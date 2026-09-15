import { gsap } from 'gsap';
import { computeScrubProgress } from './scrub';
import { debugLog } from './env';

/**
 * Scrub trigger: animation progress follows the scroll position.
 * Uses native scrollY + getBoundingClientRect, so it works with or without
 * Lenis (no ScrollTrigger / scrollerProxy needed). Scroll up reverses,
 * stop = pause.
 *
 * @param {Object} animation animation instance (prepare/setProgress/destroy)
 * @param {HTMLElement} element effect host element
 * @param {Object} config motion config (scrub boundaries, livePreview)
 * @param {Function} onFallback runs when scrub setup throws (usually play once)
 */
export function setupScrubTrigger(animation, element, config, onFallback) {
    try {
        // Prepare animation DOM first — preserve per-line scrub stagger.
        if (typeof animation.prepare === 'function') {
            try { animation.prepare(); } catch (e) {}
        }
        if (typeof animation.setInitialState === 'function') {
            try { animation.setInitialState(); } catch (e) {}
        } else if (animation.dom && animation.dom.mask) {
            try { gsap.set(animation.dom.mask, { clipPath: 'inset(0 100% 0 0)' }); } catch (e) {}
        } else if (animation.masks && animation.masks.length) {
            try { gsap.set(animation.masks, { clipPath: 'inset(0 100% 0 0)' }); } catch (e) {}
        }

        // Compute scroll progress from configurable boundaries
        // (defaults: 0 when element top enters viewport bottom,
        // 1 when element bottom exits viewport top).
        const computeProgress = () => {
            const rect = element.getBoundingClientRect();
            const vh = window.innerHeight || document.documentElement.clientHeight || 0;
            const elDocTop = rect.top + window.scrollY;
            const elHeight = rect.height || (rect.bottom - rect.top);
            return computeScrubProgress(window.scrollY, elDocTop, elHeight, vh, config);
        };

        let scrubRAF = null;
        let lastLogged = 0;
        const updateScrub = () => {
            scrubRAF = null;
            const p = computeProgress();
            // All factory animations implement setProgress.
            if (typeof animation.setProgress === 'function') {
                try { animation.setProgress(p); } catch (e) {}
            }
            // Debug (enable in console: window.__EMJE_SCRUB_DEBUG = true)
            if (window.__EMJE_SCRUB_DEBUG && Date.now() - lastLogged > 300) {
                lastLogged = Date.now();
                debugLog(true, '[EmjeMotion]', ['scrub p=', p.toFixed(3), 'scrollY=', window.scrollY]);
            }
        };
        const onScroll = () => {
            if (scrubRAF) return;
            scrubRAF = requestAnimationFrame(updateScrub);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        if (document.readyState !== 'complete') {
            window.addEventListener('load', onScroll);
        }
        // Emje smooth scroll drives native scroll too; support legacy window.lenis fallback
        const emjeLenis = window._emjeLenis || window.lenis;
        if (emjeLenis && typeof emjeLenis.on === 'function') {
            try { emjeLenis.on('scroll', onScroll); } catch (e) {}
        }

        animation._emjeScrubCleanup = () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            window.removeEventListener('load', onScroll);
            if (scrubRAF) { cancelAnimationFrame(scrubRAF); scrubRAF = null; }
        };

        // Initial sync
        updateScrub();
    } catch (e) {
        if (typeof onFallback === 'function') {
            try { onFallback(); } catch (ignored) {}
        }
    }
}
