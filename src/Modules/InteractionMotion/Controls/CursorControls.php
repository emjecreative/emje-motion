<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\InteractionMotion\Controls;

use Elementor\Controls_Manager;
use Elementor\Group_Control_Box_Shadow;
use Elementor\Group_Control_Typography;

/**
 * Interactive Cursor controls for Interaction Motion.
 * Handles dot-ring and text-follow.
 */
final class CursorControls
{
    /**
     * @param mixed $element
     */
    public function register($element): void
    {
        $element->add_control(
            'emje_interaction_cursor_heading',
            [
                'label' => esc_html__('Interactive Cursor', 'emje-motion'),
                'type' => Controls_Manager::HEADING,
                'separator' => 'before',
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'interactive-cursor',
                ],
            ],
        );

        $element->add_control(
            'emje_interaction_cursor_type',
            [
                'label' => esc_html__('Cursor Type', 'emje-motion'),
                'type' => Controls_Manager::SELECT,
                'default' => 'text-follow',
                'options' => [
                    'text-follow' => esc_html__('Text Follow', 'emje-motion'),
                    'dot-ring' => esc_html__('Dot + Ring', 'emje-motion'),
                ],
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'interactive-cursor',
                ],
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $this->registerDotRing($element);
        $this->registerTextFollow($element);
        $this->registerCommon($element);
    }

