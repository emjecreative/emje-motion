<?php

declare(strict_types=1);

/**
 * Overview admin view.
 *
 * @var array<string, bool>  $modules
 * @var array<string, array> $definitions
 */

defined('ABSPATH') || exit;

settings_errors('emje_motion_modules');
?>
<div class="wrap emje-motion-admin">
	<h1><?php echo esc_html__('Emje Motion — Overview', 'emje-motion'); ?></h1>
	<p class="description">
		<?php echo esc_html__('Enable or disable modules individually. Disabled modules will not load any assets or controls.', 'emje-motion'); ?>
	</p>

	<form method="post" action="">
		<?php wp_nonce_field('emje_motion_save_modules'); ?>
		<input type="hidden" name="emje_motion_action" value="save_modules" />

		<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;margin-top:16px;">
			<?php foreach ($definitions as $id => $def) : ?>
				<?php
                $isEnabled = ! empty($modules[$id]);
			    $inputName = 'module_' . str_replace('-', '_', $id);
			    $isComingSoon = $def['status'] === esc_html__('Coming Soon', 'emje-motion');
			    ?>
				<div style="border:1px solid #ccd0d4;border-radius:8px;padding:16px;background:#fff;">
					<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
						<span class="dashicons dashicons-<?php echo esc_attr($def['icon']); ?>" style="font-size:20px;"></span>
						<strong><?php echo esc_html($def['label']); ?></strong>
						<span style="margin-left:auto;font-size:11px;padding:2px 6px;border-radius:999px;background:<?php echo $isEnabled ? '#00a32a' : '#d63638'; ?>;color:#fff;">
							<?php echo $isEnabled ? esc_html__('Enabled', 'emje-motion') : esc_html__('Disabled', 'emje-motion'); ?>
						</span>
					</div>
					<p style="margin:0 0 8px;color:#646970;font-size:13px;"><?php echo esc_html($def['description']); ?></p>
					<p style="margin:0 0 8px;font-size:12px;color:#50575e;">
						<?php echo esc_html($def['status']); ?>
						<?php if ($isComingSoon) : ?>
							— <?php echo esc_html__('toggle available, frontend not yet implemented.', 'emje-motion'); ?>
						<?php endif; ?>
					</p>
					<label style="display:flex;align-items:center;gap:8px;font-weight:500;">
						<input type="checkbox" name="<?php echo esc_attr($inputName); ?>" value="1" <?php checked($isEnabled); ?> />
						<?php echo esc_html__('Enable module', 'emje-motion'); ?>
					</label>
				</div>
			<?php endforeach; ?>
		</div>

		<p style="margin-top:16px;">
			<button type="submit" class="button button-primary"><?php echo esc_html__('Save Modules', 'emje-motion'); ?></button>
		</p>
	</form>
</div>
