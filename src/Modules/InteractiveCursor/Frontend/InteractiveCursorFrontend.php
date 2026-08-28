<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\InteractiveCursor\Frontend;

use Elementor\Element_Base;

/**
 * Handles frontend for Interactive Cursor.
 */
final class InteractiveCursorFrontend
{
    private const SUPPORTED_ELEMENTS = [
        'container',
    ];

    public function register(): void
    {
        add_action(
            'elementor/frontend/container/before_render',
            [$this, 'beforeRender'],
            10,
            1,
        );
    }

    /**
     * @param Element_Base $element
     */
    public function beforeRender(Element_Base $element): void
    {
        if (! in_array($element->get_name(), self::SUPPORTED_ELEMENTS, true)) {
            return;
        }

        $settings = $element->get_settings_for_display();

        if (empty($settings['emje_cursor_enable'])) {
            return;
        }

        $config = $this->buildConfig($settings);

        $element->add_render_attribute(
            '_wrapper',
            'class',
            'emje-interactive-cursor',
        );

        $element->add_render_attribute(
            '_wrapper',
            'data-emje-cursor',
            wp_json_encode($config),
        );
    }

    /**
     * @param array<string, mixed> $settings
     * @return array<string, mixed>
     */
    private function buildConfig(array $settings): array
    {
        $type = $settings['emje_cursor_type'] ?? 'dot-ring';

        if (! in_array($type, ['dot', 'ring', 'dot-ring'], true)) {
            $type = 'dot-ring';
        }

        $size = 20;

        if (isset($settings['emje_cursor_size'])) {
            $raw = $settings['emje_cursor_size'];

            if (is_array($raw) && isset($raw['size'])) {
                $size = (int) $raw['size'];
            } elseif (is_numeric($raw)) {
                $size = (int) $raw;
            }
        }

        $size = max(12, min(40, $size));

        $color = isset($settings['emje_cursor_color']) ? sanitize_hex_color((string) $settings['emje_cursor_color']) : '#000000';

        if (empty($color)) {
            $color = '#000000';
        }

        $blendMode = $settings['emje_cursor_blend_mode'] ?? 'normal';

        if (! in_array($blendMode, ['normal', 'difference'], true)) {
            $blendMode = 'normal';
        }

        $hoverScale = isset($settings['emje_cursor_hover_scale']) ? (float) $settings['emje_cursor_hover_scale'] : 1.5;
        $hoverScale = max(1.2, min(2.0, $hoverScale));

        $hideNative = ($settings['emje_cursor_hide_native'] ?? 'yes') === 'yes';

        $label = isset($settings['emje_cursor_text_label']) ? sanitize_text_field((string) $settings['emje_cursor_text_label']) : '';

        if (mb_strlen($label) > 20) {
            $label = mb_substr($label, 0, 20);
        }

        return [
            'type' => $type,
            'size' => $size,
            'color' => $color,
            'blendMode' => $blendMode,
            'hoverScale' => $hoverScale,
            'hideNative' => $hideNative,
            'label' => $label,
            'livePreview' => ($settings['emje_cursor_live_preview'] ?? '') === 'yes',
        ];
    }
}
