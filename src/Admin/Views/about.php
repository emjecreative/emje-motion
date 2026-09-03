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
<header class="emje-admin-header" id="emjeAdminHeader">
	<div class="emje-admin-header__inner">
		<a class="emje-admin-header__brand" href="<?php echo esc_url(admin_url('admin.php?page=emje-motion')); ?>" aria-label="<?php echo esc_attr__('Emje Motion Overview', 'emje-motion'); ?>">
			<img class="emje-admin-header__logo" src="<?php echo esc_url(EMJE_MOTION_URL . 'assets/images/emje-motion-dashboard-logo-blue.svg'); ?>" alt="Emje Motion" />
			<span class="emje-admin-header__title">Emje Motion</span>
		</a>
		<nav class="emje-admin-header__nav" aria-label="<?php echo esc_attr__('Primary', 'emje-motion'); ?>">
			<a href="<?php echo esc_url(admin_url('admin.php?page=emje-motion')); ?>"><i class="ph-duotone ph-squares-four" aria-hidden="true"></i> <?php echo esc_html__('Overview', 'emje-motion'); ?></a>
			<a href="<?php echo esc_url(admin_url('admin.php?page=emje-motion-settings')); ?>"><i class="ph-duotone ph-gear" aria-hidden="true"></i> <?php echo esc_html__('Settings', 'emje-motion'); ?></a>
			<a class="is-active" aria-current="page" href="<?php echo esc_url(admin_url('admin.php?page=emje-motion-about')); ?>"><i class="ph-duotone ph-info" aria-hidden="true"></i> <?php echo esc_html__('About', 'emje-motion'); ?></a>
		</nav>
		<button type="button" class="emje-admin-header__toggle" aria-expanded="false" aria-controls="emjeAdminDropdown" aria-label="<?php echo esc_attr__('Toggle navigation', 'emje-motion'); ?>">
			<i class="ph-duotone ph-list" aria-hidden="true"></i>
		</button>
		<nav class="emje-admin-header__dropdown" id="emjeAdminDropdown" aria-label="<?php echo esc_attr__('Mobile navigation', 'emje-motion'); ?>">
			<a href="<?php echo esc_url(admin_url('admin.php?page=emje-motion')); ?>"><i class="ph-duotone ph-squares-four" aria-hidden="true"></i> <?php echo esc_html__('Overview', 'emje-motion'); ?></a>
			<a href="<?php echo esc_url(admin_url('admin.php?page=emje-motion-settings')); ?>"><i class="ph-duotone ph-gear" aria-hidden="true"></i> <?php echo esc_html__('Settings', 'emje-motion'); ?></a>
			<a class="is-active" aria-current="page" href="<?php echo esc_url(admin_url('admin.php?page=emje-motion-about')); ?>"><i class="ph-duotone ph-info" aria-hidden="true"></i> <?php echo esc_html__('About', 'emje-motion'); ?></a>
		</nav>
	</div>
