<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Core;

use EmjeCreative\EmjeMotion\Admin\AdminManager;
use EmjeCreative\EmjeMotion\Admin\AdminNotice;
use EmjeCreative\EmjeMotion\Admin\SettingsRepository;
use EmjeCreative\EmjeMotion\Assets\AssetsManager;
use EmjeCreative\EmjeMotion\Elementor\ElementorManager;
use EmjeCreative\EmjeMotion\Modules\HoverReveal\HoverReveal;
use EmjeCreative\EmjeMotion\Modules\InteractionMotion\InteractionMotion;
use EmjeCreative\EmjeMotion\Modules\InteractiveCursor\InteractiveCursor;
use EmjeCreative\EmjeMotion\Modules\SmoothScroll\SmoothScroll;
use EmjeCreative\EmjeMotion\Modules\TextMotion\TextMotion;
use EmjeCreative\EmjeMotion\Updater\GitHubUpdater;
use EmjeCreative\EmjeMotion\Updater\MuPluginInstaller;

/**
 * Core plugin bootstrap.
 */
final class Plugin
{
    /**
     * Service container.
     */
    private Container $container;

    /**
     * Boot the plugin.
     */
    public function boot(): void
    {
        $this->container = new Container();

        $this->registerBindings();
        $this->registerHooks();
    }

    /**
     * Register service bindings.
     */
    private function registerBindings(): void
    {
        $this->container->set(
            SettingsRepository::class,
            static fn (): SettingsRepository => new SettingsRepository(),
        );

        $this->container->set(
            AssetsManager::class,
            static fn (): AssetsManager => new AssetsManager(),
        );

        $this->container->set(
            ModuleLoader::class,
            fn (): ModuleLoader => new ModuleLoader(
                $this->container->get(SettingsRepository::class), // @phpstan-ignore-line
            ),
        );

        $this->container->set(
            ElementorManager::class,
            fn (): ElementorManager => new ElementorManager(
                $this->container->get(ModuleLoader::class), // @phpstan-ignore-line
                $this->container,
            ),
        );

        $this->container->set(
            TextMotion::class,
            static fn (): TextMotion => new TextMotion(),
        );

        $this->container->set(
            SmoothScroll::class,
            static fn (): SmoothScroll => new SmoothScroll(),
        );

        $this->container->set(
            HoverReveal::class,
            static fn (): HoverReveal => new HoverReveal(),
        );

        $this->container->set(
            InteractiveCursor::class,
            static fn (): InteractiveCursor => new InteractiveCursor(),
        );

        $this->container->set(
            InteractionMotion::class,
            static fn (): InteractionMotion => new InteractionMotion(),
        );

        $this->container->set(
            AdminNotice::class,
            static fn (): AdminNotice => new AdminNotice(),
        );

        $this->container->set(
            AdminManager::class,
            fn (): AdminManager => new AdminManager(
                $this->container->get(SettingsRepository::class), // @phpstan-ignore-line
            ),
        );

        $this->container->set(
            GitHubUpdater::class,
            static fn (): GitHubUpdater => new GitHubUpdater(
                EMJE_MOTION_FILE,
                'emjecreative/emje-motion',
                'emje-motion',
            ),
        );
    }

    /**
     * Get the service container.
     */
    public function getContainer(): Container
    {
        return $this->container;
    }

    /**
     * Register WordPress hooks.
     */
    private function registerHooks(): void
    {
        add_action('plugins_loaded', [ $this, 'onPluginsLoaded' ]);
        // Updater must run in all contexts (including wp-cron, not just is_admin) for multisite per-site activation.
        $this->registerUpdater();
    }

    private function registerUpdater(): void
    {
        $updater = $this->container->get(GitHubUpdater::class); // @phpstan-ignore-line
        if ($updater instanceof GitHubUpdater) {
            $updater->register();
        }

        // Sync mu-plugin helper on every admin load (not just when missing):
        // updates via Network Admin never re-run Activate, so a stale helper
        // would otherwise freeze there forever. install() no-ops when in sync.
        if (function_exists('is_multisite') && is_multisite() && is_admin()) {
            MuPluginInstaller::install();
        }
    }

    /**
     * Runs after all plugins have loaded.
     */
    public function onPluginsLoaded(): void
    {
        $this->registerAdmin();

        if (! $this->isElementorLoaded()) {
            $notice = $this->container->get(AdminNotice::class); // @phpstan-ignore-line
            if ($notice instanceof AdminNotice) {
                $notice->register();
            }

            return;
        }

        $assets = $this->container->get(AssetsManager::class); // @phpstan-ignore-line
        if ($assets instanceof AssetsManager) {
            $assets->register();
        }

        $elementor = $this->container->get(ElementorManager::class); // @phpstan-ignore-line
        if ($elementor instanceof ElementorManager) {
            $elementor->register();
        }
    }

    private function registerAdmin(): void
    {
        if (! is_admin()) {
            return;
        }

        $settings = $this->container->get(SettingsRepository::class); // @phpstan-ignore-line
        if ($settings instanceof SettingsRepository) {
            $settings->ensureDefaults();
        }

        $admin = $this->container->get(AdminManager::class); // @phpstan-ignore-line
        if ($admin instanceof AdminManager) {
            $admin->register();
        }
    }

    /**
     * Check whether Elementor is loaded.
     */
    private function isElementorLoaded(): bool
    {
        return class_exists('\Elementor\Plugin')
            || defined('ELEMENTOR_VERSION')
            || did_action('elementor/loaded') > 0;
    }
}
