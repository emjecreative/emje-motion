<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\BackgroundMotion\Controls;

use Elementor\Controls_Manager;

/**
 * Registers Elementor controls for Background Motion (standalone Container section).
 * Effect: ascii / aurora (placeholder name only for now).
 */
final class BackgroundMotionControls
{
    public function register(): void
    {
        add_action(
            'elementor/element/container/section_background/after_section_end',
            [$this, 'registerContainerControls'],
            11,
            2,
        );
    }

    /**
     * @param mixed $element
     * @param array<string, mixed> $args
     */
    public function registerContainerControls($element, array $args): void
    {
        $element->start_controls_section(
            'emje_motion_background_motion',
            [
                'label' => esc_html__('Background Motion', 'emje-motion'),
                'tab' => Controls_Manager::TAB_STYLE,
            ],
        );

        $element->add_control(
            'emje_background_enable',
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
            'emje_background_effect',
            [
                'label' => esc_html__('Effect', 'emje-motion'),
                'type' => Controls_Manager::SELECT,
                'default' => 'ascii',
                'options' => [
                    'ascii' => esc_html__('ASCII', 'emje-motion'),
                    'aurora' => esc_html__('Aurora (Soon)', 'emje-motion'),
                ],
                'condition' => [
                    'emje_background_enable' => 'yes',
                ],
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_aurora_notice',
            [
                'type' => Controls_Manager::RAW_HTML,
                'raw' => esc_html__('Aurora is coming soon — spec will follow. Nothing renders for now.', 'emje-motion'),
                'content_classes' => 'elementor-panel-alert elementor-panel-alert-info',
                'condition' => [
                    'emje_background_enable' => 'yes',
                    'emje_background_effect' => 'aurora',
                ],
            ],
        );

        $asciiCondition = [
            'emje_background_enable' => 'yes',
            'emje_background_effect' => 'ascii',
        ];

        $element->add_control(
            'emje_background_ascii_heading',
            [
                'label' => esc_html__('ASCII', 'emje-motion'),
                'type' => Controls_Manager::HEADING,
                'condition' => $asciiCondition,
            ],
        );

        $element->add_control(
            'emje_background_ascii_color',
            [
                'label' => esc_html__('Character Color', 'emje-motion'),
                'type' => Controls_Manager::COLOR,
                'default' => '#FFFFFF',
                'condition' => $asciiCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_ascii_charset',
            [
                'label' => esc_html__('Hover Characters', 'emje-motion'),
                'type' => Controls_Manager::SELECT,
                'default' => 'full',
                'options' => [
                    'full' => esc_html__('Full (letters, numbers & symbols)', 'emje-motion'),
                    'simple' => esc_html__('Simple (dots & dashes)', 'emje-motion'),
                ],
                'condition' => $asciiCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_ascii_cell_w',
            [
                'label' => esc_html__('Cell Width', 'emje-motion'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px'],
                'range' => [
                    'px' => [
                        'min' => 8,
                        'max' => 60,
                        'step' => 1,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 22,
                ],
                'condition' => $asciiCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_ascii_cell_h',
            [
                'label' => esc_html__('Cell Height', 'emje-motion'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px'],
                'range' => [
                    'px' => [
                        'min' => 8,
                        'max' => 60,
                        'step' => 1,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 26,
                ],
                'condition' => $asciiCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_ascii_font',
            [
                'label' => esc_html__('Font Size', 'emje-motion'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px'],
                'range' => [
                    'px' => [
                        'min' => 6,
                        'max' => 32,
                        'step' => 1,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 14,
                ],
                'condition' => $asciiCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_ascii_radius',
            [
                'label' => esc_html__('Glow Radius', 'emje-motion'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px'],
                'range' => [
                    'px' => [
                        'min' => 100,
                        'max' => 600,
                        'step' => 10,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 360,
                ],
                'condition' => $asciiCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_ascii_inner',
            [
                'label' => esc_html__('Inner Radius', 'emje-motion'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px'],
                'range' => [
                    'px' => [
                        'min' => 0,
                        'max' => 200,
                        'step' => 1,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 30,
                ],
                'condition' => $asciiCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_ascii_opacity',
            [
                'label' => esc_html__('Max Opacity', 'emje-motion'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px'],
                'range' => [
                    'px' => [
                        'min' => 0,
                        'max' => 1,
                        'step' => 0.01,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 0.35,
                ],
                'condition' => $asciiCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_ascii_fade',
            [
                'label' => esc_html__('Edge Fade', 'emje-motion'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['%'],
                'range' => [
                    '%' => [
                        'min' => 0,
                        'max' => 30,
                        'step' => 1,
                    ],
                ],
                'default' => [
                    'unit' => '%',
                    'size' => 10,
                ],
                'description' => esc_html__('Top/bottom feather so the grid melts into the container background.', 'emje-motion'),
                'classes' => 'emje-control--has-tooltip',
                'condition' => $asciiCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_live_preview',
            [
                'label' => esc_html__('Live Preview', 'emje-motion'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => esc_html__('On', 'emje-motion'),
                'label_off' => esc_html__('Off', 'emje-motion'),
                'return_value' => 'yes',
                'default' => '',
                'description' => esc_html__('Auto preview in Editor. Off saves resources.', 'emje-motion'),
                'classes' => 'emje-control--has-tooltip',
                'frontend_available' => true,
                'render_type' => 'none',
                'condition' => [
                    'emje_background_enable' => 'yes',
                ],
            ],
        );

        $element->end_controls_section();
    }
}
