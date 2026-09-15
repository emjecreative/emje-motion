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


        (new AsciiControls())->register($element);
        (new PixelControls())->register($element);
        (new DitherControls())->register($element);
        (new MeshControls())->register($element);

        $element->end_controls_section();
    }
}
