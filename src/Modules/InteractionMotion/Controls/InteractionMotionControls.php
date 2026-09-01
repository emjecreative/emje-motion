<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\InteractionMotion\Controls;

use Elementor\Controls_Manager;

/**
 * Registers Elementor controls for Interaction Motion (unified Container).
 * Effect: hover-reveal / interactive-cursor (1 per Container).
 */
final class InteractionMotionControls
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
     * @param array<string, mixed> $args
     */
    public function registerContainerControls($element, array $args): void
    {
        $element->start_controls_section(
            'emje_motion_interaction_motion',
            [
                'label' => esc_html__('Interaction Motion', 'emje-motion'),
                'tab' => Controls_Manager::TAB_STYLE,
            ],
        );

        $element->add_control(
            'emje_interaction_brand_header',
            [
                'type' => Controls_Manager::RAW_HTML,
                'raw' => '<div class="emje-brand-header"><img src="' . esc_url(EMJE_MOTION_URL . 'assets/images/emje-motion-logo.svg') . '" alt="" width="16" height="16" style="border-radius:3px;flex-shrink:0;" /><span>Emje Motion</span><span class="emje-brand-header__badge">Interaction</span></div>',
                'content_classes' => 'emje-brand-header-wrap',
            ],
        );

        $element->add_control(
            'emje_interaction_enable',
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
            'emje_interaction_effect',
            [
                'label' => esc_html__('Effect', 'emje-motion'),
                'type' => Controls_Manager::SELECT,
                'default' => 'hover-reveal',
                'options' => [
                    'hover-reveal' => esc_html__('Hover Reveal', 'emje-motion'),
                    'interactive-cursor' => esc_html__('Interactive Cursor', 'emje-motion'),
                ],
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                ],
                'frontend_available' => true,
                'render_type' => 'template',
            ],
        );

        (new HoverControls())->register($element);
        (new CursorControls())->register($element);

        $element->add_control(
            'emje_interaction_preview_heading',
            [
                'label' => esc_html__('Preview', 'emje-motion'),
                'type' => Controls_Manager::HEADING,
                'separator' => 'before',
                'condition' => [
                    'emje_interaction_enable' => 'yes',
                ],
            ],
        );

        $element->add_control(
            'emje_interaction_live_preview',
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
                    'emje_interaction_enable' => 'yes',
                ],
            ],
        );

        $element->end_controls_section();
    }
}
