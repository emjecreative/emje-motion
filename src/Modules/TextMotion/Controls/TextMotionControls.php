<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\TextMotion\Controls;

use Elementor\Controls_Manager;

/**
 * Registers Elementor controls for Text Motion.
 */
final class TextMotionControls
{
    /**
     * Register Elementor hooks.
     */
    public function register(): void
    {
        add_action(
            'elementor/element/heading/section_title_style/after_section_end',
            [ $this, 'registerHeadingControls' ],
            10,
            2
        );

        add_action(
            'elementor/element/text-editor/section_style/after_section_end',
            [ $this, 'registerTextEditorControls' ],
            10,
            2
        );
    }

    /**
     * Register controls for Heading widget.
     */
    public function registerHeadingControls($element, array $args): void
    {
        $this->registerControls($element);
    }

    /**
     * Register controls for Text Editor widget.
     */
    public function registerTextEditorControls($element, array $args): void
    {
        $this->registerControls($element);
    }

    /**
     * Register shared controls.
     */
    private function registerControls($element): void
    {
        $element->start_controls_section(
            'emje_motion_text_motion',
            [
                'label' => __('Text Motion', 'emje-motion'),
                'tab'   => Controls_Manager::TAB_STYLE,
            ]
        );

        $element->end_controls_section();
    }
}
