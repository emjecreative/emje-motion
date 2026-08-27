import gsap from 'gsap';

/**
 * Interactive Cursor per Container.
 */
export default class InteractiveCursor {
    constructor(container, config) {
        this.container = container;
        this.config = {
            type: config.type ?? 'dot-ring',
            size: config.size ?? 20,
            color: config.color ?? '#000000',
            blendMode: config.blendMode ?? 'normal',
            hoverScale: config.hoverScale ?? 1.5,
            hideNative: config.hideNative ?? true,
            label: config.label ?? '',
        };

        this.cursorEl = null;
        this.dotEl = null;
        this.ringEl = null;
        this.labelEl = null;
        this.xTo = null;
        this.yTo = null;
        this.xDotTo = null;
        this.yDotTo = null;
        this.isInside = false;
    }

    shouldInit() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return false;
        }

        if (window.matchMedia('(hover: none)').matches
            || window.matchMedia('(pointer: coarse)').matches) {
            return false;
        }

        if (document.body.classList.contains('elementor-editor-active')) {
            return false;
        }

        return true;
    }

    createElements() {
        this.cursorEl = document.createElement('div');
        this.cursorEl.className = 'emje-cursor emje-cursor--hidden';
        this.cursorEl.style.setProperty('--emje-cursor-color', this.config.color);
        this.cursorEl.style.setProperty('--emje-cursor-size', `${this.config.size}px`);

        if (this.config.blendMode === 'difference') {
            this.cursorEl.classList.add('emje-cursor--difference');
        }

        if (this.config.type === 'dot' || this.config.type === 'dot-ring') {
            this.dotEl = document.createElement('div');
            this.dotEl.className = 'emje-cursor__dot';
            this.cursorEl.appendChild(this.dotEl);
        }

        if (this.config.type === 'ring' || this.config.type === 'dot-ring') {
            this.ringEl = document.createElement('div');
            this.ringEl.className = 'emje-cursor__ring';

            if (this.config.label) {
                this.labelEl = document.createElement('span');
                this.labelEl.className = 'emje-cursor__label';
                this.labelEl.textContent = this.config.label;
                this.ringEl.appendChild(this.labelEl);
            }

            this.cursorEl.appendChild(this.ringEl);
        }

        document.body.appendChild(this.cursorEl);

        // GSAP quickTo for smooth follow.
        this.xTo = gsap.quickTo(this.cursorEl, 'x', { duration: 0.12, ease: 'power3' });
        this.yTo = gsap.quickTo(this.cursorEl, 'y', { duration: 0.12, ease: 'power3' });

        if (this.dotEl) {
            this.xDotTo = gsap.quickTo(this.dotEl, 'x', { duration: 0.06, ease: 'power3' });
            this.yDotTo = gsap.quickTo(this.dotEl, 'y', { duration: 0.06, ease: 'power3' });
        }

        if (this.config.hideNative) {
            this.container.classList.add('emje-interactive-cursor--hide-native');
        }
    }

    bindEvents() {
        this.container.addEventListener('mouseenter', this.onEnter.bind(this));
        this.container.addEventListener('mouseleave', this.onLeave.bind(this));
        this.container.addEventListener('mousemove', this.onMove.bind(this));

        // Hover scaling for interactive elements inside.
        const interactiveEls = this.container.querySelectorAll('a, button, .elementor-button, [role="button"]');
        interactiveEls.forEach((el) => {
            el.addEventListener('mouseenter', this.onInteractiveEnter.bind(this));
            el.addEventListener('mouseleave', this.onInteractiveLeave.bind(this));
        });
    }

    onEnter() {
        this.isInside = true;
        if (this.cursorEl) {
            this.cursorEl.classList.remove('emje-cursor--hidden');
            gsap.to(this.cursorEl, { opacity: 1, duration: 0.2, ease: 'power2.out' });
        }
    }

    onLeave() {
        this.isInside = false;
        if (this.cursorEl) {
            this.cursorEl.classList.add('emje-cursor--hidden');
            gsap.to(this.cursorEl, { opacity: 0, duration: 0.15, ease: 'power2.in' });
        }
        this.resetScale();
    }

    onMove(e) {
        if (!this.isInside || !this.xTo || !this.yTo) {
            return;
        }

        this.xTo(e.clientX);
        this.yTo(e.clientY);
    }

    onInteractiveEnter() {
        if (!this.ringEl) {
            return;
        }

        gsap.to(this.ringEl, {
            scale: this.config.hoverScale,
            duration: 0.25,
            ease: 'power2.out',
        });

        if (this.cursorEl) {
            this.cursorEl.classList.add('emje-cursor--hover');
        }
    }

    onInteractiveLeave() {
        this.resetScale();
    }

    resetScale() {
        if (this.ringEl) {
            gsap.to(this.ringEl, {
                scale: 1,
                duration: 0.2,
                ease: 'power2.in',
            });
        }

        if (this.cursorEl) {
            this.cursorEl.classList.remove('emje-cursor--hover');
        }
    }

    init() {
        if (!this.shouldInit()) {
            return;
        }

        this.createElements();
        this.bindEvents();
    }

    destroy() {
        if (this.cursorEl && this.cursorEl.parentNode) {
            this.cursorEl.parentNode.removeChild(this.cursorEl);
        }

        this.container.classList.remove('emje-interactive-cursor--hide-native');
        this.cursorEl = null;
    }

    static initAll() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        if (window.matchMedia('(hover: none)').matches) {
            return;
        }

        const containers = document.querySelectorAll('[data-emje-cursor]');
        containers.forEach((el) => {
            if (el.dataset.emjeCursorInitialized === 'true') {
                return;
            }

            let config;
            try {
                config = JSON.parse(el.getAttribute('data-emje-cursor'));
            } catch (e) {
                return;
            }

            const instance = new InteractiveCursor(el, config);
            instance.init();
            el.dataset.emjeCursorInitialized = 'true';
        });
    }
}
