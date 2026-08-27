<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Elementor;

use EmjeCreative\EmjeMotion\Core\ModuleLoader;
use EmjeCreative\EmjeMotion\Modules\HoverReveal\HoverReveal;
use EmjeCreative\EmjeMotion\Modules\InteractiveCursor\InteractiveCursor;
use EmjeCreative\EmjeMotion\Modules\SmoothScroll\SmoothScroll;
use EmjeCreative\EmjeMotion\Modules\TextMotion\TextMotion;

/**
 * Handles Elementor integration.
 */
final class ElementorManager
{
    private ModuleLoader $loader;

    public function __construct(ModuleLoader $loader)
    {
        $this->loader = $loader;
    }

    /**
     * Register Elementor hooks.
     */
    public function register(): void
    {
        add_action(
            'elementor/init',
            [ $this, 'onElementorInit' ],
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
        $textMotion = new TextMotion();
        $this->loader->register($textMotion, $textMotion->getId());

        $smoothScroll = new SmoothScroll();
        $this->loader->register($smoothScroll, $smoothScroll->getId());

        $hoverReveal = new HoverReveal();
        $this->loader->register($hoverReveal, $hoverReveal->getId());

        $cursor = new InteractiveCursor();
        $this->loader->register($cursor, $cursor->getId());

        $this->loader->boot();
    }
}
