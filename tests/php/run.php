<?php
// PHP smoke tests with minimal WordPress stubs (no WP needed).
// Exit code 0 = all pass.
declare(strict_types=1);

function sanitize_hex_color($c) {
    if (is_string($c) && preg_match('/^#[0-9a-f]{3}([0-9a-f]{3})?$/i', $c)) {
        return $c;
    }
    return null;
}
function sanitize_text_field($s) {
    return trim(strip_tags((string) $s));
}
function get_option($k, $d = []) {
    return $d;
}
function wp_get_attachment_image_src($id, $size) {
    return ['https://example.test/img-' . (int) $id . '-' . $size . '.jpg', 100, 100, false];
}
function esc_url_raw($url) {
    return is_string($url) ? $url : '';
}

require __DIR__ . '/../../src/Admin/SettingsRepository.php';
require __DIR__ . '/../../src/Modules/InteractionMotion/Services/ColorResolver.php';
require __DIR__ . '/../../src/Modules/InteractionMotion/Services/SliderResolver.php';
require __DIR__ . '/../../src/Support/ColorField.php';
require __DIR__ . '/../../src/Modules/InteractionMotion/Frontend/HoverConfig.php';
require __DIR__ . '/../../src/Modules/InteractionMotion/Frontend/CursorConfig.php';
require __DIR__ . '/../../src/Modules/InteractionMotion/Frontend/InteractionMotionFrontend.php';

use EmjeCreative\EmjeMotion\Modules\InteractionMotion\Frontend\CursorConfig;
use EmjeCreative\EmjeMotion\Modules\InteractionMotion\Frontend\HoverConfig;
use EmjeCreative\EmjeMotion\Modules\InteractionMotion\Frontend\InteractionMotionFrontend;
use EmjeCreative\EmjeMotion\Modules\InteractionMotion\Services\ColorResolver;

$pass = 0;
$fail = 0;
function check(string $name, $actual, $expected): void {
    global $pass, $fail;
    if ($actual === $expected) {
        $pass++;
    } else {
        $fail++;
        echo "FAIL $name: " . var_export($actual, true) . ' !== ' . var_export($expected, true) . PHP_EOL;
    }
}

$cursorCfg = new CursorConfig();
$hoverCfg = new HoverConfig();

$out = $cursorCfg->buildCursorConfig([
    'emje_interaction_cursor_type' => 'text-follow',
    'emje_interaction_cursor_size' => ['size' => 24, 'unit' => 'px'],
    'emje_interaction_cursor_color' => '#123456',
    'emje_interaction_cursor_hover_scale' => 1.8,
    'emje_interaction_cursor_hide_native' => 'yes',
    'emje_interaction_cursor_text_label' => 'Open',
    'emje_interaction_live_preview' => 'yes',
    'emje_interaction_cursor_bg_color' => '#FFFFFF',
    'emje_interaction_cursor_text_color' => '#111111',
    'emje_interaction_cursor_padding_y' => ['size' => 44, 'unit' => 'px'],
    'emje_interaction_cursor_entrance' => 'scale-bounce',
    'emje_interaction_cursor_follow_smoothness' => ['size' => 0.3],
    'emje_interaction_cursor_box_shadow_box_shadow_type' => 'yes',
], true);
check('type', $out['type'], 'text-follow');
check('size', $out['size'], 24);
check('color', $out['color'], '#123456');
check('blend-removed', array_key_exists('blendMode', $out), false);
check('hoverScale', $out['hoverScale'], 1.8);
check('hideNative', $out['hideNative'], true);
check('label', $out['label'], 'Open');
check('bg', $out['bgColor'], '#FFFFFF');
check('paddingY', $out['paddingY'], 44);
check('entrance', $out['entrance'], 'scale-bounce');
check('smooth', $out['followSmoothness'], 0.3);
check('shadow', $out['shadow'], true);
check('live', $out['livePreview'], true);
check('keyCount', count($out), 20);

// Retired Comet Trail falls through to text-follow (new + legacy paths).
$trail = $cursorCfg->buildCursorConfig(['emje_interaction_cursor_type' => 'trail'], true);
check('trail-fallback', $trail['type'], 'text-follow');
$legacyTrail = $cursorCfg->buildCursorConfig(['emje_cursor_type' => 'trail'], false);
check('legacy-trail-fallback', $legacyTrail['type'], 'text-follow');

