<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\TextMotion\Controls;

use Elementor\Controls_Manager;

/**
 * Registers Elementor controls for Text Motion.
 */
final class TextMotionControls
{
    /**
     * Register Elementor hooks.
     */
    public function register(): void
    {
        add_action(
            'elementor/element/heading/section_title_style/after_section_end',
            [ $this, 'registerHeadingControls' ],
            10,
            2,
        );

        add_action(
            'elementor/element/text-editor/section_style/after_section_end',
            [ $this, 'registerTextEditorControls' ],
            10,
            2,
        );
    }

    /**
     * Register controls for Heading widget.
     */
    public function registerHeadingControls($element, array $args): void
    {
        $this->registerControls($element);
    }

    /**
     * Register controls for Text Editor widget.
     */
    public function registerTextEditorControls($element, array $args): void
    {
        $this->registerControls($element);
    }

    /**
     * Register shared controls.
     */
    private function registerControls($element): void
    {
        $element->start_controls_section(
            'emje_motion_text_motion',
            [
                'label' => esc_html__('Text Motion', 'emje-motion'),
                'tab' => Controls_Manager::TAB_STYLE,
            ],
        );

        $element->add_control(
            'emje_motion_brand_header',
            [
                'type' => Controls_Manager::RAW_HTML,
                'raw' => '<div class="emje-brand-header"><img src="' . esc_url(EMJE_MOTION_URL . 'assets/images/emje-motion-logo.svg') . '" alt="" width="16" height="16" style="border-radius:3px;flex-shrink:0;" /><span>Emje Motion</span><span class="emje-brand-header__badge">Text Motion</span></div>',
                'content_classes' => 'emje-brand-header-wrap',
            ],
        );

        $this->registerGeneralControls($element);
        $this->registerPreviewControls($element);
        $this->registerScrambleControls($element);
        $this->registerUnfoldControls($element);
        $this->registerFillRevealControls($element);

        $this->registerPlaybackControls($element);
        $this->registerTriggerControls($element);

        $element->end_controls_section();
    }

