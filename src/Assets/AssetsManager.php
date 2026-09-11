<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Assets;

/**
 * Handles plugin assets.
 */
final class AssetsManager
{
    /**
     * Frontend script handle.
     */
    private const FRONTEND_SCRIPT = 'emje-motion-frontend';

    /**
     * Editor script handle.
     */
    private const EDITOR_SCRIPT = 'emje-motion-editor';

    /**
     * Frontend style handle.
     */
    private const FRONTEND_STYLE = 'emje-motion-frontend';

    /**
     * Editor style handle.
     */
    private const EDITOR_STYLE = 'emje-motion-editor';

    /**
     * Whether frontend assets are needed on current request.
     */
    private bool $needsFrontendAssets = false;

    /**
     * Register assets.
     */
    public function register(): void
    {
        // Frontend Assets
        add_action(
            'wp_enqueue_scripts',
            [ $this, 'registerFrontendAssets' ],
            5,
        );

        add_action(
            'wp_enqueue_scripts',
            [ $this, 'enqueueFrontendAssets' ],
            10,
        );

        // Mark assets as needed when Elementor renders a motion widget.
        add_action(
            'elementor/widget/before_render_content',
            [ $this, 'markFrontendAssetsNeeded' ],
        );

        // Also enqueue in footer as fallback for dynamically rendered widgets.
        add_action(
            'wp_footer',
            [ $this, 'maybeEnqueueInFooter' ],
            1,
        );

        // Editor Assets (top frame panel)
        add_action(
            'elementor/editor/before_enqueue_scripts',
            [ $this, 'registerEditorAssets' ],
            5,
        );

        add_action(
            'elementor/editor/before_enqueue_scripts',
            [ $this, 'enqueueEditorAssets' ],
            10,
        );

        // Preview Assets (iframe) — force frontend in preview even for unsaved drafts
        add_action(
            'elementor/preview/enqueue_styles',
            [ $this, 'enqueuePreviewAssets' ],
            10,
        );
    }

    /**
     * Mark frontend assets as needed.
     */
    public function markFrontendAssetsNeeded(mixed $widget = null): void
    {
        if ($widget !== null && is_object($widget) && method_exists($widget, 'get_settings_for_display')) {
            /** @var mixed $settings */
            $settings = $widget->get_settings_for_display();
            if (is_array($settings) && empty($settings['emje_motion_enable']) && empty($settings['emje_hover_reveal_enable']) && empty($settings['emje_cursor_enable']) && empty($settings['emje_interaction_enable']) && empty($settings['emje_background_enable'])) {
                return;
            }
        }

        $this->needsFrontendAssets = true;
    }

    /**
     * Register frontend assets.
     */
    public function registerFrontendAssets(): void
    {
        $scriptPath = EMJE_MOTION_PATH . 'dist/js/frontend.js';
        $stylePath = EMJE_MOTION_PATH . 'dist/css/frontend.css';

        if (file_exists($scriptPath)) {
            wp_register_script(
                self::FRONTEND_SCRIPT,
                $this->asset('js/frontend.js'),
                [],
                EMJE_MOTION_VERSION,
                true,
            );
        }

        if (file_exists($stylePath)) {
            wp_register_style(
                self::FRONTEND_STYLE,
                $this->asset('css/frontend.css'),
                [],
                EMJE_MOTION_VERSION,
            );
        }
    }

    /**
     * Enqueue frontend assets.
     */
    public function enqueueFrontendAssets(): void
    {
        if (! $this->shouldLoadFrontendAssets()) {
            return;
        }

        if (wp_script_is(self::FRONTEND_SCRIPT, 'registered')) {
            wp_enqueue_script(self::FRONTEND_SCRIPT);
        }

        if (wp_style_is(self::FRONTEND_STYLE, 'registered')) {
            wp_enqueue_style(self::FRONTEND_STYLE);
        }
    }

    /**
     * Fallback: enqueue in footer if widget was rendered after wp_enqueue_scripts.
     */
    public function maybeEnqueueInFooter(): void
    {
        if (! $this->needsFrontendAssets) {
            return;
        }

        $this->enqueueRegisteredFrontend();
    }

