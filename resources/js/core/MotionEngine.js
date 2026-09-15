import ElementManager from './ElementManager';
import { isEditMode as sharedIsEditMode } from './env';
import { computeScrubProgress } from './scrub';
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

        switch (config.trigger) {
            case 'hover':
                animation._emjeHoverHandler = () => {
                    playAnimation();
                };
                element.addEventListener('mouseenter', animation._emjeHoverHandler);
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
                        try {
                            if (window.__EMJE_SCRUB_DEBUG && Date.now() - lastLogged > 300) {
                                lastLogged = Date.now();
                                if (typeof console.debug === 'function') {
                                    console.debug('[EmjeMotion] scrub p=', p.toFixed(3), 'scrollY=', window.scrollY);
                                }
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
            default:
                playAnimation();
                break;
        }
    }

    prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    isEditMode() {
        // Single source of truth: core/env (kept as a method for API stability).
        return sharedIsEditMode();
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
            if (instance._emjeHoverHandler) {
                try { element.removeEventListener('mouseenter', instance._emjeHoverHandler); } catch (e) {}
                instance._emjeHoverHandler = null;
            }
            if (instance._emjeObserver) {
                try { instance._emjeObserver.disconnect(); } catch (e) {}
            }
            if (typeof instance._emjeScrubCleanup === 'function') {
                try { instance._emjeScrubCleanup(); } catch (e) {}
                instance._emjeScrubCleanup = null;
            }
            // All factory animations extend Animation and implement destroy().
            if (typeof instance.destroy === 'function') {
                try { instance.destroy(); } catch (e) {}
            }
            // Clean GSAP props on target
            try {
                const target = this.elementManager.getTargetElement(element);
                gsap.set(target, { clearProps: 'all' });
                // Also clear any split wrappers' inline styles
                target.querySelectorAll('.emje-motion-char, .emje-motion-word, .emje-motion-line').forEach((el) => {
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
        // Mirror PHP render parity: PHP adds class="emje-motion" alongside
        // data-emje-motion; live-preview attribute writes lack it.
        try { element.classList.add('emje-motion'); } catch (e) {}
        this.instances.set(element, animation);
        this.configSnapshots.set(element, JSON.stringify(config));

        this.setupTrigger(animation, element, config);
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
                const el = (typeof jQuery !== 'undefined' && $el instanceof jQuery) ? $el[0] : $el;
                if (!el) {
                    return;
                }
                if (el.matches && el.matches('[data-emje-motion]')) {
                    this.initElement(el);
                }
                if (el.querySelectorAll) {
                    el.querySelectorAll('[data-emje-motion]').forEach((child) => {
                        this.initElement(child);
                    });
                }
            };

            // Specific hooks are more reliable than global
            window.elementorFrontend.hooks.addAction('frontend/element_ready/heading', handler);
            window.elementorFrontend.hooks.addAction('frontend/element_ready/text-editor', handler);
            window.elementorFrontend.hooks.addAction('frontend/element_ready/container', handler);
        }
    }
}
