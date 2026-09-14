/**
 * Pure helper for Fill Reveal line timing.
 *
 * Overlapping (legacy): each line starts `stagger` after the previous one.
 * Sequence: each line waits until the previous one finishes, so the
 * effective stagger equals the full per-line duration.
 *
 * @param {string} mode 'overlap' | 'sequence'
 * @param {*} stagger stagger value 0..0.5
 * @param {*} duration per-line duration
 * @returns {number}
 */
export function resolveFillStagger(mode, stagger, duration) {
    if (mode === 'sequence') {
        const d = parseFloat(duration);
        if (isNaN(d) || d < 0) return 0;
        return d;
    }
    return parseFloat(stagger) || 0;
}
