<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\HoverReveal\Frontend;

use Elementor\Element_Base;

/**
 * Handles frontend for Hover Reveal.
 */
final class HoverRevealFrontend
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

        if (empty($settings['emje_hover_reveal_enable'])) {
            return;
        }

        $image = $settings['emje_hover_reveal_image'] ?? null;
        $imageUrl = '';

        if (is_array($image) && ! empty($image['url'])) {
            $imageUrl = esc_url_raw((string) $image['url']);
        } elseif (is_string($image) && $image !== '') {
            $imageUrl = esc_url_raw($image);
        }

        if ($imageUrl === '') {
            return;
        }

        $config = $this->buildConfig($settings, $imageUrl);

        $element->add_render_attribute(
            '_wrapper',
            'class',
            'emje-hover-reveal',
        );

        $element->add_render_attribute(
            '_wrapper',
            'data-emje-hover-reveal',
            wp_json_encode($config),
        );
    }

    /**
     * @param array<string, mixed> $settings
     * @return array<string, mixed>
     */
    private function buildConfig(array $settings, string $imageUrl): array
    {
        $followSpeed = isset($settings['emje_hover_reveal_follow_speed']) ? (float) $settings['emje_hover_reveal_follow_speed'] : 0.12;
        $followSpeed = max(0.05, min(0.3, $followSpeed));

        $scale = isset($settings['emje_hover_reveal_scale']) ? (float) $settings['emje_hover_reveal_scale'] : 1.0;
        $scale = max(0.8, min(1.2, $scale));

        $animation = $settings['emje_hover_reveal_animation'] ?? 'fade';

        if (! in_array($animation, ['fade', 'scale', 'clip'], true)) {
            $animation = 'fade';
        }

        $triggerArea = $settings['emje_hover_reveal_trigger_area'] ?? 'container';

        if (! in_array($triggerArea, ['container', 'heading'], true)) {
            $triggerArea = 'container';
        }

        $imageSize = $settings['emje_hover_reveal_image_size'] ?? 'medium';

        if (! in_array($imageSize, ['thumbnail', 'medium', 'large', 'full'], true)) {
            $imageSize = 'medium';
        }

        return [
            'imageUrl' => $imageUrl,
            'imageSize' => $imageSize,
            'followSpeed' => $followSpeed,
            'scale' => $scale,
            'animation' => $animation,
            'triggerArea' => $triggerArea,
            'livePreview' => ($settings['emje_hover_reveal_live_preview'] ?? '') === 'yes',
        ];
    }
}
