<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\BackgroundMotion\Controls;

use Elementor\Controls_Manager;

/**
 * Registers Elementor controls for Background Motion (standalone Container section).
 * Effects: ascii / pixel / dither / mesh.
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
                    'pixel' => esc_html__('Pixel', 'emje-motion'),
                    'dither' => esc_html__('Dither', 'emje-motion'),
                    'mesh' => esc_html__('Mesh Gradient', 'emje-motion'),
                ],
                'condition' => [
                    'emje_background_enable' => 'yes',
                ],
                'frontend_available' => true,
                'render_type' => 'template',
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
                'default' => '#3B82F6',
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
            'emje_background_ascii_disable_mobile',
            [
                'label' => esc_html__('Disable on Mobile & Tablet', 'emje-motion'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => esc_html__('Hide', 'emje-motion'),
                'label_off' => esc_html__('Show', 'emje-motion'),
                'return_value' => 'yes',
                'default' => 'yes',
                'description' => esc_html__('Hide this effect on touch devices.', 'emje-motion'),
                'classes' => 'emje-control--has-tooltip',
                'condition' => $asciiCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

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
                'default' => 'rgba(255, 255, 255, 0.08)',
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
                'default' => '#3B82F6',
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
            'emje_background_pixel_fit',
            [
                'label' => esc_html__('Fit', 'emje-motion'),
                'type' => Controls_Manager::SELECT,
                'default' => 'stretch',
                'options' => [
                    'stretch' => esc_html__('Stretch to fill', 'emje-motion'),
                    'crop' => esc_html__('Crop edges to fill', 'emje-motion'),
                ],
                'description' => esc_html__('Stretch resizes cells to fill the container. Crop keeps Cell Size precise and trims edge cells.', 'emje-motion'),
                'classes' => 'emje-control--has-tooltip',
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
                'default' => 'rgba(255, 255, 255, 0.15)',
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
                'description' => esc_html__('Cursor light reach. 0 lights a single cell (classic).', 'emje-motion'),
                'classes' => 'emje-control--has-tooltip',
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
                'description' => esc_html__('How long lit cells linger before fading back. 0 snaps back instantly.', 'emje-motion'),
                'classes' => 'emje-control--has-tooltip',
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
                    'size' => 10,
                ],
                'description' => esc_html__('Top/bottom feather so the grid melts into the container background.', 'emje-motion'),
                'classes' => 'emje-control--has-tooltip',
                'condition' => $pixelCondition,
                'frontend_available' => true,
                'render_type' => 'template',
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
                'description' => esc_html__('Hide this effect on touch devices.', 'emje-motion'),
                'classes' => 'emje-control--has-tooltip',
                'condition' => $pixelCondition,
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

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
                'default' => '#3B82F6',
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
                'default' => 'rgba(255, 255, 255, 0)',
                'description' => esc_html__('Transparent keeps the native container background visible.', 'emje-motion'),
                'classes' => 'emje-control--has-tooltip',
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
                'description' => esc_html__('Base cell size. Larger is blockier and more retro.', 'emje-motion'),
                'classes' => 'emje-control--has-tooltip',
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
                'description' => esc_html__('0 freezes on a single frame.', 'emje-motion'),
                'classes' => 'emje-control--has-tooltip',
                'condition' => $ditherCondition,
                'frontend_available' => true,
                'render_type' => 'template',
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
                    'size' => 10,
                ],
                'description' => esc_html__('Top/bottom feather so the pattern melts into the container background.', 'emje-motion'),
                'classes' => 'emje-control--has-tooltip',
                'condition' => $ditherCondition,
                'frontend_available' => true,
                'render_type' => 'template',
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
