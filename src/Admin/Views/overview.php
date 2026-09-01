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

$activeCount = count(array_filter($modules));
$totalCount = count($definitions);
$version = defined('EMJE_MOTION_VERSION') ? EMJE_MOTION_VERSION : '1.0.2';
?>
<div class="wrap emje-motion-admin">
	<div class="emje-admin-header">
		<img class="emje-admin-header__logo" src="<?php echo esc_url(EMJE_MOTION_URL . 'assets/images/emje-motion-logo.svg'); ?>" alt="" />
		<div>
			<div class="emje-admin-header__title">Emje Motion <span>v<?php echo esc_html($version); ?></span></div>
			<div class="emje-admin-header__subtitle"><?php echo esc_html__('Motion that feels native to Elementor', 'emje-motion'); ?></div>
		</div>
		<div class="emje-admin-header__nav">
			<a class="is-active" href="<?php echo esc_url(admin_url('admin.php?page=emje-motion')); ?>"><?php echo esc_html__('Overview', 'emje-motion'); ?></a>
			<a href="<?php echo esc_url(admin_url('admin.php?page=emje-motion-settings')); ?>"><?php echo esc_html__('Settings', 'emje-motion'); ?></a>
			<a href="<?php echo esc_url(admin_url('admin.php?page=emje-motion-about')); ?>"><?php echo esc_html__('About', 'emje-motion'); ?></a>
		</div>
	</div>

	<p class="emje-admin-summary">
		<span class="emje-admin-summary__dot"></span> <strong><?php echo esc_html(sprintf(__('%d Modules', 'emje-motion'), $totalCount)); ?></strong>
		<span>•</span> <span><?php echo esc_html(sprintf(__('%d Active', 'emje-motion'), $activeCount)); ?></span>
		<span>•</span> <span><?php echo esc_html__('Assets load only where used', 'emje-motion'); ?></span>
	</p>
	<p class="description" style="margin:0 0 12px 0;color:#667085;font-size:12px;"><?php echo esc_html__('Enable only what you need. Assets load only where used.', 'emje-motion'); ?></p>

	<form method="post" action="">
		<?php wp_nonce_field('emje_motion_save_modules'); ?>
		<input type="hidden" name="emje_motion_action" value="save_modules" />

		<div class="emje-grid">
			<?php foreach ($definitions as $id => $def) : ?>
				<?php
                $isEnabled = ! empty($modules[$id]);
			    $inputName = 'module_' . str_replace('-', '_', $id);
			    ?>
				<div class="emje-card <?php echo $isEnabled ? 'emje-card--top' : ''; ?>">
					<div class="emje-card__head">
						<div class="emje-card__icon"><span class="dashicons dashicons-<?php echo esc_attr($def['icon']); ?>"></span></div>
						<div class="emje-card__label"><?php echo esc_html($def['label']); ?></div>
						<span class="emje-badge <?php echo $isEnabled ? 'emje-badge--on' : 'emje-badge--off'; ?>">
							<span class="emje-badge__dot"></span> <?php echo $isEnabled ? esc_html__('Enabled', 'emje-motion') : esc_html__('Disabled', 'emje-motion'); ?>
						</span>
					</div>
					<p class="emje-card__desc"><?php echo esc_html($def['description']); ?></p>
					<div style="display:flex;align-items:center;justify-content:space-between;margin-top:12px;">
						<span style="font-size:12px;color:#667085;font-weight:500;"><?php echo esc_html__('Enable module', 'emje-motion'); ?></span>
						<label class="emje-switch">
							<input type="checkbox" name="<?php echo esc_attr($inputName); ?>" value="1" <?php checked($isEnabled); ?> />
							<span class="emje-switch__track"><span class="emje-switch__thumb"></span></span>
						</label>
					</div>
				</div>
			<?php endforeach; ?>
		</div>

		<p style="margin-top:16px;">
			<button type="submit" class="button emje-btn-primary"><?php echo esc_html__('Save Modules', 'emje-motion'); ?></button>
		</p>
	</form>
</div>
