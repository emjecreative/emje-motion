<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Updater;

/**
 * GitHub Releases updater for free plugin (public repo, no auth).
 *
 * Hooks into WordPress update transients to provide 1-click updates
 * from https://github.com/emjecreative/emje-motion/releases
 */
final class GitHubUpdater
{
    private const TRANSIENT_KEY = 'emje_motion_update_check';

    private const CACHE_TTL = 6 * 3600; // 6 hours

    private const CACHE_TTL_DEBUG = 300; // 5 minutes when WP_DEBUG

    private string $pluginFile;

    private string $slug;

    private string $repo;

    /**
     * @param string $pluginFile Full path to main plugin file (EMJE_MOTION_FILE)
     * @param string $repo       GitHub repo slug e.g. emjecreative/emje-motion
     * @param string $slug       Plugin slug e.g. emje-motion
     */
    public function __construct(string $pluginFile, string $repo = 'emjecreative/emje-motion', string $slug = 'emje-motion')
    {
        $this->pluginFile = $pluginFile;
        $this->repo = $repo;
        $this->slug = $slug;
    }

    public function register(): void
    {
        add_filter('pre_set_site_transient_update_plugins', [ $this, 'checkUpdate' ]);
        // Also handle regular transient for single-site contexts.
        add_filter('pre_set_transient_update_plugins', [ $this, 'checkUpdate' ]);
        // Merge existing response so per-site inject survives Network Admin rebuild (multisite).
        add_filter('site_transient_update_plugins', [ $this, 'mergeUpdate' ]);
        add_filter('transient_update_plugins', [ $this, 'mergeUpdate' ]);
        add_filter('plugins_api', [ $this, 'pluginInfo' ], 10, 3);
        add_filter('upgrader_source_selection', [ $this, 'fixSource' ], 10, 4);
        add_action('upgrader_process_complete', [ $this, 'afterUpgrade' ], 10, 2);
    }

    /**
     * Clear stale update data right after our plugin is updated.
     *
     * WordPress keeps `update_plugins` transient for ~12h. Without this,
     * the "There is a new version..." banner survives the update until
     * the next cron check, even when remote == installed version.
     *
     * @param mixed $upgrader
     * @param mixed $hookExtra
     */
    public function afterUpgrade($upgrader = null, $hookExtra = null): void
    {
        $pluginBasename = plugin_basename($this->pluginFile);
        $updated = false;

        if (is_array($hookExtra)) {
            if (isset($hookExtra['plugin']) && $hookExtra['plugin'] === $pluginBasename) {
                $updated = true;
            }
            if (isset($hookExtra['plugins']) && is_array($hookExtra['plugins']) && in_array($pluginBasename, $hookExtra['plugins'], true)) {
                $updated = true;
            }
            // Plugin install action (upload zip) also passes destination_name.
            if (isset($hookExtra['action'], $hookExtra['type']) && $hookExtra['action'] === 'install' && $hookExtra['type'] === 'plugin') {
                $updated = true;
            }
        }

        if (! $updated) {
            return;
        }

        delete_transient(self::TRANSIENT_KEY);
        if (function_exists('delete_site_transient')) {
            delete_site_transient(self::TRANSIENT_KEY);
            // Force WordPress to rebuild update_plugins on next load
            // so checkUpdate re-runs with the new local version.
            delete_site_transient('update_plugins');
        }
        delete_transient('update_plugins');
    }

