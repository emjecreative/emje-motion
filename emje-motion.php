<?php

/**
 * Main plugin bootstrap file.
 *
 * Loads the Emje Motion plugin and initializes the plugin bootstrap.
 *
 * @package EmjeMotion
 */

/**
 * Plugin Name: Emje Motion
 * Plugin URI: https://emjecreative.com
 * Description: A lightweight motion toolkit for Elementor.
 * Version: 1.0.1
 * Requires at least: 6.7
 * Tested up to: 6.8
 * Requires PHP: 8.2
 * Requires Plugins: elementor
 * Author: Emje Creative
 * Author URI: https://emjecreative.com
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: emje-motion
 * Update URI: https://github.com/emjecreative/emje-motion
 */

declare(strict_types=1);

defined('ABSPATH') || exit;

define('EMJE_MOTION_VERSION', '1.0.1');
define('EMJE_MOTION_FILE', __FILE__);
define('EMJE_MOTION_PATH', plugin_dir_path(__FILE__));
define('EMJE_MOTION_URL', plugin_dir_url(__FILE__));

/*
|--------------------------------------------------------------------------
| Composer Autoloader
|--------------------------------------------------------------------------
*/

$autoload = EMJE_MOTION_PATH . 'vendor/autoload.php';

if (file_exists($autoload)) {
    require_once $autoload;
}

/*
|--------------------------------------------------------------------------
| Plugin Lifecycle Hooks
|--------------------------------------------------------------------------
*/

register_activation_hook(
    __FILE__,
    [
        \EmjeCreative\EmjeMotion\Core\Activator::class,
        'activate',
    ],
);

register_deactivation_hook(
    __FILE__,
    [
        \EmjeCreative\EmjeMotion\Core\Deactivator::class,
        'deactivate',
    ],
);

/*
|--------------------------------------------------------------------------
| Bootstrap Plugin
|--------------------------------------------------------------------------
*/

if (class_exists(\EmjeCreative\EmjeMotion\Core\Plugin::class)) {
    (new \EmjeCreative\EmjeMotion\Core\Plugin())->boot();
}
