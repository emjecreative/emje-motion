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
        // Hooks will be registered here.
    }
}