    /**
     * Merge our update into already-built transient (prevents Network Admin overwrite).
     *
     * Also prunes stale entries: if WordPress still remembers "new 1.0.13"
     * but installed version is already >= that, remove it so the banner
     * disappears immediately without waiting for cron.
     *
     * @param mixed $value
     * @return mixed
     */
    public function mergeUpdate($value)
    {
        if (! is_object($value)) {
            return $value;
        }

        /** @phpstan-ignore property.notFound */
        if (! isset($value->response) || ! is_array($value->response)) {
            return $value;
        }

        $pluginBasename = plugin_basename($this->pluginFile);
        $currentVersion = defined('EMJE_MOTION_VERSION') ? EMJE_MOTION_VERSION : '0.0.0';

        /** @phpstan-ignore property.notFound */
        if (isset($value->response[$pluginBasename])) {
            // Prune instantly without API call when stored version is no longer newer.
            $stored = $value->response[$pluginBasename];
            $storedVersion = '';
            if (is_object($stored) && isset($stored->new_version) && is_string($stored->new_version)) {
                $storedVersion = $stored->new_version;
            } elseif (is_array($stored) && isset($stored['new_version']) && is_string($stored['new_version'])) {
                $storedVersion = $stored['new_version'];
            }
            if ($storedVersion !== '' && version_compare($storedVersion, (string) $currentVersion, '<=')) {
                /** @phpstan-ignore property.notFound */
                unset($value->response[$pluginBasename]);

                return $value;
            }

            // Heal icon-less entries in place (cached before icons support).
            /** @phpstan-ignore property.notFound */
            $existing = $value->response[$pluginBasename];
            if (is_object($existing) && empty($existing->icons)) {
                /** @phpstan-ignore property.notFound */
                $value->response[$pluginBasename]->icons = $this->getIcons();
            }

            return $value;
        }

        $release = $this->getReleaseInfo();
        if ($release === null) {
            return $value;
        }

        $remoteVersion = $release['version'];

        if (version_compare($remoteVersion, $currentVersion, '>')) {
            /** @phpstan-ignore property.notFound */
            $value->response[$pluginBasename] = (object) [
                'slug' => $this->slug,
                'plugin' => $pluginBasename,
                'new_version' => $remoteVersion,
                'package' => $release['download_url'],
                'url' => 'https://github.com/' . $this->repo,
                'tested' => '6.8',
                'requires' => '6.7',
                'requires_php' => '8.2',
                'icons' => $this->getIcons(),
            ];
        } else {
            // Remote is not newer — ensure no stale entry lingers.
            /** @phpstan-ignore property.notFound */
            unset($value->response[$pluginBasename]);
        }

        return $value;
    }

    /**
     * Inject update info into site transient.
     *
     * Also removes our entry when remote is no longer newer (stale banner fix).
     *
     * @param mixed $transient
     * @return mixed
     */
    public function checkUpdate($transient)
    {
        if (! is_object($transient)) {
            return $transient;
        }

        /** @phpstan-ignore property.notFound */
        if (! isset($transient->response) || ! is_array($transient->response)) {
            /** @phpstan-ignore property.notFound */
            $transient->response = [];
        }

        $pluginBasename = plugin_basename($this->pluginFile);
        $currentVersion = defined('EMJE_MOTION_VERSION') ? EMJE_MOTION_VERSION : '0.0.0';

        $release = $this->getReleaseInfo();

        if ($release === null) {
            // API failed — still prune if stored entry is clearly stale.
            /** @phpstan-ignore property.notFound */
            if (isset($transient->response[$pluginBasename])) {
                $stored = $transient->response[$pluginBasename];
                $storedVersion = is_object($stored) && isset($stored->new_version) ? (string) $stored->new_version : '';
                if ($storedVersion !== '' && version_compare($storedVersion, (string) $currentVersion, '<=')) {
                    /** @phpstan-ignore property.notFound */
                    unset($transient->response[$pluginBasename]);
                } elseif (is_object($stored) && empty($stored->icons)) {
                    /** @phpstan-ignore property.notFound */
                    $transient->response[$pluginBasename]->icons = $this->getIcons();
                }
            }

            return $transient;
        }

        $remoteVersion = $release['version'];

        if (version_compare($remoteVersion, $currentVersion, '>')) {
            /** @phpstan-ignore property.notFound */
            $transient->response[$pluginBasename] = (object) [
                'slug' => $this->slug,
                'plugin' => $pluginBasename,
                'new_version' => $remoteVersion,
                'package' => $release['download_url'],
                'url' => 'https://github.com/' . $this->repo,
                'tested' => '6.8',
                'requires' => '6.7',
                'requires_php' => '8.2',
                'icons' => $this->getIcons(),
            ];
        } else {
            /** @phpstan-ignore property.notFound */
            unset($transient->response[$pluginBasename]);
        }

        return $transient;
    }

