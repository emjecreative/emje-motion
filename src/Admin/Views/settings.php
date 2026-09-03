<?php

declare(strict_types=1);

/**
 * Settings admin view.
 *
 * @var array<string, mixed> $settings
 */

defined('ABSPATH') || exit;

settings_errors('emje_motion_settings');

$version = defined('EMJE_MOTION_VERSION') ? EMJE_MOTION_VERSION : '1.0.11';
?>
<header class="emje-admin-header" id="emjeAdminHeader">
	<div class="emje-admin-header__inner">
		<a class="emje-admin-header__brand" href="<?php echo esc_url(admin_url('admin.php?page=emje-motion')); ?>" aria-label="<?php echo esc_attr__('Emje Motion Overview', 'emje-motion'); ?>">
			<img class="emje-admin-header__logo" src="<?php echo esc_url(EMJE_MOTION_URL . 'assets/images/emje-motion-dashboard-logo-blue.svg'); ?>" alt="Emje Motion" />
			<span class="emje-admin-header__title">Emje Motion</span>
		</a>
		<nav class="emje-admin-header__nav" aria-label="<?php echo esc_attr__('Primary', 'emje-motion'); ?>">
			<a href="<?php echo esc_url(admin_url('admin.php?page=emje-motion')); ?>"><i class="ph-duotone ph-squares-four" aria-hidden="true"></i> <?php echo esc_html__('Overview', 'emje-motion'); ?></a>
			<a class="is-active" aria-current="page" href="<?php echo esc_url(admin_url('admin.php?page=emje-motion-settings')); ?>"><i class="ph-duotone ph-gear" aria-hidden="true"></i> <?php echo esc_html__('Settings', 'emje-motion'); ?></a>
			<a href="<?php echo esc_url(admin_url('admin.php?page=emje-motion-about')); ?>"><i class="ph-duotone ph-info" aria-hidden="true"></i> <?php echo esc_html__('About', 'emje-motion'); ?></a>
		</nav>
		<button type="button" class="emje-admin-header__toggle" aria-expanded="false" aria-controls="emjeAdminDropdown" aria-label="<?php echo esc_attr__('Toggle navigation', 'emje-motion'); ?>">
			<i class="ph-duotone ph-list" aria-hidden="true"></i>
		</button>
		<nav class="emje-admin-header__dropdown" id="emjeAdminDropdown" aria-label="<?php echo esc_attr__('Mobile navigation', 'emje-motion'); ?>">
			<a href="<?php echo esc_url(admin_url('admin.php?page=emje-motion')); ?>"><i class="ph-duotone ph-squares-four" aria-hidden="true"></i> <?php echo esc_html__('Overview', 'emje-motion'); ?></a>
			<a class="is-active" aria-current="page" href="<?php echo esc_url(admin_url('admin.php?page=emje-motion-settings')); ?>"><i class="ph-duotone ph-gear" aria-hidden="true"></i> <?php echo esc_html__('Settings', 'emje-motion'); ?></a>
			<a href="<?php echo esc_url(admin_url('admin.php?page=emje-motion-about')); ?>"><i class="ph-duotone ph-info" aria-hidden="true"></i> <?php echo esc_html__('About', 'emje-motion'); ?></a>
		</nav>
	</div>
