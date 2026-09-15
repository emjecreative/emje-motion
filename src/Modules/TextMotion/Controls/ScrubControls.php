<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\TextMotion\Controls;

use Elementor\Controls_Manager;

/**
 * On Scroll (Scrub) boundary controls for Text Motion.
 */
final class ScrubControls
{
    /**
     * @param mixed $element
     */
    public function register($element): void
    {
        $element->add_control(
            'emje_motion_scrub',
            [
                'label' => esc_html__('Scrub', 'emje-motion'),
                'type' => Controls_Manager::SELECT,
                'default' => 'custom',
                'options' => [
                    'full' => esc_html__('Enter + Leave Viewport', 'emje-motion'),
                    'center' => esc_html__('Center Stage', 'emje-motion'),
                    'custom' => esc_html__('Custom', 'emje-motion'),
                ],
                'condition' => [
                    'emje_motion_enable' => 'yes',
                    'emje_motion_trigger' => 'scroll',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_control(
            'emje_motion_scrub_start_position',
            [
                'label' => esc_html__('Start Position', 'emje-motion'),
                'type' => Controls_Manager::NUMBER,
                'default' => 100,
                'min' => 0,
                'max' => 100,
                'step' => 1,
                'description' => esc_html__(
                    'Screen line where the effect starts: 0 is the top of the screen, 100 is the bottom.',
                    'emje-motion',
                ),
                'classes' => 'emje-control--has-tooltip',
                'condition' => [
                    'emje_motion_enable' => 'yes',
                    'emje_motion_trigger' => 'scroll',
                    'emje_motion_scrub' => 'custom',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );

        $element->add_control(
            'emje_motion_scrub_end_position',
            [
                'label' => esc_html__('End Position', 'emje-motion'),
                'type' => Controls_Manager::NUMBER,
                'default' => 30,
                'min' => 0,
                'max' => 100,
                'step' => 1,
                'description' => esc_html__(
                    'Screen line where the effect finishes: 0 is the top of the screen, 100 is the bottom.',
                    'emje-motion',
                ),
                'classes' => 'emje-control--has-tooltip',
                'condition' => [
                    'emje_motion_enable' => 'yes',
                    'emje_motion_trigger' => 'scroll',
                    'emje_motion_scrub' => 'custom',
                ],
                'frontend_available' => true,
                'render_type' => 'none',
            ],
        );
    }
}
