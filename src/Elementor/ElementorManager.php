<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Elementor;

use EmjeCreative\EmjeMotion\Core\Container;
use EmjeCreative\EmjeMotion\Core\ModuleLoader;
use EmjeCreative\EmjeMotion\Modules\BackgroundMotion\BackgroundMotion;
use EmjeCreative\EmjeMotion\Modules\InteractionMotion\InteractionMotion;
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
        /** @var array<int, class-string<\EmjeCreative\EmjeMotion\Contracts\ModuleInterface>> $classes */
        // Legacy HoverReveal + InteractiveCursor retired (see Plugin.php).
        $classes = [
            TextMotion::class,
            SmoothScroll::class,
            InteractionMotion::class,
            BackgroundMotion::class,
        ];

        foreach ($classes as $class) {
            $this->loader->register($this->container->get($class));
        }

        $this->loader->boot();
    }
}
