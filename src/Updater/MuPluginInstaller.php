<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Updater;

/**
 * Auto-installs mu-plugin updater shim for multisite per-site activation.
 */
final class MuPluginInstaller
{
    public const MU_FILE = 'emje-motion-updater.php';

    public static function install(): void
    {
        if (! function_exists('is_multisite') || ! is_multisite()) {
            return;
        }

        $muDir = defined('WPMU_PLUGIN_DIR') ? WPMU_PLUGIN_DIR : WP_CONTENT_DIR . '/mu-plugins';
        $target = rtrim($muDir, '/\\') . '/' . self::MU_FILE;
        $source = dirname(__DIR__) . '/Updater/stub/mu-emje-motion-updater.php';

        // Alternative path when called from mu context: __DIR__ is src/Updater
        if (! file_exists($source)) {
            $source = EMJE_MOTION_PATH . 'src/Updater/stub/mu-emje-motion-updater.php';
        }

        if (! file_exists($source)) {
            return;
        }

        if (! is_dir($muDir)) {
            // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_mkdir --mu install requires mkdir
            @mkdir($muDir, 0755, true);
        }

        if (! is_dir($muDir) || ! is_writable($muDir)) {
            return;
        }

        // Only copy if not exists or source is newer.
        $shouldCopy = true;
        if (file_exists($target)) {
            $shouldCopy = filemtime($source) > filemtime($target);
        }

        if ($shouldCopy) {
            // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_copy --mu install
            @copy($source, $target);
        }
    }

    public static function uninstall(): void
    {
        if (! function_exists('is_multisite') || ! is_multisite()) {
            return;
        }

        // Only remove if no site still has plugin active (network or per-site).
        if (self::isActiveAnywhere()) {
            return;
        }

        $muDir = defined('WPMU_PLUGIN_DIR') ? WPMU_PLUGIN_DIR : WP_CONTENT_DIR . '/mu-plugins';
        $target = rtrim($muDir, '/\\') . '/' . self::MU_FILE;

        if (file_exists($target)) {
            // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_unlink -- mu cleanup
            @unlink($target);
        }
    }

    /**
     * Check if plugin is active anywhere in the network.
     */
    private static function isActiveAnywhere(): bool
    {
        $plugin = plugin_basename(EMJE_MOTION_FILE);

        // Network activated?
        if (function_exists('is_plugin_active_for_network') && is_plugin_active_for_network($plugin)) {
            return true;
        }

        if (! function_exists('get_sites') || ! function_exists('is_plugin_active')) {
            return false;
        }

        // Check each site (limit to 100 sites to avoid performance hit).
        $sites = get_sites(['number' => 100]);
        foreach ($sites as $site) {
            /** @phpstan-ignore function.alreadyNarrowedType */
            $siteId = is_object($site) ? (int) $site->blog_id : (int) $site['blog_id'];
            switch_to_blog($siteId);
            $active = is_plugin_active($plugin);
            restore_current_blog();
            if ($active) {
                return true;
            }
        }

        return false;
    }
}
