<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Elementor;

use EmjeCreative\EmjeMotion\Core\Container;
use EmjeCreative\EmjeMotion\Core\ModuleLoader;
use EmjeCreative\EmjeMotion\Modules\HoverReveal\HoverReveal;
use EmjeCreative\EmjeMotion\Modules\InteractionMotion\InteractionMotion;
use EmjeCreative\EmjeMotion\Modules\InteractiveCursor\InteractiveCursor;
use EmjeCreative\EmjeMotion\Modules\SmoothScroll\SmoothScroll;
use EmjeCreative\EmjeMotion\Modules\TextMotion\TextMotion;

/**
 * Handles Elementor integration.
 */
final class ElementorManager
{
    private ModuleLoader $loader;

    private Container $container;

    public function __construct(ModuleLoader $loader, Container $container)
    {
        $this->loader = $loader;
        $this->container = $container;
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
        $textMotion = $this->container->get(TextMotion::class);
        $this->loader->register($textMotion, $textMotion->getId()); // @phpstan-ignore-line

        $smoothScroll = $this->container->get(SmoothScroll::class);
        $this->loader->register($smoothScroll, $smoothScroll->getId()); // @phpstan-ignore-line

        $hoverReveal = $this->container->get(HoverReveal::class);
        $this->loader->register($hoverReveal, $hoverReveal->getId()); // @phpstan-ignore-line

        $cursor = $this->container->get(InteractiveCursor::class);
        $this->loader->register($cursor, $cursor->getId()); // @phpstan-ignore-line

        $interaction = $this->container->get(InteractionMotion::class);
        $this->loader->register($interaction, $interaction->getId()); // @phpstan-ignore-line

        $this->loader->boot();
    }
}
