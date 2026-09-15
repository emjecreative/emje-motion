<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\SmoothScroll;

/**
 * Single source of truth for Smooth Scroll numeric bounds.
 * Used by both the save path (AdminManager, SettingsRepository) and the
 * read path (SmoothScroll::injectConfig) so clamping cannot drift.
 */
final class SmoothScrollConfig
{
    public const DEFAULT_LERP = 0.075;
    public const MIN_LERP = 0.05;
    public const MAX_LERP = 0.15;

    public const DEFAULT_WHEEL = 1.2;
    public const MIN_WHEEL = 0.8;
    public const MAX_WHEEL = 1.5;

    public static function sanitizeLerp(mixed $value, float $fallback = self::DEFAULT_LERP): float
    {
        if (! is_numeric($value)) {
            return $fallback;
        }

        return max(self::MIN_LERP, min(self::MAX_LERP, (float) $value));
    }

    public static function sanitizeWheel(mixed $value, float $fallback = self::DEFAULT_WHEEL): float
    {
        if (! is_numeric($value)) {
            return $fallback;
        }

        return max(self::MIN_WHEEL, min(self::MAX_WHEEL, (float) $value));
    }
}
