<?php

declare(strict_types=1);

/**
 * Settings admin view.
 *
 * @var array<string, mixed> $settings
 * @var array<string, bool>  $modules
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
			<a href="<?php echo esc_url(admin_url('admin.php?page=emje-motion-about')); ?>"><i class="ph-duotone ph-article" aria-hidden="true"></i> <?php echo esc_html__('About', 'emje-motion'); ?></a>
		</nav>
		<button type="button" class="emje-admin-header__toggle" aria-expanded="false" aria-controls="emjeAdminDropdown" aria-label="<?php echo esc_attr__('Toggle navigation', 'emje-motion'); ?>">
			<i class="ph-duotone ph-list" aria-hidden="true"></i>
		</button>
		<nav class="emje-admin-header__dropdown" id="emjeAdminDropdown" aria-label="<?php echo esc_attr__('Mobile navigation', 'emje-motion'); ?>">
			<a href="<?php echo esc_url(admin_url('admin.php?page=emje-motion')); ?>"><i class="ph-duotone ph-squares-four" aria-hidden="true"></i> <?php echo esc_html__('Overview', 'emje-motion'); ?></a>
			<a class="is-active" aria-current="page" href="<?php echo esc_url(admin_url('admin.php?page=emje-motion-settings')); ?>"><i class="ph-duotone ph-gear" aria-hidden="true"></i> <?php echo esc_html__('Settings', 'emje-motion'); ?></a>
			<a href="<?php echo esc_url(admin_url('admin.php?page=emje-motion-about')); ?>"><i class="ph-duotone ph-article" aria-hidden="true"></i> <?php echo esc_html__('About', 'emje-motion'); ?></a>
		</nav>
	</div>
</header>
<div class="wrap emje-motion-admin">

	<form method="post" action="">
		<?php wp_nonce_field('emje_motion_save_settings'); ?>
		<input type="hidden" name="emje_motion_action" value="save_settings" />

		<div class="emje-main">
			<div class="emje-main__header">
				<div style="display:flex;align-items:center;gap:12px;min-width:0">
					<div class="emje-main__icon"><i class="ph-duotone ph-gear"></i></div>
					<div style="display:flex;flex-direction:column;gap:4px;min-width:0">
						<div class="emje-main__title" style="margin:0"><?php echo esc_html__('Settings', 'emje-motion'); ?></div>
						<div class="emje-main__subtitle"><?php echo esc_html__('Manage preferences & performance', 'emje-motion'); ?></div>
					</div>
				</div>
				<button type="submit" class="button emje-btn-primary" id="emjeSaveSettingsBtn" disabled aria-disabled="true" title="<?php echo esc_attr__('No changes to save', 'emje-motion'); ?>"><?php echo esc_html__('Save Settings', 'emje-motion'); ?></button>
			</div>
			<noscript><style>#emjeSaveSettingsBtn{opacity:1 !important;pointer-events:auto !important;cursor:pointer !important}</style></noscript>
			<div class="emje-main__content">
				<div class="emje-card">
					<div class="emje-card__head">
						<div class="emje-card__label"><?php echo esc_html__('Behavior', 'emje-motion'); ?></div>
					</div>
					<p class="emje-card__desc"><?php echo esc_html__('Manage how motion behaves across your site.', 'emje-motion'); ?></p>
					<div class="emje-card__divider"></div>
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
							<div class="emje-setting-row__label"><?php echo esc_html__('Disable Interaction Motion on Mobile', 'emje-motion'); ?></div>
							<div class="emje-setting-row__desc"><?php echo esc_html__('Disable Hover Reveal & Interactive Cursor on touch devices.', 'emje-motion'); ?></div>
						</div>
						<div class="emje-setting-row__control">
							<label class="emje-switch">
								<input type="checkbox" name="disable_interaction_on_mobile" value="1" <?php checked(! empty($settings['disable_interaction_on_mobile'])); ?> />
								<span class="emje-switch__track"><span class="emje-switch__thumb"></span></span>
							</label>
						</div>
					</div>
				</div>

				<?php $isSmoothEnabled = ! empty($modules['smooth-scroll']); ?>
				<?php if ($isSmoothEnabled) : ?>
				<div class="emje-card" style="margin-top:16px;">
					<div class="emje-card__head">
						<div class="emje-card__label"><?php echo esc_html__('Smooth Scroll', 'emje-motion'); ?></div>
					</div>
					<p class="emje-card__desc"><?php echo esc_html__('Global smooth scroll. Enabled via Overview → Smooth Scroll toggle.', 'emje-motion'); ?></p>
					<div class="emje-card__divider"></div>
					<div class="emje-setting-row">
						<div class="emje-setting-row__left">
							<div class="emje-setting-row__label"><?php echo esc_html__('Disable Smooth Scroll on Mobile', 'emje-motion'); ?></div>
							<div class="emje-setting-row__desc"><?php echo esc_html__('Disable smooth scroll on touch devices.', 'emje-motion'); ?></div>
						</div>
						<div class="emje-setting-row__control">
							<label class="emje-switch">
								<input type="checkbox" name="disable_smooth_on_mobile" value="1" <?php checked(! empty($settings['disable_smooth_on_mobile'])); ?> />
								<span class="emje-switch__track"><span class="emje-switch__thumb"></span></span>
							</label>
						</div>
					</div>
					<div class="emje-setting-row">
						<div class="emje-setting-row__left">
							<div class="emje-setting-row__label"><?php echo esc_html__('Smoothness', 'emje-motion'); ?></div>
							<div class="emje-setting-row__desc"><?php echo esc_html__('Lower is smoother. Range 0.05–0.15, default 0.075.', 'emje-motion'); ?></div>
						</div>
						<div class="emje-setting-row__control">
							<input class="emje-slider" type="range" name="smooth_scroll_lerp" value="<?php echo esc_attr((string) ($settings['smooth_scroll_lerp'] ?? 0.075)); ?>" min="0.05" max="0.15" step="0.005" oninput="this.nextElementSibling.textContent=this.value" />
							<span class="emje-value-bubble"><?php echo esc_html((string) ($settings['smooth_scroll_lerp'] ?? 0.075)); ?></span>
						</div>
					</div>
					<div class="emje-setting-row">
						<div class="emje-setting-row__left">
							<div class="emje-setting-row__label"><?php echo esc_html__('Wheel Multiplier', 'emje-motion'); ?></div>
							<div class="emje-setting-row__desc"><?php echo esc_html__('Controls scroll distance per tick. Range 0.8–1.5, default 1.2.', 'emje-motion'); ?></div>
						</div>
						<div class="emje-setting-row__control">
							<input class="emje-slider" type="range" name="smooth_scroll_wheel_multiplier" value="<?php echo esc_attr((string) ($settings['smooth_scroll_wheel_multiplier'] ?? 1.2)); ?>" min="0.8" max="1.5" step="0.1" oninput="this.nextElementSibling.textContent=this.value" />
							<span class="emje-value-bubble"><?php echo esc_html((string) ($settings['smooth_scroll_wheel_multiplier'] ?? 1.2)); ?></span>
						</div>
					</div>
				</div>
				<?php endif; ?>
			</div>
		</div>
	</form>
</div>
