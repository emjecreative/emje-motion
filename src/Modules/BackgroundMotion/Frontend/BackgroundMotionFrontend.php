<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\BackgroundMotion\Frontend;

use EmjeCreative\EmjeMotion\Modules\InteractionMotion\Services\ColorResolver;
use EmjeCreative\EmjeMotion\Modules\InteractionMotion\Services\SliderResolver;

/**
 * Renders Background Motion frontend attributes for Container.
 * Effects: ascii / pixel / dither.
 *
 * Color/slider sanitizing is shared with Interaction Motion via
 * ColorResolver + SliderResolver (single source of truth).
 */
final class BackgroundMotionFrontend
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
     * @param mixed $element
     */
    public function beforeRender($element): void
    {
        if (! is_object($element) || ! method_exists($element, 'get_settings_for_display')) {
            return;
        }

        /** @var mixed $raw */
        $raw = $element->get_settings_for_display();
        $settings = is_array($raw) ? $raw : [];

        if (empty($settings['emje_background_enable'])) {
            return;
        }

        $effect = isset($settings['emje_background_effect']) ? (string) $settings['emje_background_effect'] : 'ascii';
        if ($effect === 'ascii-interactive') {
            $effect = 'ascii';
        }
        if (! in_array($effect, ['ascii', 'pixel', 'dither'], true)) {
            // Unknown/retired effect (e.g. aurora sketches) — fall back to ASCII.
            $effect = 'ascii';
        }

        if ($effect === 'pixel') {
            $config = $this->buildPixelConfig($settings);
        } elseif ($effect === 'dither') {
            $config = $this->buildDitherConfig($settings);
        } else {
            $config = $this->buildAsciiConfig($settings);
        }

        $this->addDataAttribute($element, $config, 'data-emje-background', 'emje-background-motion');
    }

    /**
     * @param array<string, mixed> $settings
     *
     * @return array<string, mixed>
     */
    private function buildAsciiConfig(array $settings): array
    {
        $colorRaw = trim((string) ($settings['emje_background_ascii_color'] ?? ''));
        $globals = $settings['__globals__'] ?? [];
        if (is_array($globals) && isset($globals['emje_background_ascii_color']) && is_string($globals['emje_background_ascii_color']) && trim($globals['emje_background_ascii_color']) !== '') {
            $colorRaw = $this->colorResolver->resolveGlobalColorVar($globals['emje_background_ascii_color']);
        }
        if ($colorRaw === '') {
            $colorRaw = '#3B82F6';
        }

        $charset = isset($settings['emje_background_ascii_charset']) ? (string) $settings['emje_background_ascii_charset'] : 'full';
        if (! in_array($charset, ['full', 'simple'], true)) {
            $charset = 'full';
        }

        return [
            'effect' => 'ascii',
            'color' => $this->colorResolver->sanitizeColor($colorRaw, '#3B82F6'),
            'charset' => $charset,
            'cellW' => $this->sliderResolver->resolveFloat($settings['emje_background_ascii_cell_w'] ?? 22, 22, 8, 60),
            'cellH' => $this->sliderResolver->resolveFloat($settings['emje_background_ascii_cell_h'] ?? 26, 26, 8, 60),
            'fontSize' => $this->sliderResolver->resolveFloat($settings['emje_background_ascii_font'] ?? 14, 14, 6, 32),
            'radius' => $this->sliderResolver->resolveFloat($settings['emje_background_ascii_radius'] ?? 360, 360, 100, 600),
            'innerRadius' => $this->sliderResolver->resolveFloat($settings['emje_background_ascii_inner'] ?? 30, 30, 0, 200),
            'maxOpacity' => $this->sliderResolver->resolveFloat($settings['emje_background_ascii_opacity'] ?? 0.35, 0.35, 0, 1),
            'fade' => $this->sliderResolver->resolveFloat($settings['emje_background_ascii_fade'] ?? 10, 10, 0, 30),
            'livePreview' => ($settings['emje_background_live_preview'] ?? '') === 'yes',
            'disableOnMobile' => ($settings['emje_background_ascii_disable_mobile'] ?? 'yes') === 'yes',
        ];
    }

    /**
     * @param array<string, mixed> $settings
     *
     * @return array<string, mixed>
     */
    private function buildPixelConfig(array $settings): array
    {
        $baseRaw = trim((string) ($settings['emje_background_pixel_base'] ?? ''));
        $activeRaw = trim((string) ($settings['emje_background_pixel_active'] ?? ''));
        $globals = $settings['__globals__'] ?? [];
        if (is_array($globals)) {
            if (isset($globals['emje_background_pixel_base']) && is_string($globals['emje_background_pixel_base']) && trim($globals['emje_background_pixel_base']) !== '') {
                $baseRaw = $this->colorResolver->resolveGlobalColorVar($globals['emje_background_pixel_base']);
            }
            if (isset($globals['emje_background_pixel_active']) && is_string($globals['emje_background_pixel_active']) && trim($globals['emje_background_pixel_active']) !== '') {
                $activeRaw = $this->colorResolver->resolveGlobalColorVar($globals['emje_background_pixel_active']);
            }
        }
        if ($baseRaw === '') {
            $baseRaw = 'rgba(255, 255, 255, 0.08)';
        }
        if ($activeRaw === '') {
            $activeRaw = '#3B82F6';
        }
        $borderRaw = trim((string) ($settings['emje_background_pixel_border'] ?? ''));
        if (is_array($globals)) {
            if (isset($globals['emje_background_pixel_border']) && is_string($globals['emje_background_pixel_border']) && trim($globals['emje_background_pixel_border']) !== '') {
                $borderRaw = $this->colorResolver->resolveGlobalColorVar($globals['emje_background_pixel_border']);
            }
        }
        if ($borderRaw === '') {
            $borderRaw = 'rgba(255, 255, 255, 0.15)';
        }

        $fit = isset($settings['emje_background_pixel_fit']) ? (string) $settings['emje_background_pixel_fit'] : 'stretch';
        if (! in_array($fit, ['stretch', 'crop'], true)) {
            $fit = 'stretch';
        }

        return [
            'effect' => 'pixel',
            'base' => $this->colorResolver->sanitizeColor($baseRaw, 'rgba(255, 255, 255, 0.08)'),
            'active' => $this->colorResolver->sanitizeColor($activeRaw, '#3B82F6'),
            'fit' => $fit,
            'cellSize' => $this->sliderResolver->resolveFloat($settings['emje_background_pixel_size'] ?? 56, 56, 24, 96),
            'gap' => $this->sliderResolver->resolveFloat($settings['emje_background_pixel_gap'] ?? 2, 2, 0, 12),
            'borderW' => $this->sliderResolver->resolveFloat($settings['emje_background_pixel_border_w'] ?? 1, 1, 0, 2),
            'border' => $this->colorResolver->sanitizeColor($borderRaw, 'rgba(255, 255, 255, 0.15)'),
            'speed' => $this->sliderResolver->resolveFloat($settings['emje_background_pixel_speed'] ?? 0.15, 0.15, 0.05, 0.5),
            'radius' => $this->sliderResolver->resolveFloat($settings['emje_background_pixel_radius'] ?? 120, 120, 0, 300),
            'trail' => $this->sliderResolver->resolveFloat($settings['emje_background_pixel_trail'] ?? 0.4, 0.4, 0, 1.5),
            'fade' => $this->sliderResolver->resolveFloat($settings['emje_background_pixel_fade'] ?? 10, 10, 0, 30),
            'livePreview' => ($settings['emje_background_live_preview'] ?? '') === 'yes',
            'disableOnMobile' => ($settings['emje_background_pixel_disable_mobile'] ?? 'yes') === 'yes',
        ];
    }

    /**
     * @param array<string, mixed> $settings
     *
     * @return array<string, mixed>
     */
    private function buildDitherConfig(array $settings): array
    {
        $fgRaw = trim((string) ($settings['emje_background_dither_fg'] ?? ''));
        $bgRaw = trim((string) ($settings['emje_background_dither_bg'] ?? ''));
        $globals = $settings['__globals__'] ?? [];
        if (is_array($globals)) {
            if (isset($globals['emje_background_dither_fg']) && is_string($globals['emje_background_dither_fg']) && trim($globals['emje_background_dither_fg']) !== '') {
                $fgRaw = $this->colorResolver->resolveGlobalColorVar($globals['emje_background_dither_fg']);
            }
            if (isset($globals['emje_background_dither_bg']) && is_string($globals['emje_background_dither_bg']) && trim($globals['emje_background_dither_bg']) !== '') {
                $bgRaw = $this->colorResolver->resolveGlobalColorVar($globals['emje_background_dither_bg']);
            }
        }
        if ($fgRaw === '') {
            $fgRaw = '#3B82F6';
        }
        if ($bgRaw === '') {
            $bgRaw = 'rgba(255, 255, 255, 0)';
        }

        return [
            'effect' => 'dither',
            'fg' => $this->colorResolver->sanitizeColor($fgRaw, '#3B82F6'),
            'bg' => $this->colorResolver->sanitizeColor($bgRaw, 'rgba(255, 255, 255, 0)'),
            'pixel' => $this->sliderResolver->resolveFloat($settings['emje_background_dither_pixel'] ?? 8, 8, 4, 32),
            'density' => $this->sliderResolver->resolveFloat($settings['emje_background_dither_density'] ?? 0.5, 0.5, 0, 1),
            'scale' => $this->sliderResolver->resolveFloat($settings['emje_background_dither_scale'] ?? 1.5, 1.5, 0.5, 4),
            'speed' => $this->sliderResolver->resolveFloat($settings['emje_background_dither_speed'] ?? 0.6, 0.6, 0, 2),
            'ripple' => ($settings['emje_background_dither_ripple'] ?? 'yes') === 'yes',
            'rippleStrength' => $this->sliderResolver->resolveFloat($settings['emje_background_dither_ripple_strength'] ?? 0.6, 0.6, 0, 1),
            'rippleWidth' => $this->sliderResolver->resolveFloat($settings['emje_background_dither_ripple_width'] ?? 140, 140, 20, 400),
            'rippleSpeed' => $this->sliderResolver->resolveFloat($settings['emje_background_dither_ripple_speed'] ?? 420, 420, 100, 1200),
            'fade' => $this->sliderResolver->resolveFloat($settings['emje_background_dither_fade'] ?? 10, 10, 0, 30),
            'livePreview' => ($settings['emje_background_live_preview'] ?? '') === 'yes',
            'disableOnMobile' => ($settings['emje_background_dither_disable_mobile'] ?? '') === 'yes',
        ];
    }

    /**
     * @param mixed $element
     * @param array<string, mixed> $config
     */
    private function addDataAttribute($element, array $config, string $attr, string $class): void
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
