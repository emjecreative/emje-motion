<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\TextMotion\Frontend;

use Elementor\Widget_Base;

/**
 * Handles frontend integration for the Text Motion module.
 */
final class TextMotionFrontend
{
    /**
     * Supported Elementor widgets.
     *
     * @var string[]
     */
    private const SUPPORTED_WIDGETS = [
        'heading',
        'text-editor',
    ];

	private const MOTION_CLASS = 'emje-motion';

    /**
     * Register frontend hooks.
     */
    public function register(): void
    {
        add_action(
            'elementor/widget/before_render_content',
            [ $this, 'beforeRender' ]
        );
    }

    /**
     * Runs before widget content is rendered.
     */
    public function beforeRender(Widget_Base $widget): void
    {
        if (
            ! in_array(
                $widget->get_name(),
                self::SUPPORTED_WIDGETS,
                true
            )
        ) {
            return;
        }

		$settings = $widget->get_settings_for_display();

		if (empty($settings['emje_motion_enable'])) {
			return;
		}

		$config = $this->buildConfig($settings);

		$widget->add_render_attribute(
			'_wrapper',
			'class',
			self::MOTION_CLASS
		);

		$widget->add_render_attribute(
			'_wrapper',
			'data-emje-motion',
			wp_json_encode($config)
		);

    }

	/**
	 * Build the frontend motion configuration.
	 *
	 * @param array<string, mixed> $settings
	 * @return array<string, mixed>
	 */
	private function buildConfig(array $settings): array
	{
		return [
		'animation' => $settings['emje_motion_animation'] ?? '',
		'duration'  => (float) ($settings['emje_motion_duration'] ?? 1),
		'delay'     => (float) ($settings['emje_motion_delay'] ?? 0),
		'ease'      => $settings['emje_motion_ease'] ?? 'power2.out',
		'trigger'   => $settings['emje_motion_trigger'] ?? 'load',
		'playOnce'  => ($settings['emje_motion_play_once'] ?? 'yes') === 'yes',
		];
	}

}
