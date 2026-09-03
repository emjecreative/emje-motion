<?php

declare(strict_types=1);

/**
 * About admin view.
 *
 * @var string $version
 * @var string $wpVersion
 * @var string $phpVersion
 * @var string $elementorVersion
 */

defined('ABSPATH') || exit;

settings_errors('emje_motion_check_updates');
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
			<a class="is-active" aria-current="page" href="<?php echo esc_url(admin_url('admin.php?page=emje-motion-about')); ?>"><i class="ph-duotone ph-article" aria-hidden="true"></i> <?php echo esc_html__('About', 'emje-motion'); ?></a>
		</nav>
		<button type="button" class="emje-admin-header__toggle" aria-expanded="false" aria-controls="emjeAdminDropdown" aria-label="<?php echo esc_attr__('Toggle navigation', 'emje-motion'); ?>">
			<i class="ph-duotone ph-list" aria-hidden="true"></i>
		</button>
		<nav class="emje-admin-header__dropdown" id="emjeAdminDropdown" aria-label="<?php echo esc_attr__('Mobile navigation', 'emje-motion'); ?>">
			<a href="<?php echo esc_url(admin_url('admin.php?page=emje-motion')); ?>"><i class="ph-duotone ph-squares-four" aria-hidden="true"></i> <?php echo esc_html__('Overview', 'emje-motion'); ?></a>
			<a href="<?php echo esc_url(admin_url('admin.php?page=emje-motion-settings')); ?>"><i class="ph-duotone ph-gear" aria-hidden="true"></i> <?php echo esc_html__('Settings', 'emje-motion'); ?></a>
			<a class="is-active" aria-current="page" href="<?php echo esc_url(admin_url('admin.php?page=emje-motion-about')); ?>"><i class="ph-duotone ph-article" aria-hidden="true"></i> <?php echo esc_html__('About', 'emje-motion'); ?></a>
		</nav>
	</div>
