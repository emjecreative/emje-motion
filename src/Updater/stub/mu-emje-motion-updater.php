<?php

declare(strict_types=1);

/**
 * Emje Motion MU Updater Shim
 * Auto-loaded in all multisite contexts (Network Admin, wp-cron, REST) even when per-site Activate.
 * Lightweight GitHub releases check — does not load Elementor or ModuleLoader.
 */

defined('ABSPATH') || exit;

if (! function_exists('emje_motion_mu_get_version')) {
    function emje_motion_mu_get_version(): string
    {
        $file = WP_PLUGIN_DIR . '/emje-motion/emje-motion.php';
        if (! file_exists($file)) {
            return '0.0.0';
        }
        $data = get_file_data($file, ['Version' => 'Version'], 'plugin');
        return ! empty($data['Version']) ? trim((string) $data['Version']) : '0.0.0';
    }
}

if (! function_exists('emje_motion_mu_is_allowed_host')) {
    function emje_motion_mu_is_allowed_host(string $url): bool
    {
        $host = (string) parse_url($url, PHP_URL_HOST);
        $scheme = (string) parse_url($url, PHP_URL_SCHEME);
        if ($scheme !== 'https') {
            return false;
        }

        return in_array(
            strtolower($host),
            ['github.com', 'objects.githubusercontent.com', 'codeload.github.com', 'api.github.com'],
            true,
        );
    }
}

if (! function_exists('emje_motion_mu_get_release')) {
    function emje_motion_mu_get_release(): ?array
    {
        $key = 'emje_motion_update_check';
        $cached = get_site_transient($key);
        if (is_array($cached) && isset($cached['version'], $cached['download_url'])) {
            return $cached;
        }
        $cached = get_transient($key);
        if (is_array($cached) && isset($cached['version'], $cached['download_url'])) {
            return $cached;
        }

        $url = 'https://api.github.com/repos/emjecreative/emje-motion/releases/latest';
        $current = emje_motion_mu_get_version();
        $response = wp_remote_get($url, [
            'timeout' => 10,
            'headers' => [
                'Accept' => 'application/vnd.github+json',
                'User-Agent' => 'EmjeMotion/' . $current,
                'X-GitHub-Api-Version' => '2022-11-28',
            ],
        ]);

        if (is_wp_error($response)) {
            return null;
        }
        if ((int) wp_remote_retrieve_response_code($response) !== 200) {
            return null;
        }
        $body = wp_remote_retrieve_body($response);
        if ($body === '') {
            return null;
        }
        $data = json_decode($body, true);
        if (! is_array($data)) {
            return null;
        }
        $tag = isset($data['tag_name']) && is_string($data['tag_name']) ? $data['tag_name'] : '';
        if ($tag === '') {
            return null;
        }
        $version = ltrim($tag, 'vV');
        if ($version === '') {
            return null;
        }
        $downloadUrl = '';
        if (isset($data['assets']) && is_array($data['assets'])) {
            foreach ($data['assets'] as $asset) {
                if (! is_array($asset)) {
                    continue;
                }
                $name = isset($asset['name']) && is_string($asset['name']) ? $asset['name'] : '';
                $assetUrl = isset($asset['browser_download_url']) && is_string($asset['browser_download_url']) ? $asset['browser_download_url'] : '';
                if ($name === 'emje-motion.zip' && $assetUrl !== '') {
                    $downloadUrl = $assetUrl;
                    break;
                }
            }
        }
        if ($downloadUrl === '') {
            $downloadUrl = isset($data['zipball_url']) && is_string($data['zipball_url']) ? $data['zipball_url'] : '';
        }
        if ($downloadUrl === '' || ! emje_motion_mu_is_allowed_host($downloadUrl)) {
            return null;
        }
        $releaseBody = isset($data['body']) && is_string($data['body']) ? $data['body'] : '';
        $publishedAt = isset($data['published_at']) && is_string($data['published_at']) ? $data['published_at'] : gmdate('Y-m-d H:i:s');

        $info = [
            'version' => $version,
            'download_url' => $downloadUrl,
            'body' => $releaseBody,
            'published_at' => $publishedAt,
        ];

        $ttl = (defined('WP_DEBUG') && WP_DEBUG) ? 300 : 6 * 3600;
        set_transient($key, $info, $ttl);
        set_site_transient($key, $info, $ttl);

        return $info;
    }
}

