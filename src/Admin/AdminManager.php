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

        if ($action === 'check_updates') {
            $this->handleCheckUpdates();
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

        $existing = $this->settings->getModules();
        $modules = [];

        // Visible modules in Overview (3)
        foreach (['text-motion', 'smooth-scroll', 'interaction-motion'] as $id) {
            // phpcs:ignore WordPress.Security.NonceVerification.Missing -- already verified
            $key = 'module_' . str_replace('-', '_', $id);
            $modules[$id] = isset($_POST[$key]) && $_POST[$key] === '1';
        }

        // Preserve legacy hover/cursor for backward compat (old pages still render via InteractionMotionFrontend legacy fallback)
        $modules['hover-reveal'] = $existing['hover-reveal'] ?? true;
        $modules['interactive-cursor'] = $existing['interactive-cursor'] ?? true;
        // Sync legacy to new: if interaction is enabled, keep legacy enabled for old frontend; if interaction disabled, keep legacy as is
        if (! empty($modules['interaction-motion'])) {
            $modules['hover-reveal'] = true;
            $modules['interactive-cursor'] = true;
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
            'smooth_scroll_lerp' => isset($_POST['smooth_scroll_lerp']) ? (float) $_POST['smooth_scroll_lerp'] : 0.055,
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

    private function handleCheckUpdates(): void
    {
        if (! isset($_POST['_wpnonce']) || ! wp_verify_nonce(sanitize_text_field((string) $_POST['_wpnonce']), 'emje_motion_check_updates')) {
            wp_die(esc_html__('Security check failed.', 'emje-motion'));
        }

        if (! current_user_can(self::CAPABILITY)) {
            wp_die(esc_html__('Insufficient permissions.', 'emje-motion'));
        }

        // Clear cached update check (6h) and WordPress update transients.
        delete_transient('emje_motion_update_check');
        delete_site_transient('update_plugins');
        // For multisite, also clear site-wide flag.
        if (is_multisite()) {
            delete_site_transient('update_plugins');
        }

        // Force WordPress to re-check (triggers pre_set_site_transient_update_plugins via our updater).
        wp_update_plugins();

        // Check if an update is now available by inspecting the transient after force.
        $updates = get_site_transient('update_plugins');
        $hasUpdate = false;
        $pluginFile = plugin_basename(EMJE_MOTION_FILE);

        if (is_object($updates) && isset($updates->response) && is_array($updates->response) && isset($updates->response[$pluginFile])) {
            $hasUpdate = true;
        }

        if ($hasUpdate) {
            $updatesUrl = is_network_admin() ? network_admin_url('update-core.php') : admin_url('update-core.php');
            add_settings_error(
                'emje_motion_check_updates',
                'emje_motion_update_available',
                sprintf(
                    /* translators: %s: updates page URL */
                    esc_html__('Update available. Go to %s to update.', 'emje-motion'),
                    '<a href="' . esc_url($updatesUrl) . '">' . esc_html__('Updates', 'emje-motion') . '</a>',
                ),
                'updated',
            );
        } else {
            // Check if remote check actually ran (if updater still cached with no update, it's up to date).
            add_settings_error(
                'emje_motion_check_updates',
                'emje_motion_up_to_date',
                esc_html__("You're up to date.", 'emje-motion'),
                'updated',
            );
        }

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
                'description' => esc_html__('Buttery smooth scrolling for the entire site. Global module.', 'emje-motion'),
                'status' => esc_html__('Available', 'emje-motion'),
                'icon' => 'arrow-down-alt',
            ],
            'interaction-motion' => [
                'label' => esc_html__('Interaction Motion', 'emje-motion'),
                'description' => esc_html__('Hover Reveal and Interactive Cursor for Container — 1 effect per Container (like Text Motion).', 'emje-motion'),
                'status' => esc_html__('Available', 'emje-motion'),
                'icon' => 'admin-customizer',
            ],
        ];
    }
}
