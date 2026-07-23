<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Elementor;

use EmjeCreative\EmjeMotion\Core\ModuleLoader;
use EmjeCreative\EmjeMotion\Modules\TextMotion\TextMotion;

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
        $this->registerModules();
    }

    /**
     * Register all Emje Motion modules.
     */
    private function registerModules(): void
    {
        $loader = new ModuleLoader();

        $loader->register(
            new TextMotion()
        );

        $loader->boot();
    }
}
