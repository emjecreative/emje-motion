import { findTarget } from './utils.js';

export function buildTextMotionConfig(settings) {
    var get = function(key, def) {
        var v = settings.get(key);
        return v !== undefined && v !== null ? v : def;
    };

    var customChars = get('emje_motion_scramble_custom_characters', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
    if (typeof customChars !== 'string') customChars = String(customChars);
    if (customChars.length > 200) customChars = customChars.substring(0, 200);
    if (customChars === '') customChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    var scrambleSpeed = parseFloat(get('emje_motion_scramble_speed', 1));
    if (isNaN(scrambleSpeed)) scrambleSpeed = 1;
    scrambleSpeed = Math.max(0.5, Math.min(5, scrambleSpeed));

    var duration = parseFloat(get('emje_motion_duration', 1));
    if (isNaN(duration)) duration = 1;
    duration = Math.max(0, duration);

    var delay = parseFloat(get('emje_motion_delay', 0));
    if (isNaN(delay)) delay = 0;
    delay = Math.max(0, delay);

    var stagger = parseFloat(get('emje_motion_unfold_stagger', 0.04));
    if (isNaN(stagger)) stagger = 0.04;
    stagger = Math.max(0, Math.min(0.5, stagger));

    var splitBy = get('emje_motion_unfold_split_by', 'words');
    if (['words', 'characters'].indexOf(splitBy) === -1) splitBy = 'words';

    var bgOpacity = 0.25;
    var rawOpacity = get('emje_motion_fill_bg_opacity', null);
    if (rawOpacity !== null) {
        if (typeof rawOpacity === 'object' && rawOpacity.size !== undefined) {
            bgOpacity = parseFloat(rawOpacity.size);
        } else if (!isNaN(parseFloat(rawOpacity))) {
            bgOpacity = parseFloat(rawOpacity);
        }
    }
    bgOpacity = Math.max(0, Math.min(1, bgOpacity));

    var fillStagger = parseFloat(get('emje_motion_fill_stagger', 0.15));
    if (isNaN(fillStagger)) fillStagger = 0.15;
    fillStagger = Math.max(0, Math.min(0.5, fillStagger));

    var animation = get('emje_motion_animation', 'scramble-text');
    if (['scramble-text', 'text-unfold', 'fill-reveal'].indexOf(animation) === -1) animation = 'scramble-text';

    var trigger = get('emje_motion_trigger', 'load');
    if (['load', 'viewport', 'hover', 'scroll'].indexOf(trigger) === -1) trigger = 'load';

    var ease = get('emje_motion_ease', 'power2.out');

    // Play Once only for viewport, others always replay (UX)
    var rawPlayOnce = get('emje_motion_play_once', null);
    var playOnce;
    if (trigger === 'viewport') {
        playOnce = (rawPlayOnce === null ? '' : rawPlayOnce) === 'yes'; // default No for viewport
    } else {
        playOnce = false;
    }

    return {
        animation: animation,
        characterSet: get('emje_motion_scramble_character_set', 'letters-numbers'),
        customCharacters: customChars,
        revealOrder: get('emje_motion_scramble_reveal_order', 'left-to-right'),
        scrambleSpeed: scrambleSpeed,
        duration: duration,
        delay: delay,
        ease: ease,
        trigger: trigger,
        playOnce: playOnce,
        splitBy: splitBy,
        stagger: stagger,
        fillBgOpacity: bgOpacity,
        fillStagger: fillStagger,
        livePreview: get('emje_motion_live_preview', 'yes') === 'yes'
    };
}
