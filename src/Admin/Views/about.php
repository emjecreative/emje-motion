<?php

declare(strict_types=1);

/**
 * About admin view.
 *
 * @var string $version
 */

defined('ABSPATH') || exit;

settings_errors('emje_motion_check_updates');

$isNetwork = is_network_admin();
?>
<div class="wrap emje-motion-admin">
	<div class="emje-admin-header">
		<img class="emje-admin-header__logo" src="<?php echo esc_url(EMJE_MOTION_URL . 'assets/images/emje-motion-logo.svg'); ?>" alt="" />
		<div>
			<div class="emje-admin-header__title">Emje Motion <span>v<?php echo esc_html($version); ?></span></div>
			<div class="emje-admin-header__subtitle"><?php echo esc_html__('Motion that feels native to Elementor', 'emje-motion'); ?></div>
		</div>
		<div class="emje-admin-header__nav">
			<a href="<?php echo esc_url(admin_url('admin.php?page=emje-motion')); ?>"><?php echo esc_html__('Overview', 'emje-motion'); ?></a>
			<a href="<?php echo esc_url(admin_url('admin.php?page=emje-motion-settings')); ?>"><?php echo esc_html__('Settings', 'emje-motion'); ?></a>
			<a class="is-active" href="<?php echo esc_url(admin_url('admin.php?page=emje-motion-about')); ?>"><?php echo esc_html__('About', 'emje-motion'); ?></a>
		</div>
	</div>

	<div class="emje-hero">
		<img class="emje-hero__logo" src="<?php echo esc_url(EMJE_MOTION_URL . 'assets/images/emje-motion-logo.svg'); ?>" alt="" />
		<div class="emje-hero__title"><?php echo esc_html__('Lightweight motion toolkit for Elementor', 'emje-motion'); ?></div>
		<p class="emje-hero__subtitle"><?php echo esc_html__('Scramble, Unfold & Fill Reveal. Hover Reveal & Interactive Cursor. Buttery smooth scroll — assets load only where used.', 'emje-motion'); ?></p>
		<div class="emje-hero__pill">v<?php echo esc_html($version); ?> • <?php echo esc_html__('WordPress 6.7+ • Elementor 3.23+ • PHP 8.2+', 'emje-motion'); ?></div>
	</div>

	<div class="emje-links">
		<a href="https://emjecreative.com" target="_blank" rel="noopener noreferrer">
			<span class="emje-links__icon"><span class="dashicons dashicons-admin-site-alt3"></span></span>
			<span><span class="emje-links__title"><?php echo esc_html__('Website', 'emje-motion'); ?></span><br><span class="emje-links__url">emjecreative.com</span></span>
			<span class="dashicons dashicons-arrow-right-alt2" style="margin-left:auto;color:#667085;"></span>
		</a>
		<a href="https://github.com/emjecreative/emje-motion" target="_blank" rel="noopener noreferrer">
			<span class="emje-links__icon"><span class="dashicons dashicons-media-document"></span></span>
			<span><span class="emje-links__title"><?php echo esc_html__('Documentation', 'emje-motion'); ?></span><br><span class="emje-links__url">GitHub README</span></span>
			<span class="dashicons dashicons-arrow-right-alt2" style="margin-left:auto;color:#667085;"></span>
		</a>
		<a href="https://github.com/emjecreative/emje-motion/issues" target="_blank" rel="noopener noreferrer">
			<span class="emje-links__icon"><span class="dashicons dashicons-sos"></span></span>
			<span><span class="emje-links__title"><?php echo esc_html__('Support', 'emje-motion'); ?></span><br><span class="emje-links__url">GitHub Issues</span></span>
			<span class="dashicons dashicons-arrow-right-alt2" style="margin-left:auto;color:#667085;"></span>
		</a>
		<a href="https://github.com/emjecreative/emje-motion#readme" target="_blank" rel="noopener noreferrer">
			<span class="emje-links__icon"><span class="dashicons dashicons-update"></span></span>
			<span><span class="emje-links__title"><?php echo esc_html__('Changelog', 'emje-motion'); ?></span><br><span class="emje-links__url">WHAT'S NEW</span></span>
			<span class="dashicons dashicons-arrow-right-alt2" style="margin-left:auto;color:#667085;"></span>
		</a>
	</div>

	<div class="emje-card" style="margin-top:16px;">
		<h2 style="margin:0 0 8px 0;font-size:14px;font-weight:700;color:#111827;"><?php echo esc_html__('Updates', 'emje-motion'); ?></h2>
		<p class="description" style="margin:0 0 12px 0;color:#667085;font-size:12px;"><?php echo esc_html__('Check if a newer version is available.', 'emje-motion'); ?></p>
		<form method="post" action="">
			<?php wp_nonce_field('emje_motion_check_updates'); ?>
			<input type="hidden" name="emje_motion_action" value="check_updates" />
			<button type="submit" class="button emje-btn-primary"><?php echo esc_html__('Check for Updates', 'emje-motion'); ?></button>
		</form>
	</div>
</div>
