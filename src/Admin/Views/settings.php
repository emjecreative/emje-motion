<?php

declare(strict_types=1);

/**
 * Settings admin view.
 *
 * @var array<string, mixed> $settings
 */

defined('ABSPATH') || exit;

settings_errors('emje_motion_settings');
?>
<div class="wrap emje-motion-admin">
	<h1><?php echo esc_html__('Emje Motion — Settings', 'emje-motion'); ?></h1>

	<form method="post" action="">
		<?php wp_nonce_field('emje_motion_save_settings'); ?>
		<input type="hidden" name="emje_motion_action" value="save_settings" />

		<table class="form-table" role="presentation">
			<tbody>
				<tr>
					<th scope="row"><?php echo esc_html__('Respect Reduced Motion', 'emje-motion'); ?></th>
					<td>
						<label>
							<input type="checkbox" name="respect_reduced_motion" value="1" <?php checked(! empty($settings['respect_reduced_motion'])); ?> />
							<?php echo esc_html__('Disable animations when user prefers reduced motion', 'emje-motion'); ?>
						</label>
						<p class="description"><?php echo esc_html__('When enabled, all motion is skipped if the OS/browser reports prefers-reduced-motion: reduce.', 'emje-motion'); ?></p>
					</td>
				</tr>
				<tr>
					<th scope="row"><?php echo esc_html__('Disable on Mobile', 'emje-motion'); ?></th>
					<td>
						<label>
							<input type="checkbox" name="disable_on_mobile" value="1" <?php checked(! empty($settings['disable_on_mobile'])); ?> />
							<?php echo esc_html__('Disable Hover Reveal and Interactive Cursor on touch devices', 'emje-motion'); ?>
						</label>
						<p class="description"><?php echo esc_html__('Also used as default for Smooth Scroll mobile toggle.', 'emje-motion'); ?></p>
					</td>
				</tr>
				<tr>
					<th scope="row"><?php echo esc_html__('Debug Mode', 'emje-motion'); ?></th>
					<td>
						<label>
							<input type="checkbox" name="debug_mode" value="1" <?php checked(! empty($settings['debug_mode'])); ?> />
							<?php echo esc_html__('Enable WP_DEBUG logging for module failures', 'emje-motion'); ?>
						</label>
						<p class="description"><?php echo esc_html__('Logs to error_log when WP_DEBUG is true. See ModuleLoader.', 'emje-motion'); ?></p>
					</td>
				</tr>
			</tbody>
		</table>

		<h2><?php echo esc_html__('Smooth Scroll', 'emje-motion'); ?></h2>
		<p class="description"><?php echo esc_html__('Lenis-powered global smooth scroll. Enabled via Overview → Smooth Scroll toggle. Lerp controls smoothness, Wheel Multiplier controls scroll distance.', 'emje-motion'); ?></p>

		<table class="form-table" role="presentation">
			<tbody>
				<tr>
					<th scope="row"><?php echo esc_html__('Smoothness (Lerp)', 'emje-motion'); ?></th>
					<td>
						<input type="number" name="smooth_scroll_lerp" value="<?php echo esc_attr((string) ($settings['smooth_scroll_lerp'] ?? 0.075)); ?>" min="0.05" max="0.15" step="0.005" />
						<p class="description"><?php echo esc_html__('Range 0.05–0.15, default 0.075. Lower is smoother.', 'emje-motion'); ?></p>
					</td>
				</tr>
				<tr>
					<th scope="row"><?php echo esc_html__('Wheel Multiplier', 'emje-motion'); ?></th>
					<td>
						<input type="number" name="smooth_scroll_wheel_multiplier" value="<?php echo esc_attr((string) ($settings['smooth_scroll_wheel_multiplier'] ?? 1.0)); ?>" min="0.8" max="1.5" step="0.1" />
						<p class="description"><?php echo esc_html__('Range 0.8–1.5, default 1.0. Controls scroll distance per wheel tick.', 'emje-motion'); ?></p>
					</td>
				</tr>
			</tbody>
		</table>

		<p>
			<button type="submit" class="button button-primary"><?php echo esc_html__('Save Settings', 'emje-motion'); ?></button>
		</p>
	</form>

	<hr />

	<h2><?php echo esc_html__('Performance', 'emje-motion'); ?></h2>
	<p class="description">
		<?php echo esc_html__('Assets are loaded conditionally: only on pages where Elementor data contains emje_motion_enable. Use the filter emje_motion_should_load_assets to force loading for popups or archives.', 'emje-motion'); ?>
	</p>
</div>
