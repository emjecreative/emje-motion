<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\InteractionMotion\Services;

/**
 * Resolves Elementor slider values.
 */
final class SliderResolver
{
    /**
     * @param mixed $value
     */
    public function resolve(mixed $value, int $default, int $min, int $max): int
    {
        return (int) $this->resolveFloat($value, (float) $default, (float) $min, (float) $max);
    }

    /**
     * @param mixed $value
     */
    public function resolveFloat(mixed $value, float $default, float $min, float $max): float
    {
        $raw = $value;
        if (is_array($value) && isset($value['size'])) {
            $raw = $value['size'];
        }
        if (! is_numeric($raw)) {
            return $default;
        }
        $float = (float) $raw;
        return max($min, min($max, $float));
    }
}
