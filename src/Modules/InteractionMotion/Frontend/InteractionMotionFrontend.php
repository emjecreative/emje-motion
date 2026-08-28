<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\InteractionMotion\Frontend;

/**
 * Renders Interaction Motion frontend attributes for Container.
 * Handles both new unified controls and legacy hover-reveal / cursor controls for backward compat.
 */
final class InteractionMotionFrontend
{
    /**
     * Register frontend hooks.
     */
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
     * @param mixed $element
     */
    public function beforeRender($element): void
    {
        if (! is_object($element) || ! method_exists($element, 'get_settings_for_display')) {
            return;
        }

        if (! $element instanceof \Elementor\Element_Base) {
            return;
        }

        $settings = $element->get_settings_for_display();

        // New unified controls
        $newEnable = $settings['emje_interaction_enable'] ?? '';
        $newEffect = $settings['emje_interaction_effect'] ?? 'hover-reveal';

        // Legacy controls (for backward compat with existing pages)
        $legacyHoverEnable = $settings['emje_hover_reveal_enable'] ?? '';
        $legacyCursorEnable = $settings['emje_cursor_enable'] ?? '';

        $isNew = ! empty($newEnable);
        $isLegacyHover = ! empty($legacyHoverEnable);
        $isLegacyCursor = ! empty($legacyCursorEnable);

        // If new unified is used, prefer it; otherwise fallback to legacy
        if ($isNew) {
            if ($newEffect === 'hover-reveal') {
                $config = $this->buildHoverConfig($settings, true);
                if (empty($config['imageUrl'])) {
                    return;
                }
                $element->add_render_attribute(
                    '_wrapper',
                    'data-emje-hover-reveal',
                    wp_json_encode($config),
                );
                $element->add_render_attribute(
                    '_wrapper',
                    'class',
                    'emje-hover-reveal',
                );
            } elseif ($newEffect === 'interactive-cursor') {
                $config = $this->buildCursorConfig($settings, true);
                $element->add_render_attribute(
                    '_wrapper',
                    'data-emje-cursor',
                    wp_json_encode($config),
                );
                $element->add_render_attribute(
                    '_wrapper',
                    'class',
                    'emje-interactive-cursor',
                );
            }
            return;
        }

        // Legacy fallback: handle old hover-reveal
        if ($isLegacyHover) {
            $config = $this->buildHoverConfig($settings, false);
            if (empty($config['imageUrl'])) {
                return;
            }
            $element->add_render_attribute(
                '_wrapper',
                'data-emje-hover-reveal',
                wp_json_encode($config),
            );
            $element->add_render_attribute(
                '_wrapper',
                'class',
                'emje-hover-reveal',
            );
        }

        // Legacy fallback: handle old cursor (separate check, but if both legacy were enabled, both will render — now discouraged)
        if ($isLegacyCursor) {
            $config = $this->buildCursorConfig($settings, false);
            $element->add_render_attribute(
                '_wrapper',
                'data-emje-cursor',
                wp_json_encode($config),
            );
            $element->add_render_attribute(
                '_wrapper',
                'class',
                'emje-interactive-cursor',
            );
        }
    }

