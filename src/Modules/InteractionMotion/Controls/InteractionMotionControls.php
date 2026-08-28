<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\InteractionMotion\Controls;

use Elementor\Controls_Manager;

/**
 * Registers Elementor controls for Interaction Motion (unified Container).
 * Effect: hover-reveal / interactive-cursor (1 per Container, no both).
 */
final class InteractionMotionControls
{
    public function register(): void
    {
        add_action(
            'elementor/element/container/section_background/after_section_end',
            [$this, 'registerContainerControls'],
            10,
            2,
        );
    }

    /**
     * @param mixed $element
     */
    public function registerContainerControls($element, array $args): void
    {
        $element->start_controls_section(
            'emje_motion_interaction_motion',
            [
                'label' => esc_html__('Interaction Motion', 'emje-motion'),
                'tab' => Controls_Manager::TAB_STYLE,
            ],
        );

        // Enable
        $element->add_control(
            'emje_interaction_enable',
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

        // Effect select (like Text Motion Animation)
        $element->add_control(
            'emje_interaction_effect',
            [
                'label' => esc_html__('Effect', 'emje-motion'),
                'type' => Controls_Manager::SELECT,
                'default' => 'hover-reveal',
                'options' => [
                    'hover-reveal' => esc_html__('Hover Reveal', 'emje-motion'),
                    'interactive-cursor' => esc_html__('Interactive Cursor', 'emje-motion'),
                ],
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                ],
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        // === Hover Reveal group ===
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
            'emje_interaction_hover_follow_speed',
            [
                'label' => esc_html__('Follow Speed', 'emje-motion'),
                'type' => Controls_Manager::NUMBER,
                'default' => 0.12,
                'min' => 0.05,
                'max' => 0.3,
                'step' => 0.01,
                'description' => esc_html__('How quickly the image follows the cursor. Lower is smoother.', 'emje-motion'),
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'hover-reveal',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_control(
            'emje_interaction_hover_scale',
            [
                'label' => esc_html__('Scale on Hover', 'emje-motion'),
                'type' => Controls_Manager::NUMBER,
                'default' => 1.0,
                'min' => 0.8,
                'max' => 1.2,
                'step' => 0.05,
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'hover-reveal',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
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
                    'scale' => esc_html__('Scale', 'emje-motion'),
                    'clip' => esc_html__('Clip Path', 'emje-motion'),
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

        // === Interactive Cursor group ===
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
                'default' => 'dot-ring',
                'options' => [
                    'dot' => esc_html__('Dot', 'emje-motion'),
                    'ring' => esc_html__('Ring', 'emje-motion'),
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
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

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
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'interactive-cursor',
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
                'default' => 'yes',
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'interactive-cursor',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_control(
            'emje_interaction_cursor_text_label',
            [
                'label' => esc_html__('Text Label', 'emje-motion'),
                'type' => Controls_Manager::TEXT,
                'default' => '',
                'placeholder' => esc_html__('e.g. View', 'emje-motion'),
                'description' => esc_html__('Optional text shown inside cursor on hover.', 'emje-motion'),
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                    'emje_interaction_effect' => 'interactive-cursor',
                ],
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        // Live Preview — single toggle, conditional on effect
        $element->add_control(
            'emje_interaction_preview_heading',
            [
                'label' => esc_html__('Preview', 'emje-motion'),
                'type' => Controls_Manager::HEADING,
                'separator' => 'before',
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                ],
            ],
        );

        $element->add_control(
            'emje_interaction_live_preview',
            [
                'label' => esc_html__('Live Preview', 'emje-motion'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => esc_html__('On', 'emje-motion'),
                'label_off' => esc_html__('Off', 'emje-motion'),
                'return_value' => 'yes',
                'default' => '',
                'description' => esc_html__('Auto preview in Editor. Off saves resources.', 'emje-motion'),
                'frontend_available' => true,
                'render_type' => 'none',
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                ],
            ],
        );

        $element->end_controls_section();
    }
}
