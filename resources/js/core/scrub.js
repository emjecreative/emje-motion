/**
 * Pure helpers for On Scroll (Scrub) boundaries.
 *
 * A boundary answers: "at which scrollY does the effect hit progress 0/1?"
 * Each boundary pairs an element point (top/center/bottom) with a viewport
 * line (0 = screen top .. 1 = screen bottom):
 *
 *   scrollY = elDocTop + elRatio * elHeight - vpRatio * viewportHeight
 *
 * Defaults reproduce the legacy hardcoded range:
 * start 'top-bottom' -> elDocTop - vh, end 'bottom-top' -> elDocBottom.
 */

/**
 * Clamp a custom viewport position to 0..100.
 *
 * @param {*} value
 * @param {number} fallback
 * @returns {number}
 */
export function clampScrubPos(value, fallback) {
    const n = parseFloat(value);
    if (isNaN(n)) return fallback;
    return Math.max(0, Math.min(100, n));
}

/**
 * Resolve a boundary preset to element + viewport ratios.
 *
 * @param {string} kind 'start' or 'end'
 * @param {string} preset
 * @param {*} customPos custom viewport position 0..100
 * @returns {{el: number, vp: number}}
 */
export function resolveScrubAnchor(kind, preset, customPos) {
    if (preset === 'custom') {
        const fallback = kind === 'start' ? 100 : 30;
        return {
            el: kind === 'start' ? 0 : 1,
            vp: clampScrubPos(customPos, fallback) / 100,
        };
    }

    const table = {
        start: {
            'top-bottom': { el: 0, vp: 1 },
            'top-center': { el: 0, vp: 0.5 },
            'center-center': { el: 0.5, vp: 0.5 },
            'top-top': { el: 0, vp: 0 },
        },
        end: {
            'bottom-top': { el: 1, vp: 0 },
            'bottom-center': { el: 1, vp: 0.5 },
            'center-center': { el: 0.5, vp: 0.5 },
            'bottom-bottom': { el: 1, vp: 1 },
        },
    };

    const known = (table[kind] || {})[preset];
    if (known) return known;

    // Unknown preset -> legacy behavior so old pages never break.
    return kind === 'start' ? { el: 0, vp: 1 } : { el: 1, vp: 0 };
}

/**
 * Resolve a combined scrub preset to start + end anchors.
 * Unknown presets fall back to 'full' so old pages never break.
 *
 * @param {string} preset 'full' | 'center' | 'custom'
 * @param {*} startPos custom start line 0..100
 * @param {*} endPos custom end line 0..100
 * @returns {{start: {el: number, vp: number}, end: {el: number, vp: number}}}
 */
export function resolveScrubPreset(preset, startPos, endPos) {
    switch (preset) {
        case 'center':
            return { start: { el: 0, vp: 0.5 }, end: { el: 1, vp: 0.5 } };
        case 'custom':
            return {
                start: { el: 0, vp: clampScrubPos(startPos, 100) / 100 },
                end: { el: 1, vp: clampScrubPos(endPos, 30) / 100 },
            };
        case 'full':
        default:
            return { start: { el: 0, vp: 1 }, end: { el: 1, vp: 0 } };
    }
}

/**
 * Compute scrub progress 0..1 from absolute scroll geometry.
 *
 * @param {number} scrollY current scroll position
 * @param {number} elDocTop element top in document coordinates
 * @param {number} elHeight element height
 * @param {number} viewportHeight viewport height
 * @param {Object} config motion config (scrub/StartPos/EndPos, or legacy scrubStart/End keys)
 * @returns {number}
 */
export function computeScrubProgress(scrollY, elDocTop, elHeight, viewportHeight, config) {
    const cfg = config || {};
    let start;
    let end;

    if (cfg.scrub !== undefined && cfg.scrub !== null) {
        const bounds = resolveScrubPreset(cfg.scrub, cfg.scrubStartPos, cfg.scrubEndPos);
        start = bounds.start;
        end = bounds.end;
    } else {
        // Legacy separate keys (cached HTML predating the combined preset).
        start = resolveScrubAnchor('start', cfg.scrubStart, cfg.scrubStartPos);
        end = resolveScrubAnchor('end', cfg.scrubEnd, cfg.scrubEndPos);
    }

    const startScroll = elDocTop + start.el * elHeight - start.vp * viewportHeight;
    const endScroll = elDocTop + end.el * elHeight - end.vp * viewportHeight;
    const range = endScroll - startScroll;

    // Degenerate range (e.g. start meets end): behave as a step so the
    // animation never freezes at 0 the way the old guard did.
    if (!(range > 0)) {
        return scrollY < startScroll ? 0 : 1;
    }

    const p = (scrollY - startScroll) / range;
    return Math.max(0, Math.min(1, p));
}
