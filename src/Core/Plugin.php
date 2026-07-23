<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Core;

/**
 * Core plugin bootstrap.
 */
final class Plugin
{
    /**
     * Boot the plugin.
     */
    public function boot(): void
    {
        $this->initialize();
    }

    /**
     * Initialize the plugin.
     */
    private function initialize(): void
    {
        $this->registerHooks();
    }

    /**
     * Register WordPress hooks.
     */
    private function registerHooks(): void
    {
        add_action( 'plugins_loaded', [ $this, 'onPluginsLoaded' ] );
    }

    /**
     * Runs after all plugins have loaded.
     */
    public function onPluginsLoaded(): void
    {
    if ( ! $this->isElementorLoaded() ) {

        ( new \EmjeCreative\EmjeMotion\Admin\AdminNotice() )->register();

        return;
    }

    // Elementor initialization will start here.
    }

	/**
	* Check whether Elementor is loaded.
 	*/
	private function isElementorLoaded(): bool
	{
    return did_action( 'elementor/loaded' ) > 0;
	}
}
