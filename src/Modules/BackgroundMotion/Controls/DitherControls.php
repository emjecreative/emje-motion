<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\BackgroundMotion\Controls;

use Elementor\Controls_Manager;

/**
 * Dither controls for Background Motion.
 */
final class DitherControls
{
    /**
     * @param mixed $element
     */
    public function register($element): void
    {
        $ditherCondition = [
            'emje_background_enable' => 'yes',
            'emje_background_effect' => 'dither',
        ];

        $element->add_control(
            'emje_background_dither_heading',
            [
                'label' => esc_html__('Dither', 'emje-motion'),
                'type' => Controls_Manager::HEADING,
                'description' => esc_html__('Animated retro dither that lives on its own. Click/tap sends a ripple.', 'emje-motion'),
                'condition' => $ditherCondition,
            ],
        );

        $element->add_control(
            'emje_background_dither_fg',
            [
                'label' => esc_html__('Dot Color', 'emje-motion'),
                'type' => Controls_Manager::COLOR,
                'default' => '#1227E2',
                'condition' => $ditherCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_dither_bg',
            [
                'label' => esc_html__('Background Color', 'emje-motion'),
                'type' => Controls_Manager::COLOR,
                'default' => '#1227E21A',
                'condition' => $ditherCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_dither_pixel',
            [
                'label' => esc_html__('Pixel Size', 'emje-motion'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px'],
                'range' => [
                    'px' => [
                        'min' => 4,
                        'max' => 32,
                        'step' => 1,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 8,
                ],
                'condition' => $ditherCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_dither_density',
            [
                'label' => esc_html__('Pattern Density', 'emje-motion'),
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
                    'size' => 0.5,
                ],
                'condition' => $ditherCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_dither_scale',
            [
                'label' => esc_html__('Pattern Scale', 'emje-motion'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px'],
                'range' => [
                    'px' => [
                        'min' => 0.5,
                        'max' => 4,
                        'step' => 0.1,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 1.5,
                ],
                'condition' => $ditherCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_dither_speed',
            [
                'label' => esc_html__('Animation Speed', 'emje-motion'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px'],
                'range' => [
                    'px' => [
                        'min' => 0,
                        'max' => 2,
                        'step' => 0.05,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 0.6,
                ],
                'condition' => $ditherCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_dither_divider_ripple',
            [
                'type' => Controls_Manager::DIVIDER,
                'condition' => $ditherCondition,
            ],
        );

        $element->add_control(
            'emje_background_dither_ripple',
            [
                'label' => esc_html__('Enable Ripples', 'emje-motion'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => esc_html__('On', 'emje-motion'),
                'label_off' => esc_html__('Off', 'emje-motion'),
                'return_value' => 'yes',
                'default' => 'yes',
                'condition' => $ditherCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_dither_ripple_strength',
            [
                'label' => esc_html__('Ripple Strength', 'emje-motion'),
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
                    'size' => 0.6,
                ],
                'condition' => array_merge($ditherCondition, ['emje_background_dither_ripple' => 'yes']),
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_dither_ripple_width',
            [
                'label' => esc_html__('Ripple Width', 'emje-motion'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px'],
                'range' => [
                    'px' => [
                        'min' => 20,
                        'max' => 400,
                        'step' => 5,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 140,
                ],
                'condition' => array_merge($ditherCondition, ['emje_background_dither_ripple' => 'yes']),
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_dither_ripple_speed',
            [
                'label' => esc_html__('Ripple Speed', 'emje-motion'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px'],
                'range' => [
                    'px' => [
                        'min' => 100,
                        'max' => 1200,
                        'step' => 10,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 420,
                ],
                'condition' => array_merge($ditherCondition, ['emje_background_dither_ripple' => 'yes']),
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_dither_fade',
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
                    'size' => 0,
                ],
                'condition' => $ditherCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_dither_divider_mobile',
            [
                'type' => Controls_Manager::DIVIDER,
                'condition' => $ditherCondition,
            ],
        );

        $element->add_control(
            'emje_background_dither_disable_mobile',
            [
                'label' => esc_html__('Disable on Mobile & Tablet', 'emje-motion'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => esc_html__('Hide', 'emje-motion'),
                'label_off' => esc_html__('Show', 'emje-motion'),
                'return_value' => 'yes',
                'default' => '',
                'condition' => $ditherCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

    }
}
