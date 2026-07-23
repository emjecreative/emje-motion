<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Elementor;

use EmjeCreative\EmjeMotion\Assets\AssetsManager;

/**
 * Handles Elementor integration.
 */
final class ElementorManager
{
    /**
     * Register Elementor hooks.
     */
    public function register(): void
    {
        add_action(
            'elementor/init',
            [ $this, 'onElementorInit' ]
        );
    }

    /**
     * Runs when Elementor has initialized.
     */
    public function onElementorInit(): void
    {
        $assets = new AssetsManager();
		$assets->register();
    }
}
