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
            [ $this, 'showElementorRequiredNotice' ],
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
				<strong><?php echo esc_html__('Emje Motion', 'emje-motion'); ?></strong>
				<?php echo esc_html__('requires Elementor to be installed and activated.', 'emje-motion'); ?>
			</p>
		</div>
		<?php
    }
}
