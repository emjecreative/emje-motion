<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\InteractionMotion\Frontend;

use EmjeCreative\EmjeMotion\Modules\InteractionMotion\Services\SliderResolver;

/**
 * Hover Reveal config builder for Interaction Motion.
 */
final class HoverConfig
{
    private SliderResolver $sliderResolver;

    public function __construct()
    {
        $this->sliderResolver = new SliderResolver();
    }

    /**
     * @param array<string, mixed> $settings
     *
     * @return array<string, mixed>
     */
    public function buildHoverConfig(array $settings, bool $isNew): array
    {
        if ($isNew) {
            $fields = $this->resolveHoverFields($settings, 'emje_interaction_hover_', 'emje_interaction_live_preview');
            // New controls: offset & rotate (legacy has no equivalent).
            $fields['offsetX'] = $this->sliderResolver->resolve($settings['emje_interaction_hover_offset_x'] ?? 0, 0, -200, 200);
            $fields['offsetY'] = $this->sliderResolver->resolve($settings['emje_interaction_hover_offset_y'] ?? 0, 0, -200, 200);
            $fields['rotate'] = $this->sliderResolver->resolve($settings['emje_interaction_hover_rotate'] ?? 0, 0, 0, 360);
            $fields['rotateHover'] = $this->sliderResolver->resolve($settings['emje_interaction_hover_rotate_hover'] ?? 15, 15, 0, 360);
        } else {
            // Legacy v1.0.0 keys; offset/rotate did not exist back then.
            $fields = $this->resolveHoverFields($settings, 'emje_hover_reveal_', 'emje_hover_reveal_live_preview');
            $fields['offsetX'] = 0;
            $fields['offsetY'] = 0;
            $fields['rotate'] = 0;
            $fields['rotateHover'] = 15;
        }

        // New keys carry emje_interaction_hover_disable_mobile (default yes);
        // legacy v1.0.0 settings predate the toggle, so they fall back to
        // hidden-on-touch — the historical behavior.
        $fields['disableOnMobile'] = ($settings['emje_interaction_hover_disable_mobile'] ?? 'yes') === 'yes';

        return $fields;
    }

    /**
     * Resolve + clamp shared Hover Reveal fields for either key family.
     *
     * @param array<string, mixed> $settings
     *
     * @return array<string, mixed>
     */
    private function resolveHoverFields(array $settings, string $prefix, string $liveKey): array
    {
        $image = $settings[$prefix . 'image'] ?? null;
        $imageSize = isset($settings[$prefix . 'image_size']) ? (string) $settings[$prefix . 'image_size'] : 'medium';
        // Resolve sized URL for quality + speed (thumbnail = smaller file)
        $imageUrl = '';
        if (is_array($image)) {
            if (! empty($image['id'])) {
                $sized = wp_get_attachment_image_src((int) $image['id'], $imageSize);
                if (is_array($sized) && ! empty($sized[0])) {
                    $imageUrl = (string) $sized[0];
                } elseif (! empty($image['url'])) {
                    $imageUrl = (string) $image['url'];
                }
            } elseif (! empty($image['url'])) {
                $imageUrl = (string) $image['url'];
            }
        } elseif (is_string($image) && $image !== '') {
            $imageUrl = $image;
        }
        $followSpeed = isset($settings[$prefix . 'follow_speed']) ? (float) $settings[$prefix . 'follow_speed'] : 0.12;
        $scale = isset($settings[$prefix . 'scale']) ? (float) $settings[$prefix . 'scale'] : 1.0;
        $animation = isset($settings[$prefix . 'animation']) ? (string) $settings[$prefix . 'animation'] : 'fade';
        $triggerArea = isset($settings[$prefix . 'trigger_area']) ? (string) $settings[$prefix . 'trigger_area'] : 'container';
        $livePreview = ($settings[$liveKey] ?? '') === 'yes';
        $followSpeed = max(0.05, min(0.3, $followSpeed));
        $scale = max(0.8, min(1.2, $scale));
        if (! in_array($animation, ['fade', 'scale', 'clip'], true)) {
            $animation = 'fade';
        }
        if (! in_array($triggerArea, ['container', 'heading'], true)) {
            $triggerArea = 'container';
        }
        if (! in_array($imageSize, ['thumbnail', 'medium', 'large', 'full'], true)) {
            $imageSize = 'medium';
        }

        return [
            'imageUrl' => esc_url_raw($imageUrl),
            'imageSize' => $imageSize,
            'followSpeed' => $followSpeed,
            'scale' => $scale,
            'animation' => $animation,
            'triggerArea' => $triggerArea,
            'livePreview' => $livePreview,
        ];
    }
}
