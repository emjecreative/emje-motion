<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\TextMotion\Controls;

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
    public function registerHeadingControls( $element, array $args ): void
    {
        $this->registerControls( $element );
    }

    /**
     * Register controls for Text Editor widget.
     */
    public function registerTextEditorControls( $element, array $args ): void
    {
        $this->registerControls( $element );
    }

    /**
     * Register shared controls.
     */
    private function registerControls( $element ): void
    {
        // Controls will be added in the next task.
    }
}
