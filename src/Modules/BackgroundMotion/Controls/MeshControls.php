<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\BackgroundMotion\Controls;

use Elementor\Controls_Manager;

/**
 * Mesh Gradient controls for Background Motion.
 */
final class MeshControls
{
    /**
     * @param mixed $element
     */
    public function register($element): void
    {
        $meshCondition = [
            'emje_background_enable' => 'yes',
            'emje_background_effect' => 'mesh',
        ];

        $element->add_control(
            'emje_background_mesh_heading',
            [
                'label' => esc_html__('Mesh Gradient', 'emje-motion'),
                'type' => Controls_Manager::HEADING,
                'description' => esc_html__('Animated WebGL mesh gradient. Lives on its own, no cursor needed.', 'emje-motion'),
                'condition' => $meshCondition,
            ],
        );

        $element->add_control(
            'emje_background_mesh_motion',
            [
                'label' => esc_html__('Motion Type', 'emje-motion'),
                'type' => Controls_Manager::SELECT,
                'default' => 'drift',
                'options' => [
                    'drift' => esc_html__('Drift', 'emje-motion'),
                    'swirl' => esc_html__('Swirl', 'emje-motion'),
                    'pulse' => esc_html__('Pulse', 'emje-motion'),
                    'flow' => esc_html__('Flow', 'emje-motion'),
                ],
                'condition' => $meshCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_mesh_c1',
            [
                'label' => esc_html__('Color 1', 'emje-motion'),
                'type' => Controls_Manager::COLOR,
                'default' => '#0C4A6E',
                'condition' => $meshCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_mesh_c2',
            [
                'label' => esc_html__('Color 2', 'emje-motion'),
                'type' => Controls_Manager::COLOR,
                'default' => '#0284C7',
                'condition' => $meshCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_mesh_c3',
            [
                'label' => esc_html__('Color 3', 'emje-motion'),
                'type' => Controls_Manager::COLOR,
                'default' => '#5EEAD4',
                'condition' => $meshCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_mesh_c4',
            [
                'label' => esc_html__('Color 4', 'emje-motion'),
                'type' => Controls_Manager::COLOR,
                'default' => '#F0FDFA',
                'condition' => $meshCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_mesh_quality',
            [
                'label' => esc_html__('Quality', 'emje-motion'),
                'type' => Controls_Manager::SELECT,
                'default' => 'balanced',
                'options' => [
                    'low' => esc_html__('Low (fastest)', 'emje-motion'),
                    'balanced' => esc_html__('Balanced', 'emje-motion'),
                    'high' => esc_html__('High (sharpest)', 'emje-motion'),
                ],
                'condition' => $meshCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_mesh_speed',
            [
                'label' => esc_html__('Animation Speed', 'emje-motion'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px'],
                'range' => [
                    'px' => [
                        'min' => 0,
                        'max' => 4,
                        'step' => 0.05,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 2,
                ],
                'condition' => $meshCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_mesh_opacity',
            [
                'label' => esc_html__('Opacity', 'emje-motion'),
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
                    'size' => 1,
                ],
                'condition' => $meshCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_mesh_fade',
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
                'condition' => $meshCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        $element->add_control(
            'emje_background_mesh_divider_mobile',
            [
                'type' => Controls_Manager::DIVIDER,
                'condition' => $meshCondition,
            ],
        );

        $element->add_control(
            'emje_background_mesh_disable_mobile',
            [
                'label' => esc_html__('Disable on Mobile & Tablet', 'emje-motion'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => esc_html__('Hide', 'emje-motion'),
                'label_off' => esc_html__('Show', 'emje-motion'),
                'return_value' => 'yes',
                'default' => '',
                'condition' => $meshCondition,
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
                'description' => esc_html__('Turn ON to preview. If a change doesn\'t appear, toggle OFF then ON again.', 'emje-motion'),
                'classes' => 'emje-control--has-tooltip',
                'frontend_available' => true,
                'render_type' => 'none',
                'condition' => [
                    'emje_background_enable' => 'yes',
                ],
            ],
        );

    }
}