    /**
     * Provide plugin info for View details modal.
     *
     * @param mixed $result
     * @param string $action
     * @param mixed $args
     * @return mixed
     */
    public function pluginInfo($result, string $action, $args)
    {
        if ($action !== 'plugin_information') {
            return $result;
        }

        if (! isset($args->slug) || $args->slug !== $this->slug) {
            return $result;
        }

        $release = $this->getReleaseInfo();

        if ($release === null) {
            return $result;
        }

        $changelog = $this->getChangelogSection($release['body']);

        return (object) [
            'name' => 'Emje Motion',
            'slug' => $this->slug,
            'version' => $release['version'],
            'author' => '<a href="https://emjecreative.com">Emje Creative</a>',
            'homepage' => 'https://github.com/' . $this->repo,
            'download_link' => $release['download_url'],
            'trunk' => $release['download_url'],
            'requires' => '6.7',
            'tested' => '6.8',
            'requires_php' => '8.2',
            'last_updated' => $release['published_at'],
            'icons' => $this->getIcons(),
            'sections' => [
                'description' => 'A lightweight motion toolkit for Elementor — Text Motion, Smooth Scroll, Interaction Motion (Hover Reveal & Interactive Cursor).',
                'changelog' => $changelog,
            ],
        ];
    }

    /**
     * Fix source directory name from GitHub zipball.
     *
     * GitHub zipball extracts to emje-motion-1.0.0-xxxxx or emje-motion-main.
     * WordPress expects emje-motion.
     *
     * @param mixed $source
     * @param mixed $remoteSource
     * @param mixed $upgrader
     * @param mixed $hookExtra
     * @return mixed
     */
    public function fixSource($source, $remoteSource, $upgrader = null, $hookExtra = null)
    {
        if (! is_string($source)) {
            return $source;
        }

        // Only act on our plugin.
        if (isset($hookExtra['plugin'])) {
            $target = is_string($hookExtra['plugin']) ? $hookExtra['plugin'] : '';
            if ($target !== '' && $target !== plugin_basename($this->pluginFile)) {
                return $source;
            }
        } elseif (isset($hookExtra['plugins'])) {
            // Bulk update case
            $plugins = is_array($hookExtra['plugins']) ? $hookExtra['plugins'] : [];
            if (! in_array(plugin_basename($this->pluginFile), $plugins, true)) {
                return $source;
            }
        }

        $basename = basename((string) rtrim($source, '/\\'));
        if ($basename === $this->slug) {
            return $source;
        }

        // If source contains our slug, rename it.
        if (str_contains($basename, $this->slug)) {
            $newSource = rtrim((string) $remoteSource, '/\\') . '/' . $this->slug . '/';
            if (is_dir($source)) {
                // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.FileSystemOperations_rename -- required for upgrader fix
                rename($source, $newSource);

                return $newSource;
            }
        }

        return $source;
    }

