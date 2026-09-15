<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\InteractionMotion\Frontend;

use EmjeCreative\EmjeMotion\Modules\InteractionMotion\Services\ColorResolver;
use EmjeCreative\EmjeMotion\Modules\InteractionMotion\Services\SliderResolver;
use EmjeCreative\EmjeMotion\Support\ColorField;

/**
 * Interactive Cursor config builder for Interaction Motion.
 */
final class CursorConfig
{
    private ColorResolver $colorResolver;
    private SliderResolver $sliderResolver;

    public function __construct()
    {
        $this->colorResolver = new ColorResolver();
        $this->sliderResolver = new SliderResolver();
    }

    /**
     * @param array<string, mixed> $settings
     *
     * @return array<string, mixed>
     */
    public function buildCursorConfig(array $settings, bool $isNew): array
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
            $color = ColorField::pick($settings, 'emje_interaction_cursor_color', '#000000', $this->colorResolver);
            $hoverScale = isset($settings['emje_interaction_cursor_hover_scale']) ? (float) $settings['emje_interaction_cursor_hover_scale'] : 1.5;
            $hideNative = ($settings['emje_interaction_cursor_hide_native'] ?? '') === 'yes';
            // Text Label only for Text Follow; Dot+Ring has no label.
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
            // Retired 'trail' (Comet Trail) falls through to text-follow.
            if (! in_array($type, ['dot-ring', 'text-follow'], true)) {
                $type = 'text-follow';
            }
            $hoverScale = max(1.2, min(2.0, $hoverScale));

            // Text Follow specific - allow hex, rgb/a, hsl/a, globals
            $extras = $this->resolveTextFollowExtras($settings);

            return array_merge(
                [
                    'type' => $type,
                    'size' => $size,
                    'color' => $color,
                    'hoverScale' => $hoverScale,
                    'hideNative' => $hideNative,
                    'label' => $label,
                    'livePreview' => $livePreview,
                    'disableOnMobile' => ($settings['emje_interaction_cursor_disable_mobile'] ?? 'yes') === 'yes',
                ],
                $extras,
            );
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
        $hoverScale = isset($settings['emje_cursor_hover_scale']) ? (float) $settings['emje_cursor_hover_scale'] : 1.5;
        $hideNative = ($settings['emje_cursor_hide_native'] ?? '') === 'yes';
        $label = isset($settings['emje_cursor_text_label']) ? (string) $settings['emje_cursor_text_label'] : 'View';
        $label = sanitize_text_field($label);
        if ($label === '') {
            $label = 'View';
        }
        $livePreview = ($settings['emje_cursor_live_preview'] ?? '') === 'yes';
        // Retired 'trail' (Comet Trail) falls through to text-follow.
        if (! in_array($type, ['dot-ring', 'text-follow'], true)) {
            $type = 'text-follow';
        }
        $hoverScale = max(1.2, min(2.0, $hoverScale));

        return [
            'type' => $type,
            'size' => $size,
            'color' => $color,
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
            'livePreview' => $livePreview,
            // Legacy v1.0.0 keys predate the per-effect toggle — keep the
            // historical hidden-on-touch behavior.
            'disableOnMobile' => true,
        ];
    }

    /**
     * Resolve Text Follow extras (pill styling, typography, entrance, shadow).
     *
     * @param array<string, mixed> $settings
     *
     * @return array<string, mixed>
     */
    private function resolveTextFollowExtras(array $settings): array
    {
        $bgColor = ColorField::pick($settings, 'emje_interaction_cursor_bg_color', '#FFFFFF', $this->colorResolver);
        $textColor = ColorField::pick($settings, 'emje_interaction_cursor_text_color', '#111111', $this->colorResolver);
        $paddingY = $this->sliderResolver->resolve($settings['emje_interaction_cursor_padding_y'] ?? 40, 40, 8, 48);
        $paddingX = $this->sliderResolver->resolve($settings['emje_interaction_cursor_padding_x'] ?? 32, 32, 12, 56);
        $radius = $this->sliderResolver->resolve($settings['emje_interaction_cursor_radius'] ?? 99, 99, 0, 100);
        $typography = $this->resolveTypography($settings, 'emje_interaction_cursor_typography');
        // Legacy v1.0.0 compat: old pages stored a plain font_size slider
        // with no matching Elementor control; keep reading it as fallback.
        $fontSizeLegacy = $this->sliderResolver->resolve($settings['emje_interaction_cursor_font_size'] ?? null, $typography['fontSize'] ?? 14, 10, 24);
        if (isset($typography['fontSize']) && $typography['fontSize'] > 0) {
            $fontSizeLegacy = $typography['fontSize'];
        }
        $fontSize = $fontSizeLegacy;
        $entrance = isset($settings['emje_interaction_cursor_entrance']) ? (string) $settings['emje_interaction_cursor_entrance'] : 'scale';
        if (! in_array($entrance, ['scale', 'scale-bounce', 'none'], true)) {
            $entrance = 'scale';
        }
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
            // legacy keys for backward compat
            'shadow' => $boxShadow !== 'none',
            'shadowBlur' => 32,
        ];
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
     *
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
            $fontFamily = trim($fontFamily);
            // Reject anything that could break out of a CSS value context.
            if (preg_match('/[;{}<>"\']/i', $fontFamily) === 1) {
                $fontFamily = '';
            }
            $typography['fontFamily'] = $fontFamily;
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
            // Sanitize the color so the box-shadow string cannot carry CSS injection.
            $color = $this->colorResolver->sanitizeColor($color, 'rgba(0, 0, 0, 0.12)');
            return sprintf('%dpx %dpx %dpx %dpx %s', $h, $v, $blur, $spread, $color);
        }

        if (is_string($boxShadow) && trim($boxShadow) !== '') {
            // Reject any value that could break out of a CSS value context.
            $shadow = trim($boxShadow);
            if (preg_match('/[;{}<>"\']|url\(/i', $shadow) === 1) {
                return $default;
            }
            return $shadow;
        }

        return $default;
    }
}
