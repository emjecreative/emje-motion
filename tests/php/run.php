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
require __DIR__ . '/../../src/Modules/InteractionMotion/Frontend/InteractionMotionFrontend.php';

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

$front = new InteractionMotionFrontend();
$m = new ReflectionMethod($front, 'buildCursorConfig');
$m->setAccessible(true);

$out = $m->invoke($front, [
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
$trail = $m->invoke($front, ['emje_interaction_cursor_type' => 'trail'], true);
check('trail-fallback', $trail['type'], 'text-follow');
$legacyTrail = $m->invoke($front, ['emje_cursor_type' => 'trail'], false);
check('legacy-trail-fallback', $legacyTrail['type'], 'text-follow');

// Hover Reveal: new and legacy key families produce the same shape.
$mh = new ReflectionMethod($front, 'buildHoverConfig');
$mh->setAccessible(true);
$newHover = $mh->invoke($front, [
    'emje_interaction_hover_image' => ['id' => 7, 'url' => 'https://example.test/fallback.jpg'],
    'emje_interaction_hover_image_size' => 'thumbnail',
    'emje_interaction_hover_follow_speed' => 0.2,
    'emje_interaction_hover_animation' => 'bogus',
    'emje_interaction_live_preview' => 'yes',
], true);
check('hover-url', $newHover['imageUrl'], 'https://example.test/img-7-thumbnail.jpg');
check('hover-anim-clamp', $newHover['animation'], 'fade');
check('hover-speed', $newHover['followSpeed'], 0.2);
$legacyHover = $mh->invoke($front, [
    'emje_hover_reveal_image' => ['id' => 7, 'url' => 'https://example.test/fallback.jpg'],
    'emje_hover_reveal_image_size' => 'thumbnail',
    'emje_hover_reveal_live_preview' => 'yes',
], false);
check('legacy-hover-url', $legacyHover['imageUrl'], 'https://example.test/img-7-thumbnail.jpg');
check('legacy-hover-offset', [$legacyHover['offsetX'], $legacyHover['offsetY'], $legacyHover['rotate'], $legacyHover['rotateHover']], [0, 0, 0, 15]);
check('legacy-hover-keys', array_keys($legacyHover), array_keys($newHover));

// Shared sanitizer accepts 8-digit hex everywhere now.
$resolver = new ColorResolver();
check('hex8', $resolver->sanitizeColor('#3B82F680', 'fallback'), '#3B82F680');
check('hex-bad', $resolver->sanitizeColor('#12345', 'fallback'), 'fallback');
check('injection', $resolver->sanitizeColor('red;evil', 'fallback'), 'fallback');
check('var', $resolver->sanitizeColor('var(--e-global-color-abc)', 'fallback'), 'var(--e-global-color-abc)');

echo PHP_EOL . "$pass passed, $fail failed" . PHP_EOL;
exit($fail === 0 ? 0 : 1);
