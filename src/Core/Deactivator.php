<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Core;

/**
 * Handles plugin deactivation.
 */
final class Deactivator
{
    public static function deactivate(): void
    {
        // Keep options on deactivation to preserve user settings.
        // Cleanup is handled via uninstall hook (if ever added).
        flush_rewrite_rules();
    }
}
