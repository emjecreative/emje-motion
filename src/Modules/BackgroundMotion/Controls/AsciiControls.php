<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\BackgroundMotion\Controls;

use Elementor\Controls_Manager;

/**
 * ASCII controls for Background Motion.
 */
final class AsciiControls
{
    /**
     * @param mixed $element
     */
    public function register($element): void
    {
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
                'default' => '#1227E2',
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
                'condition' => $asciiCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_ascii_divider_mobile',
            [
                'type' => Controls_Manager::DIVIDER,
                'condition' => $asciiCondition,
            ],
        );

        $element->add_control(
            'emje_background_ascii_disable_mobile',
            [
                'label' => esc_html__('Disable on Mobile & Tablet', 'emje-motion'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => esc_html__('Hide', 'emje-motion'),
                'label_off' => esc_html__('Show', 'emje-motion'),
                'return_value' => 'yes',
                'default' => 'yes',
                'condition' => $asciiCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

    }
}
