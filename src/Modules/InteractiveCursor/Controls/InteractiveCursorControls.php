<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\InteractiveCursor\Controls;

use Elementor\Controls_Manager;

/**
 * Registers Elementor controls for Interactive Cursor.
 */
final class InteractiveCursorControls
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
            'emje_motion_interactive_cursor',
            [
                'label' => esc_html__('Interactive Cursor', 'emje-motion'),
                'tab' => Controls_Manager::TAB_STYLE,
            ],
        );

        $element->add_control(
            'emje_cursor_enable',
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
            'emje_cursor_type',
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
                    'emje_cursor_enable' => 'yes',
                ],
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_cursor_size',
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
                    'emje_cursor_enable' => 'yes',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_control(
            'emje_cursor_color',
            [
                'label' => esc_html__('Color', 'emje-motion'),
                'type' => Controls_Manager::COLOR,
                'default' => '#000000',
                'condition' => [
                    'emje_cursor_enable' => 'yes',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_control(
            'emje_cursor_blend_mode',
            [
                'label' => esc_html__('Blend Mode', 'emje-motion'),
                'type' => Controls_Manager::SELECT,
                'default' => 'normal',
                'options' => [
                    'normal' => esc_html__('Normal', 'emje-motion'),
                    'difference' => esc_html__('Difference', 'emje-motion'),
                ],
                'condition' => [
                    'emje_cursor_enable' => 'yes',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_control(
            'emje_cursor_hover_scale',
            [
                'label' => esc_html__('Hover Scale', 'emje-motion'),
                'type' => Controls_Manager::NUMBER,
                'default' => 1.5,
                'min' => 1.2,
                'max' => 2.0,
                'step' => 0.1,
                'description' => esc_html__('Scale when hovering links/buttons inside the container.', 'emje-motion'),
                'condition' => [
                    'emje_cursor_enable' => 'yes',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_control(
            'emje_cursor_hide_native',
            [
                'label' => esc_html__('Hide Native Cursor', 'emje-motion'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => esc_html__('Yes', 'emje-motion'),
                'label_off' => esc_html__('No', 'emje-motion'),
                'return_value' => 'yes',
                'default' => 'yes',
                'condition' => [
                    'emje_cursor_enable' => 'yes',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_control(
            'emje_cursor_text_label',
            [
                'label' => esc_html__('Text Label', 'emje-motion'),
                'type' => Controls_Manager::TEXT,
                'default' => '',
                'placeholder' => esc_html__('e.g. View', 'emje-motion'),
                'description' => esc_html__('Optional text shown inside cursor on hover.', 'emje-motion'),
                'condition' => [
                    'emje_cursor_enable' => 'yes',
                ],
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_cursor_preview_heading',
            [
                'label' => esc_html__('Preview', 'emje-motion'),
                'type' => Controls_Manager::HEADING,
                'separator' => 'before',
                'condition' => [
                    'emje_cursor_enable' => 'yes',
                ],
            ],
        );

        $element->add_control(
            'emje_cursor_live_preview',
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
                    'emje_cursor_enable' => 'yes',
                ],
            ],
        );

        $element->end_controls_section();
    }
}
