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
        $raw = $value;
        if (is_array($value) && isset($value['size'])) {
            $raw = $value['size'];
        }
        if (! is_numeric($raw)) {
            return $default;
        }
        $int = (int) $raw;
        return max($min, min($max, $int));
    }
}
