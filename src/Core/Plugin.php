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
                $this->container->get(SettingsRepository::class),
            ),
        );

        $this->container->set(
            ElementorManager::class,
            fn (): ElementorManager => new ElementorManager(
                $this->container->get(ModuleLoader::class),
                $this->container,
            ),
        );

        $this->registerModuleBindings();
        $this->registerAdminBindings();

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
     * Register motion module bindings.
     */
    private function registerModuleBindings(): void
    {
        $modules = [
            TextMotion::class,
            SmoothScroll::class,
            HoverReveal::class,
            InteractiveCursor::class,
            InteractionMotion::class,
        ];

        foreach ($modules as $class) {
            $this->container->set(
                $class,
                static fn () => new $class(),
            );
        }
    }

    /**
     * Register admin bindings.
     */
    private function registerAdminBindings(): void
    {
        $this->container->set(
            AdminNotice::class,
            static fn (): AdminNotice => new AdminNotice(),
        );

        $this->container->set(
            AdminManager::class,
            fn (): AdminManager => new AdminManager(
                $this->container->get(SettingsRepository::class),
            ),
        );
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

    /**
     * Register the self-healing updater.
     *
     * Must run in all contexts (including wp-cron, not just is_admin)
     * for multisite per-site activation. Mu-plugin sync runs on
     * admin_init — never at file-load time, because pluggable functions
     * do not exist yet while wp-settings.php includes plugins.
     */
    private function registerUpdater(): void
    {
        $this->container->get(GitHubUpdater::class)->register();

        // install() no-ops when already in sync.
        if (function_exists('is_multisite') && is_multisite()) {
            add_action('admin_init', [MuPluginInstaller::class, 'install']);
        }
    }

    /**
     * Runs after all plugins have loaded.
     */
    public function onPluginsLoaded(): void
    {
        $this->registerAdmin();

        if (! $this->isElementorLoaded()) {
            $this->container->get(AdminNotice::class)->register();

            return;
        }

        $this->container->get(AssetsManager::class)->register();
        $this->container->get(ElementorManager::class)->register();
    }

    private function registerAdmin(): void
    {
        if (! is_admin()) {
            return;
        }

        $this->container->get(SettingsRepository::class)->ensureDefaults();
        $this->container->get(AdminManager::class)->register();
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
