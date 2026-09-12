<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Support;

/**
 * Shared Elementor render-attribute writer for frontend JSON configs.
 */
final class RenderAttributes
{
    /**
     * @param mixed $element
     * @param array<string, mixed> $config
     */
    public static function addDataAttribute($element, array $config, string $attr, string $class): void
    {
        if (! is_object($element) || ! method_exists($element, 'add_render_attribute')) {
            return;
        }
        $json = wp_json_encode($config);
        if (! is_string($json)) {
            return;
        }
        $element->add_render_attribute('_wrapper', $attr, $json);
        $element->add_render_attribute('_wrapper', 'class', $class);
    }
}