    /**
    * Register general controls.
    */
    private function registerGeneralControls($element): void
    {
        $element->add_control(
            'emje_motion_enable',
            [
                'label' => esc_html__('Enable', 'emje-motion'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => esc_html__('On', 'emje-motion'),
                'label_off' => esc_html__('Off', 'emje-motion'),
                'return_value' => 'yes',
                'default' => '',
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_motion_animation',
            [
                'label' => esc_html__('Animation', 'emje-motion'),
                'type' => Controls_Manager::SELECT,
                'default' => 'scramble-text',
                'options' => [
                    'scramble-text' => esc_html__('Scramble', 'emje-motion'),
                    'text-unfold' => esc_html__('Unfold', 'emje-motion'),
                    'fill-reveal' => esc_html__('Fill Reveal', 'emje-motion'),
                ],
                'condition' => [
                    'emje_motion_enable' => 'yes',
                ],
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );
    }

    /**
    * Register Scramble Text controls.
    */
    private function registerScrambleControls($element): void
    {
        $element->add_control(
            'emje_motion_scramble_heading',
            [
                'label' => esc_html__('Scramble', 'emje-motion'),
                'type' => Controls_Manager::HEADING,
                'separator' => 'before',
                'condition' => [
                    'emje_motion_enable' => 'yes',
                    'emje_motion_animation' => 'scramble-text',
                ],
            ],
        );

        $element->add_control(
            'emje_motion_scramble_character_set',
            [
                'label' => esc_html__('Character Set', 'emje-motion'),
                'type' => Controls_Manager::SELECT,
                'default' => 'letters-numbers',
                'options' => [
                    'letters' => esc_html__('Letters', 'emje-motion'),
                    'numbers' => esc_html__('Numbers', 'emje-motion'),
                    'letters-numbers' => esc_html__('Letters & Numbers', 'emje-motion'),
                    'symbols' => esc_html__('Symbols', 'emje-motion'),
                    'custom' => esc_html__('Custom', 'emje-motion'),
                ],
                'condition' => [
                    'emje_motion_enable' => 'yes',
                    'emje_motion_animation' => 'scramble-text',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_control(
            'emje_motion_scramble_custom_characters',
            [
                'label' => esc_html__('Custom Characters', 'emje-motion'),
                'type' => Controls_Manager::TEXT,
                'default' => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
                'placeholder' => esc_html__('Enter custom characters', 'emje-motion'),
                'condition' => [
                    'emje_motion_enable' => 'yes',
                    'emje_motion_animation' => 'scramble-text',
                    'emje_motion_scramble_character_set' => 'custom',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_control(
            'emje_motion_scramble_reveal_order',
            [
                'label' => esc_html__('Reveal Order', 'emje-motion'),
                'type' => Controls_Manager::SELECT,
                'default' => 'left-to-right',
                'options' => [
                    'left-to-right' => esc_html__('Left → Right', 'emje-motion'),
                    'right-to-left' => esc_html__('Right → Left', 'emje-motion'),
                    'center-out' => esc_html__('Center Out', 'emje-motion'),
                    'random' => esc_html__('Random', 'emje-motion'),
                ],
                'condition' => [
                    'emje_motion_enable' => 'yes',
                    'emje_motion_animation' => 'scramble-text',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_control(
            'emje_motion_scramble_speed',
            [
                'label' => esc_html__('Scramble Speed', 'emje-motion'),
                'type' => Controls_Manager::NUMBER,
                'default' => 1,
                'min' => 0.5,
                'max' => 5,
                'step' => 0.1,
                'description' => esc_html__(
                    'Controls how quickly random characters change. 1 = Normal speed.',
                    'emje-motion',
                ),
                'classes' => 'emje-control--has-tooltip',
                'condition' => [
                    'emje_motion_enable' => 'yes',
                    'emje_motion_animation' => 'scramble-text',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

    }

    /**
     * Register Unfold controls.
     */
    private function registerUnfoldControls($element): void
    {
        $element->add_control(
            'emje_motion_unfold_heading',
            [
                'label' => esc_html__('Unfold', 'emje-motion'),
                'type' => Controls_Manager::HEADING,
                'separator' => 'before',
                'condition' => [
                    'emje_motion_enable' => 'yes',
                    'emje_motion_animation' => 'text-unfold',
                ],
            ],
        );

        $element->add_control(
            'emje_motion_unfold_split_by',
            [
                'label' => esc_html__('Split By', 'emje-motion'),
                'type' => Controls_Manager::SELECT,
                'default' => 'words',
                'options' => [
                    'words' => esc_html__('Words', 'emje-motion'),
                    'characters' => esc_html__('Characters', 'emje-motion'),
                ],
                'condition' => [
                    'emje_motion_enable' => 'yes',
                    'emje_motion_animation' => 'text-unfold',
                ],
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_motion_unfold_stagger',
            [
                'label' => esc_html__('Stagger', 'emje-motion'),
                'type' => Controls_Manager::NUMBER,
                'default' => 0.04,
                'min' => 0,
                'max' => 0.5,
                'step' => 0.01,
                'description' => esc_html__(
                    'Delay between each word/character animation, in seconds.',
                    'emje-motion',
                ),
                'classes' => 'emje-control--has-tooltip',
                'condition' => [
                    'emje_motion_enable' => 'yes',
                    'emje_motion_animation' => 'text-unfold',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );
    }

    /**
     * Register Fill Reveal controls.
     */
    private function registerFillRevealControls($element): void
    {
        $element->add_control(
            'emje_motion_fill_heading',
            [
                'label' => esc_html__('Fill Reveal', 'emje-motion'),
                'type' => Controls_Manager::HEADING,
                'separator' => 'before',
                'condition' => [
                    'emje_motion_enable' => 'yes',
                    'emje_motion_animation' => 'fill-reveal',
                ],
            ],
        );

        $element->add_control(
            'emje_motion_fill_bg_opacity',
            [
                'label' => esc_html__('Background Opacity', 'emje-motion'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => [ 'px' ],
                'range' => [
                    'px' => [
                        'min' => 0,
                        'max' => 1,
                        'step' => 0.05,
                    ],
                ],
                'default' => [
                    'size' => 0.25,
                    'unit' => 'px',
                ],
                'description' => esc_html__(
                    'Opacity of the background text layer.',
                    'emje-motion',
                ),
                'classes' => 'emje-control--has-tooltip',
                'condition' => [
                    'emje_motion_enable' => 'yes',
                    'emje_motion_animation' => 'fill-reveal',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_control(
            'emje_motion_fill_stagger',
            [
                'label' => esc_html__('Line Stagger', 'emje-motion'),
                'type' => Controls_Manager::NUMBER,
                'default' => 0.15,
                'min' => 0,
                'max' => 0.5,
                'step' => 0.01,
                'description' => esc_html__(
                    'Delay between lines. 0 = together, 0.15 = next line starts after 0.15s. For 25% overlap with 1s duration use 0.25.',
                    'emje-motion',
                ),
                'classes' => 'emje-control--has-tooltip',
                'condition' => [
                    'emje_motion_enable' => 'yes',
                    'emje_motion_animation' => 'fill-reveal',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );
    }

    /**
     * Register playback controls.
     */
    private function registerPlaybackControls($element): void
    {
        $element->add_control(
            'emje_motion_playback_heading',
            [
                'label' => esc_html__('Timing', 'emje-motion'),
                'type' => Controls_Manager::HEADING,
                'separator' => 'before',
                'condition' => [
                    'emje_motion_enable' => 'yes',
                ],
            ],
        );

        $element->add_control(
            'emje_motion_duration',
            [
                'label' => esc_html__('Duration', 'emje-motion'),
                'type' => Controls_Manager::NUMBER,
                'default' => 1,
                'min' => 0,
                'step' => 0.1,
                'description' => esc_html__(
                    'Total animation duration in seconds.',
                    'emje-motion',
                ),
                'classes' => 'emje-control--has-tooltip',
                'condition' => [
                    'emje_motion_enable' => 'yes',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_control(
            'emje_motion_delay',
            [
                'label' => esc_html__('Delay', 'emje-motion'),
                'type' => Controls_Manager::NUMBER,
                'default' => 0,
                'min' => 0,
                'step' => 0.1,
                'description' => esc_html__(
                    'Delay before the animation starts, in seconds.',
                    'emje-motion',
                ),
                'classes' => 'emje-control--has-tooltip',
                'condition' => [
                    'emje_motion_enable' => 'yes',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_control(
            'emje_motion_ease',
            [
                'label' => esc_html__('Ease', 'emje-motion'),
                'type' => Controls_Manager::SELECT,
                'default' => 'power2.out',
                'options' => [
                    'none' => esc_html__('None (Linear)', 'emje-motion'),
                    'power1.out' => esc_html__('Power1 Out', 'emje-motion'),
                    'power2.out' => esc_html__('Power2 Out', 'emje-motion'),
                    'power3.out' => esc_html__('Power3 Out', 'emje-motion'),
                    'power4.out' => esc_html__('Power4 Out', 'emje-motion'),
                    'back.out(1.7)' => esc_html__('Back Out', 'emje-motion'),
                    'elastic.out(1, 0.3)' => esc_html__('Elastic Out', 'emje-motion'),
                ],
                'description' => esc_html__(
                    'Controls the animation easing.',
                    'emje-motion',
                ),
                'classes' => 'emje-control--has-tooltip',
                'condition' => [
                    'emje_motion_enable' => 'yes',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

    }

    private function registerPreviewControls($element): void
    {
        $element->add_control(
            'emje_motion_preview_heading',
            [
                'label' => esc_html__('Preview', 'emje-motion'),
                'type' => Controls_Manager::HEADING,
                'separator' => 'before',
                'condition' => [
                    'emje_motion_enable' => 'yes',
                ],
            ],
        );

        $element->add_control(
            'emje_motion_live_preview',
            [
                'label' => esc_html__('Live Preview', 'emje-motion'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => esc_html__('On', 'emje-motion'),
                'label_off' => esc_html__('Off', 'emje-motion'),
                'return_value' => 'yes',
                'default' => 'yes',
                'description' => esc_html__('Automatically replay animation when controls change.', 'emje-motion'),
                'classes' => 'emje-control--has-tooltip',
                'frontend_available' => true,
                'render_type' => 'none',
                'condition' => [
                    'emje_motion_enable' => 'yes',
                ],
            ],
        );

        $element->add_control(
            'emje_motion_preview_button',
            [
                'type' => Controls_Manager::RAW_HTML,
                'raw' => '<button type="button" class="elementor-button elementor-button-success emje-motion-preview-btn" style="width:100%;margin-top:8px;"><i class="eicon-play" aria-hidden="true"></i> ' . esc_html__('Preview Animation', 'emje-motion') . '</button><div class="elementor-control-field-description">' . esc_html__('Replays animation regardless of Play Once.', 'emje-motion') . '</div>',
                'content_classes' => 'emje-motion-preview-control',
                'condition' => [
                    'emje_motion_enable' => 'yes',
                    'emje_motion_live_preview' => 'yes',
                ],
            ],
        );
    }

    private function registerTriggerControls($element): void
    {
        $element->add_control(
            'emje_motion_trigger_heading',
            [
                'label' => esc_html__('Trigger', 'emje-motion'),
                'type' => Controls_Manager::HEADING,
                'condition' => [
                    'emje_motion_enable' => 'yes',
                ],
            ],
        );

        $element->add_control(
            'emje_motion_trigger',
            [
                'label' => esc_html__('Event', 'emje-motion'),
                'type' => Controls_Manager::SELECT,
                'default' => 'load',
                'options' => [
                    'load' => esc_html__('Page Load', 'emje-motion'),
                    'viewport' => esc_html__('Scroll Into View', 'emje-motion'),
                    'hover' => esc_html__('Hover', 'emje-motion'),
                    'scroll' => esc_html__('On Scroll (Scrub)', 'emje-motion'),
                ],
                'condition' => [
                    'emje_motion_enable' => 'yes',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_control(
            'emje_motion_play_once',
            [
                'label' => esc_html__('Play Once', 'emje-motion'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => esc_html__('Yes', 'emje-motion'),
                'label_off' => esc_html__('No', 'emje-motion'),
                'return_value' => 'yes',
                'default' => '',
                'description' => esc_html__(
                    'Prevent the animation from replaying after it has completed.',
                    'emje-motion',
                ),
                'classes' => 'emje-control--has-tooltip',
                'condition' => [
                    'emje_motion_enable' => 'yes',
                    'emje_motion_trigger' => 'viewport',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );
    }
}
