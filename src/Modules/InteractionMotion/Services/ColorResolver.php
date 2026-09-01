<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\InteractionMotion\Services;

/**
 * Resolves and sanitizes colors, including Elementor Global Colors.
 */
final class ColorResolver
{
    private const FALLBACK_DOT_RING = '#000000';
    private const FALLBACK_BG = '#FFFFFF';
    private const FALLBACK_TEXT = '#111111';
    private const FALLBACK_TRAIL_HEAD = '#111111';
    private const FALLBACK_TRAIL_TAIL = '#FF4D5A';

    public function resolveGlobalColorVar(string $globalValue): string
    {
        if (str_contains($globalValue, 'globals/colors')) {
            $parts = parse_url($globalValue);
            if (isset($parts['query'])) {
                parse_str($parts['query'], $query);
                if (isset($query['id']) && is_string($query['id']) && $query['id'] !== '') {
                    $id = preg_replace('/[^a-zA-Z0-9_-]/', '', $query['id']);
                    return "var(--e-global-color-{$id})";
                }
            }
            if (preg_match('/id=([^&]+)/', $globalValue, $m)) {
                $id = preg_replace('/[^a-zA-Z0-9_-]/', '', $m[1]);
                return "var(--e-global-color-{$id})";
            }
        }
        if (str_starts_with($globalValue, 'var(')) {
            return $globalValue;
        }
        return $globalValue;
    }

    /**
     * Sanitize CSS color or fallback.
     */
    public function sanitizeColor(string $value, string $fallback): string
    {
        $value = trim($value);
        if ($value === '') {
            return $fallback;
        }
        $hex = sanitize_hex_color($value);
        if ($hex) {
            return $hex;
        }
        if (preg_match('/^(rgba?|hsla?|var)\s*\(.*\)$/i', $value)) {
            return $value;
        }
        if (str_starts_with($value, 'var(')) {
            return $value;
        }
        // Allow only safe named colors.
        $allowed = ['transparent', 'currentColor', 'inherit', 'initial', 'unset', 'red', 'blue', 'green', 'black', 'white'];
        if (in_array(strtolower($value), $allowed, true)) {
            return strtolower($value);
        }
        return $fallback;
    }

    public function getFallback(string $key): string
    {
        return match ($key) {
            'dot_ring' => self::FALLBACK_DOT_RING,
            'bg' => self::FALLBACK_BG,
            'text' => self::FALLBACK_TEXT,
            'trail_head' => self::FALLBACK_TRAIL_HEAD,
            'trail_tail' => self::FALLBACK_TRAIL_TAIL,
            default => self::FALLBACK_DOT_RING,
        };
    }
}
