<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\TextMotion\Frontend;

use Elementor\Widget_Base;

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

        $widget->add_render_attribute(
            '_wrapper',
            'class',
            self::MOTION_CLASS,
        );

        $widget->add_render_attribute(
            '_wrapper',
            'data-emje-motion',
            wp_json_encode($config),
        );

    }

    /**
     * Build the frontend motion configuration.
     *
     * @param array<string, mixed> $settings
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
        if (! in_array($splitBy, [ 'words', 'characters' ], true)) {
            $splitBy = 'words';
        }

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

            'splitBy' => $splitBy,

            'stagger' => $stagger,

            'fillBgOpacity' => $bgOpacity,

            'fillStagger' => $fillStagger,

            'livePreview' => ($settings['emje_motion_live_preview'] ?? 'yes') === 'yes',
        ];
    }
}
