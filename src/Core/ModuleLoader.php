<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Core;

use EmjeCreative\EmjeMotion\Contracts\ModuleInterface;

/**
 * Loads and registers plugin modules.
 */
final class ModuleLoader
{
    /**
     * Registered modules.
     *
     * @var ModuleInterface[]
     */
    private array $modules = [];

    /**
     * Register a module instance.
     */
    public function register(ModuleInterface $module): void
    {
        $this->modules[] = $module;
    }

    /**
     * Boot all registered modules.
     */
    public function boot(): void
    {
        foreach ($this->modules as $module) {
            if (method_exists($module, 'register')) {
                $module->register();
            }
        }
    }
}
