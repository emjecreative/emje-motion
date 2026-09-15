import ElementManager from './ElementManager';
import { isEditMode } from './env';
import { setupScrubTrigger } from './scrubTrigger';
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
            case 'scroll':
                setupScrubTrigger(animation, element, config, playAnimation);
                break;
            case 'load':
            default:
                playAnimation();
                break;
        }
    }

    prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    shouldSkipDueToReducedMotion() {
        if (isEditMode()) {
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
        if (isEditMode() && config.livePreview === false) {
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
