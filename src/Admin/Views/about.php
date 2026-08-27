<?php

declare(strict_types=1);

/**
 * About admin view.
 *
 * @var string $version
 */

defined('ABSPATH') || exit;
?>
<div class="wrap emje-motion-admin">
	<h1><?php echo esc_html__('Emje Motion — About', 'emje-motion'); ?></h1>

	<div style="background:#fff;border:1px solid #ccd0d4;border-radius:8px;padding:16px;max-width:720px;">
		<p style="font-size:14px;">
			<strong><?php echo esc_html__('Version:', 'emje-motion'); ?></strong> <?php echo esc_html($version); ?>
		</p>
		<p>
			<?php echo esc_html__('A lightweight motion toolkit for Elementor. Extends existing widgets with modern motion effects without adding custom widgets.', 'emje-motion'); ?>
		</p>
		<ul style="list-style:disc;margin-left:20px;">
			<li><a href="https://emjecreative.com" target="_blank" rel="noopener noreferrer"><?php echo esc_html__('Website', 'emje-motion'); ?></a></li>
			<li><a href="https://github.com/emjecreative/emje-motion" target="_blank" rel="noopener noreferrer"><?php echo esc_html__('Documentation', 'emje-motion'); ?></a></li>
			<li><a href="https://github.com/emjecreative/emje-motion/issues" target="_blank" rel="noopener noreferrer"><?php echo esc_html__('Support', 'emje-motion'); ?></a></li>
			<li><a href="https://github.com/emjecreative/emje-motion#readme" target="_blank" rel="noopener noreferrer"><?php echo esc_html__('Changelog', 'emje-motion'); ?></a></li>
		</ul>
		<p class="description">
			<?php echo esc_html__('Requires WordPress 6.7+, Elementor 3.23+, PHP 8.2+. Animation engine: GSAP (Free) + Lenis (MIT) for Smooth Scroll.', 'emje-motion'); ?>
		</p>
	</div>
</div>
