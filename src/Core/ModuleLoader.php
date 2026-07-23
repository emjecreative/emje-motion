<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Core;

/**
 * Loads and registers plugin modules.
 */
final class ModuleLoader
{
    /**
     * Registered modules.
     *
     * @var array<object>
     */
    private array $modules = [];

    /**
     * Register a module instance.
     */
    public function register(object $module): void
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