</header>
<div class="wrap emje-motion-admin">

	<form method="post" action="">
		<?php wp_nonce_field('emje_motion_save_settings'); ?>
		<input type="hidden" name="emje_motion_action" value="save_settings" />

		<div class="emje-main">
			<div class="emje-main__header">
				<div class="emje-main__title"><i class="ph-duotone ph-gear"></i> <?php echo esc_html__('Settings', 'emje-motion'); ?></div>
				<button type="submit" class="button emje-btn-primary"><?php echo esc_html__('Save Settings', 'emje-motion'); ?></button>
			</div>
			<div class="emje-main__content">
				<div style="padding:0;">
					<h2 style="margin:0 0 12px 0;font-size:14px;font-weight:700;color:#111827;"><?php echo esc_html__('Behavior', 'emje-motion'); ?></h2>
					<div class="emje-setting-row">
						<div class="emje-setting-row__left">
							<div class="emje-setting-row__label"><?php echo esc_html__('Respect Reduced Motion', 'emje-motion'); ?></div>
							<div class="emje-setting-row__desc"><?php echo esc_html__('Honors your system preference. Motion auto-skips if the user prefers less animation.', 'emje-motion'); ?></div>
						</div>
						<div class="emje-setting-row__control">
							<label class="emje-switch">
								<input type="checkbox" name="respect_reduced_motion" value="1" <?php checked(! empty($settings['respect_reduced_motion'])); ?> />
								<span class="emje-switch__track"><span class="emje-switch__thumb"></span></span>
							</label>
						</div>
					</div>
					<div class="emje-setting-row">
						<div class="emje-setting-row__left">
							<div class="emje-setting-row__label"><?php echo esc_html__('Disable on Mobile', 'emje-motion'); ?></div>
							<div class="emje-setting-row__desc"><?php echo esc_html__('Disable Hover Reveal and Interactive Cursor on touch devices.', 'emje-motion'); ?></div>
						</div>
						<div class="emje-setting-row__control">
							<label class="emje-switch">
								<input type="checkbox" name="disable_on_mobile" value="1" <?php checked(! empty($settings['disable_on_mobile'])); ?> />
								<span class="emje-switch__track"><span class="emje-switch__thumb"></span></span>
							</label>
						</div>
					</div>
					<div class="emje-setting-row">
						<div class="emje-setting-row__left">
							<div class="emje-setting-row__label"><?php echo esc_html__('Debug Mode', 'emje-motion'); ?></div>
							<div class="emje-setting-row__desc"><?php echo esc_html__('Logs to error_log when WP_DEBUG is true.', 'emje-motion'); ?></div>
						</div>
						<div class="emje-setting-row__control">
							<label class="emje-switch">
								<input type="checkbox" name="debug_mode" value="1" <?php checked(! empty($settings['debug_mode'])); ?> />
								<span class="emje-switch__track"><span class="emje-switch__thumb"></span></span>
							</label>
						</div>
					</div>
				</div>

				<div style="margin-top:16px;border-top:1px solid #E5E7EB;padding-top:16px;">
					<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
						<h2 style="margin:0;font-size:14px;font-weight:700;color:#111827;"><?php echo esc_html__('Smooth Scroll', 'emje-motion'); ?></h2>
						<span style="font-size:11px;font-weight:600;background:#F2F4F7;border:1px solid #E5E7EB;color:#344054;padding:2px 6px;border-radius:999px;"><?php echo esc_html__('Global', 'emje-motion'); ?></span>
					</div>
					<p class="description" style="margin:0 0 12px 0;color:#667085;font-size:12px;"><?php echo esc_html__('Global smooth scroll. Enabled via Overview → Smooth Scroll toggle.', 'emje-motion'); ?></p>
					<div class="emje-setting-row">
						<div class="emje-setting-row__left">
							<div class="emje-setting-row__label"><?php echo esc_html__('Smoothness', 'emje-motion'); ?></div>
							<div class="emje-setting-row__desc"><?php echo esc_html__('Lower is smoother. Range 0.05–0.15, default 0.055.', 'emje-motion'); ?></div>
						</div>
						<div class="emje-setting-row__control">
							<input class="emje-slider" type="range" name="smooth_scroll_lerp" value="<?php echo esc_attr((string) ($settings['smooth_scroll_lerp'] ?? 0.055)); ?>" min="0.05" max="0.15" step="0.005" oninput="this.nextElementSibling.textContent=this.value" />
							<span class="emje-value-bubble"><?php echo esc_html((string) ($settings['smooth_scroll_lerp'] ?? 0.055)); ?></span>
						</div>
					</div>
					<div class="emje-setting-row">
						<div class="emje-setting-row__left">
							<div class="emje-setting-row__label"><?php echo esc_html__('Wheel Multiplier', 'emje-motion'); ?></div>
							<div class="emje-setting-row__desc"><?php echo esc_html__('Controls scroll distance per tick. Range 0.8–1.5, default 1.0.', 'emje-motion'); ?></div>
						</div>
						<div class="emje-setting-row__control">
							<input class="emje-slider" type="range" name="smooth_scroll_wheel_multiplier" value="<?php echo esc_attr((string) ($settings['smooth_scroll_wheel_multiplier'] ?? 1.0)); ?>" min="0.8" max="1.5" step="0.1" oninput="this.nextElementSibling.textContent=this.value" />
							<span class="emje-value-bubble"><?php echo esc_html((string) ($settings['smooth_scroll_wheel_multiplier'] ?? 1.0)); ?></span>
						</div>
					</div>
				</div>

				<div class="emje-card" style="background:#F8FAFF;border-color:#DCE4FF;margin-top:16px;">
					<div style="display:flex;gap:10px;align-items:center;">
						<i class="ph-duotone ph-info" style="color:#1227E2;"></i>
						<div>
							<div style="font-weight:600;color:#111827;font-size:13px;"><?php echo esc_html__('Performance', 'emje-motion'); ?></div>
							<p class="description" style="margin:2px 0 0 0;color:#667085;font-size:12px;">
								<?php echo esc_html__('Assets load only where used — on pages with motion enabled. Use filter emje_motion_should_load_assets for popups or archives.', 'emje-motion'); ?>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</form>
</div>
