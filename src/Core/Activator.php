<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Core;

use EmjeCreative\EmjeMotion\Admin\SettingsRepository;
use EmjeCreative\EmjeMotion\Updater\MuPluginInstaller;

/**
 * Handles plugin activation.
 */
final class Activator
{
    /**
     * @param bool $_networkWide Whether activation is network-wide (multisite).
     *                           Unused; kept for the WordPress hook signature.
     */
    public static function activate(bool $_networkWide = false): void
    {
        $repo = new SettingsRepository();
        $repo->ensureDefaults();

        // Auto-install mu-plugin helper for multisite per-site updates.
        MuPluginInstaller::install();
    }
}
