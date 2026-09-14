<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\TextMotion\Frontend;

use Elementor\Widget_Base;
use EmjeCreative\EmjeMotion\Modules\InteractionMotion\Services\ColorResolver;
use EmjeCreative\EmjeMotion\Support\ColorField;
use EmjeCreative\EmjeMotion\Support\RenderAttributes;

/**
 * Handles frontend integration for the Text Motion module.
 */
final class TextMotionFrontend
{
    /**
     * Supported Elementor widgets.
     *
     * @var string[]
     */
    private const SUPPORTED_WIDGETS = [
        'heading',
        'text-editor',
    ];

    private const MOTION_CLASS = 'emje-motion';

    /**
     * Register frontend hooks.
     */
    public function register(): void
    {
        add_action(
            'elementor/widget/before_render_content',
            [ $this, 'beforeRender' ],
        );
    }

    /**
     * Runs before widget content is rendered.
     */
    public function beforeRender(Widget_Base $widget): void
    {
        if (
            ! in_array(
                $widget->get_name(),
                self::SUPPORTED_WIDGETS,
                true,
            )
        ) {
            return;
        }

        $settings = $widget->get_settings_for_display();

        if (empty($settings['emje_motion_enable'])) {
            return;
        }

        $config = $this->buildConfig($settings);

        RenderAttributes::addDataAttribute($widget, $config, 'data-emje-motion', self::MOTION_CLASS);

    }

