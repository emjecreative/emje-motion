<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\InteractionMotion\Controls;

use Elementor\Controls_Manager;

/**
 * Hover Reveal controls for Interaction Motion.
 */
final class HoverControls
{
    /**
     * @param mixed $element
     */
    public function register($element): void
    {
        $element->add_control(
            'emje_interaction_hover_heading',
            [
                'label' => esc_html__('Hover Reveal', 'emje-motion'),
                'type' => Controls_Manager::HEADING,
                'separator' => 'before',
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'hover-reveal',
                ],
            ],
        );

        $element->add_control(
            'emje_interaction_hover_image',
            [
                'label' => esc_html__('Reveal Image', 'emje-motion'),
                'type' => Controls_Manager::MEDIA,
                'default' => [
                    'url' => '',
                ],
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'hover-reveal',
                ],
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_interaction_hover_image_size',
            [
                'label' => esc_html__('Image Size', 'emje-motion'),
                'type' => Controls_Manager::SELECT,
                'default' => 'medium',
                'options' => [
                    'thumbnail' => esc_html__('Thumbnail', 'emje-motion'),
                    'medium' => esc_html__('Medium', 'emje-motion'),
                    'large' => esc_html__('Large', 'emje-motion'),
                    'full' => esc_html__('Full', 'emje-motion'),
                ],
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'hover-reveal',
                ],
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_interaction_hover_animation',
            [
                'label' => esc_html__('Reveal Animation', 'emje-motion'),
                'type' => Controls_Manager::SELECT,
                'default' => 'fade',
                'options' => [
                    'fade' => esc_html__('Fade', 'emje-motion'),
                    'clip' => esc_html__('Clip Path', 'emje-motion'),
                    'blocks' => esc_html__('Blocks', 'emje-motion'),
                ],
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'hover-reveal',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_control(
            'emje_interaction_hover_clip_direction',
            [
                'label' => esc_html__('Clip Direction', 'emje-motion'),
                'type' => Controls_Manager::SELECT,
                'default' => 'left',
                'options' => [
                    'left' => esc_html__('Left', 'emje-motion'),
                    'right' => esc_html__('Right', 'emje-motion'),
                    'top' => esc_html__('Top', 'emje-motion'),
                    'bottom' => esc_html__('Bottom', 'emje-motion'),
                ],
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'hover-reveal',
                    'emje_interaction_hover_animation' => 'clip',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_control(
            'emje_interaction_hover_duration',
            [
                'label' => esc_html__('Reveal Duration', 'emje-motion'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['s'],
                'range' => [
                    's' => [
                        'min' => 0.1,
                        'max' => 1,
                        'step' => 0.05,
                    ],
                ],
                'default' => [
                    'size' => 0.3,
                    'unit' => 's',
                ],
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'hover-reveal',
                    'emje_interaction_hover_animation' => ['fade', 'clip'],
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_control(
            'emje_interaction_hover_blocks_columns',
            [
                'label' => esc_html__('Grid Columns', 'emje-motion'),
                'type' => Controls_Manager::NUMBER,
                'default' => 5,
                'min' => 2,
                'max' => 10,
                'step' => 1,
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'hover-reveal',
                    'emje_interaction_hover_animation' => 'blocks',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_control(
            'emje_interaction_hover_blocks_rows',
            [
                'label' => esc_html__('Grid Rows', 'emje-motion'),
                'type' => Controls_Manager::NUMBER,
                'default' => 7,
                'min' => 2,
                'max' => 12,
                'step' => 1,
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'hover-reveal',
                    'emje_interaction_hover_animation' => 'blocks',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_control(
            'emje_interaction_hover_blocks_order',
            [
                'label' => esc_html__('Reveal Order', 'emje-motion'),
                'type' => Controls_Manager::SELECT,
                'default' => 'random',
                'options' => [
                    'random' => esc_html__('Random', 'emje-motion'),
                    'rows' => esc_html__('Rows', 'emje-motion'),
                ],
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'hover-reveal',
                    'emje_interaction_hover_animation' => 'blocks',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_control(
            'emje_interaction_hover_blocks_speed',
            [
                'label' => esc_html__('Blocks Speed', 'emje-motion'),
                'type' => Controls_Manager::NUMBER,
                'default' => 0.02,
                'min' => 0.005,
                'max' => 0.06,
                'step' => 0.005,
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'hover-reveal',
                    'emje_interaction_hover_animation' => 'blocks',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_control(
            'emje_interaction_hover_follow_speed',
            [
                'label' => esc_html__('Follow Speed', 'emje-motion'),
                'type' => Controls_Manager::NUMBER,
                'default' => 0.12,
                'min' => 0.05,
                'max' => 0.3,
                'step' => 0.01,
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'hover-reveal',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_control(
            'emje_interaction_hover_trigger_area',
            [
                'label' => esc_html__('Trigger Area', 'emje-motion'),
                'type' => Controls_Manager::SELECT,
                'default' => 'container',
                'options' => [
                    'container' => esc_html__('Whole Container', 'emje-motion'),
                    'heading' => esc_html__('Heading Only', 'emje-motion'),
                ],
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'hover-reveal',
                ],
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_interaction_hover_offset_x',
            [
                'label' => esc_html__('Offset X', 'emje-motion'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px'],
                'range' => [
                    'px' => [
                        'min' => -200,
                        'max' => 200,
                        'step' => 1,
                    ],
                ],
                'default' => [
                    'size' => 0,
                    'unit' => 'px',
                ],
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'hover-reveal',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_control(
            'emje_interaction_hover_offset_y',
            [
                'label' => esc_html__('Offset Y', 'emje-motion'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px'],
                'range' => [
                    'px' => [
                        'min' => -200,
                        'max' => 200,
                        'step' => 1,
                    ],
                ],
                'default' => [
                    'size' => 0,
                    'unit' => 'px',
                ],
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'hover-reveal',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_control(
            'emje_interaction_hover_rotate',
            [
                'label' => esc_html__('Rotate', 'emje-motion'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['deg'],
                'range' => [
                    'deg' => [
                        'min' => -360,
                        'max' => 360,
                        'step' => 1,
                    ],
                ],
                'default' => [
                    'size' => 0,
                    'unit' => 'deg',
                ],
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'hover-reveal',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_control(
            'emje_interaction_hover_rotate_hover',
            [
                'label' => esc_html__('Hover Rotate', 'emje-motion'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['deg'],
                'range' => [
                    'deg' => [
                        'min' => -360,
                        'max' => 360,
                        'step' => 1,
                    ],
                ],
                'default' => [
                    'size' => 15,
                    'unit' => 'deg',
                ],
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'hover-reveal',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_control(
            'emje_interaction_hover_disable_mobile',
            [
                'label' => esc_html__('Disable on Mobile & Tablet', 'emje-motion'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => esc_html__('Hide', 'emje-motion'),
                'label_off' => esc_html__('Show', 'emje-motion'),
                'return_value' => 'yes',
                'default' => 'yes',
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'hover-reveal',
                ],
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );
    }
}
