<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\SmoothScroll;

use EmjeCreative\EmjeMotion\Admin\SettingsRepository;
use EmjeCreative\EmjeMotion\Contracts\ModuleInterface;

/**
 * Smooth Scroll module — Lenis-powered global smooth scroll.
 */
final class SmoothScroll implements ModuleInterface
{
    private SettingsRepository $settings;

    public function __construct(?SettingsRepository $settings = null)
    {
        $this->settings = $settings ?? new SettingsRepository();
    }

    public function getId(): string
    {
        return 'smooth-scroll';
    }

    public function register(): void
    {
        // Output config as inline script data.
        add_action('wp_enqueue_scripts', [$this, 'injectConfig'], 20);

        // Allow assets to be forced via filter when module enabled.
        add_filter('emje_motion_should_load_assets', [$this, 'forceAssetLoading'], 10, 1);
    }

    /**
     * Inject smooth scroll config for frontend.
     */
    public function injectConfig(): void
    {
        if (is_admin()) {
            return;
        }

        // Do not output in Elementor editor/preview.
        if ($this->isElementorEditor()) {
            return;
        }

        $allSettings = $this->settings->getSettings();

        $config = [
            'enabled' => $this->settings->isEnabled($this->getId()),
            'lerp' => isset($allSettings['smooth_scroll_lerp']) ? (float) $allSettings['smooth_scroll_lerp'] : 0.055,
            'wheelMultiplier' => isset($allSettings['smooth_scroll_wheel_multiplier']) ? (float) $allSettings['smooth_scroll_wheel_multiplier'] : 1.0,
            'respectReducedMotion' => ! empty($allSettings['respect_reduced_motion']),
            'disableOnMobile' => ! empty($allSettings['disable_on_mobile']),
        ];

        // Expose via inline script attached to frontend handle.
        // Fallback: also print as global if handle not yet registered.
        $json = wp_json_encode($config);

        if (! is_string($json)) {
            return;
        }

        // Use wp_add_inline_script if handle registered, otherwise print in footer.
        if (wp_script_is('emje-motion-frontend', 'registered')) {
            wp_add_inline_script(
                'emje-motion-frontend',
                'window.EmjeMotionSmoothScrollConfig = ' . $json . ';',
                'before',
            );
        } else {
            add_action(
                'wp_footer',
                static function () use ($json): void {
                    echo '<script id="emje-motion-smooth-scroll-config">window.EmjeMotionSmoothScrollConfig = ' . $json . ';</script>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- JSON is escaped via wp_json_encode
                },
                5,
            );
        }

        // Also add data attribute marker for AssetsManager fallback detection.
        add_action(
            'wp_footer',
            static function (): void {
                echo '<script id="emje-motion-smooth-scroll-marker" type="text/javascript">document.documentElement.setAttribute("data-emje-smooth-scroll","1");</script>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
            },
            5,
        );
    }

    /**
     * Force asset loading when smooth scroll is enabled (global module).
     *
     * @param bool $shouldLoad
     */
    public function forceAssetLoading(bool $shouldLoad): bool
    {
        if ($shouldLoad) {
            return true;
        }

        if ($this->settings->isEnabled($this->getId()) && ! $this->isElementorEditor() && ! is_admin()) {
            return true;
        }

        return $shouldLoad;
    }

    private function isElementorEditor(): bool
    {
        // Check Elementor editor/preview mode without hard dependency.
        if (class_exists('\Elementor\Plugin')) {
            $plugin = \Elementor\Plugin::$instance ?? null;

            if ($plugin && isset($plugin->editor) && method_exists($plugin->editor, 'is_edit_mode') && $plugin->editor->is_edit_mode()) {
                return true;
            }

            if (isset($plugin->preview) && method_exists($plugin->preview, 'is_preview_mode') && $plugin->preview->is_preview_mode()) {
                return true;
            }
        }

        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only check
        if (isset($_GET['elementor_library'])) {
            return true;
        }

        return false;
    }
}