    /**
     * Build the frontend motion configuration.
     *
     * @param array<string, mixed> $settings
     *
     * @return array<string, mixed>
     */
    private function buildConfig(array $settings): array
    {
        $customCharacters = isset($settings['emje_motion_scramble_custom_characters'])
            ? sanitize_text_field((string) $settings['emje_motion_scramble_custom_characters'])
            : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

        if (mb_strlen($customCharacters) > 200) {
            $customCharacters = mb_substr($customCharacters, 0, 200);
        }

        if ($customCharacters === '') {
            $customCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        }

        $scrambleSpeed = isset($settings['emje_motion_scramble_speed'])
            ? (float) $settings['emje_motion_scramble_speed']
            : 1.0;

        $scrambleSpeed = max(0.5, min(5.0, $scrambleSpeed));

        $duration = isset($settings['emje_motion_duration'])
            ? (float) $settings['emje_motion_duration']
            : 1.0;

        $duration = max(0.0, $duration);

        $delay = isset($settings['emje_motion_delay'])
            ? (float) $settings['emje_motion_delay']
            : 0.0;

        $delay = max(0.0, $delay);

        $stagger = isset($settings['emje_motion_unfold_stagger'])
            ? (float) $settings['emje_motion_unfold_stagger']
            : 0.04;

        $stagger = max(0.0, min(0.5, $stagger));

        $splitBy = $settings['emje_motion_unfold_split_by'] ?? 'words';
        if (! in_array($splitBy, [ 'words', 'characters', 'lines' ], true)) {
            $splitBy = 'words';
        }

        $direction = $settings['emje_motion_unfold_direction'] ?? 'up';
        if (! in_array($direction, [ 'up', 'down', 'left', 'right' ], true)) {
            $direction = 'up';
        }

        $distance = isset($settings['emje_motion_unfold_distance'])
            ? (float) $settings['emje_motion_unfold_distance']
            : 1.2;

        $distance = max(0.0, min(2.0, $distance));

        $mask = ($settings['emje_motion_unfold_mask'] ?? '') === 'yes';

        $blur = isset($settings['emje_motion_unfold_blur'])
            ? (float) $settings['emje_motion_unfold_blur']
            : 0.0;

        $blur = max(0.0, min(20.0, $blur));

        $bgOpacity = 0.25;
        if (isset($settings['emje_motion_fill_bg_opacity'])) {
            $raw = $settings['emje_motion_fill_bg_opacity'];

            if (is_array($raw) && isset($raw['size'])) {
                $bgOpacity = (float) $raw['size'];
            } elseif (is_numeric($raw)) {
                $bgOpacity = (float) $raw;
            }
        }

        $bgOpacity = max(0.0, min(1.0, $bgOpacity));

        $fillStagger = isset($settings['emje_motion_fill_stagger'])
            ? (float) $settings['emje_motion_fill_stagger']
            : 0.15;
        $fillStagger = max(0.0, min(0.5, $fillStagger));

        $fillLineMode = $settings['emje_motion_fill_line_mode'] ?? 'overlap';
        if (! in_array($fillLineMode, [ 'overlap', 'sequence' ], true)) {
            $fillLineMode = 'overlap';
        }

        $fillBlur = isset($settings['emje_motion_fill_blur'])
            ? (float) $settings['emje_motion_fill_blur']
            : 0.0;

        $fillBlur = max(0.0, min(20.0, $fillBlur));

        $fillWashColor = $this->resolveWashColor($settings);

        $animation = $settings['emje_motion_animation'] ?? '';
        if (! in_array($animation, [ 'scramble-text', 'text-unfold', 'fill-reveal' ], true)) {
            $animation = 'scramble-text';
        }

        $trigger = $settings['emje_motion_trigger'] ?? 'load';
        if (! in_array($trigger, [ 'load', 'viewport', 'hover', 'scroll' ], true)) {
            $trigger = 'load';
        }

        $ease = $settings['emje_motion_ease'] ?? 'power2.out';
        if (! in_array($ease, [
            'none',
            'power1.out',
            'power2.out',
            'power3.out',
            'power4.out',
            'back.out(1.7)',
            'elastic.out(1, 0.3)',
        ], true)) {
            $ease = 'power2.out';
        }

        // Play Once only relevant for viewport; others always replay
        $rawPlayOnce = $settings['emje_motion_play_once'] ?? null;
        if ($trigger === 'viewport') {
            $playOnce = ($rawPlayOnce ?? '') === 'yes'; // default No for viewport (UX)
        } else {
            $playOnce = false;
        }

        // Scrub boundaries only relevant for scroll. Default is Custom
        // 100/30 (effect starts as text enters, finishes at the 30% line).
        // Legacy separate Start/End keys (never released, but possibly saved
        // in drafts or cached HTML) are translated when the new key is absent.
        $scrubPresets = [ 'full', 'center', 'custom' ];

        $scrub = $settings['emje_motion_scrub'] ?? null;

        $scrubStartPos = isset($settings['emje_motion_scrub_start_position'])
            ? (float) $settings['emje_motion_scrub_start_position']
            : 100.0;

        $scrubStartPos = max(0.0, min(100.0, $scrubStartPos));

        $scrubEndPos = isset($settings['emje_motion_scrub_end_position'])
            ? (float) $settings['emje_motion_scrub_end_position']
            : 30.0;

        $scrubEndPos = max(0.0, min(100.0, $scrubEndPos));

        if ($scrub === 'visible') {
            // Retired preset: exactly custom 100/100.
            $scrub = 'custom';
            $scrubStartPos = 100.0;
            $scrubEndPos = 100.0;
        } elseif ($scrub === 'leave') {
            // Retired preset: closest sane fallback.
            $scrub = 'full';
        } elseif (! in_array($scrub, $scrubPresets, true)) {
            $scrub = null;
        }

        if ($scrub === null) {
            $legacy = $this->translateLegacyScrub($settings, $scrubStartPos, $scrubEndPos);
            $scrub = $legacy['scrub'];
            $scrubStartPos = $legacy['startPos'];
            $scrubEndPos = $legacy['endPos'];
        }

        $characterSet = $settings['emje_motion_scramble_character_set'] ?? 'letters-numbers';
        if (! in_array($characterSet, ['letters', 'numbers', 'letters-numbers', 'symbols', 'custom'], true)) {
            $characterSet = 'letters-numbers';
        }

        $revealOrder = $settings['emje_motion_scramble_reveal_order'] ?? 'left-to-right';
        if (! in_array($revealOrder, ['left-to-right', 'right-to-left', 'center-out', 'random'], true)) {
            $revealOrder = 'left-to-right';
        }

        return [
            'animation' => $animation,

            'characterSet' => $characterSet,

            'customCharacters' => $customCharacters,

            'revealOrder' => $revealOrder,

            'scrambleSpeed' => $scrambleSpeed,

            'duration' => $duration,

            'delay' => $delay,

            'ease' => $ease,

            'trigger' => $trigger,

            'playOnce' => $playOnce,

            'scrub' => $scrub,

            'scrubStartPos' => $scrubStartPos,

            'scrubEndPos' => $scrubEndPos,

            'splitBy' => $splitBy,

            'direction' => $direction,

            'distance' => $distance,

            'mask' => $mask,

            'blur' => $blur,

            'stagger' => $stagger,

            'fillBgOpacity' => $bgOpacity,

            'fillStagger' => $fillStagger,

            'fillLineMode' => $fillLineMode,

            'fillWashColor' => $fillWashColor,

            'fillBlur' => $fillBlur,

            'livePreview' => ($settings['emje_motion_live_preview'] ?? 'yes') === 'yes',
        ];
    }

