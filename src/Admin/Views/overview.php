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

$activeCount = count(array_filter(array_intersect_key($modules, $definitions)));
$totalCount = count($definitions);
if ($activeCount === 0) {
    $statusLabel = __('No features active', 'emje-motion');
} elseif ($activeCount === $totalCount) {
    $statusLabel = __('All features active', 'emje-motion');
} else {
    $statusLabel = sprintf(__('%d of %d active', 'emje-motion'), $activeCount, $totalCount);
}
$version = defined('EMJE_MOTION_VERSION') ? EMJE_MOTION_VERSION : '1.0.2';
?>
<header class="emje-admin-header" id="emjeAdminHeader">
	<div class="emje-admin-header__inner">
		<a class="emje-admin-header__brand" href="<?php echo esc_url(admin_url('admin.php?page=emje-motion')); ?>" aria-label="<?php echo esc_attr__('Emje Motion Overview', 'emje-motion'); ?>">
			<img class="emje-admin-header__logo" src="<?php echo esc_url(EMJE_MOTION_URL . 'assets/images/emje-motion-dashboard-logo-blue.svg'); ?>" alt="Emje Motion" />
			<span class="emje-admin-header__title">Emje Motion</span>
		</a>
		<nav class="emje-admin-header__nav" aria-label="<?php echo esc_attr__('Primary', 'emje-motion'); ?>">
			<a class="is-active" aria-current="page" href="<?php echo esc_url(admin_url('admin.php?page=emje-motion')); ?>"><i class="ph-duotone ph-squares-four" aria-hidden="true"></i> <?php echo esc_html__('Overview', 'emje-motion'); ?></a>
			<a href="<?php echo esc_url(admin_url('admin.php?page=emje-motion-settings')); ?>"><i class="ph-duotone ph-gear" aria-hidden="true"></i> <?php echo esc_html__('Settings', 'emje-motion'); ?></a>
			<a href="<?php echo esc_url(admin_url('admin.php?page=emje-motion-about')); ?>"><i class="ph-duotone ph-article" aria-hidden="true"></i> <?php echo esc_html__('About', 'emje-motion'); ?></a>
		</nav>
		<button type="button" class="emje-admin-header__toggle" aria-expanded="false" aria-controls="emjeAdminDropdown" aria-label="<?php echo esc_attr__('Toggle navigation', 'emje-motion'); ?>">
			<i class="ph-duotone ph-list" aria-hidden="true"></i>
		</button>
		<nav class="emje-admin-header__dropdown" id="emjeAdminDropdown" aria-label="<?php echo esc_attr__('Mobile navigation', 'emje-motion'); ?>">
			<a class="is-active" aria-current="page" href="<?php echo esc_url(admin_url('admin.php?page=emje-motion')); ?>"><i class="ph-duotone ph-squares-four" aria-hidden="true"></i> <?php echo esc_html__('Overview', 'emje-motion'); ?></a>
			<a href="<?php echo esc_url(admin_url('admin.php?page=emje-motion-settings')); ?>"><i class="ph-duotone ph-gear" aria-hidden="true"></i> <?php echo esc_html__('Settings', 'emje-motion'); ?></a>
			<a href="<?php echo esc_url(admin_url('admin.php?page=emje-motion-about')); ?>"><i class="ph-duotone ph-article" aria-hidden="true"></i> <?php echo esc_html__('About', 'emje-motion'); ?></a>
		</nav>
	</div>
</header>
<div class="wrap emje-motion-admin">

	<form method="post" action="">
		<?php wp_nonce_field('emje_motion_save_modules'); ?>
		<input type="hidden" name="emje_motion_action" value="save_modules" />

		<div class="emje-main">
			<div class="emje-main__header">
				<div style="display:flex;align-items:center;gap:12px;min-width:0">
					<div class="emje-main__icon"><i class="ph-duotone ph-sliders-horizontal"></i></div>
					<div style="display:flex;flex-direction:column;gap:4px;min-width:0">
						<div class="emje-main__title" style="margin:0"><?php echo esc_html__('Features', 'emje-motion'); ?></div>
						<div class="emje-main__subtitle"><?php echo esc_html($statusLabel); ?></div>
					</div>
				</div>
				<button type="submit" class="button emje-btn-primary" id="emjeSaveBtn" disabled aria-disabled="true" title="<?php echo esc_attr__('No changes to save', 'emje-motion'); ?>"><?php echo esc_html__('Save Changes', 'emje-motion'); ?></button>
			</div>
			<noscript><style>#emjeSaveBtn{opacity:1 !important;pointer-events:auto !important;cursor:pointer !important}</style><p style="font-size:11px;color:#667085;margin:6px 0 0 0"><?php echo esc_html__('Enable JavaScript to track changes.', 'emje-motion'); ?></p></noscript>
			<div class="emje-main__content">
				<div class="emje-grid">
					<?php foreach ($definitions as $id => $def) : ?>
						<?php
                        $isEnabled = ! empty($modules[$id]);
					    $inputName = 'module_' . str_replace('-', '_', $id);
					    ?>
						<div class="emje-card">
							<div class="emje-card__head">
								<div class="emje-card__icon"><i class="ph-duotone ph-<?php echo esc_attr($def['icon']); ?>"></i></div>
								<div class="emje-card__label"><?php echo esc_html($def['label']); ?></div>
							</div>
							<p class="emje-card__desc"><?php echo esc_html($def['description']); ?></p>
							<div class="emje-card__divider"></div>
							<div style="display:flex;align-items:center;justify-content:space-between;margin-top:0;">
								<span class="emje-badge <?php echo $isEnabled ? 'emje-badge--on' : 'emje-badge--off'; ?>"><?php echo $isEnabled ? esc_html__('Enabled', 'emje-motion') : esc_html__('Disabled', 'emje-motion'); ?></span>
								<label class="emje-switch">
									<input type="checkbox" name="<?php echo esc_attr($inputName); ?>" value="1" <?php checked($isEnabled); ?> />
									<span class="emje-switch__track"><span class="emje-switch__thumb"></span></span>
								</label>
							</div>
						</div>
					<?php endforeach; ?>
				</div>
			</div>
		</div>
	</form>
</div>