// Hover Reveal: new and legacy key families produce the same shape.
$newHover = $hoverCfg->buildHoverConfig([
    'emje_interaction_hover_image' => ['id' => 7, 'url' => 'https://example.test/fallback.jpg'],
    'emje_interaction_hover_image_size' => 'thumbnail',
    'emje_interaction_hover_follow_speed' => 0.2,
    'emje_interaction_hover_animation' => 'bogus',
    'emje_interaction_live_preview' => 'yes',
], true);
check('hover-url', $newHover['imageUrl'], 'https://example.test/img-7-medium.jpg');
check('hover-anim-clamp', $newHover['animation'], 'fade');
check('hover-speed', $newHover['followSpeed'], 0.2);
// Ketajaman: thumbnail ambil file medium, kotak tampil tetap thumbnail.
check('hover-size-key', $newHover['imageSize'], 'thumbnail');
// Opsi 'scale' dihapus: nilai lama harus jadi 'fade'.
$retiredScale = $hoverCfg->buildHoverConfig([
    'emje_interaction_hover_image' => ['id' => 7, 'url' => 'https://example.test/fallback.jpg'],
    'emje_interaction_hover_animation' => 'scale',
], true);
check('hover-scale-retired', $retiredScale['animation'], 'fade');
// Kontrol baru: default = perilaku lama (fade 0.25, arah kiri).
check('hover-dir-default', $newHover['clipDirection'], 'left');
check('hover-dur-default', $newHover['duration'], 0.25);
$clipHover = $hoverCfg->buildHoverConfig([
    'emje_interaction_hover_image' => ['id' => 7, 'url' => 'https://example.test/fallback.jpg'],
    'emje_interaction_hover_animation' => 'clip',
    'emje_interaction_hover_clip_direction' => 'bogus',
    'emje_interaction_hover_duration' => ['size' => 5, 'unit' => 's'],
], true);
check('hover-dir-clamp', $clipHover['clipDirection'], 'left');
check('hover-dur-clamp', $clipHover['duration'], 1.0);
// Blocks: default = perilaku lama (5x7, acak, 0.02).
check('hover-blocks-default', [$newHover['cols'], $newHover['rows'], $newHover['blockOrder'], $newHover['blockSpeed']], [5, 7, 'random', 0.02]);
$bigBlocks = $hoverCfg->buildHoverConfig([
    'emje_interaction_hover_animation' => 'blocks',
    'emje_interaction_hover_blocks_columns' => 99,
    'emje_interaction_hover_blocks_rows' => 0,
    'emje_interaction_hover_blocks_order' => 'bogus',
    'emje_interaction_hover_blocks_speed' => 9,
], true);
check('hover-blocks-clamp', [$bigBlocks['cols'], $bigBlocks['rows'], $bigBlocks['blockOrder'], $bigBlocks['blockSpeed']], [10, 2, 'random', 0.06]);
$legacyHover = $hoverCfg->buildHoverConfig([
    'emje_hover_reveal_image' => ['id' => 7, 'url' => 'https://example.test/fallback.jpg'],
    'emje_hover_reveal_image_size' => 'thumbnail',
    'emje_hover_reveal_live_preview' => 'yes',
], false);
check('legacy-hover-url', $legacyHover['imageUrl'], 'https://example.test/img-7-medium.jpg');
check('legacy-hover-offset', [$legacyHover['offsetX'], $legacyHover['offsetY'], $legacyHover['rotate'], $legacyHover['rotateHover']], [0, 0, 0, 15]);
check('legacy-hover-keys', array_keys($legacyHover), array_keys($newHover));

// Shared sanitizer accepts 8-digit hex everywhere now.
$resolver = new ColorResolver();
check('hex8', $resolver->sanitizeColor('#3B82F680', 'fallback'), '#3B82F680');
check('hex-bad', $resolver->sanitizeColor('#12345', 'fallback'), 'fallback');
check('injection', $resolver->sanitizeColor('red;evil', 'fallback'), 'fallback');
check('var', $resolver->sanitizeColor('var(--e-global-color-abc)', 'fallback'), 'var(--e-global-color-abc)');

