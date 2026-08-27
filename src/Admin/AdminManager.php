<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Admin;

/**
 * Registers admin menu and handles saving.
 */
final class AdminManager
{
    private const MENU_SLUG = 'emje-motion';

    private const CAPABILITY = 'manage_options';

    private SettingsRepository $settings;

    public function __construct(SettingsRepository $settings)
    {
        $this->settings = $settings;
    }

    /**
     * Register WordPress hooks.
     */
    public function register(): void
    {
        add_action('admin_menu', [$this, 'registerMenu']);
        add_action('admin_init', [$this, 'handleSave']);
        add_action('admin_enqueue_scripts', [$this, 'enqueueAssets']);
    }

    /**
     * Register top-level menu and submenus.
     */
    public function registerMenu(): void
    {
        add_menu_page(
            esc_html__('Emje Motion', 'emje-motion'),
            esc_html__('Emje Motion', 'emje-motion'),
            self::CAPABILITY,
            self::MENU_SLUG,
            [$this, 'renderOverview'],
            'dashicons-controls-play',
            58,
        );

        add_submenu_page(
            self::MENU_SLUG,
            esc_html__('Overview', 'emje-motion'),
            esc_html__('Overview', 'emje-motion'),
            self::CAPABILITY,
            self::MENU_SLUG,
            [$this, 'renderOverview'],
        );

        add_submenu_page(
            self::MENU_SLUG,
            esc_html__('Settings', 'emje-motion'),
            esc_html__('Settings', 'emje-motion'),
            self::CAPABILITY,
            self::MENU_SLUG . '-settings',
            [$this, 'renderSettings'],
        );

        add_submenu_page(
            self::MENU_SLUG,
            esc_html__('About', 'emje-motion'),
            esc_html__('About', 'emje-motion'),
            self::CAPABILITY,
            self::MENU_SLUG . '-about',
            [$this, 'renderAbout'],
        );
    }

    /**
     * Enqueue admin assets when on our pages.
     *
     * @param string $hook
     */
    public function enqueueAssets(string $hook): void
    {
        if (! str_contains($hook, self::MENU_SLUG)) {
            return;
        }

        // Minimal inline styles for overview cards; no external file needed for v1.
    }

    /**
     * Handle saving from Overview and Settings pages.
     */
    public function handleSave(): void
    {
        if (! is_admin() || ! current_user_can(self::CAPABILITY)) {
            return;
        }

        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- verified below
        if (empty($_POST['emje_motion_action'])) {
            return;
        }

        $action = sanitize_key((string) $_POST['emje_motion_action']);

        if ($action === 'save_modules') {
            $this->handleSaveModules();
        }

        if ($action === 'save_settings') {
            $this->handleSaveSettings();
        }
    }

    private function handleSaveModules(): void
    {
        if (! isset($_POST['_wpnonce']) || ! wp_verify_nonce(sanitize_text_field((string) $_POST['_wpnonce']), 'emje_motion_save_modules')) {
            wp_die(esc_html__('Security check failed.', 'emje-motion'));
        }

        if (! current_user_can(self::CAPABILITY)) {
            wp_die(esc_html__('Insufficient permissions.', 'emje-motion'));
        }

        $modules = [];

        foreach (SettingsRepository::MODULE_IDS as $id) {
            // phpcs:ignore WordPress.Security.NonceVerification.Missing -- already verified
            $key = 'module_' . str_replace('-', '_', $id);
            $modules[$id] = isset($_POST[$key]) && $_POST[$key] === '1';
        }

        $this->settings->saveModules($modules);

        add_settings_error(
            'emje_motion_modules',
            'emje_motion_modules_saved',
            esc_html__('Modules updated.', 'emje-motion'),
            'updated',
        );

        set_transient('settings_errors', get_settings_errors(), 30);
    }

    private function handleSaveSettings(): void
    {
        if (! isset($_POST['_wpnonce']) || ! wp_verify_nonce(sanitize_text_field((string) $_POST['_wpnonce']), 'emje_motion_save_settings')) {
            wp_die(esc_html__('Security check failed.', 'emje-motion'));
        }

        if (! current_user_can(self::CAPABILITY)) {
            wp_die(esc_html__('Insufficient permissions.', 'emje-motion'));
        }

        $settings = [
            'respect_reduced_motion' => isset($_POST['respect_reduced_motion']) && $_POST['respect_reduced_motion'] === '1',
            'disable_on_mobile' => isset($_POST['disable_on_mobile']) && $_POST['disable_on_mobile'] === '1',
            'debug_mode' => isset($_POST['debug_mode']) && $_POST['debug_mode'] === '1',
            'smooth_scroll_lerp' => isset($_POST['smooth_scroll_lerp']) ? (float) $_POST['smooth_scroll_lerp'] : 0.075,
            'smooth_scroll_wheel_multiplier' => isset($_POST['smooth_scroll_wheel_multiplier']) ? (float) $_POST['smooth_scroll_wheel_multiplier'] : 1.0,
        ];

        $this->settings->saveSettings($settings);

        add_settings_error(
            'emje_motion_settings',
            'emje_motion_settings_saved',
            esc_html__('Settings saved.', 'emje-motion'),
            'updated',
        );

        set_transient('settings_errors', get_settings_errors(), 30);
    }

    public function renderOverview(): void
    {
        if (! current_user_can(self::CAPABILITY)) {
            return;
        }

        $modules = $this->settings->getModules();
        $definitions = $this->getModuleDefinitions();

        include EMJE_MOTION_PATH . 'src/Admin/Views/overview.php';
    }

    public function renderSettings(): void
    {
        if (! current_user_can(self::CAPABILITY)) {
            return;
        }

        $settings = $this->settings->getSettings();

        include EMJE_MOTION_PATH . 'src/Admin/Views/settings.php';
    }

    public function renderAbout(): void
    {
        if (! current_user_can(self::CAPABILITY)) {
            return;
        }

        $version = defined('EMJE_MOTION_VERSION') ? EMJE_MOTION_VERSION : '1.0.0';

        include EMJE_MOTION_PATH . 'src/Admin/Views/about.php';
    }

    /**
     * Module definitions for Overview.
     *
     * @return array<string, array{label: string, description: string, status: string, icon: string}>
     */
    private function getModuleDefinitions(): array
    {
        return [
            'text-motion' => [
                'label' => esc_html__('Text Motion', 'emje-motion'),
                'description' => esc_html__('Scramble, Unfold and Fill Reveal animations for Heading and Text Editor widgets.', 'emje-motion'),
                'status' => esc_html__('Available', 'emje-motion'),
                'icon' => 'editor-textcolor',
            ],
            'smooth-scroll' => [
                'label' => esc_html__('Smooth Scroll', 'emje-motion'),
                'description' => esc_html__('Lenis-powered smooth scrolling for the entire site. Global module.', 'emje-motion'),
                'status' => esc_html__('Available', 'emje-motion'),
                'icon' => 'arrow-down-alt',
            ],
            'hover-reveal' => [
                'label' => esc_html__('Hover Reveal', 'emje-motion'),
                'description' => esc_html__('Image follow-cursor reveal on Container hover. Premium portfolio effect.', 'emje-motion'),
                'status' => esc_html__('Available', 'emje-motion'),
                'icon' => 'images-alt2',
            ],
            'interactive-cursor' => [
                'label' => esc_html__('Interactive Cursor', 'emje-motion'),
                'description' => esc_html__('Custom dot+ring cursor per Container with hover scaling.', 'emje-motion'),
                'status' => esc_html__('Available', 'emje-motion'),
                'icon' => 'admin-customizer',
            ],
        ];
    }
}
