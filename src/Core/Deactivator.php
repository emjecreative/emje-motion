<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Core;

use EmjeCreative\EmjeMotion\Updater\MuPluginInstaller;

/**
 * Handles plugin deactivation.
 */
final class Deactivator
{
    public static function deactivate(): void
    {
        // Keep options on deactivation to preserve user settings.
        // No rewrite flush: plugin registers no CPTs or rewrite rules.
        MuPluginInstaller::uninstall();
    }
}
