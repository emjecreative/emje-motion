<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\HoverReveal\Controls;

use Elementor\Controls_Manager;

/**
 * Registers Elementor controls for Hover Reveal.
 */
final class HoverRevealControls
{
    public function register(): void
    {
        add_action(
            'elementor/element/container/section_layout/after_section_end',
            [$this, 'registerContainerControls'],
            10,
            2,
        );
    }

    /**
     * Register controls for Container.
     *
     * @param mixed $element
     */
    public function registerContainerControls($element, array $args): void
    {
        $element->start_controls_section(
            'emje_motion_hover_reveal',
            [
                'label' => esc_html__('Hover Reveal', 'emje-motion'),
                'tab' => Controls_Manager::TAB_LAYOUT,
            ],
        );

        $element->add_control(
            'emje_hover_reveal_enable',
            [
                'label' => esc_html__('Enable', 'emje-motion'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => esc_html__('On', 'emje-motion'),
                'label_off' => esc_html__('Off', 'emje-motion'),
                'return_value' => 'yes',
                'default' => '',
            ],
        );

        $element->add_control(
            'emje_hover_reveal_image',
            [
                'label' => esc_html__('Reveal Image', 'emje-motion'),
                'type' => Controls_Manager::MEDIA,
                'default' => [
                    'url' => '',
                ],
                'condition' => [
                    'emje_hover_reveal_enable' => 'yes',
                ],
            ],
        );

        $element->add_control(
            'emje_hover_reveal_image_size',
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
                    'emje_hover_reveal_enable' => 'yes',
                ],
            ],
        );

        $element->add_control(
            'emje_hover_reveal_follow_speed',
            [
                'label' => esc_html__('Follow Speed', 'emje-motion'),
                'type' => Controls_Manager::NUMBER,
                'default' => 0.12,
                'min' => 0.05,
                'max' => 0.3,
                'step' => 0.01,
                'description' => esc_html__('How quickly the image follows the cursor. Lower is smoother.', 'emje-motion'),
                'condition' => [
                    'emje_hover_reveal_enable' => 'yes',
                ],
            ],
        );

        $element->add_control(
            'emje_hover_reveal_scale',
            [
                'label' => esc_html__('Scale on Hover', 'emje-motion'),
                'type' => Controls_Manager::NUMBER,
                'default' => 1.0,
                'min' => 0.8,
                'max' => 1.2,
                'step' => 0.05,
                'condition' => [
                    'emje_hover_reveal_enable' => 'yes',
                ],
            ],
        );

        $element->add_control(
            'emje_hover_reveal_animation',
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
                    'emje_hover_reveal_enable' => 'yes',
                ],
            ],
        );

        $element->add_control(
            'emje_hover_reveal_trigger_area',
            [
                'label' => esc_html__('Trigger Area', 'emje-motion'),
                'type' => Controls_Manager::SELECT,
                'default' => 'container',
                'options' => [
                    'container' => esc_html__('Whole Container', 'emje-motion'),
                    'heading' => esc_html__('Heading Only', 'emje-motion'),
                ],
                'condition' => [
                    'emje_hover_reveal_enable' => 'yes',
                ],
            ],
        );

        $element->end_controls_section();
    }
}
