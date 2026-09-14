<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Support;

use EmjeCreative\EmjeMotion\Modules\InteractionMotion\Services\ColorResolver;

/**
 * Single source of truth for reading an Elementor color setting:
 * raw value, Elementor Global Color (__globals__) override, empty fallback,
 * then sanitizing. Replaces the same ~6 lines copied per color field.
 */
final class ColorField
{
    /**
     * @param array<string, mixed> $settings
     */
    public static function pick(array $settings, string $key, string $fallback, ColorResolver $resolver): string
    {
        $raw = trim((string) ($settings[$key] ?? ''));

        $globals = $settings['__globals__'] ?? [];
        if (
            is_array($globals)
            && isset($globals[$key])
            && is_string($globals[$key])
            && trim($globals[$key]) !== ''
        ) {
            $raw = $resolver->resolveGlobalColorVar($globals[$key]);
        }

        if ($raw === '') {
            return $fallback;
        }

        return $resolver->sanitizeColor($raw, $fallback);
    }
}
