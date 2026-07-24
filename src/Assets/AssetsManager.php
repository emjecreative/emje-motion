<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Assets;

/**
 * Handles plugin assets.
 */
final class AssetsManager
{
	    /**
     * Frontend script handle.
     */
    private const FRONTEND_SCRIPT = 'emje-motion-frontend';

    /**
     * Editor script handle.
     */
    private const EDITOR_SCRIPT = 'emje-motion-editor';

    /**
     * Frontend style handle.
     */
    private const FRONTEND_STYLE = 'emje-motion-frontend';

    /**
     * Editor style handle.
     */
    private const EDITOR_STYLE = 'emje-motion-editor';


    /**
     * Register assets.
     */
	public function register(): void
	{
		// Frontend Assets
		add_action(
			'wp_enqueue_scripts',
			[ $this, 'registerFrontendAssets' ],
			5
		);

		add_action(
			'wp_enqueue_scripts',
			[ $this, 'enqueueFrontendAssets' ],
			10
		);

		// Editor Assets
		add_action(
			'elementor/editor/before_enqueue_scripts',
			[ $this, 'registerEditorAssets' ],
			5
		);

		add_action(
			'elementor/editor/before_enqueue_scripts',
			[ $this, 'enqueueEditorAssets' ],
			10
		);
	}

    /**
     * Register frontend assets.
     */
    public function registerFrontendAssets(): void
    {
		wp_register_script(
			self::FRONTEND_SCRIPT,
			$this->asset('js/frontend.js'),
			[],
			EMJE_MOTION_VERSION,
			true
		);
    }

	/**
	 * Enqueue frontend assets.
	 */
	public function enqueueFrontendAssets(): void
	{
		wp_enqueue_script(
			self::FRONTEND_SCRIPT
		);
	}

    /**
     * Register editor assets.
     */
    public function registerEditorAssets(): void
    {
        // Editor assets will be added later.
    }

	/**
	 * Enqueue editor assets.
	 */
	public function enqueueEditorAssets(): void
	{
		// Editor assets will be enqueued later.
	}


	/**
	 * Get plugin asset URL.
	 *
	 * @param string $path Asset path relative to the dist directory.
	 *
	 * @return string
	 */
	private function asset(string $path): string
	{
		return EMJE_MOTION_URL . 'dist/' . ltrim($path, '/');
	}
}