    /**
     * Fetch release info from GitHub API with caching.
     *
     * @return array{version: string, download_url: string, body: string, published_at: string}|null
     */
    private function getReleaseInfo(): ?array
    {
        $cached = $this->getCachedRelease();
        if (is_array($cached) && isset($cached['version'], $cached['download_url'])) {
            return $cached;
        }

        $url = 'https://api.github.com/repos/' . $this->repo . '/releases/latest';

        $response = wp_remote_get($url, [
            'timeout' => 10,
            'headers' => [
                'Accept' => 'application/vnd.github+json',
                'User-Agent' => 'EmjeMotion/' . (defined('EMJE_MOTION_VERSION') ? EMJE_MOTION_VERSION : '1.0.0'),
                'X-GitHub-Api-Version' => '2022-11-28',
            ],
        ]);

        if (is_wp_error($response)) {
            return null;
        }

        $code = (int) wp_remote_retrieve_response_code($response);
        if ($code !== 200) {
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

        // Prefer attached asset emje-motion.zip, fallback to zipball.
        $downloadUrl = '';
        if (isset($data['assets']) && is_array($data['assets'])) {
            foreach ($data['assets'] as $asset) {
                if (! is_array($asset)) {
                    continue;
                }
                $name = isset($asset['name']) && is_string($asset['name']) ? $asset['name'] : '';
                $urlAsset = isset($asset['browser_download_url']) && is_string($asset['browser_download_url']) ? $asset['browser_download_url'] : '';
                if ($name === 'emje-motion.zip' && $urlAsset !== '') {
                    $downloadUrl = $urlAsset;
                    break;
                }
            }
        }

        if ($downloadUrl === '') {
            $downloadUrl = isset($data['zipball_url']) && is_string($data['zipball_url']) ? $data['zipball_url'] : '';
        }

        // Only allow GitHub-hosted download URLs (asset, codeload, or release redirect).
        if ($downloadUrl === '' || ! $this->isAllowedDownloadHost($downloadUrl)) {
            return null;
        }

        $releaseBody = isset($data['body']) && is_string($data['body']) ? $data['body'] : '';
        $publishedAt = isset($data['published_at']) && is_string($data['published_at']) ? $data['published_at'] : gmdate('Y-m-d H:i:s');

        // @phpstan-ignore return.type
        /** @var array{version: string, download_url: string, body: string, published_at: string} $info */
        $info = [
            'version' => $version,
            'download_url' => $downloadUrl,
            'body' => $releaseBody,
            'published_at' => $publishedAt,
        ];

        $ttl = (defined('WP_DEBUG') && WP_DEBUG) ? self::CACHE_TTL_DEBUG : self::CACHE_TTL;
        $this->setCachedRelease($info, $ttl);

        return $info;
    }

    /**
     * Plugin icon for Dashboard → Updates list and View details modal.
     *
     * Single SVG (existing blue logo, local URL so it works offline/intranet).
     *
     * @return array{svg: string}
     */
    private function getIcons(): array
    {
        $base = defined('EMJE_MOTION_URL') ? (string) EMJE_MOTION_URL : '';

        return [
            'svg' => $base !== '' ? $base . 'assets/images/emje-motion-logo.svg' : '',
        ];
    }

    /**
     * Whether a download URL is hosted on an allowed GitHub host (prevents arbitrary package URLs).
     */
    private function isAllowedDownloadHost(string $url): bool
    {
        $host = (string) parse_url($url, PHP_URL_HOST);
        $scheme = (string) parse_url($url, PHP_URL_SCHEME);

        if ($scheme !== 'https') {
            return false;
        }

        return in_array(
            strtolower($host),
            [
                'github.com',
                'objects.githubusercontent.com',
                'codeload.github.com',
                'api.github.com',
            ],
            true,
        );
    }

    /**
     * Get cached release (handles multisite).
     *
     * @return mixed
     */
    private function getCachedRelease()
    {
        if (function_exists('is_multisite') && is_multisite()) {
            $site = get_site_transient(self::TRANSIENT_KEY);
            if (is_array($site)) {
                return $site;
            }
        }

        return get_transient(self::TRANSIENT_KEY);
    }

    /**
     * Set cached release (handles multisite).
     */
    private function setCachedRelease(array $info, int $ttl): void
    {
        set_transient(self::TRANSIENT_KEY, $info, $ttl);
        if (function_exists('is_multisite') && is_multisite()) {
            set_site_transient(self::TRANSIENT_KEY, $info, $ttl);
        }
    }

    /**
     * Build changelog section for plugins_api.
     */
    private function getChangelogSection(string $releaseBody): string
    {
        // Try to read local CHANGELOG.md for richer history.
        $changelogPath = defined('EMJE_MOTION_PATH') ? EMJE_MOTION_PATH . 'CHANGELOG.md' : '';

        if ($changelogPath !== '' && file_exists($changelogPath)) {
            $content = file_get_contents($changelogPath);
            if (is_string($content) && $content !== '') {
                // Convert markdown-ish to html for modal.
                $html = '<pre style="white-space:pre-wrap;word-wrap:break-word;">' . esc_html($content) . '</pre>';
                if ($releaseBody !== '') {
                    $html .= '<h4>Latest Release</h4><pre style="white-space:pre-wrap;">' . esc_html($releaseBody) . '</pre>';
                }

                return $html;
            }
        }

        if ($releaseBody !== '') {
            return '<pre style="white-space:pre-wrap;">' . esc_html($releaseBody) . '</pre>';
        }

        return '<p>See <a href="https://github.com/' . esc_html($this->repo) . '/releases">GitHub Releases</a> for changelog.</p>';
    }
}
