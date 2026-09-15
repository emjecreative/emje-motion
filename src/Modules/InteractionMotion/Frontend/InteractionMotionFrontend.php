<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\InteractionMotion\Frontend;

use EmjeCreative\EmjeMotion\Support\RenderAttributes;

/**
 * Renders Interaction Motion frontend attributes for Container.
 * Handles both new unified controls and legacy hover-reveal / cursor controls for backward compat.
 */
final class InteractionMotionFrontend
{
    /**
     * Register frontend hooks.
     */
    public function register(): void
    {
        add_action(
            'elementor/frontend/container/before_render',
            [$this, 'beforeRender'],
            10,
            1,
        );
    }

    /**
     * @param mixed $element
     */
    public function beforeRender($element): void
    {
        if (! is_object($element) || ! method_exists($element, 'get_settings_for_display')) {
            return;
        }

        /** @var mixed $raw */
        $raw = $element->get_settings_for_display();
        $settings = $this->mergeGlobals($element, is_array($raw) ? $raw : []);

        // New unified controls
        $newEnable = $settings['emje_interaction_enable'] ?? '';
        $newEffect = $settings['emje_interaction_effect'] ?? 'hover-reveal';

        // Legacy controls (for backward compat with existing pages)
        $legacyHoverEnable = $settings['emje_hover_reveal_enable'] ?? '';
        $legacyCursorEnable = $settings['emje_cursor_enable'] ?? '';

        $isNew = ! empty($newEnable);
        $isLegacyHover = ! empty($legacyHoverEnable);
        $isLegacyCursor = ! empty($legacyCursorEnable);

        // If new unified is used, prefer it; otherwise fallback to legacy
        if ($isNew) {
            if ($newEffect === 'hover-reveal') {
                $config = (new HoverConfig())->buildHoverConfig($settings, true);
                if (empty($config['imageUrl'])) {
                    return;
                }
                RenderAttributes::addDataAttribute($element, $config, 'data-emje-hover-reveal', 'emje-hover-reveal');
            } elseif ($newEffect === 'interactive-cursor') {
                $config = (new CursorConfig())->buildCursorConfig($settings, true);
                RenderAttributes::addDataAttribute($element, $config, 'data-emje-cursor', 'emje-interactive-cursor');
            }
            return;
        }

        // Legacy fallback: handle old hover-reveal
        if ($isLegacyHover) {
            $config = (new HoverConfig())->buildHoverConfig($settings, false);
            if (empty($config['imageUrl'])) {
                return;
            }
            RenderAttributes::addDataAttribute($element, $config, 'data-emje-hover-reveal', 'emje-hover-reveal');
        }

        // Legacy fallback: handle old cursor (separate check, but if both legacy were enabled, both will render — now discouraged)
        if ($isLegacyCursor) {
            $config = (new CursorConfig())->buildCursorConfig($settings, false);
            RenderAttributes::addDataAttribute($element, $config, 'data-emje-cursor', 'emje-interactive-cursor');
        }
    }




    /**
     * Merge __globals__ from raw settings so frontend can use var(--e-global-*) dynamically.
     *
     * @param array<string, mixed> $settings
     *
     * @return array<string, mixed>
     */
    private function mergeGlobals(object $element, array $settings): array
    {
        try {
            $rawSettings = method_exists($element, 'get_settings') ? $element->get_settings() : [];
            if (is_array($rawSettings) && isset($rawSettings['__globals__']) && is_array($rawSettings['__globals__'])) {
                if (! isset($settings['__globals__']) || ! is_array($settings['__globals__'])) {
                    $settings['__globals__'] = [];
                }
                // Prefer raw __globals__ (var refs) over display resolved hex.
                foreach ($rawSettings['__globals__'] as $k => $v) {
                    if (! isset($settings['__globals__'][$k]) || $settings['__globals__'][$k] === '') {
                        $settings['__globals__'][$k] = $v;
                    }
                }
            }
        } catch (\Throwable $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('[Emje Motion] mergeGlobals failed: ' . $e->getMessage());
            }
        }

        return $settings;
    }





}
