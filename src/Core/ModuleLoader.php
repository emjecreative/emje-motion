<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Core;

use EmjeCreative\EmjeMotion\Admin\SettingsRepository;
use EmjeCreative\EmjeMotion\Contracts\ModuleInterface;

/**
 * Loads and registers plugin modules.
 */
final class ModuleLoader
{
    /**
     * Registered modules indexed by module ID.
     *
     * @var array<string, ModuleInterface>
     */
    private array $modules = [];

    private SettingsRepository $settings;

    public function __construct(?SettingsRepository $settings = null)
    {
        $this->settings = $settings ?? new SettingsRepository();
    }

    /**
     * Register a module instance.
     *
     * @param string|null $moduleId Optional explicit ID. If null, will try getId() on module or fallback to class name.
     */
    public function register(ModuleInterface $module, ?string $moduleId = null): void
    {
        $id = $moduleId ?? $this->resolveModuleId($module);
        $this->modules[$id] = $module;
    }

    /**
     * Check whether a module is enabled.
     */
    public function isEnabled(string $moduleId): bool
    {
        /**
         * Allow filtering via `emje_motion_module_enabled`.
         *
         * @param bool   $enabled  Whether the module is enabled.
         * @param string $moduleId Module ID.
         */
        $enabled = $this->settings->isEnabled($moduleId);

        return (bool) apply_filters('emje_motion_module_enabled', $enabled, $moduleId);
    }

    /**
     * Boot all registered modules that are enabled.
     */
    public function boot(): void
    {
        foreach ($this->modules as $moduleId => $module) {
            if (! $this->isEnabled($moduleId)) {
                continue;
            }

            try {
                $module->register();
            } catch (\Throwable $e) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch -- logs removed, recreate locally if needed
            }
        }
    }

    /**
     * Resolve module ID from instance.
     */
    private function resolveModuleId(ModuleInterface $module): string
    {
        $id = $module->getId();

        if ($id !== '') {
            return $id;
        }

        return $module::class;
    }
}
