<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Admin;

final class AdminNotice
{
    /**
     * Register WordPress hooks.
     */
    public function register(): void
    {
        add_action(
            'admin_notices',
            [ $this, 'showElementorRequiredNotice' ]
        );
    }

    /**
     * Display Elementor required notice.
     */
    public function showElementorRequiredNotice(): void
    {
        ?>
		<div class="notice notice-error">
			<p>
				<strong>Emje Motion</strong> requires Elementor to be installed and activated.
			</p>
		</div>
		<?php
    }
}