if (! function_exists('emje_motion_mu_get_icons')) {
    function emje_motion_mu_get_icons(): array
    {
        $base = function_exists('plugins_url') ? plugins_url('emje-motion/') : '';
        if ($base === '') {
            $base = defined('WP_PLUGIN_URL') ? rtrim((string) WP_PLUGIN_URL, '/') . '/emje-motion/' : '';
        }

        return [
            'svg' => $base !== '' ? $base . 'assets/images/emje-motion-logo.svg' : '',
        ];
    }
}

if (! function_exists('emje_motion_mu_check_update')) {
    function emje_motion_mu_check_update($transient)
    {
        if (! is_object($transient)) {
            return $transient;
        }
        if (! isset($transient->response) || ! is_array($transient->response)) {
            $transient->response = [];
        }
        $pluginFile = 'emje-motion/emje-motion.php';
        $currentVersion = emje_motion_mu_get_version();
        $release = emje_motion_mu_get_release();
        if ($release === null) {
            // API gagal — tetap hapus banner basi kalau versinya sudah tidak lebih baru.
            if (isset($transient->response[$pluginFile])) {
                $stored = $transient->response[$pluginFile];
                $storedVersion = is_object($stored) && isset($stored->new_version) ? (string) $stored->new_version : '';
                if ($storedVersion !== '' && version_compare($storedVersion, $currentVersion, '<=')) {
                    unset($transient->response[$pluginFile]);
                } elseif (is_object($stored) && empty($stored->icons)) {
                    $transient->response[$pluginFile]->icons = emje_motion_mu_get_icons();
                }
            }
            return $transient;
        }
        $remoteVersion = $release['version'];
        if (version_compare($remoteVersion, $currentVersion, '>')) {
            $transient->response[$pluginFile] = (object) [
                'slug' => 'emje-motion',
                'plugin' => $pluginFile,
                'new_version' => $remoteVersion,
                'package' => $release['download_url'],
                'url' => 'https://github.com/emjecreative/emje-motion',
                'tested' => '7.1',
                'requires' => '6.7',
                'requires_php' => '8.2',
                'icons' => emje_motion_mu_get_icons(),
            ];
        } else {
            unset($transient->response[$pluginFile]);
        }

        return $transient;
    }
}

if (! function_exists('emje_motion_mu_merge_update')) {
    function emje_motion_mu_merge_update($value)
    {
        if (! is_object($value) || ! isset($value->response) || ! is_array($value->response)) {
            return $value;
        }
        $pluginFile = 'emje-motion/emje-motion.php';
        $currentVersion = emje_motion_mu_get_version();
        if (isset($value->response[$pluginFile])) {
            // Hapus langsung tanpa API call kalau versi tersimpan sudah tidak lebih baru.
            $stored = $value->response[$pluginFile];
            $storedVersion = '';
            if (is_object($stored) && isset($stored->new_version)) {
                $storedVersion = (string) $stored->new_version;
            } elseif (is_array($stored) && isset($stored['new_version'])) {
                $storedVersion = (string) $stored['new_version'];
            }
            if ($storedVersion !== '' && version_compare($storedVersion, $currentVersion, '<=')) {
                unset($value->response[$pluginFile]);

                return $value;
            }

            // Sembuhkan entry tanpa icon di tempat (cache sebelum dukungan icon).
            if (is_object($value->response[$pluginFile]) && empty($value->response[$pluginFile]->icons)) {
                $value->response[$pluginFile]->icons = emje_motion_mu_get_icons();
            }

            return $value;
        }
        $release = emje_motion_mu_get_release();
        if ($release === null) {
            return $value;
        }
        if (version_compare($release['version'], $currentVersion, '>')) {
            $value->response[$pluginFile] = (object) [
                'slug' => 'emje-motion',
                'plugin' => $pluginFile,
                'new_version' => $release['version'],
                'package' => $release['download_url'],
                'url' => 'https://github.com/emjecreative/emje-motion',
                'tested' => '7.1',
                'requires' => '6.7',
                'requires_php' => '8.2',
                'icons' => emje_motion_mu_get_icons(),
            ];
        } else {
            unset($value->response[$pluginFile]);
        }

        return $value;
    }
}

