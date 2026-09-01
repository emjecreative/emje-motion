import ElementManager from './ElementManager';
import ScrambleText from '../modules/TextMotion/ScrambleText';
import TextUnfold from '../modules/TextMotion/TextUnfold';
import FillReveal from '../modules/TextMotion/FillReveal';
import gsap from 'gsap';

/**
 * Main Motion Engine — supports live preview in Elementor editor.
 */
export default class MotionEngine {
    constructor() {
        this.elementManager = new ElementManager();
        this.instances = new WeakMap();
        this.configSnapshots = new WeakMap();
        this.debounceTimers = new WeakMap();
        this._hookRegistered = false;
    }

    /**
     * Create animation instance.
     */
    createAnimation(element, config) {
        switch (config.animation) {
            case 'scramble-text':
                return new ScrambleText(element, config);
            case 'text-unfold':
                return new TextUnfold(element, config);
            case 'fill-reveal':
                return new FillReveal(element, config);
            default:
                return null;
        }
    }

    /**
     * Setup animation trigger.
     */
    setupTrigger(animation, element, config) {
        let hasPlayed = false;

        const playAnimation = () => {
            if (config.playOnce && hasPlayed) {
                return;
            }
            animation.play();
            hasPlayed = true;
        };

        // Store play handler for re-use on reInit (force replay in editor)
        animation._emjePlay = playAnimation;
        animation._emjeHasPlayed = () => hasPlayed;
        animation._emjeResetPlayed = () => { hasPlayed = false; };

        switch (config.trigger) {
            case 'hover':
                element.addEventListener('mouseenter', () => {
                    playAnimation();
                });
                break;
            case 'viewport': {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach((entry) => {
                        if (!entry.isIntersecting) {
                            return;
                        }
                        playAnimation();
                        if (config.playOnce) {
                            observer.unobserve(element);
                        }
                    });
                });
                observer.observe(element);
                animation._emjeObserver = observer;
                break;
            }
            case 'scroll': {
                // Scrub: progress follows scroll manually — element enters bottom -> leaves top.
                // Uses native scrollY + getBoundingClientRect, so it works with or without Lenis
                // (no ScrollTrigger / scrollerProxy needed). Scroll up reverses, stop = pause.
                try {
                    // Prepare animation DOM first — preserve per-line for scrub stagger (rekomendasi diskalakan)
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

                    // Compute scroll progress: 0 when element top enters viewport bottom,
                    // 1 when element bottom exits viewport top.
                    const computeProgress = () => {
                        const rect = element.getBoundingClientRect();
                        const vh = window.innerHeight || document.documentElement.clientHeight || 0;
                        const elDocTop = rect.top + window.scrollY;
                        const elDocBottom = rect.bottom + window.scrollY;
                        const startScroll = elDocTop - vh;      // element top at viewport bottom
                        const endScroll = elDocBottom;          // element bottom at viewport top
                        const range = endScroll - startScroll;
                        if (!(range > 0)) return 0;
                        const p = (window.scrollY - startScroll) / range;
                        return Math.max(0, Math.min(1, p));
                    };

                    let scrubRAF = null;
                    let lastLogged = 0;
                    const updateScrub = () => {
                        scrubRAF = null;
                        const p = computeProgress();
                        if (typeof animation.setProgress === 'function') {
                            try { animation.setProgress(p); } catch (e) {}
                        } else if (animation.timeline && typeof animation.timeline.progress === 'function') {
                            try { animation.timeline.progress(p); } catch (e) {}
                        } else {
                            const masks = animation.masks && animation.masks.length ? animation.masks : (animation.dom && animation.dom.mask ? [animation.dom.mask] : []);
                            masks.forEach((m) => {
                                try { gsap.set(m, { clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` }); } catch (e) {}
                            });
                            if (typeof animation.renderFrame === 'function') {
                                try { animation.renderFrame(p); } catch (e) {}
                            }
                        }
                        // Debug (enable in console: window.__EMJE_SCRUB_DEBUG = true)
                        try {
                            if (window.__EMJE_SCRUB_DEBUG && Date.now() - lastLogged > 300) {
                                lastLogged = Date.now();
                                console.log('[EmjeMotion] scrub p=', p.toFixed(3), 'scrollY=', window.scrollY);
                            }
                        } catch (e) {}
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
                    playAnimation();
                }
                break;
            }
            case 'load':
            case 'page-load':
            default:
                playAnimation();
                break;
        }
    }

    prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    isEditMode() {
        if (document.body.classList.contains('elementor-editor-active')) {
            return true;
        }
        if (typeof window.elementorFrontend !== 'undefined' && window.elementorFrontend.isEditMode) {
            try {
                return window.elementorFrontend.isEditMode();
            } catch (e) {
                return false;
            }
        }
        return false;
    }

    shouldSkipDueToReducedMotion() {
        if (this.isEditMode()) {
            return false;
        }
        return this.prefersReducedMotion();
    }

    destroyInstance(element) {
        const instance = this.instances.get(element);
        if (instance) {
            if (instance._emjeObserver) {
                try { instance._emjeObserver.disconnect(); } catch (e) {}
            }
            if (typeof instance._emjeScrubCleanup === 'function') {
                try { instance._emjeScrubCleanup(); } catch (e) {}
                instance._emjeScrubCleanup = null;
            }
            if (typeof instance.destroy === 'function') {
                try { instance.destroy(); } catch (e) {}
            } else if (typeof instance.killTimeline === 'function') {
                try { instance.killTimeline(); } catch (e) {}
            }
            // Clean GSAP props on target
            try {
                const target = this.elementManager.getTargetElement(element);
                gsap.set(target, { clearProps: 'all' });
                // Also clear any split wrappers' inline styles
                target.querySelectorAll('.emje-motion-char, .emje-motion-word').forEach((el) => {
                    gsap.set(el, { clearProps: 'all' });
                });
            } catch (e) {}
        }
        this.instances.delete(element);
        this.configSnapshots.delete(element);
        delete element.dataset.emjeMotionInitialized;
    }

    reInitElement(element) {
        // Debounce per element
        if (this.debounceTimers.has(element)) {
            clearTimeout(this.debounceTimers.get(element));
        }
        const timer = setTimeout(() => {
            this.debounceTimers.delete(element);
            this._doReInit(element);
        }, 80);
        this.debounceTimers.set(element, timer);
    }

    _doReInit(element) {
        this.destroyInstance(element);
        this.initElement(element, true);
    }

    /**
     * Initialize a single element.
     */
    initElement(element, force = false) {
        const already = element.dataset.emjeMotionInitialized === 'true';
        if (already && !force) {
            // Already initialized, treat as reInit request (e.g., attribute mutation)
            this.reInitElement(element);
            return;
        }

        if (already && force) {
            // Force path already destroyed, proceed
        }

        const config = this.elementManager.getConfig(element);
        if (!config) {
            return;
        }

        if (this.shouldSkipDueToReducedMotion()) {
            return;
        }

        // Respect live preview toggle in editor (Opsi AUX): if livePreview is explicitly false in edit mode, skip init
        if (this.isEditMode() && config.livePreview === false) {
            return;
        }

        const targetElement = this.elementManager.getTargetElement(element);
        const animation = this.createAnimation(targetElement, config);
        if (!animation) {
            return;
        }

        element.dataset.emjeMotionInitialized = 'true';
        this.instances.set(element, animation);
        this.configSnapshots.set(element, JSON.stringify(config));

        this.setupTrigger(animation, element, config);

        // In edit mode, force replay even if playOnce was true before
        if (this.isEditMode() && typeof animation._emjeResetPlayed === 'function') {
            // Already played via setupTrigger load case, ensure it's visible
        }
    }

    /**
     * Initialize the engine.
     */
    init() {
        const elements = this.elementManager.getElements();
        if (elements.length > 0) {
            elements.forEach((element) => this.initElement(element));
        }
        this.observeNewElements();
        this.hookElementorFrontend();
        // Expose singleton for editor bridge
        if (!window.EmjeMotion) {
            window.EmjeMotion = {};
        }
        window.EmjeMotion.engine = this;
        window.EmjeMotion.refresh = (el) => {
            if (el && el instanceof HTMLElement) {
                this.reInitElement(el);
            } else {
                document.querySelectorAll('[data-emje-motion]').forEach((node) => this.reInitElement(node));
            }
        };
    }

    /**
     * Observe dynamically added elements and attribute changes.
     */
    observeNewElements() {
        if (typeof MutationObserver === 'undefined') {
            return;
        }

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (!(node instanceof HTMLElement)) {
                            return;
                        }
                        if (node.matches('[data-emje-motion]')) {
                            this.initElement(node);
                        }
                        node.querySelectorAll('[data-emje-motion]').forEach((el) => {
                            this.initElement(el);
                        });
                        // Also handle Hover/Cursor containers added dynamically
                        if (node.matches('[data-emje-hover-reveal]') || node.matches('[data-emje-cursor]')) {
                            // Let respective modules handle via their initAll - trigger manually if exposed
                            if (window.EmjeMotionHoverReveal) {
                                window.EmjeMotionHoverReveal.initAll();
                            }
                            if (window.EmjeMotionCursor) {
                                window.EmjeMotionCursor.initAll();
                            }
                        }
                    });
                } else if (mutation.type === 'attributes') {
                    const target = mutation.target;
                    if (target instanceof HTMLElement && target.hasAttribute('data-emje-motion')) {
                        const newRaw = target.getAttribute('data-emje-motion');
                        const oldSnapshot = this.configSnapshots.get(target);
                        if (newRaw !== oldSnapshot) {
                            this.reInitElement(target);
                        }
                    }
                    if (target instanceof HTMLElement && (target.hasAttribute('data-emje-hover-reveal') || target.hasAttribute('data-emje-cursor'))) {
                        // For hover/cursor, trigger their reInit via global
                        if (target.hasAttribute('data-emje-hover-reveal') && window.EmjeMotionHoverReveal) {
                            window.EmjeMotionHoverReveal.reInit(target);
                        }
                        if (target.hasAttribute('data-emje-cursor') && window.EmjeMotionCursor) {
                            window.EmjeMotionCursor.reInit(target);
                        }
                    }
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['data-emje-motion', 'data-emje-hover-reveal', 'data-emje-cursor'],
        });
    }

    /**
     * Hook into Elementor frontend lifecycle.
     */
    hookElementorFrontend() {
        if (this._hookRegistered) {
            return;
        }

        if (typeof window.elementorFrontend === 'undefined') {
            window.addEventListener('elementor/frontend/init', () => this.hookElementorFrontend());
            return;
        }

        this._hookRegistered = true;

        if (window.elementorFrontend.hooks) {
            const handler = ($el) => {
                const el = $el instanceof jQuery ? $el[0] : $el;
                if (!el) {
                    return;
                }
                if (el.matches('[data-emje-motion]')) {
                    this.initElement(el);
                }
                el.querySelectorAll('[data-emje-motion]').forEach((child) => {
                    this.initElement(child);
                });
            };

            // Specific hooks are more reliable than global
            window.elementorFrontend.hooks.addAction('frontend/element_ready/heading', handler);
            window.elementorFrontend.hooks.addAction('frontend/element_ready/text-editor', handler);
            window.elementorFrontend.hooks.addAction('frontend/element_ready/container', handler);
            // Fallback global
            window.elementorFrontend.hooks.addAction('frontend/element_ready/global', handler);
        }
    }
}