    /**
     * @param array<string, mixed> $settings
     * @return array<string, mixed>
     */
    private function buildHoverConfig(array $settings, bool $isNew): array
    {
        if ($isNew) {
            $image = $settings['emje_interaction_hover_image'] ?? null;
            $imageUrl = is_array($image) && isset($image['url']) ? (string) $image['url'] : '';
            $imageSize = isset($settings['emje_interaction_hover_image_size']) ? (string) $settings['emje_interaction_hover_image_size'] : 'medium';
            $followSpeed = isset($settings['emje_interaction_hover_follow_speed']) ? (float) $settings['emje_interaction_hover_follow_speed'] : 0.12;
            $scale = isset($settings['emje_interaction_hover_scale']) ? (float) $settings['emje_interaction_hover_scale'] : 1.0;
            $animation = isset($settings['emje_interaction_hover_animation']) ? (string) $settings['emje_interaction_hover_animation'] : 'fade';
            $triggerArea = isset($settings['emje_interaction_hover_trigger_area']) ? (string) $settings['emje_interaction_hover_trigger_area'] : 'container';
            $livePreview = ($settings['emje_interaction_live_preview'] ?? '') === 'yes';
            // Clamp
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

        // Legacy
        $image = $settings['emje_hover_reveal_image'] ?? null;
        $imageUrl = is_array($image) && isset($image['url']) ? (string) $image['url'] : '';
        $imageSize = isset($settings['emje_hover_reveal_image_size']) ? (string) $settings['emje_hover_reveal_image_size'] : 'medium';
        $followSpeed = isset($settings['emje_hover_reveal_follow_speed']) ? (float) $settings['emje_hover_reveal_follow_speed'] : 0.12;
        $scale = isset($settings['emje_hover_reveal_scale']) ? (float) $settings['emje_hover_reveal_scale'] : 1.0;
        $animation = isset($settings['emje_hover_reveal_animation']) ? (string) $settings['emje_hover_reveal_animation'] : 'fade';
        $triggerArea = isset($settings['emje_hover_reveal_trigger_area']) ? (string) $settings['emje_hover_reveal_trigger_area'] : 'container';
        $livePreview = ($settings['emje_hover_reveal_live_preview'] ?? '') === 'yes';
        $followSpeed = max(0.05, min(0.3, $followSpeed));
        $scale = max(0.8, min(1.2, $scale));
        if (! in_array($animation, ['fade', 'scale', 'clip'], true)) {
            $animation = 'fade';
        }
        if (! in_array($triggerArea, ['container', 'heading'], true)) {
            $triggerArea = 'container';
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

    /**
     * @param array<string, mixed> $settings
     * @return array<string, mixed>
     */
    private function buildCursorConfig(array $settings, bool $isNew): array
    {
        if ($isNew) {
            $type = isset($settings['emje_interaction_cursor_type']) ? (string) $settings['emje_interaction_cursor_type'] : 'dot-ring';
            $sizeRaw = $settings['emje_interaction_cursor_size'] ?? null;
            $size = 20;
            if (is_array($sizeRaw) && isset($sizeRaw['size'])) {
                $size = (int) $sizeRaw['size'];
            } elseif (is_numeric($sizeRaw)) {
                $size = (int) $sizeRaw;
            }
            $size = max(12, min(40, $size));
            $color = isset($settings['emje_interaction_cursor_color']) ? (string) $settings['emje_interaction_cursor_color'] : '#000000';
            $color = sanitize_hex_color($color) ?: '#000000';
            $blendMode = isset($settings['emje_interaction_cursor_blend_mode']) ? (string) $settings['emje_interaction_cursor_blend_mode'] : 'normal';
            $hoverScale = isset($settings['emje_interaction_cursor_hover_scale']) ? (float) $settings['emje_interaction_cursor_hover_scale'] : 1.5;
            $hideNative = ($settings['emje_interaction_cursor_hide_native'] ?? 'yes') === 'yes';
            $label = isset($settings['emje_interaction_cursor_text_label']) ? (string) $settings['emje_interaction_cursor_text_label'] : '';
            $label = sanitize_text_field($label);
            $livePreview = ($settings['emje_interaction_live_preview'] ?? '') === 'yes';
            if (! in_array($type, ['dot', 'ring', 'dot-ring'], true)) {
                $type = 'dot-ring';
            }
            if (! in_array($blendMode, ['normal', 'difference'], true)) {
                $blendMode = 'normal';
            }
            $hoverScale = max(1.2, min(2.0, $hoverScale));

            return [
                'type' => $type,
                'size' => $size,
                'color' => $color,
                'blendMode' => $blendMode,
                'hoverScale' => $hoverScale,
                'hideNative' => $hideNative,
                'label' => $label,
                'livePreview' => $livePreview,
            ];
        }

        $type = isset($settings['emje_cursor_type']) ? (string) $settings['emje_cursor_type'] : 'dot-ring';
        $sizeRaw = $settings['emje_cursor_size'] ?? null;
        $size = 20;
        if (is_array($sizeRaw) && isset($sizeRaw['size'])) {
            $size = (int) $sizeRaw['size'];
        } elseif (is_numeric($sizeRaw)) {
            $size = (int) $sizeRaw;
        }
        $size = max(12, min(40, $size));
        $color = isset($settings['emje_cursor_color']) ? (string) $settings['emje_cursor_color'] : '#000000';
        $color = sanitize_hex_color($color) ?: '#000000';
        $blendMode = isset($settings['emje_cursor_blend_mode']) ? (string) $settings['emje_cursor_blend_mode'] : 'normal';
        $hoverScale = isset($settings['emje_cursor_hover_scale']) ? (float) $settings['emje_cursor_hover_scale'] : 1.5;
        $hideNative = ($settings['emje_cursor_hide_native'] ?? 'yes') === 'yes';
        $label = isset($settings['emje_cursor_text_label']) ? (string) $settings['emje_cursor_text_label'] : '';
        $label = sanitize_text_field($label);
        $livePreview = ($settings['emje_cursor_live_preview'] ?? '') === 'yes';
        if (! in_array($type, ['dot', 'ring', 'dot-ring'], true)) {
            $type = 'dot-ring';
        }
        if (! in_array($blendMode, ['normal', 'difference'], true)) {
            $blendMode = 'normal';
        }
        $hoverScale = max(1.2, min(2.0, $hoverScale));

        return [
            'type' => $type,
            'size' => $size,
            'color' => $color,
            'blendMode' => $blendMode,
            'hoverScale' => $hoverScale,
            'hideNative' => $hideNative,
            'label' => $label,
            'livePreview' => $livePreview,
        ];
    }
}
