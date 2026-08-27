import Lenis from 'lenis';

/**
 * Lenis-based smooth scroll.
 *
 * Respects prefers-reduced-motion and mobile disable.
 */
export default class LenisScroll {
    constructor(config = {}) {
        this.config = {
            lerp: config.lerp ?? 0.075,
            wheelMultiplier: config.wheelMultiplier ?? 1.0,
            respectReducedMotion: config.respectReducedMotion ?? true,
            disableOnMobile: config.disableOnMobile ?? true,
            enabled: config.enabled ?? false,
        };

        this.lenis = null;
        this.rafId = null;
        this.isRunning = false;
    }

    shouldInit() {
        if (!this.config.enabled) {
            return false;
        }

        // Do not run in Elementor editor/preview.
        if (document.body.classList.contains('elementor-editor-active')) {
            return false;
        }

        if (document.documentElement.hasAttribute('data-elementor-device-mode')) {
            // Heuristic: editor preview has this attribute.
            const isEditor = window.location.search.includes('elementor_library')
                || window.location.search.includes('preview=true');
            if (isEditor) {
                return false;
            }
        }

        if (this.config.respectReducedMotion
            && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return false;
        }

        if (this.config.disableOnMobile) {
            const isTouch = window.matchMedia('(hover: none)').matches
                || window.matchMedia('(pointer: coarse)').matches
                || window.innerWidth < 768;

            if (isTouch) {
                return false;
            }
        }

        return true;
    }

    init() {
        if (this.isRunning || !this.shouldInit()) {
            return;
        }

        this.lenis = new Lenis({
            lerp: this.config.lerp,
            wheelMultiplier: this.config.wheelMultiplier,
            autoRaf: false,
        });

        document.documentElement.classList.add('lenis', 'lenis-smooth');
        this.isRunning = true;

        const raf = (time) => {
            if (!this.lenis || !this.isRunning) {
                return;
            }
            this.lenis.raf(time);
            this.rafId = requestAnimationFrame(raf);
        };

        this.rafId = requestAnimationFrame(raf);

        // Handle anchor links: Lenis has built-in, but ensure Elementor anchors still work.
        this.bindAnchors();
    }

    bindAnchors() {
        if (!this.lenis) {
            return;
        }

        document.addEventListener('click', (e) => {
            const target = e.target.closest('a[href^="#"]');
            if (!target) {
                return;
            }

            const href = target.getAttribute('href');
            if (!href || href === '#') {
                return;
            }

            const id = href.slice(1);
            const el = document.getElementById(id);
            if (!el) {
                return;
            }

            // Let Lenis handle smooth scroll to anchor.
            e.preventDefault();
            this.lenis.scrollTo(el, { offset: -20 });
        });
    }

    destroy() {
        this.isRunning = false;

        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }

        if (this.lenis) {
            this.lenis.destroy();
            this.lenis = null;
        }

        document.documentElement.classList.remove('lenis', 'lenis-smooth');
    }
}