    /**
     * Determine whether frontend assets should be loaded.
     */
    private function shouldLoadFrontendAssets(): bool
    {
        static $cache = null;

        if (is_bool($cache)) {
            return $cache || $this->needsFrontendAssets;
        }

        if ($this->needsFrontendAssets) {
            $cache = true;

            return true;
        }

        if (is_admin()) {
            $cache = false;

            return false;
        }

        // Check current post's Elementor data for any motion enabled.
        $postId = get_queried_object_id();

        if ($postId > 0) {
            $elementorData = get_post_meta($postId, '_elementor_data', true);
            $needleKeys = ['emje_motion_enable', 'emje_hover_reveal_enable', 'emje_cursor_enable', 'emje_interaction_enable', 'emje_background_enable'];

            if (! empty($elementorData) && is_string($elementorData)) {
                foreach ($needleKeys as $needle) {
                    if (str_contains($elementorData, $needle)) {
                        $cache = true;

                        return true;
                    }
                }
            }

            if (! empty($elementorData) && is_array($elementorData)) {
                $encoded = wp_json_encode($elementorData);

                if (is_string($encoded)) {
                    foreach ($needleKeys as $needle) {
                        if (str_contains($encoded, $needle)) {
                            $cache = true;

                            return true;
                        }
                    }
                }
            }
        }

        // Allow other integrations (e.g., popups, archives) to force load via filter.
        $cache = (bool) apply_filters('emje_motion_should_load_assets', false);

        return $cache;
    }

    /**
     * Register editor assets.
     */
    public function registerEditorAssets(): void
    {
        $scriptPath = EMJE_MOTION_PATH . 'dist/js/editor.js';
        $stylePath = EMJE_MOTION_PATH . 'dist/css/editor.css';

        if (file_exists($scriptPath)) {
            wp_register_script(
                self::EDITOR_SCRIPT,
                $this->asset('js/editor.js'),
                ['jquery', 'elementor-editor'],
                EMJE_MOTION_VERSION,
                true,
            );
        }

        if (file_exists($stylePath)) {
            wp_register_style(
                self::EDITOR_STYLE,
                $this->asset('css/editor.css'),
                [],
                EMJE_MOTION_VERSION,
            );
        }
    }

    /**
     * Enqueue editor assets.
     */
    public function enqueueEditorAssets(): void
    {
        if (wp_script_is(self::EDITOR_SCRIPT, 'registered')) {
            // Expose config for editor bridge (logo for heading icons).
            wp_localize_script(
                self::EDITOR_SCRIPT,
                'EmjeMotionConfig',
                [
                    'logoUrl' => EMJE_MOTION_URL . 'assets/images/emje-motion-logo.svg',
                ],
            );
            // Also expose EMJE_MOTION_URL as global for fallback.
            wp_add_inline_script(
                self::EDITOR_SCRIPT,
                'window.EMJE_MOTION_URL = ' . wp_json_encode(EMJE_MOTION_URL) . ';',
                'before',
            );
            wp_enqueue_script(self::EDITOR_SCRIPT);
        }

        if (wp_style_is(self::EDITOR_STYLE, 'registered')) {
            wp_enqueue_style(self::EDITOR_STYLE);
        }
    }

    /**
     * Enqueue preview assets — ensure frontend is available in preview iframe.
     */
    public function enqueuePreviewAssets(): void
    {
        // Ensure frontend handle is registered
        $this->registerFrontendAssets();

        $this->enqueueRegisteredFrontend();
    }

    /**
     * Enqueue registered frontend script + style once.
     */
    private function enqueueRegisteredFrontend(): void
    {
        if (wp_script_is(self::FRONTEND_SCRIPT, 'registered') && ! wp_script_is(self::FRONTEND_SCRIPT, 'enqueued')) {
            wp_enqueue_script(self::FRONTEND_SCRIPT);
        }

        if (wp_style_is(self::FRONTEND_STYLE, 'registered') && ! wp_style_is(self::FRONTEND_STYLE, 'enqueued')) {
            wp_enqueue_style(self::FRONTEND_STYLE);
        }
    }

    /**
     * Get plugin asset URL.
     *
     * @param non-empty-string $path Asset path relative to the dist directory.
     *
     * @return non-empty-string
     */
    private function asset(string $path): string
    {
        /** @var non-empty-string $url */
        $url = EMJE_MOTION_URL . 'dist/' . ltrim($path, '/');

        return $url;
    }
}