</header>
<div class="wrap emje-motion-admin">

	<div class="emje-main">
		<div class="emje-main__header">
			<div class="emje-main__title"><i class="ph-duotone ph-info" style="color:#1227E2;"></i> <?php echo esc_html__('About', 'emje-motion'); ?></div>
			<span style="font-size:11px;font-weight:600;background:#F2F4FF;border:1px solid #DCE4FF;color:#1227E2;padding:2px 8px;border-radius:999px;">v<?php echo esc_html($version); ?></span>
		</div>
		<div class="emje-main__content">
			<div style="text-align:center;padding:8px 0 12px 0;">
				<img src="<?php echo esc_url(EMJE_MOTION_URL . 'assets/images/emje-motion-logo.svg'); ?>" alt="" style="width:40px;height:40px;border-radius:8px;border:1px solid #E5E7EB;padding:6px;background:#F9FAFB;" />
				<div style="font-size:16px;font-weight:700;margin:8px 0 4px 0;color:#111827;"><?php echo esc_html__('Lightweight motion toolkit for Elementor', 'emje-motion'); ?></div>
				<p style="color:#667085;font-size:12px;margin:0;max-width:520px;margin-left:auto;margin-right:auto;"><?php echo esc_html__('Scramble, Unfold & Fill Reveal. Hover Reveal & Interactive Cursor. Buttery smooth scroll — assets load only where used.', 'emje-motion'); ?></p>
				<div style="display:inline-flex;gap:6px;background:#F2F4FF;border:1px solid #DCE4FF;color:#1227E2;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:600;margin-top:8px;">v<?php echo esc_html($version); ?> • <?php echo esc_html__('WordPress 6.7+ • Elementor 3.23+ • PHP 8.2+', 'emje-motion'); ?></div>
			</div>
			<div class="emje-links">
		<a href="https://emjecreative.com" target="_blank" rel="noopener noreferrer">
			<span class="emje-links__icon"><i class="ph-duotone ph-globe"></i></span>
			<span><span class="emje-links__title"><?php echo esc_html__('Website', 'emje-motion'); ?></span><br><span class="emje-links__url">emjecreative.com</span></span>
			<i class="ph-duotone ph-caret-right" style="margin-left:auto;color:#667085;"></i>
		</a>
		<a href="https://github.com/emjecreative/emje-motion" target="_blank" rel="noopener noreferrer">
			<span class="emje-links__icon"><i class="ph-duotone ph-book-open"></i></span>
			<span><span class="emje-links__title"><?php echo esc_html__('Documentation', 'emje-motion'); ?></span><br><span class="emje-links__url">GitHub README</span></span>
			<i class="ph-duotone ph-caret-right" style="margin-left:auto;color:#667085;"></i>
		</a>
		<a href="https://github.com/emjecreative/emje-motion/issues" target="_blank" rel="noopener noreferrer">
			<span class="emje-links__icon"><i class="ph-duotone ph-lifebuoy"></i></span>
			<span><span class="emje-links__title"><?php echo esc_html__('Support', 'emje-motion'); ?></span><br><span class="emje-links__url">GitHub Issues</span></span>
			<i class="ph-duotone ph-caret-right" style="margin-left:auto;color:#667085;"></i>
		</a>
		<a href="https://github.com/emjecreative/emje-motion#readme" target="_blank" rel="noopener noreferrer">
			<span class="emje-links__icon"><i class="ph-duotone ph-clock-counter-clockwise"></i></span>
			<span><span class="emje-links__title"><?php echo esc_html__('Changelog', 'emje-motion'); ?></span><br><span class="emje-links__url">WHAT'S NEW</span></span>
			<i class="ph-duotone ph-caret-right" style="margin-left:auto;color:#667085;"></i>
		</a>
			</div>
			<div style="margin-top:16px;padding-top:16px;border-top:1px solid #E5E7EB;">
				<h2 style="margin:0 0 8px 0;font-size:14px;font-weight:700;color:#111827;"><?php echo esc_html__('Updates', 'emje-motion'); ?></h2>
				<p class="description" style="margin:0 0 12px 0;color:#667085;font-size:12px;"><?php echo esc_html__('Check if a newer version is available.', 'emje-motion'); ?></p>
				<form method="post" action="">
					<?php wp_nonce_field('emje_motion_check_updates'); ?>
					<input type="hidden" name="emje_motion_action" value="check_updates" />
					<button type="submit" class="button emje-btn-primary"><?php echo esc_html__('Check for Updates', 'emje-motion'); ?></button>
				</form>
				<?php if (is_multisite()) : ?>
					<p class="description" style="margin:8px 0 0 0;color:#667085;font-size:11px;"><?php echo esc_html__('On multisite, Network Activate is recommended. When activated per site, check for updates from that site’s dashboard.', 'emje-motion'); ?></p>
				<?php endif; ?>
			</div>
		</div>
	</div>
</div>