    /**
     * @param mixed $element
     */
    private function registerDotRing($element): void
    {
        $element->add_control(
            'emje_interaction_cursor_size',
            [
                'label' => esc_html__('Size', 'emje-motion'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px'],
                'range' => [
                    'px' => [
                        'min' => 12,
                        'max' => 40,
                        'step' => 1,
                    ],
                ],
                'default' => [
                    'size' => 20,
                    'unit' => 'px',
                ],
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'interactive-cursor',
                    'emje_interaction_cursor_type' => 'dot-ring',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_control(
            'emje_interaction_cursor_color',
            [
                'label' => esc_html__('Color', 'emje-motion'),
                'type' => Controls_Manager::COLOR,
                'default' => '#000000',
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'interactive-cursor',
                    'emje_interaction_cursor_type' => 'dot-ring',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_control(
            'emje_interaction_cursor_hover_scale',
            [
                'label' => esc_html__('Hover Scale', 'emje-motion'),
                'type' => Controls_Manager::NUMBER,
                'default' => 1.5,
                'min' => 1.2,
                'max' => 2.0,
                'step' => 0.1,
                'description' => esc_html__('Scale when hovering links/buttons inside the container.', 'emje-motion'),
                'classes' => 'emje-control--has-tooltip',
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'interactive-cursor',
                    'emje_interaction_cursor_type' => 'dot-ring',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );
    }

    /**
     * @param mixed $element
     */
    private function registerTextFollow($element): void
    {
        $element->add_control(
            'emje_interaction_cursor_text_label',
            [
                'label' => esc_html__('Text Label', 'emje-motion'),
                'type' => Controls_Manager::TEXT,
                'default' => 'View',
                'placeholder' => esc_html__('e.g. View', 'emje-motion'),
                'description' => esc_html__('Text shown inside the Text Follow cursor.', 'emje-motion'),
                'classes' => 'emje-control--has-tooltip',
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'interactive-cursor',
                    'emje_interaction_cursor_type' => 'text-follow',
                ],
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_group_control(
            Group_Control_Typography::get_type(),
            [
                'name' => 'emje_interaction_cursor_typography',
                'label' => esc_html__('Typography', 'emje-motion'),
                'selector' => '{{WRAPPER}} .emje-cursor__follow .emje-cursor__label--follow',
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'interactive-cursor',
                    'emje_interaction_cursor_type' => 'text-follow',
                ],
                'fields_options' => [
                    'typography' => ['default' => 'yes'],
                    'font_size' => [
                        'default' => ['unit' => 'px', 'size' => 14],
                    ],
                    'font_weight' => ['default' => 600],
                ],
            ],
        );

        $element->add_control(
            'emje_interaction_cursor_bg_color',
            [
                'label' => esc_html__('Background', 'emje-motion'),
                'type' => Controls_Manager::COLOR,
                'default' => '#FFFFFF',
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'interactive-cursor',
                    'emje_interaction_cursor_type' => 'text-follow',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_control(
            'emje_interaction_cursor_text_color',
            [
                'label' => esc_html__('Text Color', 'emje-motion'),
                'type' => Controls_Manager::COLOR,
                'default' => '#111111',
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'interactive-cursor',
                    'emje_interaction_cursor_type' => 'text-follow',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_control(
            'emje_interaction_cursor_padding_y',
            [
                'label' => esc_html__('Padding Y', 'emje-motion'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px'],
                'range' => [
                    'px' => [
                        'min' => 8,
                        'max' => 48,
                        'step' => 1,
                    ],
                ],
                'default' => [
                    'size' => 40,
                    'unit' => 'px',
                ],
                'description' => esc_html__('Vertical padding. Controls circle height.', 'emje-motion'),
                'classes' => 'emje-control--has-tooltip',
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'interactive-cursor',
                    'emje_interaction_cursor_type' => 'text-follow',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_control(
            'emje_interaction_cursor_padding_x',
            [
                'label' => esc_html__('Padding X', 'emje-motion'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px'],
                'range' => [
                    'px' => [
                        'min' => 12,
                        'max' => 56,
                        'step' => 1,
                    ],
                ],
                'default' => [
                    'size' => 32,
                    'unit' => 'px',
                ],
                'description' => esc_html__('Horizontal padding. Controls circle width. Longer text becomes pill.', 'emje-motion'),
                'classes' => 'emje-control--has-tooltip',
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'interactive-cursor',
                    'emje_interaction_cursor_type' => 'text-follow',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_control(
            'emje_interaction_cursor_radius',
            [
                'label' => esc_html__('Border Radius', 'emje-motion'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px'],
                'range' => [
                    'px' => [
                        'min' => 0,
                        'max' => 100,
                        'step' => 1,
                    ],
                ],
                'default' => [
                    'size' => 99,
                    'unit' => 'px',
                ],
                'description' => esc_html__('0 = square, 12 = rounded, 50+ = circle/pill.', 'emje-motion'),
                'classes' => 'emje-control--has-tooltip',
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'interactive-cursor',
                    'emje_interaction_cursor_type' => 'text-follow',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_control(
            'emje_interaction_cursor_entrance',
            [
                'label' => esc_html__('Entrance', 'emje-motion'),
                'type' => Controls_Manager::SELECT,
                'default' => 'scale',
                'options' => [
                    'scale' => esc_html__('Scale', 'emje-motion'),
                    'scale-bounce' => esc_html__('Scale Bounce', 'emje-motion'),
                    'none' => esc_html__('None', 'emje-motion'),
                ],
                'description' => esc_html__('How the cursor appears when entering the container.', 'emje-motion'),
                'classes' => 'emje-control--has-tooltip',
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'interactive-cursor',
                    'emje_interaction_cursor_type' => 'text-follow',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_group_control(
            Group_Control_Box_Shadow::get_type(),
            [
                'name' => 'emje_interaction_cursor_box_shadow',
                'label' => esc_html__('Shadow', 'emje-motion'),
                'selector' => '{{WRAPPER}} .emje-cursor__follow',
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'interactive-cursor',
                    'emje_interaction_cursor_type' => 'text-follow',
                ],
                'fields_options' => [
                    'box_shadow_type' => [
                        'default' => 'yes',
                    ],
                    'box_shadow' => [
                        'default' => [
                            'horizontal' => 0,
                            'vertical' => 8,
                            'blur' => 32,
                            'spread' => 0,
                            'color' => 'rgba(0, 0, 0, 0.12)',
                        ],
                    ],
                ],
            ],
        );
    }

    /**
     * @param mixed $element
     */
    private function registerCommon($element): void
    {
        $element->add_control(
            'emje_interaction_cursor_blend_mode',
            [
                'label' => esc_html__('Blend Mode', 'emje-motion'),
                'type' => Controls_Manager::SELECT,
                'default' => 'normal',
                'options' => [
                    'normal' => esc_html__('Normal', 'emje-motion'),
                    'difference' => esc_html__('Difference', 'emje-motion'),
                ],
                'description' => esc_html__('Difference inverts colors underneath the cursor.', 'emje-motion'),
                'classes' => 'emje-control--has-tooltip',
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'interactive-cursor',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_control(
            'emje_interaction_cursor_hide_native',
            [
                'label' => esc_html__('Hide Native Cursor', 'emje-motion'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => esc_html__('Yes', 'emje-motion'),
                'label_off' => esc_html__('No', 'emje-motion'),
                'return_value' => 'yes',
                'default' => '',
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'interactive-cursor',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_control(
            'emje_interaction_cursor_follow_smoothness',
            [
                'label' => esc_html__('Follow Smoothness', 'emje-motion'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['s'],
                'range' => [
                    's' => [
                        'min' => 0.05,
                        'max' => 0.6,
                        'step' => 0.01,
                    ],
                ],
                'default' => [
                    'size' => 0.5,
                    'unit' => 's',
                ],
                'description' => esc_html__('Lower = snappier, higher = more lag.', 'emje-motion'),
                'classes' => 'emje-control--has-tooltip',
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'interactive-cursor',
                    'emje_interaction_cursor_type' => ['dot-ring', 'text-follow'],
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );
    }
}
