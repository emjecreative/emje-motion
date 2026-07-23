<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Assets;

/**
 * Handles plugin assets.
 */
final class AssetsManager
{
    /**
     * Register assets.
     */
    public function register(): void
    {
        add_action(
            'wp_enqueue_scripts',
            [ $this, 'registerFrontendAssets' ]
        );

        add_action(
            'elementor/editor/before_enqueue_scripts',
            [ $this, 'registerEditorAssets' ]
        );
    }

    /**
     * Register frontend assets.
     */
    public function registerFrontendAssets(): void
    {
        // Coming soon.
    }

    /**
     * Register editor assets.
     */
    public function registerEditorAssets(): void
    {
        // Coming soon.
    }
}
