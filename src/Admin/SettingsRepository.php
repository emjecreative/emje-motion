<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Admin;

/**
 * Centralized access to plugin options.
 */
final class SettingsRepository
{
    public const OPTION_MODULES = 'emje_motion_modules';

    public const OPTION_SETTINGS = 'emje_motion_settings';

    /**
     * Known module IDs.
     *
     * @var string[]
     */
    public const MODULE_IDS = [
        'text-motion',
        'smooth-scroll',
        'hover-reveal',
        'interactive-cursor',
    ];

    /**
     * Default enabled map.
     *
     * All modules enabled by default except Smooth Scroll (global effect
     * should be opt-in to avoid surprising existing sites).
     *
     * @var array<string, bool>
     */
    private const DEFAULT_MODULES = [
        'text-motion' => true,
        'smooth-scroll' => false,
        'hover-reveal' => true,
        'interactive-cursor' => true,
    ];

    /**
     * Default global settings.
     *
     * @var array<string, mixed>
     */
    private const DEFAULT_SETTINGS = [
        'respect_reduced_motion' => true,
        'disable_on_mobile' => true,
        'debug_mode' => false,
        'smooth_scroll_lerp' => 0.075,
        'smooth_scroll_wheel_multiplier' => 1.0,
    ];

    /**
     * Get enabled map for all modules.
     *
     * @return array<string, bool>
     */
    public function getModules(): array
    {
        $stored = get_option(self::OPTION_MODULES, []);

        if (! is_array($stored)) {
            $stored = [];
        }

        $modules = self::DEFAULT_MODULES;

        foreach ($stored as $key => $value) {
            if (! is_string($key) || ! in_array($key, self::MODULE_IDS, true)) {
                continue;
            }

            $modules[$key] = (bool) $value;
        }

        return $modules;
    }

    /**
     * Check whether a module is enabled.
     */
    public function isEnabled(string $moduleId): bool
    {
        if (! in_array($moduleId, self::MODULE_IDS, true)) {
            return false;
        }

        $modules = $this->getModules();

        return $modules[$moduleId] ?? false;
    }

    /**
     * Persist enabled map.
     *
     * @param array<string, bool> $modules
     */
    public function saveModules(array $modules): void
    {
        $sanitized = [];

        foreach (self::MODULE_IDS as $id) {
            $sanitized[$id] = ! empty($modules[$id]);
        }

        update_option(self::OPTION_MODULES, $sanitized);
    }

    /**
     * Get global settings.
     *
     * @return array<string, mixed>
     */
    public function getSettings(): array
    {
        $stored = get_option(self::OPTION_SETTINGS, []);

        if (! is_array($stored)) {
            $stored = [];
        }

        return array_merge(self::DEFAULT_SETTINGS, $stored);
    }

    /**
     * Persist global settings.
     *
     * @param array<string, mixed> $settings
     */
    public function saveSettings(array $settings): void
    {
        $current = $this->getSettings();

        $lerp = isset($settings['smooth_scroll_lerp']) ? (float) $settings['smooth_scroll_lerp'] : (float) $current['smooth_scroll_lerp'];
        $lerp = max(0.05, min(0.15, $lerp));

        $wheel = isset($settings['smooth_scroll_wheel_multiplier']) ? (float) $settings['smooth_scroll_wheel_multiplier'] : (float) $current['smooth_scroll_wheel_multiplier'];
        $wheel = max(0.8, min(1.5, $wheel));

        $sanitized = [
            'respect_reduced_motion' => isset($settings['respect_reduced_motion']) ? (bool) $settings['respect_reduced_motion'] : $current['respect_reduced_motion'],
            'disable_on_mobile' => isset($settings['disable_on_mobile']) ? (bool) $settings['disable_on_mobile'] : $current['disable_on_mobile'],
            'debug_mode' => isset($settings['debug_mode']) ? (bool) $settings['debug_mode'] : $current['debug_mode'],
            'smooth_scroll_lerp' => $lerp,
            'smooth_scroll_wheel_multiplier' => $wheel,
        ];

        update_option(self::OPTION_SETTINGS, $sanitized);
    }

    /**
     * Ensure defaults exist on first run.
     */
    public function ensureDefaults(): void
    {
        if (false === get_option(self::OPTION_MODULES)) {
            add_option(self::OPTION_MODULES, self::DEFAULT_MODULES);
        }

        if (false === get_option(self::OPTION_SETTINGS)) {
            add_option(self::OPTION_SETTINGS, self::DEFAULT_SETTINGS);
        }
    }
}
