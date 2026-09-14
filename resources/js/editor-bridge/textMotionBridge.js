import { pickEditorColor, clampNum, toNumber } from './utils.js';

function translateLegacyScrub(get, startPos, endPos) {
    var hasLegacy = get('emje_motion_scrub_start', null) !== null
        || get('emje_motion_scrub_end', null) !== null
        || get('emje_motion_scrub_start_position', null) !== null
        || get('emje_motion_scrub_end_position', null) !== null;

    if (!hasLegacy) {
        return { scrub: 'custom', startPos: startPos, endPos: endPos };
    }

    var start = get('emje_motion_scrub_start', 'top-bottom');
    if (['top-bottom', 'top-center', 'center-center', 'top-top', 'custom'].indexOf(start) === -1) start = 'top-bottom';

    var end = get('emje_motion_scrub_end', 'bottom-top');
    if (['bottom-top', 'bottom-center', 'center-center', 'bottom-bottom', 'custom'].indexOf(end) === -1) end = 'bottom-top';

    var named = {
        'top-bottom/bottom-top': 'full',
        'top-center/bottom-center': 'center'
    };
    var hit = named[start + '/' + end];
    if (hit) {
        return { scrub: hit, startPos: startPos, endPos: endPos };
    }

    var startLines = { 'top-bottom': 100, 'top-center': 50, 'center-center': 50, 'top-top': 0 };
    var endLines = { 'bottom-top': 0, 'bottom-center': 50, 'center-center': 50, 'bottom-bottom': 100 };

    if (start !== 'custom') startPos = startLines[start];
    if (end !== 'custom') endPos = endLines[end];

    return { scrub: 'custom', startPos: startPos, endPos: endPos };
}

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
    if (['words', 'characters', 'lines'].indexOf(splitBy) === -1) splitBy = 'words';

    var direction = get('emje_motion_unfold_direction', 'up');
    if (['up', 'down', 'left', 'right'].indexOf(direction) === -1) direction = 'up';

    var distance = clampNum(get('emje_motion_unfold_distance', 1.2), 0, 2, 1.2);

    var mask = get('emje_motion_unfold_mask', '') === 'yes';

    var blur = clampNum(get('emje_motion_unfold_blur', 0), 0, 20, 0);

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

    var fillLineMode = get('emje_motion_fill_line_mode', 'overlap');
    if (['overlap', 'sequence'].indexOf(fillLineMode) === -1) fillLineMode = 'overlap';

    var fillBlur = clampNum(get('emje_motion_fill_blur', 0), 0, 20, 0);

    // Empty wash color means "follow the text color" (legacy look).
    var fillWashColor = pickEditorColor(get, 'emje_motion_fill_wash_color', '');

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

    // Scrub: combined preset; legacy separate keys translated when absent.
    var scrubPresets = ['full', 'center', 'custom'];
    var scrub = get('emje_motion_scrub', null);
    if (scrub !== 'visible' && scrub !== 'leave' && scrubPresets.indexOf(scrub) === -1) {
        scrub = null;
    }

    var scrubStartPos = clampNum(get('emje_motion_scrub_start_position', 100), 0, 100, 100);

    var scrubEndPos = clampNum(get('emje_motion_scrub_end_position', 30), 0, 100, 30);

    // Retired presets (never released, but possibly in drafts).
    if (scrub === 'visible') {
        // Exactly custom 100/100.
        scrub = 'custom';
        scrubStartPos = 100;
        scrubEndPos = 100;
    } else if (scrub === 'leave') {
        // Closest sane fallback.
        scrub = 'full';
    }

    if (scrub === null) {
        var translated = translateLegacyScrub(get, scrubStartPos, scrubEndPos);
        scrub = translated.scrub;
        scrubStartPos = translated.startPos;
        scrubEndPos = translated.endPos;
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
        scrub: scrub,
        scrubStartPos: scrubStartPos,
        scrubEndPos: scrubEndPos,
        splitBy: splitBy,
        direction: direction,
        distance: distance,
        mask: mask,
        blur: blur,
        stagger: stagger,
        fillBgOpacity: bgOpacity,
        fillStagger: fillStagger,
        fillLineMode: fillLineMode,
        fillWashColor: fillWashColor,
        fillBlur: fillBlur,
        livePreview: get('emje_motion_live_preview', 'yes') === 'yes'
    };
}
