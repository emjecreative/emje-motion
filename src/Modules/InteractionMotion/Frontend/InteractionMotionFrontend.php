<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\InteractionMotion\Frontend;

use EmjeCreative\EmjeMotion\Modules\InteractionMotion\Services\ColorResolver;
use EmjeCreative\EmjeMotion\Modules\InteractionMotion\Services\SliderResolver;

/**
 * Renders Interaction Motion frontend attributes for Container.
 * Handles both new unified controls and legacy hover-reveal / cursor controls for backward compat.
 */
final class InteractionMotionFrontend
{
    private ColorResolver $colorResolver;
    private SliderResolver $sliderResolver;

    public function __construct()
    {
        $this->colorResolver = new ColorResolver();
        $this->sliderResolver = new SliderResolver();
    }

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
     * @param \Elementor\Element_Base $element
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
        // Merge __globals__ from raw settings so frontend can use var(--e-global-*) dynamically
        try {
            $rawSettings = method_exists($element, 'get_settings') ? $element->get_settings() : [];
            if (is_array($rawSettings) && isset($rawSettings['__globals__']) && is_array($rawSettings['__globals__'])) {
                if (!isset($settings['__globals__']) || !is_array($settings['__globals__'])) {
                    $settings['__globals__'] = [];
                }
                // Prefer raw __globals__ (var refs) over display resolved hex
                foreach ($rawSettings['__globals__'] as $k => $v) {
                    if (!isset($settings['__globals__'][$k]) || $settings['__globals__'][$k] === '') {
                        $settings['__globals__'][$k] = $v;
                    }
                }
            }
        } catch (\Throwable $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('[Emje Motion] InteractionMotionFrontend beforeRender globals merge failed: ' . $e->getMessage());
            }
        }

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
                $this->addDataAttribute($element, $config, 'data-emje-hover-reveal', 'emje-hover-reveal');
            } elseif ($newEffect === 'interactive-cursor') {
                $config = $this->buildCursorConfig($settings, true);
                $this->addDataAttribute($element, $config, 'data-emje-cursor', 'emje-interactive-cursor');
            }
            return;
        }

        // Legacy fallback: handle old hover-reveal
        if ($isLegacyHover) {
            $config = $this->buildHoverConfig($settings, false);
            if (empty($config['imageUrl'])) {
                return;
            }
            $this->addDataAttribute($element, $config, 'data-emje-hover-reveal', 'emje-hover-reveal');
        }

        // Legacy fallback: handle old cursor (separate check, but if both legacy were enabled, both will render — now discouraged)
        if ($isLegacyCursor) {
            $config = $this->buildCursorConfig($settings, false);
            $this->addDataAttribute($element, $config, 'data-emje-cursor', 'emje-interactive-cursor');
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
            $imageSize = isset($settings['emje_interaction_hover_image_size']) ? (string) $settings['emje_interaction_hover_image_size'] : 'medium';
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
            $followSpeed = isset($settings['emje_interaction_hover_follow_speed']) ? (float) $settings['emje_interaction_hover_follow_speed'] : 0.12;
            $scale = isset($settings['emje_interaction_hover_scale']) ? (float) $settings['emje_interaction_hover_scale'] : 1.0;
            $animation = isset($settings['emje_interaction_hover_animation']) ? (string) $settings['emje_interaction_hover_animation'] : 'fade';
            $triggerArea = isset($settings['emje_interaction_hover_trigger_area']) ? (string) $settings['emje_interaction_hover_trigger_area'] : 'container';
            $livePreview = ($settings['emje_interaction_live_preview'] ?? '') === 'yes';
            // New controls: offset & rotate
            $offsetX = $this->resolveSliderValue($settings['emje_interaction_hover_offset_x'] ?? 0, 0, -200, 200);
            $offsetY = $this->resolveSliderValue($settings['emje_interaction_hover_offset_y'] ?? 0, 0, -200, 200);
            $rotate = $this->resolveSliderValue($settings['emje_interaction_hover_rotate'] ?? 0, 0, 0, 360);
            $rotateHover = $this->resolveSliderValue($settings['emje_interaction_hover_rotate_hover'] ?? 15, 15, 0, 360);
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
                'offsetX' => $offsetX,
                'offsetY' => $offsetY,
                'rotate' => $rotate,
                'rotateHover' => $rotateHover,
            ];
        }

        // Legacy
        $image = $settings['emje_hover_reveal_image'] ?? null;
        $imageSize = isset($settings['emje_hover_reveal_image_size']) ? (string) $settings['emje_hover_reveal_image_size'] : 'medium';
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
            'offsetX' => 0,
            'offsetY' => 0,
            'rotate' => 0,
            'rotateHover' => 15,
        ];
    }

    /**
     * @param array<string, mixed> $settings
     * @return array<string, mixed>
     */
    private function buildCursorConfig(array $settings, bool $isNew): array
    {
        if ($isNew) {
            $type = isset($settings['emje_interaction_cursor_type']) ? (string) $settings['emje_interaction_cursor_type'] : 'text-follow';
            // migrate legacy dot/ring -> dot-ring, keep dot-ring for backward compat
            if (in_array($type, ['dot', 'ring'], true)) {
                $type = 'dot-ring';
            }
            $sizeRaw = $settings['emje_interaction_cursor_size'] ?? null;
            $size = 20;
            if (is_array($sizeRaw) && isset($sizeRaw['size'])) {
                $size = (int) $sizeRaw['size'];
            } elseif (is_numeric($sizeRaw)) {
                $size = (int) $sizeRaw;
            }
            $size = max(12, min(40, $size));
            $colorRaw = trim((string) ($settings['emje_interaction_cursor_color'] ?? ''));
            $globalsColor = $settings['__globals__'] ?? [];
            if (isset($globalsColor['emje_interaction_cursor_color']) && is_string($globalsColor['emje_interaction_cursor_color']) && trim($globalsColor['emje_interaction_cursor_color']) !== '') {
                $colorRaw = $this->resolveGlobalColorVar($globalsColor['emje_interaction_cursor_color']);
            }
            if ($colorRaw === '') {
                $colorRaw = '#000000';
            }
            $color = $this->sanitizeColor($colorRaw, '#000000');
            $blendMode = 'normal';
            $hoverScale = isset($settings['emje_interaction_cursor_hover_scale']) ? (float) $settings['emje_interaction_cursor_hover_scale'] : 1.5;
            $hideNative = ($settings['emje_interaction_cursor_hide_native'] ?? '') === 'yes';
            // Text Label only for Text Follow, Dot+Ring has no label (hapus total)
            if ($type === 'text-follow') {
                $label = isset($settings['emje_interaction_cursor_text_label']) ? (string) $settings['emje_interaction_cursor_text_label'] : 'View';
                $label = sanitize_text_field($label);
                if ($label === '') {
                    $label = 'View';
                }
            } else {
                $label = '';
            }
            $livePreview = ($settings['emje_interaction_live_preview'] ?? '') === 'yes';
            if (! in_array($type, ['dot-ring', 'text-follow', 'trail'], true)) {
                $type = 'text-follow';
            }
            $hoverScale = max(1.2, min(2.0, $hoverScale));

            // Comet Trail specific
            $trailDotsRaw = $settings['emje_interaction_cursor_trail_dots'] ?? null;
            $trailDots = 6;
            if (is_array($trailDotsRaw) && isset($trailDotsRaw['size'])) {
                $trailDots = (int) $trailDotsRaw['size'];
            } elseif (is_numeric($trailDotsRaw)) {
                $trailDots = (int) $trailDotsRaw;
            }
            $trailDots = max(3, min(12, $trailDots));

            $trailSizeRaw = $settings['emje_interaction_cursor_trail_size'] ?? null;
            $trailSize = 20;
            if (is_array($trailSizeRaw) && isset($trailSizeRaw['size'])) {
                $trailSize = (int) $trailSizeRaw['size'];
            } elseif (is_numeric($trailSizeRaw)) {
                $trailSize = (int) $trailSizeRaw;
            }
            $trailSize = max(4, min(24, $trailSize));

            $headColorRaw = trim((string) ($settings['emje_interaction_cursor_trail_head_color'] ?? ''));
            $tailColorRaw = trim((string) ($settings['emje_interaction_cursor_trail_tail_color'] ?? ''));
            $globalsTrail = $settings['__globals__'] ?? [];
            if (isset($globalsTrail['emje_interaction_cursor_trail_head_color']) && is_string($globalsTrail['emje_interaction_cursor_trail_head_color']) && trim($globalsTrail['emje_interaction_cursor_trail_head_color']) !== '') {
                $headColorRaw = $this->resolveGlobalColorVar($globalsTrail['emje_interaction_cursor_trail_head_color']);
            }
            if (isset($globalsTrail['emje_interaction_cursor_trail_tail_color']) && is_string($globalsTrail['emje_interaction_cursor_trail_tail_color']) && trim($globalsTrail['emje_interaction_cursor_trail_tail_color']) !== '') {
                $tailColorRaw = $this->resolveGlobalColorVar($globalsTrail['emje_interaction_cursor_trail_tail_color']);
            }
            if ($headColorRaw === '') {
                $headColorRaw = '#111111';
            }
            if ($tailColorRaw === '') {
                $tailColorRaw = '#FF4D5A';
            }
            $trailHeadColor = $this->sanitizeColor($headColorRaw, '#111111');
            $trailTailColor = $this->sanitizeColor($tailColorRaw, '#FF4D5A');

            $trailLagRaw = $settings['emje_interaction_cursor_trail_lag'] ?? null;
            $trailLag = 0.35;
            if (is_array($trailLagRaw) && isset($trailLagRaw['size'])) {
                $trailLag = (float) $trailLagRaw['size'];
            } elseif (is_numeric($trailLagRaw)) {
                $trailLag = (float) $trailLagRaw;
            }
            $trailLag = max(0.1, min(0.5, $trailLag));

            $trailFade = ($settings['emje_interaction_cursor_trail_fade'] ?? 'yes') === 'yes';

            // Text Follow specific — allow hex, rgb/a, hsl/a, globals
            $bgColorRaw = trim((string) ($settings['emje_interaction_cursor_bg_color'] ?? ''));
            $textColorRaw = trim((string) ($settings['emje_interaction_cursor_text_color'] ?? ''));
            // Handle Elementor Global Colors via __globals__ — prioritize var() so kit updates propagate
            $globals = $settings['__globals__'] ?? [];
            if (isset($globals['emje_interaction_cursor_bg_color']) && is_string($globals['emje_interaction_cursor_bg_color']) && trim($globals['emje_interaction_cursor_bg_color']) !== '') {
                $bgColorRaw = $this->resolveGlobalColorVar($globals['emje_interaction_cursor_bg_color']);
            }
            if (isset($globals['emje_interaction_cursor_text_color']) && is_string($globals['emje_interaction_cursor_text_color']) && trim($globals['emje_interaction_cursor_text_color']) !== '') {
                $textColorRaw = $this->resolveGlobalColorVar($globals['emje_interaction_cursor_text_color']);
            }
            if ($bgColorRaw === '') {
                $bgColorRaw = '#FFFFFF';
            }
            if ($textColorRaw === '') {
                $textColorRaw = '#111111';
            }
            $bgColor = $this->sanitizeColor($bgColorRaw, '#FFFFFF');
            $textColor = $this->sanitizeColor($textColorRaw, '#111111');
            $paddingY = $this->resolveSliderValue($settings['emje_interaction_cursor_padding_y'] ?? 40, 40, 8, 48);
            $paddingX = $this->resolveSliderValue($settings['emje_interaction_cursor_padding_x'] ?? 32, 32, 12, 56);
            $radius = $this->resolveSliderValue($settings['emje_interaction_cursor_radius'] ?? 99, 99, 0, 100);
            $typography = $this->resolveTypography($settings, 'emje_interaction_cursor_typography');
            // legacy fontSize fallback
            $fontSizeLegacy = $this->resolveSliderValue($settings['emje_interaction_cursor_font_size'] ?? null, $typography['fontSize'] ?? 14, 10, 24);
            if (isset($typography['fontSize']) && $typography['fontSize'] > 0) {
                $fontSizeLegacy = $typography['fontSize'];
            }
            $fontSize = $fontSizeLegacy;
            $entrance = 'scale';
            $followSmoothnessRaw = $settings['emje_interaction_cursor_follow_smoothness'] ?? null;
            $followSmoothness = 0.5;
            if (is_array($followSmoothnessRaw) && isset($followSmoothnessRaw['size'])) {
                $followSmoothness = (float) $followSmoothnessRaw['size'];
            } elseif (is_numeric($followSmoothnessRaw)) {
                $followSmoothness = (float) $followSmoothnessRaw;
            }
            $followSmoothness = max(0.05, min(0.6, $followSmoothness));
            $boxShadow = $this->resolveBoxShadow($settings, 'emje_interaction_cursor_box_shadow', '0px 8px 32px 0px rgba(0, 0, 0, 0.12)');

            return [
                'type' => $type,
                'size' => $size,
                'color' => $color,
                'blendMode' => $blendMode,
                'hoverScale' => $hoverScale,
                'hideNative' => $hideNative,
                'label' => $label,
                'bgColor' => $bgColor,
                'textColor' => $textColor,
                'paddingY' => $paddingY,
                'paddingX' => $paddingX,
                'radius' => $radius,
                'fontSize' => $fontSize,
                'typography' => $typography,
                'entrance' => $entrance,
                'followSmoothness' => $followSmoothness,
                'boxShadow' => $boxShadow,
                // Comet Trail
                'trailDots' => $trailDots,
                'trailSize' => $trailSize,
                'trailHeadColor' => $trailHeadColor,
                'trailTailColor' => $trailTailColor,
                'trailLag' => $trailLag,
                'trailFade' => $trailFade,
                // legacy keys for backward compat
                'shadow' => $boxShadow !== 'none',
                'shadowBlur' => 32,
                'livePreview' => $livePreview,
            ];
        }

        $type = isset($settings['emje_cursor_type']) ? (string) $settings['emje_cursor_type'] : 'text-follow';
        if (in_array($type, ['dot', 'ring'], true)) {
            $type = 'dot-ring';
        }
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
        $blendMode = 'normal';
        $hoverScale = isset($settings['emje_cursor_hover_scale']) ? (float) $settings['emje_cursor_hover_scale'] : 1.5;
        $hideNative = ($settings['emje_cursor_hide_native'] ?? '') === 'yes';
        $label = isset($settings['emje_cursor_text_label']) ? (string) $settings['emje_cursor_text_label'] : 'View';
        $label = sanitize_text_field($label);
        if ($label === '') {
            $label = 'View';
        }
        $livePreview = ($settings['emje_cursor_live_preview'] ?? '') === 'yes';
        if (! in_array($type, ['dot-ring', 'text-follow', 'trail'], true)) {
            $type = 'text-follow';
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
            // defaults for legacy so JS gets consistent shape
            'bgColor' => '#FFFFFF',
            'textColor' => '#111111',
            'paddingY' => 40,
            'paddingX' => 32,
            'radius' => 99,
            'fontSize' => 14,
            'typography' => [
                'fontFamily' => '',
                'fontSize' => 14,
                'fontSizeUnit' => 'px',
                'fontWeight' => '600',
                'textTransform' => '',
                'fontStyle' => '',
                'lineHeight' => '',
                'letterSpacing' => '',
            ],
            'entrance' => 'scale',
            'followSmoothness' => 0.5,
            'boxShadow' => '0px 8px 32px 0px rgba(0, 0, 0, 0.12)',
            'shadow' => true,
            'shadowBlur' => 32,
            'trailDots' => 6,
            'trailSize' => 20,
            'trailHeadColor' => '#111111',
            'trailTailColor' => '#FF4D5A',
            'trailLag' => 0.35,
            'trailFade' => true,
            'livePreview' => $livePreview,
        ];
    }

    /**
     * Resolve Elementor Global color var from __globals__.
     */
    private function resolveGlobalColorVar(string $globalValue): string
    {
        // Format: globals/colors?id=abc123 or globals/colors?id=e-global-color-abc
        if (str_contains($globalValue, 'globals/colors')) {
            $parts = parse_url($globalValue);
            if (isset($parts['query'])) {
                parse_str($parts['query'], $query);
                if (isset($query['id']) && is_string($query['id']) && $query['id'] !== '') {
                    $id = preg_replace('/[^a-zA-Z0-9_-]/', '', $query['id']);
                    return "var(--e-global-color-{$id})";
                }
            }
            // Fallback: extract id after id=
            if (preg_match('/id=([^&]+)/', $globalValue, $m)) {
                $id = preg_replace('/[^a-zA-Z0-9_-]/', '', $m[1]);
                return "var(--e-global-color-{$id})";
            }
        }
        // If already a var, return as is
        if (str_starts_with($globalValue, 'var(')) {
            return $globalValue;
        }
        return $globalValue;
    }

    private function resolveGlobalTypographyVar(string $globalValue, string $prop): string
    {
        // Format: globals/typography?id=abc123
        if (str_contains($globalValue, 'globals/typography')) {
            $parts = parse_url($globalValue);
            $id = '';
            if (isset($parts['query'])) {
                parse_str($parts['query'], $query);
                if (isset($query['id']) && is_string($query['id'])) {
                    $id = preg_replace('/[^a-zA-Z0-9_-]/', '', $query['id']);
                }
            }
            if ($id === '' && preg_match('/id=([^&]+)/', $globalValue, $m)) {
                $id = preg_replace('/[^a-zA-Z0-9_-]/', '', $m[1]);
            }
            if ($id !== '') {
                $map = [
                    'font_family' => "var(--e-global-typography-{$id}-font-family)",
                    'font_size' => "var(--e-global-typography-{$id}-font-size)",
                    'font_weight' => "var(--e-global-typography-{$id}-font-weight)",
                    'text_transform' => "var(--e-global-typography-{$id}-text-transform)",
                    'font_style' => "var(--e-global-typography-{$id}-font-style)",
                    'line_height' => "var(--e-global-typography-{$id}-line-height)",
                    'letter_spacing' => "var(--e-global-typography-{$id}-letter-spacing)",
                ];
                return $map[$prop] ?? "var(--e-global-typography-{$id}-{$prop})";
            }
        }
        if (str_starts_with($globalValue, 'var(')) {
            return $globalValue;
        }
        return $globalValue;
    }

    /**
     * Resolve Elementor Typography group to array.
     *
     * @param array<string, mixed> $settings
     * @return array<string, mixed>
     */
    private function resolveTypography(array $settings, string $name): array
    {
        $prefix = $name . '_';
        $get = static function (string $key) use ($settings, $prefix): mixed {
            return $settings[$prefix . $key] ?? $settings[$key] ?? null;
        };

        $typography = [];

        $fontFamily = $get('font_family');
        if (is_string($fontFamily) && trim($fontFamily) !== '') {
            $typography['fontFamily'] = trim($fontFamily);
        } else {
            // Check globals
            $globals = $settings['__globals__'] ?? [];
            $globalKey = $name . '_font_family';
            if (isset($globals[$globalKey]) && is_string($globals[$globalKey])) {
                $typography['fontFamily'] = $this->resolveGlobalTypographyVar($globals[$globalKey], 'font_family');
            } else {
                $typography['fontFamily'] = '';
            }
        }

        // Handle globals: if font_family is via __globals__, get_settings_for_display already resolves, but fallback check
        $fontSizeRaw = $get('font_size');
        $fontSize = 14;
        $fontSizeUnit = 'px';
        if (is_array($fontSizeRaw) && isset($fontSizeRaw['size']) && $fontSizeRaw['size'] !== '') {
            $fontSize = (int) $fontSizeRaw['size'];
            $fontSizeUnit = $fontSizeRaw['unit'] ?? 'px';
        } elseif (is_numeric($fontSizeRaw)) {
            $fontSize = (int) $fontSizeRaw;
        } else {
            $globals = $settings['__globals__'] ?? [];
            $gKey = $name . '_font_size';
            if (isset($globals[$gKey]) && is_string($globals[$gKey])) {
                $var = $this->resolveGlobalTypographyVar($globals[$gKey], 'font_size');
                // Try to keep as CSS var string for JS inline - store as string
                $typography['fontSize'] = $var;
                $typography['fontSizeUnit'] = '';
                $fontSize = $var;
                $fontSizeUnit = '';
            }
        }
        // Only set if not already set via global var
        $hasVarFontSize = false;
        if (isset($typography['fontSize'])) {
            $val = (string) $typography['fontSize'];
            if (str_starts_with($val, 'var(')) {
                $hasVarFontSize = true;
            }
        }
        if (!$hasVarFontSize) {
            $typography['fontSize'] = $fontSize;
            $typography['fontSizeUnit'] = $fontSizeUnit;
        }

        $fontWeight = $get('font_weight');
        if ((is_string($fontWeight) && trim($fontWeight) !== '') || is_numeric($fontWeight)) {
            $typography['fontWeight'] = (string) $fontWeight;
        } else {
            $globals = $settings['__globals__'] ?? [];
            $gKey = $name . '_font_weight';
            if (isset($globals[$gKey]) && is_string($globals[$gKey])) {
                $typography['fontWeight'] = $this->resolveGlobalTypographyVar($globals[$gKey], 'font_weight');
            } else {
                // Check global typography group id fallback
                $globalsAll = $settings['__globals__'] ?? [];
                $groupKey = $name . '_typography';
                if (isset($globalsAll[$groupKey]) && is_string($globalsAll[$groupKey])) {
                    $typography['fontWeight'] = $this->resolveGlobalTypographyVar($globalsAll[$groupKey], 'font_weight');
                } else {
                    $typography['fontWeight'] = '600';
                }
            }
        }

        $textTransform = $get('text_transform');
        if (is_string($textTransform) && trim($textTransform) !== '') {
            $typography['textTransform'] = $textTransform;
        } else {
            $globals = $settings['__globals__'] ?? [];
            $gKey = $name . '_text_transform';
            if (isset($globals[$gKey]) && is_string($globals[$gKey])) {
                $typography['textTransform'] = $this->resolveGlobalTypographyVar($globals[$gKey], 'text_transform');
            } else {
                $typography['textTransform'] = '';
            }
        }

        $fontStyle = $get('font_style');
        if (is_string($fontStyle) && trim($fontStyle) !== '') {
            $typography['fontStyle'] = $fontStyle;
        } else {
            $globals = $settings['__globals__'] ?? [];
            $gKey = $name . '_font_style';
            if (isset($globals[$gKey]) && is_string($globals[$gKey])) {
                $typography['fontStyle'] = $this->resolveGlobalTypographyVar($globals[$gKey], 'font_style');
            } else {
                $typography['fontStyle'] = '';
            }
        }

        $lineHeightRaw = $get('line_height');
        if (is_array($lineHeightRaw) && isset($lineHeightRaw['size']) && $lineHeightRaw['size'] !== '') {
            $typography['lineHeight'] = $lineHeightRaw['size'] . ($lineHeightRaw['unit'] ?? '');
        } elseif (is_string($lineHeightRaw) && trim($lineHeightRaw) !== '' || is_numeric($lineHeightRaw)) {
            $typography['lineHeight'] = (string) $lineHeightRaw;
        } else {
            $globals = $settings['__globals__'] ?? [];
            $gKey = $name . '_line_height';
            if (isset($globals[$gKey]) && is_string($globals[$gKey])) {
                $typography['lineHeight'] = $this->resolveGlobalTypographyVar($globals[$gKey], 'line_height');
            } else {
                $typography['lineHeight'] = '';
            }
        }

        $letterSpacingRaw = $get('letter_spacing');
        if (is_array($letterSpacingRaw) && isset($letterSpacingRaw['size']) && $letterSpacingRaw['size'] !== '') {
            $typography['letterSpacing'] = $letterSpacingRaw['size'] . ($letterSpacingRaw['unit'] ?? 'px');
        } elseif (is_string($letterSpacingRaw) && trim($letterSpacingRaw) !== '' || is_numeric($letterSpacingRaw)) {
            $typography['letterSpacing'] = (string) $letterSpacingRaw;
        } else {
            $globals = $settings['__globals__'] ?? [];
            $gKey = $name . '_letter_spacing';
            if (isset($globals[$gKey]) && is_string($globals[$gKey])) {
                $typography['letterSpacing'] = $this->resolveGlobalTypographyVar($globals[$gKey], 'letter_spacing');
            } else {
                $typography['letterSpacing'] = '';
            }
        }
        // Also handle global typography group fallback for font_family if not set
        if (empty($typography['fontFamily'])) {
            $globals = $settings['__globals__'] ?? [];
            $groupKey = $name . '_typography';
            if (isset($globals[$groupKey]) && is_string($globals[$groupKey])) {
                $gf = $this->resolveGlobalTypographyVar($globals[$groupKey], 'font_family');
                if ($gf !== $globals[$groupKey]) {
                    $typography['fontFamily'] = $gf;
                }
            }
        }

        return $typography;
    }

    /**
     * Resolve Elementor Box Shadow group to CSS string.
     *
     * @param array<string, mixed> $settings
     */
    private function resolveBoxShadow(array $settings, string $name, string $default): string
    {
        $typeKey = $name . '_box_shadow_type';
        $valueKey = $name . '_box_shadow';

        $type = $settings[$typeKey] ?? 'yes';
        if ($type === '' || $type === 'no' || $type === 'none') {
            return 'none';
        }

        $boxShadow = $settings[$valueKey] ?? null;
        if (is_array($boxShadow)) {
            $h = isset($boxShadow['horizontal']) ? (int) $boxShadow['horizontal'] : 0;
            $v = isset($boxShadow['vertical']) ? (int) $boxShadow['vertical'] : 8;
            $blur = isset($boxShadow['blur']) ? (int) $boxShadow['blur'] : 32;
            $spread = isset($boxShadow['spread']) ? (int) $boxShadow['spread'] : 0;
            $color = isset($boxShadow['color']) ? trim((string) $boxShadow['color']) : 'rgba(0, 0, 0, 0.12)';
            if ($color === '') {
                $color = 'rgba(0, 0, 0, 0.12)';
            }
            // If all zero and color default empty, treat as none
            if ($h === 0 && $v === 0 && $blur === 0 && $spread === 0 && $color === 'rgba(0, 0, 0, 0.12)') {
                // keep default
            }
            return sprintf('%dpx %dpx %dpx %dpx %s', $h, $v, $blur, $spread, $color);
        }

        if (is_string($boxShadow) && trim($boxShadow) !== '') {
            return trim($boxShadow);
        }

        return $default;
    }

    /**
     * Sanitize CSS color (hex, rgb/rgba, hsl/hsla, var, named) or fallback.
     * Supports Elementor Global Colors (var(--e-global-color-...)).
     */
    private function sanitizeColor(string $value, string $fallback): string
    {
        return $this->colorResolver->sanitizeColor($value, $fallback);
    }

    /**
     * Resolve slider value (supports ['size'=>int] or int/string).
     *
     * @param mixed $value
     */
    private function resolveSliderValue(mixed $value, int $default, int $min, int $max): int
    {
        return $this->sliderResolver->resolve($value, $default, $min, $max);
    }

    /**
     * @param \Elementor\Element_Base $element
     * @param array<string, mixed> $config
     * @param string $attr
     * @param string $class
     */
    private function addDataAttribute(\Elementor\Element_Base $element, array $config, string $attr, string $class): void
    {
        $element->add_render_attribute('_wrapper', $attr, wp_json_encode($config));
        $element->add_render_attribute('_wrapper', 'class', $class);
    }
}
