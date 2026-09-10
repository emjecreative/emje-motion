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

    /**
     * Result of the latest Check for Updates in this request.
     *
     * 'available' when a newer version exists, 'current' when up to date, null when no check ran.
     *
     * @var 'available'|'current'|null
     */
    private ?string $checkUpdatesResult = null;

    /**
     * URL to the WordPress Updates screen for the latest check.
     */
    private string $checkUpdatesUrl = '';

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
        // Single-site only: on multisite the mu helper owns this link
        // (it loads in Network Admin too) — registering both would double it.
        if (! function_exists('is_multisite') || ! is_multisite()) {
            add_filter('plugin_row_meta', [$this, 'rowMeta'], 10, 2);
        }
    }

    /**
     * Add a "View details" modal link like wordpress.org plugins have.
     *
     * Core only grants it to wordpress.org plugins; ours is excluded by
     * the Update URI header, so we add our own (content comes from the
     * GitHub updater's plugins_api response: Description + Changelog).
     *
     * @param string[] $links
     * @param string $pluginFile
     *
     * @return string[]
     */
    public function rowMeta(array $links, string $pluginFile): array
    {
        if ($pluginFile !== plugin_basename(EMJE_MOTION_FILE)) {
            return $links;
        }

        $url = self_admin_url('plugin-install.php?tab=plugin-information&plugin=emje-motion&TB_iframe=true&width=640&height=662');
        $links[] = sprintf(
            '<a href="%s" class="thickbox open-plugin-details-modal" aria-label="%s">%s</a>',
            esc_url($url),
            esc_attr__('View Emje Motion details', 'emje-motion'),
            esc_html__('View details', 'emje-motion'),
        );

        return $links;
    }

    /**
     * Register top-level menu and submenus.
     */
    public function registerMenu(): void
    {
        $iconPath = EMJE_MOTION_PATH . 'assets/images/emje-motion-dashboard-logo.svg';
        $iconSvg = is_readable($iconPath) ? file_get_contents($iconPath) : false;
        $icon = is_string($iconSvg) && $iconSvg !== '' ? 'data:image/svg+xml;base64,' . base64_encode($iconSvg) : 'dashicons-art';
        add_menu_page(
            esc_html__('Emje Motion', 'emje-motion'),
            esc_html__('Emje Motion', 'emje-motion'),
            self::CAPABILITY,
            self::MENU_SLUG,
            [$this, 'renderOverview'],
            $icon,
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

        // Phosphor Icons — Duotone (Opsi A)
        wp_enqueue_style('phosphor-icons-duotone', 'https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/duotone/style.css', [], '2.1.1');

        // Geist — Google Fonts (hanya dashboard Emje Motion, CDN)
        wp_enqueue_style('geist-font', 'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&display=swap', [], null);

        $css = EMJE_MOTION_URL . 'assets/css/admin.css';
        $path = EMJE_MOTION_PATH . 'assets/css/admin.css';
        $ver = $this->assetVersion($path);

        wp_enqueue_style('emje-motion-admin', $css, [], $ver);

        $js = EMJE_MOTION_URL . 'assets/js/admin.js';
        $jsPath = EMJE_MOTION_PATH . 'assets/js/admin.js';
        $jsVer = $this->assetVersion($jsPath);
        if (file_exists($jsPath)) {
            wp_enqueue_script('emje-motion-admin', $js, [], $jsVer, true);
        }
    }

    /**
     * Version admin assets: filemtime in debug, plugin version otherwise.
     */
    private function assetVersion(string $path): string
    {
        static $cache = [];

        if (isset($cache[$path])) {
            return $cache[$path];
        }

        if (defined('WP_DEBUG') && WP_DEBUG && file_exists($path)) {
            $mtime = filemtime($path);
            if (is_int($mtime)) {
                return $cache[$path] = (string) $mtime;
            }
        }

        return $cache[$path] = EMJE_MOTION_VERSION;
    }

    /**
     * Verify nonce + capability for admin POST handlers.
     */
    private function verifyRequest(string $action): void
    {
        if (! isset($_POST['_wpnonce']) || ! wp_verify_nonce(sanitize_text_field(wp_unslash((string) $_POST['_wpnonce'])), $action)) {
            wp_die(esc_html__('Security check failed.', 'emje-motion'));
        }

        if (! current_user_can(self::CAPABILITY)) {
            wp_die(esc_html__('Insufficient permissions.', 'emje-motion'));
        }
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

        $action = sanitize_key(wp_unslash((string) $_POST['emje_motion_action']));

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
        $this->verifyRequest('emje_motion_save_modules');

        $modules = [];

        // Visible modules in Overview (3)
        $posted = wp_unslash($_POST);
        foreach (['text-motion', 'smooth-scroll', 'interaction-motion', 'background-motion'] as $id) {
            // phpcs:ignore WordPress.Security.NonceVerification.Missing -- already verified
            $key = 'module_' . str_replace('-', '_', $id);
            $modules[$id] = isset($posted[$key]) && $posted[$key] === '1';
        }

        // Note: legacy hover-reveal / interactive-cursor module IDs are retired;
        // saveModules() only persists known MODULE_IDS, so stale stored keys
        // are dropped on the next save automatically.
        $this->settings->saveModules($modules);

        add_settings_error(
            'emje_motion_modules',
            'emje_motion_modules_saved',
            esc_html__('Features saved.', 'emje-motion'),
            'updated',
        );

        set_transient('settings_errors', get_settings_errors(), 30);
    }

    private function handleSaveSettings(): void
    {
        $this->verifyRequest('emje_motion_save_settings');

        $modules = $this->settings->getModules();
        $isSmoothEnabled = ! empty($modules['smooth-scroll']);
        $currentSettings = $this->settings->getSettings();
        $posted = wp_unslash($_POST);
        // Reset to default when disabled (Opsi A hide total)
        if ($isSmoothEnabled) {
            $lerp = isset($posted['smooth_scroll_lerp']) ? (float) $posted['smooth_scroll_lerp'] : 0.075;
            $wheel = isset($posted['smooth_scroll_wheel_multiplier']) ? (float) $posted['smooth_scroll_wheel_multiplier'] : 1.2;
            $disableSmooth = isset($posted['disable_smooth_on_mobile']) && $posted['disable_smooth_on_mobile'] === '1';
        } else {
            $lerp = 0.075;
            $wheel = 1.2;
            $disableSmooth = $currentSettings['disable_smooth_on_mobile'] ?? true;
        }

        $settings = [
            'respect_reduced_motion' => isset($posted['respect_reduced_motion']) && $posted['respect_reduced_motion'] === '1',
            'disable_interaction_on_mobile' => isset($posted['disable_interaction_on_mobile']) && $posted['disable_interaction_on_mobile'] === '1',
            'disable_smooth_on_mobile' => $disableSmooth,
            'smooth_scroll_lerp' => $lerp,
            'smooth_scroll_wheel_multiplier' => $wheel,
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
        $this->verifyRequest('emje_motion_check_updates');

        // Clear cached update check (6h) for both single and multisite.
        delete_transient('emje_motion_update_check');
        delete_site_transient('emje_motion_update_check');
        // Clear WordPress update transients (network-wide in multisite).
        delete_site_transient('update_plugins');
        delete_transient('update_plugins');

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
            $this->checkUpdatesResult = 'available';
            $this->checkUpdatesUrl = is_network_admin() ? network_admin_url('update-core.php') : admin_url('update-core.php');
        } else {
            // Check if remote check actually ran (if updater still cached with no update, it's up to date).
            $this->checkUpdatesResult = 'current';
            $this->checkUpdatesUrl = '';
        }
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
        $modules = $this->settings->getModules();

        include EMJE_MOTION_PATH . 'src/Admin/Views/settings.php';
    }

    public function renderAbout(): void
    {
        if (! current_user_can(self::CAPABILITY)) {
            return;
        }

        $version = defined('EMJE_MOTION_VERSION') ? EMJE_MOTION_VERSION : '1.0.0';
        $wpVersion = get_bloginfo('version');
        $phpVersion = PHP_VERSION;
        $elementorVersion = defined('ELEMENTOR_VERSION') ? (string) ELEMENTOR_VERSION : '';

        if ($elementorVersion === '' && function_exists('get_plugin_data')) {
            $elementorFile = WP_PLUGIN_DIR . '/elementor/elementor.php';
            if (file_exists($elementorFile)) {
                $data = get_plugin_data($elementorFile, false, false);
                $elementorVersion = $data['Version'];
            }
        }

        // Inline result of Check for Updates (same request, left of the button).
        $updatesResult = $this->checkUpdatesResult;
        $updatesUrl = $this->checkUpdatesUrl;

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
                'description' => esc_html__('Scramble, Unfold & Fill Reveal for Heading & Text Editor. Live preview in editor.', 'emje-motion'),
                'status' => esc_html__('Available', 'emje-motion'),
                'icon' => 'text-t',
            ],
            'smooth-scroll' => [
                'label' => esc_html__('Smooth Scroll', 'emje-motion'),
                'description' => esc_html__('Buttery smooth scrolling — site-wide, zero-jank, native feel. Global module.', 'emje-motion'),
                'status' => esc_html__('Available', 'emje-motion'),
                'icon' => 'mouse-simple',
            ],
            'interaction-motion' => [
                'label' => esc_html__('Interaction Motion', 'emje-motion'),
                'description' => esc_html__('Hover Reveal & Interactive Cursor for Container — one effect per Container.', 'emje-motion'),
                'status' => esc_html__('Available', 'emje-motion'),
                'icon' => 'cursor-click',
            ],
            'background-motion' => [
                'label' => esc_html__('Background Motion', 'emje-motion'),
                'description' => esc_html__('ASCII & Pixel ambient backgrounds for Container.', 'emje-motion'),
                'status' => esc_html__('Available', 'emje-motion'),
                'icon' => 'sparkle',
            ],
        ];
    }
}
