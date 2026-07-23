<?php
/**
 * Plugin Name:       Emje Motion
 * Plugin URI:        https://emjecreative.com
 * Description:       A lightweight motion toolkit for Elementor.
 * Version:           1.0.0
 * Requires at least: 6.5
 * Requires PHP:      8.2
 * Author:            Emje Creative
 * Author URI:        https://emjecreative.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       emje-motion
 * Domain Path:       /languages
 */

defined( 'ABSPATH' ) || exit;

define( 'EMJE_MOTION_VERSION', '1.0.0' );
define( 'EMJE_MOTION_FILE', __FILE__ );
define( 'EMJE_MOTION_PATH', plugin_dir_path( __FILE__ ) );
define( 'EMJE_MOTION_URL', plugin_dir_url( __FILE__ ) );

$autoload = EMJE_MOTION_PATH . 'vendor/autoload.php';

if ( file_exists( $autoload ) ) {
	require_once $autoload;
}

register_activation_hook(
    __FILE__,
    [ \EmjeCreative\EmjeMotion\Core\Activator::class, 'activate' ]
);

register_deactivation_hook(
    __FILE__,
    [ \EmjeCreative\EmjeMotion\Core\Deactivator::class, 'deactivate' ]
);

if ( class_exists( \EmjeCreative\EmjeMotion\Core\Plugin::class ) ) {
	$plugin = new \EmjeCreative\EmjeMotion\Core\Plugin();
	$plugin->boot();
}
