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
            2
        );

        add_action(
            'elementor/element/text-editor/section_style/after_section_end',
            [ $this, 'registerTextEditorControls' ],
            10,
            2
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
                'tab'   => Controls_Manager::TAB_STYLE,
            ]
        );

		$this->registerGeneralControls($element);
		$this->registerScrambleControls($element);

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
            	'label'        => esc_html__( 'Enable', 'emje-motion' ),
            	'type'         => Controls_Manager::SWITCHER,
            	'label_on'     => esc_html__( 'On', 'emje-motion' ),
            	'label_off'    => esc_html__( 'Off', 'emje-motion' ),
            	'return_value' => 'yes',
            	'default'      => '',
        	]
    	);

    	$element->add_control(
        	'emje_motion_animation',
        	[
            	'label'     => esc_html__( 'Animation', 'emje-motion' ),
            	'type'      => Controls_Manager::SELECT,
            	'default'   => 'scramble-text',
            	'options'   => [
                	'scramble-text' => esc_html__( 'Scramble', 'emje-motion' ),
                	'text-unfold'   => esc_html__( 'Unfold', 'emje-motion' ),
                	'fill-reveal'   => esc_html__( 'Fill Reveal', 'emje-motion' ),
            	],
            	'condition' => [
                	'emje_motion_enable' => 'yes',
            	],
        	]
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
				'label'     => esc_html__( 'Scramble', 'emje-motion' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => [
					'emje_motion_enable'    => 'yes',
					'emje_motion_animation' => 'scramble-text',
				],
			]
    	);

		$element->add_control(
			'emje_motion_scramble_character_set',
			[
				'label'     => esc_html__( 'Character Set', 'emje-motion' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'letters-numbers',
				'options'   => [
					'letters'          => esc_html__( 'Letters', 'emje-motion' ),
					'numbers'          => esc_html__( 'Numbers', 'emje-motion' ),
					'letters-numbers'  => esc_html__( 'Letters & Numbers', 'emje-motion' ),
					'symbols'          => esc_html__( 'Symbols', 'emje-motion' ),
					'custom'           => esc_html__( 'Custom', 'emje-motion' ),
				],
				'condition' => [
					'emje_motion_enable'    => 'yes',
					'emje_motion_animation' => 'scramble-text',
				],
			]
		);

		$element->add_control(
			'emje_motion_scramble_custom_characters',
			[
				'label'       => esc_html__( 'Custom Characters', 'emje-motion' ),
				'type'        => Controls_Manager::TEXT,
				'default'     => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
				'placeholder' => esc_html__( 'Enter custom characters', 'emje-motion' ),
				'condition'   => [
					'emje_motion_enable'                 => 'yes',
					'emje_motion_animation'              => 'scramble-text',
					'emje_motion_scramble_character_set' => 'custom',
				],
			]
		);

		$element->add_control(
			'emje_motion_scramble_reveal_order',
			[
				'label'     => esc_html__( 'Reveal Order', 'emje-motion' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'left-to-right',
				'options'   => [
					'left-to-right' => esc_html__( 'Left → Right', 'emje-motion' ),
					'right-to-left' => esc_html__( 'Right → Left', 'emje-motion' ),
					'center-out'    => esc_html__( 'Center Out', 'emje-motion' ),
					'random'        => esc_html__( 'Random', 'emje-motion' ),
				],
				'condition' => [
					'emje_motion_enable'    => 'yes',
					'emje_motion_animation' => 'scramble-text',
				],
			]
		);

		$element->add_control(
			'emje_motion_scramble_speed',
			[
				'label'       => esc_html__( 'Scramble Speed', 'emje-motion' ),
				'type'        => Controls_Manager::NUMBER,
				'default'     => 1,
				'min'         => 0.5,
				'max'         => 5,
				'step'        => 0.1,
				'description' => esc_html__(
					'Controls how quickly random characters change. 1 = Normal speed.',
					'emje-motion'
				),
				'condition'   => [
					'emje_motion_enable'    => 'yes',
					'emje_motion_animation' => 'scramble-text',
				],
			]
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
				'label' => esc_html__( 'Timing', 'emje-motion' ),
				'type'  => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => [
					'emje_motion_enable' => 'yes',
				],
			]
		);

		$element->add_control(
			'emje_motion_duration',
			[
				'label'       => esc_html__( 'Duration', 'emje-motion' ),
				'type'        => Controls_Manager::NUMBER,
				'default'     => 1,
				'min'         => 0,
				'step'        => 0.1,
				'description' => esc_html__(
					'Total animation duration in seconds.',
					'emje-motion'
				),
				'condition'   => [
					'emje_motion_enable' => 'yes',
				],
			]
		);

		$element->add_control(
			'emje_motion_delay',
			[
				'label'       => esc_html__( 'Delay', 'emje-motion' ),
				'type'        => Controls_Manager::NUMBER,
				'default'     => 0,
				'min'         => 0,
				'step'        => 0.1,
				'description' => esc_html__(
					'Delay before the animation starts, in seconds.',
					'emje-motion'
				),
				'condition'   => [
					'emje_motion_enable' => 'yes',
				],
			]
		);

		$element->add_control(
			'emje_motion_ease',
			[
				'label'   => esc_html__( 'Ease', 'emje-motion' ),
				'type'    => Controls_Manager::SELECT,
				'default' => 'power2.out',
				'options' => [
					'none'         => esc_html__( 'None (Linear)', 'emje-motion' ),
					'power1.out'   => esc_html__( 'Power1 Out', 'emje-motion' ),
					'power2.out'   => esc_html__( 'Power2 Out', 'emje-motion' ),
					'power3.out'   => esc_html__( 'Power3 Out', 'emje-motion' ),
					'power4.out'   => esc_html__( 'Power4 Out', 'emje-motion' ),
					'back.out(1.7)' => esc_html__( 'Back Out', 'emje-motion' ),
					'elastic.out(1, 0.3)' => esc_html__( 'Elastic Out', 'emje-motion' ),
				],
				'description' => esc_html__(
					'Controls the animation easing.',
					'emje-motion'
				),
				'condition' => [
					'emje_motion_enable' => 'yes',
				],
			]
		);

	}

	private function registerTriggerControls($element): void
	{
		$element->add_control(
			'emje_motion_trigger_heading',
			[
				'label' => esc_html__( 'Trigger', 'emje-motion' ),
				'type'  => Controls_Manager::HEADING,
				'condition' => [
					'emje_motion_enable' => 'yes',
				],
			]
		);

		$element->add_control(
			'emje_motion_trigger',
			[
				'label'   => esc_html__( 'Event', 'emje-motion' ),
				'type'    => Controls_Manager::SELECT,
				'default' => 'load',
				'options' => [
					'load' 		=> esc_html__( 'Page Load', 'emje-motion' ),
					'viewport'  => esc_html__( 'Scroll Into View', 'emje-motion' ),
					'hover'     => esc_html__( 'Hover', 'emje-motion' ),
				],
				'condition' => [
					'emje_motion_enable' => 'yes',
				],
			]
		);

		$element->add_control(
			'emje_motion_play_once',
			[
				'label'        => esc_html__( 'Play Once', 'emje-motion' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Yes', 'emje-motion' ),
				'label_off'    => esc_html__( 'No', 'emje-motion' ),
				'return_value' => 'yes',
				'default'      => 'yes',
				'description'  => esc_html__(
					'Prevent the animation from replaying after it has completed.',
					'emje-motion'
				),
				'condition' => [
					'emje_motion_enable' => 'yes',
				],
			]
		);
	}


}
