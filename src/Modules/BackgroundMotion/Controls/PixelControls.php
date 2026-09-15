<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\BackgroundMotion\Controls;

use Elementor\Controls_Manager;

/**
 * Pixel controls for Background Motion.
 */
final class PixelControls
{
    /**
     * @param mixed $element
     */
    public function register($element): void
    {
        $pixelCondition = [
            'emje_background_enable' => 'yes',
            'emje_background_effect' => 'pixel',
        ];

        $element->add_control(
            'emje_background_pixel_heading',
            [
                'label' => esc_html__('Pixel', 'emje-motion'),
                'type' => Controls_Manager::HEADING,
                'description' => esc_html__('Interactive pixel grid that lights up under your cursor.', 'emje-motion'),
                'condition' => $pixelCondition,
            ],
        );

        $element->add_control(
            'emje_background_pixel_base',
            [
                'label' => esc_html__('Base Color', 'emje-motion'),
                'type' => Controls_Manager::COLOR,
                'default' => '#1227E21A',
                'condition' => $pixelCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_pixel_active',
            [
                'label' => esc_html__('Highlight Color', 'emje-motion'),
                'type' => Controls_Manager::COLOR,
                'default' => '#1227E2',
                'condition' => $pixelCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_pixel_fit',
            [
                'label' => esc_html__('Fit', 'emje-motion'),
                'type' => Controls_Manager::SELECT,
                'default' => 'stretch',
                'options' => [
                    'stretch' => esc_html__('Stretch to fill', 'emje-motion'),
                    'crop' => esc_html__('Crop edges to fill', 'emje-motion'),
                ],
                'condition' => $pixelCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_pixel_size',
            [
                'label' => esc_html__('Cell Size', 'emje-motion'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px'],
                'range' => [
                    'px' => [
                        'min' => 24,
                        'max' => 96,
                        'step' => 1,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 56,
                ],
                'condition' => $pixelCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_pixel_gap',
            [
                'label' => esc_html__('Gap', 'emje-motion'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px'],
                'range' => [
                    'px' => [
                        'min' => 0,
                        'max' => 12,
                        'step' => 1,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 2,
                ],
                'description' => esc_html__('Spacing between cells when Border Width is 0. Ignored while dividers are active.', 'emje-motion'),
                'classes' => 'emje-control--has-tooltip',
                'condition' => $pixelCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_pixel_border_w',
            [
                'label' => esc_html__('Border Width', 'emje-motion'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px'],
                'range' => [
                    'px' => [
                        'min' => 0,
                        'max' => 2,
                        'step' => 0.5,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 1,
                ],
                'condition' => $pixelCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_pixel_border',
            [
                'label' => esc_html__('Border Color', 'emje-motion'),
                'type' => Controls_Manager::COLOR,
                'default' => '#1227E21A',
                'condition' => $pixelCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_pixel_speed',
            [
                'label' => esc_html__('Transition Speed', 'emje-motion'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px'],
                'range' => [
                    'px' => [
                        'min' => 0.05,
                        'max' => 0.5,
                        'step' => 0.01,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 0.15,
                ],
                'condition' => $pixelCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_pixel_radius',
            [
                'label' => esc_html__('Glow Radius', 'emje-motion'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px'],
                'range' => [
                    'px' => [
                        'min' => 0,
                        'max' => 300,
                        'step' => 5,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 120,
                ],
                'condition' => $pixelCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_pixel_trail',
            [
                'label' => esc_html__('Trail Fade', 'emje-motion'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px'],
                'range' => [
                    'px' => [
                        'min' => 0,
                        'max' => 1.5,
                        'step' => 0.05,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 0.4,
                ],
                'condition' => $pixelCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_pixel_fade',
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
                'condition' => $pixelCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_pixel_divider_mobile',
            [
                'type' => Controls_Manager::DIVIDER,
                'condition' => $pixelCondition,
            ],
        );

        $element->add_control(
            'emje_background_pixel_disable_mobile',
            [
                'label' => esc_html__('Disable on Mobile & Tablet', 'emje-motion'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => esc_html__('Hide', 'emje-motion'),
                'label_off' => esc_html__('Show', 'emje-motion'),
                'return_value' => 'yes',
                'default' => 'yes',
                'condition' => $pixelCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

    }
}