// Row meta "View details" dedupe (core adds one when update slug is set).
if (! defined('ABSPATH')) {
    define('ABSPATH', '/tmp/wordpress/');
}
if (! defined('EMJE_MOTION_FILE')) {
    define('EMJE_MOTION_FILE', '/tmp/wordpress/wp-content/plugins/emje-motion/emje-motion.php');
}
if (! function_exists('plugin_basename')) {
    function plugin_basename($file) {
        if (is_string($file) && str_contains($file, 'emje-motion.php')) {
            return 'emje-motion/emje-motion.php';
        }

        return is_string($file) ? basename($file) : '';
    }
}
if (! function_exists('self_admin_url')) {
    function self_admin_url($path = '') {
        return 'https://example.test/wp-admin/' . ltrim((string) $path, '/');
    }
}
if (! function_exists('esc_url')) {
    function esc_url($url) {
        return is_string($url) ? $url : '';
    }
}
if (! function_exists('esc_attr__')) {
    function esc_attr__($text, $domain = null) {
        return (string) $text;
    }
}
if (! function_exists('esc_html__')) {
    function esc_html__($text, $domain = null) {
        return (string) $text;
    }
}
if (! function_exists('add_filter')) {
    function add_filter($hook, $cb, $prio = 10, $args = 1) {
        return true;
    }
}
if (! function_exists('add_action')) {
    function add_action($hook, $cb, $prio = 10, $args = 1) {
        return true;
    }
}

require __DIR__ . '/../../src/Admin/AdminManager.php';
require __DIR__ . '/../../src/Updater/stub/mu-emje-motion-updater.php';

use EmjeCreative\EmjeMotion\Admin\AdminManager;
use EmjeCreative\EmjeMotion\Admin\SettingsRepository;

$admin = new AdminManager(new SettingsRepository());
$coreLink = '<a href="https://example.test/wp-admin/plugin-install.php?tab=plugin-information&plugin=emje-motion&TB_iframe=true&width=600&height=550" class="thickbox open-plugin-details-modal">View details</a>';

$added = $admin->rowMeta([], 'emje-motion/emje-motion.php');
check('rowmeta-adds-when-missing', count($added), 1);
check('rowmeta-adds-modal', str_contains($added[0], 'open-plugin-details-modal'), true);

$deduped = $admin->rowMeta([$coreLink], 'emje-motion/emje-motion.php');
check('rowmeta-no-double-with-core', count($deduped), 1);
check('rowmeta-keeps-core-link', $deduped[0], $coreLink);

$other = $admin->rowMeta(['<a>Docs</a>'], 'other/other.php');
check('rowmeta-ignores-other-plugin', $other, ['<a>Docs</a>']);

$muAdded = emje_motion_mu_row_meta([], 'emje-motion/emje-motion.php');
check('mu-rowmeta-adds-when-missing', count($muAdded), 1);

$muDeduped = emje_motion_mu_row_meta([$coreLink], 'emje-motion/emje-motion.php');
check('mu-rowmeta-no-double-with-core', count($muDeduped), 1);
check('mu-rowmeta-keeps-core-link', $muDeduped[0], $coreLink);

$muOther = emje_motion_mu_row_meta(['<a>Docs</a>'], 'other/other.php');
check('mu-rowmeta-ignores-other-plugin', $muOther, ['<a>Docs</a>']);

// Text Motion buildConfig: retired scrub presets + unfold defaults.
require_once __DIR__ . '/../../src/Support/ColorField.php';
require __DIR__ . '/../../src/Modules/TextMotion/Frontend/TextMotionFrontend.php';

use EmjeCreative\EmjeMotion\Modules\TextMotion\Frontend\TextMotionFrontend;

$tmFront = new TextMotionFrontend();
$tmBuild = new ReflectionMethod($tmFront, 'buildConfig');
$tmBuild->setAccessible(true);

$tmVisible = $tmBuild->invoke($tmFront, [ 'emje_motion_scrub' => 'visible' ]);
check('tm-visible-scrub', $tmVisible['scrub'], 'custom');
check('tm-visible-pos', [ $tmVisible['scrubStartPos'], $tmVisible['scrubEndPos'] ], [ 100.0, 100.0 ]);

$tmLeave = $tmBuild->invoke($tmFront, [ 'emje_motion_scrub' => 'leave' ]);
check('tm-leave-scrub', $tmLeave['scrub'], 'full');

$tmDef = $tmBuild->invoke($tmFront, []);
check('tm-scrub-default', [ $tmDef['scrub'], $tmDef['scrubStartPos'], $tmDef['scrubEndPos'] ], [ 'custom', 100.0, 30.0 ]);
check('tm-unfold-defaults', [ $tmDef['splitBy'], $tmDef['direction'], $tmDef['distance'], $tmDef['blur'], $tmDef['stagger'] ], [ 'words', 'up', 1.2, 0.0, 0.04 ]);
check('tm-wash-default', $tmDef['fillWashColor'], '');
check('tm-wash-evil', $tmBuild->invoke($tmFront, [ 'emje_motion_fill_wash_color' => 'red;evil' ])['fillWashColor'], '');

echo PHP_EOL . "$pass passed, $fail failed" . PHP_EOL;
exit($fail === 0 ? 0 : 1);
