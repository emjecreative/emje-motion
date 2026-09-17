<?php

declare(strict_types=1);

namespace EmjeCreative\EmjeMotion\Modules\InteractionMotion\Frontend;

use EmjeCreative\EmjeMotion\Modules\InteractionMotion\Services\SliderResolver;

/**
 * Hover Reveal config builder for Interaction Motion.
 */
final class HoverConfig
{
    private SliderResolver $sliderResolver;

    public function __construct()
    {
        $this->sliderResolver = new SliderResolver();
    }

    /**
     * @param array<string, mixed> $settings
     *
     * @return array<string, mixed>
     */
    public function buildHoverConfig(array $settings, bool $isNew): array
    {
        if ($isNew) {
            $fields = $this->resolveHoverFields($settings, 'emje_interaction_hover_', 'emje_interaction_live_preview');
            // New controls: offset & rotate (legacy has no equivalent).
            $fields['offsetX'] = $this->sliderResolver->resolve($settings['emje_interaction_hover_offset_x'] ?? 0, 0, -200, 200);
            $fields['offsetY'] = $this->sliderResolver->resolve($settings['emje_interaction_hover_offset_y'] ?? 0, 0, -200, 200);
            $fields['rotate'] = $this->sliderResolver->resolve($settings['emje_interaction_hover_rotate'] ?? 0, 0, -360, 360);
            $fields['rotateHover'] = $this->sliderResolver->resolve($settings['emje_interaction_hover_rotate_hover'] ?? 15, 15, -360, 360);
        } else {
            // Legacy v1.0.0 keys; offset/rotate did not exist back then.
            $fields = $this->resolveHoverFields($settings, 'emje_hover_reveal_', 'emje_hover_reveal_live_preview');
            $fields['offsetX'] = 0;
            $fields['offsetY'] = 0;
            $fields['rotate'] = 0;
            $fields['rotateHover'] = 15;
        }

        // New keys carry emje_interaction_hover_disable_mobile (default yes);
        // legacy v1.0.0 settings predate the toggle, so they fall back to
        // hidden-on-touch — the historical behavior.
        $fields['disableOnMobile'] = ($settings['emje_interaction_hover_disable_mobile'] ?? 'yes') === 'yes';

        return $fields;
    }

    /**
     * Resolve + clamp shared Hover Reveal fields for either key family.
     *
     * @param array<string, mixed> $settings
     *
     * @return array<string, mixed>
     */
    private function resolveHoverFields(array $settings, string $prefix, string $liveKey): array
    {
        $image = $settings[$prefix . 'image'] ?? null;
        $imageSize = isset($settings[$prefix . 'image_size']) ? (string) $settings[$prefix . 'image_size'] : 'medium';
        // Resolve sized URL for quality + speed (thumbnail = smaller file)
        // Ketajaman: ambil 1 tingkat di atasnya (thumbnail->medium,
        // medium->large, large/full->full) supaya tidak buram saat
        // di-upscale (foto portrait) dan tajam di layar retina.
        // Kotak tampil (imageSize) tidak berubah.
        $fetchSize = $imageSize;
        if ($imageSize === 'thumbnail') {
            $fetchSize = 'medium';
        } elseif ($imageSize === 'medium') {
            $fetchSize = 'large';
        } elseif ($imageSize === 'large') {
            $fetchSize = 'full';
        }
        $imageUrl = '';
        if (is_array($image)) {
            if (! empty($image['id'])) {
                $sized = wp_get_attachment_image_src((int) $image['id'], $fetchSize);
                if (is_array($sized) && ! empty($sized[0])) {
                    $imageUrl = (string) $sized[0];
                } elseif (! empty($image['url'])) {
                    $imageUrl = (string) $image['url'];
                }
            } elseif (! empty($image['url'])) {
                $imageUrl = (string) $image['url'];
            }
        } elseif (is_string($image) && $image !== '') {
            $imageUrl = $image;
        }
        $followSpeed = isset($settings[$prefix . 'follow_speed']) ? (float) $settings[$prefix . 'follow_speed'] : 0.12;
        // Kontrol 'Scale on Hover' dihapus dari panel, tapi nilai yang
        // sudah tersimpan di halaman lama tetap dibaca (back-compat).
        $scale = isset($settings[$prefix . 'scale']) ? (float) $settings[$prefix . 'scale'] : 1.0;
        $animation = isset($settings[$prefix . 'animation']) ? (string) $settings[$prefix . 'animation'] : 'fade';
        $triggerArea = isset($settings[$prefix . 'trigger_area']) ? (string) $settings[$prefix . 'trigger_area'] : 'container';
        $livePreview = ($settings[$liveKey] ?? '') === 'yes';
        $followSpeed = max(0.05, min(0.3, $followSpeed));
        $scale = max(0.8, min(1.2, $scale));
        // 'scale' dihapus: nilai lama otomatis jadi 'fade'.
        if (! in_array($animation, ['fade', 'clip', 'blocks'], true)) {
            $animation = 'fade';
        }
        if (! in_array($triggerArea, ['container', 'heading'], true)) {
            $triggerArea = 'container';
        }
        if (! in_array($imageSize, ['thumbnail', 'medium', 'large', 'full'], true)) {
            $imageSize = 'medium';
        }
        $clipDirection = isset($settings[$prefix . 'clip_direction']) ? (string) $settings[$prefix . 'clip_direction'] : 'left';
        if (! in_array($clipDirection, ['left', 'right', 'top', 'bottom'], true)) {
            $clipDirection = 'left';
        }
        // Durasi bawaan = perilaku lama per animasi (halaman lama tidak
        // berubah). Kontrol baru default 0.3 untuk halaman baru.
        $duration = $animation === 'clip' ? 0.4 : 0.25;
        $durationRaw = $settings[$prefix . 'duration'] ?? null;
        if (is_array($durationRaw) && isset($durationRaw['size'])) {
            $durationRaw = $durationRaw['size'];
        }
        if (is_numeric($durationRaw)) {
            $duration = max(0.1, min(1.0, (float) $durationRaw));
        }

        // Blocks: default = perilaku sekarang (halaman lama tidak berubah).
        $cols = isset($settings[$prefix . 'blocks_columns']) ? (int) $settings[$prefix . 'blocks_columns'] : 5;
        $rows = isset($settings[$prefix . 'blocks_rows']) ? (int) $settings[$prefix . 'blocks_rows'] : 7;
        $cols = max(2, min(10, $cols));
        $rows = max(2, min(12, $rows));
        $blockOrder = isset($settings[$prefix . 'blocks_order']) ? (string) $settings[$prefix . 'blocks_order'] : 'random';
        if (! in_array($blockOrder, ['random', 'rows'], true)) {
            $blockOrder = 'random';
        }
        $blockSpeed = isset($settings[$prefix . 'blocks_speed']) ? (float) $settings[$prefix . 'blocks_speed'] : 0.02;
        $blockSpeed = max(0.005, min(0.06, $blockSpeed));

        return [
            'imageUrl' => esc_url_raw($imageUrl),
            'imageSize' => $imageSize,
            'followSpeed' => $followSpeed,
            'scale' => $scale,
            'animation' => $animation,
            'clipDirection' => $clipDirection,
            'duration' => $duration,
            'cols' => $cols,
            'rows' => $rows,
            'blockOrder' => $blockOrder,
            'blockSpeed' => $blockSpeed,
            'triggerArea' => $triggerArea,
            'livePreview' => $livePreview,
        ];
    }
}
