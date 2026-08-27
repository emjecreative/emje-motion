<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Core;

use EmjeCreative\EmjeMotion\Admin\SettingsRepository;

/**
 * Handles plugin activation.
 */
final class Activator
{
    public static function activate(): void
    {
        $repo = new SettingsRepository();
        $repo->ensureDefaults();
    }
}
