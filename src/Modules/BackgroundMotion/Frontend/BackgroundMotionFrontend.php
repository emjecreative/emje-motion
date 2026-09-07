<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\BackgroundMotion\Frontend;

use EmjeCreative\EmjeMotion\Admin\SettingsRepository;

/**
 * Renders Background Motion frontend attributes for Container.
 * Only ascii renders for now; aurora is a name placeholder.
 */
final class BackgroundMotionFrontend
{
    private SettingsRepository $settings;

    public function __construct(?SettingsRepository $settings = null)
    {
        $this->settings = $settings ?? new SettingsRepository();
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

        // Legacy value from early builds.
        if ($effect === 'ascii-interactive') {
            $effect = 'ascii';
        }

        if ($effect !== 'ascii') {
            // Aurora: name only for now — render nothing.
            return;
        }

        $config = $this->buildAsciiConfig($settings);

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
            $colorRaw = $this->resolveGlobalColorVar($globals['emje_background_ascii_color']);
        }
        if ($colorRaw === '') {
            $colorRaw = '#FFFFFF';
        }

        $charset = isset($settings['emje_background_ascii_charset']) ? (string) $settings['emje_background_ascii_charset'] : 'full';
        if (! in_array($charset, ['full', 'simple'], true)) {
            $charset = 'full';
        }

        $globalSettings = $this->settings->getSettings();

        return [
            'effect' => 'ascii',
            'color' => $this->sanitizeColor($colorRaw, '#FFFFFF'),
            'charset' => $charset,
            'cellW' => $this->resolveFloat($settings['emje_background_ascii_cell_w'] ?? 22, 22, 8, 60),
            'cellH' => $this->resolveFloat($settings['emje_background_ascii_cell_h'] ?? 26, 26, 8, 60),
            'fontSize' => $this->resolveFloat($settings['emje_background_ascii_font'] ?? 14, 14, 6, 32),
            'radius' => $this->resolveFloat($settings['emje_background_ascii_radius'] ?? 360, 360, 100, 600),
            'innerRadius' => $this->resolveFloat($settings['emje_background_ascii_inner'] ?? 30, 30, 0, 200),
            'maxOpacity' => $this->resolveFloat($settings['emje_background_ascii_opacity'] ?? 0.35, 0.35, 0, 1),
            'fade' => $this->resolveFloat($settings['emje_background_ascii_fade'] ?? 10, 10, 0, 30),
            'livePreview' => ($settings['emje_background_live_preview'] ?? '') === 'yes',
            'disableOnMobile' => ! empty($globalSettings['disable_interaction_on_mobile']),
        ];
    }

    /**
     * @param mixed $value
     */
    private function resolveFloat(mixed $value, float $default, float $min, float $max): float
    {
        $raw = $value;
        if (is_array($value) && isset($value['size'])) {
            $raw = $value['size'];
        }
        if (! is_numeric($raw)) {
            return $default;
        }

        return max($min, min($max, (float) $raw));
    }

    private function resolveGlobalColorVar(string $globalValue): string
    {
        if (str_contains($globalValue, 'globals/colors')) {
            $parts = parse_url($globalValue);
            if (isset($parts['query'])) {
                parse_str($parts['query'], $query);
                if (isset($query['id']) && is_string($query['id']) && $query['id'] !== '') {
                    $id = preg_replace('/[^a-zA-Z0-9_-]/', '', $query['id']);
                    return "var(--e-global-color-{$id})";
                }
            }
            if (preg_match('/id=([^&]+)/', $globalValue, $m)) {
                $id = preg_replace('/[^a-zA-Z0-9_-]/', '', $m[1]);
                return "var(--e-global-color-{$id})";
            }
        }
        if (str_starts_with($globalValue, 'var(')) {
            return $globalValue;
        }

        return $globalValue;
    }

    private function sanitizeColor(string $value, string $fallback): string
    {
        $value = trim($value);
        if ($value === '') {
            return $fallback;
        }
        if (preg_match('/[;{}<>"\']|url\(/i', $value) === 1) {
            return $fallback;
        }
        $hex = sanitize_hex_color($value);
        if ($hex) {
            return $hex;
        }
        if (preg_match('/^(?:rgba?|hsla?)\s*\([0-9.,%\s\/]+\)$/i', $value)) {
            return $value;
        }
        if (preg_match('/^var\(\s*--[a-zA-Z0-9_-]+\s*\)$/i', $value)) {
            return $value;
        }
        if (preg_match('/^[a-zA-Z]+$/', $value)) {
            return strtolower($value);
        }

        return $fallback;
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
