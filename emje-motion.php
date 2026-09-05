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
 * Description: Beautiful motion for your website.
 * Version: 1.0.28
 * Requires at least: 6.7
 * Tested up to: 7.1
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

define('EMJE_MOTION_VERSION', '1.0.28');
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
|
| Wrapped in closures so activating an incomplete copy (missing vendor/)
| shows the admin notice below instead of a fatal "class not found".
|
*/

register_activation_hook(
    __FILE__,
    static function (bool $networkWide = false): void {
        if (class_exists(\EmjeCreative\EmjeMotion\Core\Activator::class)) {
            \EmjeCreative\EmjeMotion\Core\Activator::activate($networkWide);
        }
    },
);

register_deactivation_hook(
    __FILE__,
    static function (): void {
        if (class_exists(\EmjeCreative\EmjeMotion\Core\Deactivator::class)) {
            \EmjeCreative\EmjeMotion\Core\Deactivator::deactivate();
        }
    },
);

/*
|--------------------------------------------------------------------------
| Self-Healing Updater (zero dependencies)
|--------------------------------------------------------------------------
|
| GitHubUpdater + MuPluginInstaller use only WordPress APIs — no Composer.
| They load directly so 1-click updates and stale-banner pruning keep
| working even if vendor/ is ever missing (e.g. after a bad upload).
|
*/

if (! class_exists(\EmjeCreative\EmjeMotion\Updater\GitHubUpdater::class)) {
    require_once EMJE_MOTION_PATH . 'src/Updater/GitHubUpdater.php';
}

if (! class_exists(\EmjeCreative\EmjeMotion\Updater\MuPluginInstaller::class)) {
    require_once EMJE_MOTION_PATH . 'src/Updater/MuPluginInstaller.php';
}

/*
|--------------------------------------------------------------------------
| Bootstrap Plugin
|--------------------------------------------------------------------------
*/

if (class_exists(\EmjeCreative\EmjeMotion\Core\Plugin::class)) {
    (new \EmjeCreative\EmjeMotion\Core\Plugin())->boot();
} elseif (class_exists(\EmjeCreative\EmjeMotion\Updater\GitHubUpdater::class)) {
    // Incomplete install: updater stays alive so the user can 1-click
    // back to health, but say so loudly instead of dying silently.
    (new \EmjeCreative\EmjeMotion\Updater\GitHubUpdater(
        EMJE_MOTION_FILE,
        'emjecreative/emje-motion',
        'emje-motion',
    ))->register();

    add_action('admin_notices', static function (): void {
        if (! current_user_can('manage_options')) {
            return;
        }
        ?>
        <div class="notice notice-error">
            <p>
                <?php
                echo esc_html__('Emje Motion is incompletely installed (missing files). Please reinstall it: ', 'emje-motion');
        echo '<a href="https://github.com/emjecreative/emje-motion/releases/latest">';
        echo esc_html__('download the latest release zip', 'emje-motion');
        echo '</a>';
        ?>
            </p>
        </div>
        <?php
    });
}