if (! function_exists('emje_motion_mu_plugin_info')) {
    function emje_motion_mu_plugin_info($result, string $action, $args)
    {
        if ($action !== 'plugin_information' || ! isset($args->slug) || $args->slug !== 'emje-motion') {
            return $result;
        }
        $release = emje_motion_mu_get_release();
        if ($release === null) {
            return $result;
        }
        return (object) [
            'name' => 'Emje Motion',
            'slug' => 'emje-motion',
            'version' => $release['version'],
            'author' => '<a href="https://emjecreative.com">Emje Creative</a>',
            'homepage' => 'https://github.com/emjecreative/emje-motion',
            'download_link' => $release['download_url'],
            'trunk' => $release['download_url'],
            'requires' => '6.7',
            'tested' => '7.1',
            'requires_php' => '8.2',
            'last_updated' => $release['published_at'],
            'icons' => emje_motion_mu_get_icons(),
            'sections' => [
                'description' => 'A lightweight motion toolkit for Elementor — Text Motion, Smooth Scroll, Interaction Motion.',
                'changelog' => '<pre style="white-space:pre-wrap;">' . esc_html($release['body']) . '</pre>',
            ],
        ];
    }
}

if (! function_exists('emje_motion_mu_fix_source')) {
    function emje_motion_mu_fix_source($source, $remoteSource, $upgrader = null, $hookExtra = null)
    {
        if (! is_string($source)) {
            return $source;
        }
        $target = 'emje-motion/emje-motion.php';
        if (isset($hookExtra['plugin']) && is_string($hookExtra['plugin']) && $hookExtra['plugin'] !== '' && $hookExtra['plugin'] !== $target) {
            return $source;
        }
        if (isset($hookExtra['plugins']) && is_array($hookExtra['plugins']) && ! in_array($target, $hookExtra['plugins'], true)) {
            return $source;
        }
        $basename = basename(rtrim($source, '/\\'));
        if ($basename === 'emje-motion') {
            return $source;
        }
        if (str_contains($basename, 'emje-motion')) {
            $newSource = rtrim((string) $remoteSource, '/\\') . '/emje-motion/';
            if (is_dir($source)) {
                rename($source, $newSource);

                return $newSource;
            }
        }

        return $source;
    }
}

// Register update hooks — always in mu context.
add_filter('pre_set_site_transient_update_plugins', 'emje_motion_mu_check_update');
add_filter('pre_set_transient_update_plugins', 'emje_motion_mu_check_update');
add_filter('site_transient_update_plugins', 'emje_motion_mu_merge_update');
add_filter('transient_update_plugins', 'emje_motion_mu_merge_update');
add_filter('plugins_api', 'emje_motion_mu_plugin_info', 10, 3);
add_filter('upgrader_source_selection', 'emje_motion_mu_fix_source', 10, 4);

if (! function_exists('emje_motion_mu_after_upgrade')) {
    function emje_motion_mu_after_upgrade($upgrader = null, $hookExtra = null)
    {
        $target = 'emje-motion/emje-motion.php';
        $updated = false;
        if (is_array($hookExtra)) {
            if (isset($hookExtra['plugin']) && $hookExtra['plugin'] === $target) {
                $updated = true;
            }
            if (isset($hookExtra['plugins']) && is_array($hookExtra['plugins']) && in_array($target, $hookExtra['plugins'], true)) {
                $updated = true;
            }
            if (isset($hookExtra['action'], $hookExtra['type']) && $hookExtra['action'] === 'install' && $hookExtra['type'] === 'plugin') {
                $updated = true;
            }
        }
        if (! $updated) {
            return;
        }
        delete_transient('emje_motion_update_check');
        delete_site_transient('emje_motion_update_check');
        delete_site_transient('update_plugins');
        delete_transient('update_plugins');
    }
}
add_action('upgrader_process_complete', 'emje_motion_mu_after_upgrade', 10, 2);
