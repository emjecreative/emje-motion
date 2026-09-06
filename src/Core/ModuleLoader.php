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
     */
    public function register(ModuleInterface $module): void
    {
        $this->modules[$module->getId()] = $module;
    }

    /**
     * Check whether a module is enabled.
     */
    public function isEnabled(string $moduleId): bool
    {
        /**
         * Allow filtering via `emje_motion_module_enabled`.
         *
         * @param bool $enabled Whether the module is enabled.
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
            } catch (\Throwable $e) {
                /**
                 * Notify on module boot failure without breaking other modules.
                 *
                 * @param string $moduleId Failing module ID.
                 * @param \Throwable $e Caught error.
                 */
                do_action('emje_motion_module_error', $moduleId, $e);

                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log(sprintf('[Emje Motion] Module [%s] failed: %s', $moduleId, $e->getMessage()));
                }
            }
        }
    }
}
