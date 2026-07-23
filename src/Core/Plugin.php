<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Core;

/**
 * Core plugin bootstrap.
 */
final class Plugin
{
    /**
     * Service container.
     */
    private Container $container;

    /**
     * Boot the plugin.
     */
    public function boot(): void
    {
        $this->container = new Container();

        $this->registerHooks();
    }

    /**
     * Get the service container.
     */
    public function getContainer(): Container
    {
        return $this->container;
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