</header>
<div class="wrap emje-motion-admin">

	<div class="emje-card emje-about-hero-card">
		<div class="emje-about-hero__title"><?php echo esc_html__('Lightweight motion toolkit for Elementor', 'emje-motion'); ?></div>
		<p class="emje-about-hero__desc"><?php echo esc_html__('Scramble, Unfold & Fill Reveal. Hover Reveal & Interactive Cursor. Buttery smooth scroll — assets load only where used.', 'emje-motion'); ?></p>
	</div>

	<div class="emje-main">
		<div class="emje-main__header">
			<div class="emje-about-header__left">
				<div class="emje-main__icon"><i class="ph-duotone ph-article"></i></div>
				<div class="emje-about-header__text">
					<div class="emje-main__title"><?php echo esc_html__('About', 'emje-motion'); ?></div>
					<div class="emje-main__subtitle"><?php echo esc_html__('Information & updates', 'emje-motion'); ?></div>
				</div>
			</div>
		</div>
		<div class="emje-main__content">
			<div class="emje-links">
				<a href="https://emjecreative.com" target="_blank" rel="noopener noreferrer">
					<span class="emje-links__icon"><i class="ph-duotone ph-globe"></i></span>
					<span class="emje-links__text"><span class="emje-links__title"><?php echo esc_html__('Website', 'emje-motion'); ?></span><span class="emje-links__url">emjecreative.com</span></span>
					<i class="ph-duotone ph-caret-right emje-links__caret" aria-hidden="true"></i>
				</a>
				<a href="https://github.com/emjecreative/emje-motion" target="_blank" rel="noopener noreferrer">
					<span class="emje-links__icon"><i class="ph-duotone ph-book-open"></i></span>
					<span class="emje-links__text"><span class="emje-links__title"><?php echo esc_html__('Documentation', 'emje-motion'); ?></span><span class="emje-links__url">Read Guide</span></span>
					<i class="ph-duotone ph-caret-right emje-links__caret" aria-hidden="true"></i>
				</a>
				<a href="https://github.com/emjecreative/emje-motion/issues" target="_blank" rel="noopener noreferrer">
					<span class="emje-links__icon"><i class="ph-duotone ph-lifebuoy"></i></span>
					<span class="emje-links__text"><span class="emje-links__title"><?php echo esc_html__('Support', 'emje-motion'); ?></span><span class="emje-links__url">Get Help</span></span>
					<i class="ph-duotone ph-caret-right emje-links__caret" aria-hidden="true"></i>
				</a>
				<a href="https://github.com/emjecreative/emje-motion#readme" target="_blank" rel="noopener noreferrer">
					<span class="emje-links__icon"><i class="ph-duotone ph-clock-counter-clockwise"></i></span>
					<span class="emje-links__text"><span class="emje-links__title"><?php echo esc_html__('Changelog', 'emje-motion'); ?></span><span class="emje-links__url">WHAT'S NEW</span></span>
					<i class="ph-duotone ph-caret-right emje-links__caret" aria-hidden="true"></i>
				</a>
			</div>
		</div>
	</div>

	<div class="emje-about-grid">
		<div class="emje-card emje-about-card">
			<div class="emje-main__header emje-about-card__header">
				<div class="emje-about-header__left">
					<div class="emje-main__icon"><i class="ph-duotone ph-pulse"></i></div>
					<div class="emje-about-header__text">
						<div class="emje-main__title"><?php echo esc_html__('System Status', 'emje-motion'); ?></div>
						<div class="emje-main__subtitle"><?php echo esc_html__('Current environment — useful when asking for support.', 'emje-motion'); ?></div>
					</div>
				</div>
			</div>
			<div class="emje-about-card__body">
				<div class="emje-about-system">
					<div class="emje-about-system__item">
						<span class="emje-about-system__label"><?php echo esc_html__('Plugin', 'emje-motion'); ?></span>
						<span class="emje-about-system__value">v<?php echo esc_html($version); ?></span>
					</div>
					<div class="emje-about-system__item">
						<span class="emje-about-system__label">WordPress</span>
						<span class="emje-about-system__value"><?php echo esc_html($wpVersion); ?></span>
					</div>
					<div class="emje-about-system__item">
						<span class="emje-about-system__label">Elementor</span>
						<span class="emje-about-system__value"><?php echo $elementorVersion !== '' ? esc_html($elementorVersion) : esc_html__('Not detected', 'emje-motion'); ?></span>
					</div>
					<div class="emje-about-system__item">
						<span class="emje-about-system__label">PHP</span>
						<span class="emje-about-system__value"><?php echo esc_html($phpVersion); ?></span>
					</div>
				</div>
			</div>
		</div>

		<div class="emje-card emje-about-card">
			<div class="emje-main__header emje-about-card__header emje-about-card__header--flat">
				<div class="emje-about-header__left">
					<div class="emje-main__icon"><i class="ph-duotone ph-download-simple"></i></div>
					<div class="emje-about-header__text">
						<div class="emje-main__title"><?php echo esc_html__('Updates', 'emje-motion'); ?></div>
						<div class="emje-main__subtitle"><?php echo esc_html__('Check if a newer version is available.', 'emje-motion'); ?></div>
					</div>
				</div>
				<form method="post" action="" class="emje-about-updates__form">
					<?php wp_nonce_field('emje_motion_check_updates'); ?>
					<input type="hidden" name="emje_motion_action" value="check_updates" />
					<button type="submit" class="button emje-btn-primary"><?php echo esc_html__('Check for Updates', 'emje-motion'); ?></button>
				</form>
			</div>
			<?php if (is_multisite()) : ?>
				<div class="emje-about-updates__body">
					<p class="emje-about-updates__note"><?php echo esc_html__('On multisite, Network Activate is recommended. When activated per site, check for updates from that site’s dashboard.', 'emje-motion'); ?></p>
				</div>
			<?php endif; ?>
		</div>
	</div>

</div>