    /**
     * Resolve the wash color: Elementor Global Colors via __globals__ win,
     * empty means "follow the text color".
     *
     * @param array<string, mixed> $settings
     */
    private function resolveWashColor(array $settings): string
    {
        return ColorField::pick($settings, 'emje_motion_fill_wash_color', '', new ColorResolver());
    }

    /**
     * Translate pre-simplification separate Start/End keys into the combined
     * scrub preset. Exact named matches map to presets; anything else becomes
     * custom with equivalent viewport positions (center-center anchors on the
     * element center, approximated here as 50 — close enough for a fallback).
     *
     * @param array<string, mixed> $settings
     *
     * @return array{scrub: string, startPos: float, endPos: float}
     */
    private function translateLegacyScrub(array $settings, float $startPos, float $endPos): array
    {
        $hasLegacy = isset($settings['emje_motion_scrub_start'])
            || isset($settings['emje_motion_scrub_end'])
            || isset($settings['emje_motion_scrub_start_position'])
            || isset($settings['emje_motion_scrub_end_position']);

        if (! $hasLegacy) {
            return [ 'scrub' => 'custom', 'startPos' => $startPos, 'endPos' => $endPos ];
        }

        $start = $settings['emje_motion_scrub_start'] ?? 'top-bottom';
        if (! in_array($start, [ 'top-bottom', 'top-center', 'center-center', 'top-top', 'custom' ], true)) {
            $start = 'top-bottom';
        }

        $end = $settings['emje_motion_scrub_end'] ?? 'bottom-top';
        if (! in_array($end, [ 'bottom-top', 'bottom-center', 'center-center', 'bottom-bottom', 'custom' ], true)) {
            $end = 'bottom-top';
        }

        $named = [
            'top-bottom/bottom-top' => 'full',
            'top-center/bottom-center' => 'center',
        ];

        $key = $start . '/' . $end;
        if (isset($named[$key])) {
            return [ 'scrub' => $named[$key], 'startPos' => $startPos, 'endPos' => $endPos ];
        }

        $startLines = [
            'top-bottom' => 100.0,
            'top-center' => 50.0,
            'center-center' => 50.0,
            'top-top' => 0.0,
        ];
        $endLines = [
            'bottom-top' => 0.0,
            'bottom-center' => 50.0,
            'center-center' => 50.0,
            'bottom-bottom' => 100.0,
        ];

        if ($start !== 'custom') {
            $startPos = $startLines[$start];
        }

        if ($end !== 'custom') {
            $endPos = $endLines[$end];
        }

        return [ 'scrub' => 'custom', 'startPos' => $startPos, 'endPos' => $endPos ];
    }
}
