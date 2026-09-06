import gsap from 'gsap';

/**
 * Hover Reveal — image follows cursor inside Container.
 */
export default class HoverReveal {
    constructor(container, config) {
        this.container = container;
        this.config = config;
        // default true for backward compat (legacy configs without key)
        if (this.config.disableOnMobile === undefined) this.config.disableOnMobile = true;
        this.imageEl = null;
        this.fallbackEl = null;
        this.xTo = null;
        this.yTo = null;
        this.isVisible = false;
        this.triggerEl = null;
    }

    isEditMode() {
        if (document.body.classList.contains('elementor-editor-active')) {
            return true;
        }
        if (typeof window.elementorFrontend !== 'undefined' && window.elementorFrontend.isEditMode) {
            try { return window.elementorFrontend.isEditMode(); } catch (e) { return false; }
        }
        return false;
    }

    shouldInit() {
        // Respect live preview toggle in editor
        if (this.isEditMode() && this.config.livePreview === false) {
            return false;
        }

        // In editor preview, allow even with reduced-motion / touch when live is On
        if (!this.isEditMode()) {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                return false;
            }
            if (this.config.disableOnMobile && (window.matchMedia('(hover: none)').matches
                || window.matchMedia('(pointer: coarse)').matches)) {
                return false;
            }
        }

        if (!this.config.imageUrl) {
            return false;
        }

        return true;
    }

    createElements() {
        this.imageEl = document.createElement('div');
        this.imageEl.className = 'emje-hover-reveal__image';
        if (this.config.animation === 'clip') {
            this.imageEl.classList.add('emje-hover-reveal__image--clip');
        }

        const img = document.createElement('img');
        img.src = this.config.imageUrl;
        img.alt = '';
        img.loading = 'lazy';
        this.imageEl.appendChild(img);
        document.body.appendChild(this.imageEl);

        // Apply Image Size for quality + display (thumbnail 150, medium 280, large 400, full 600)
        var sizeMap = {
            thumbnail: { w: 150, h: 150 },
            medium: { w: 280, h: 200 },
            large: { w: 400, h: 300 },
            full: { w: 600, h: 400 },
        };
        var sz = sizeMap[this.config.imageSize] || sizeMap.medium;
        this.imageEl.style.width = sz.w + 'px';
        this.imageEl.style.height = sz.h + 'px';

        // Mobile fallback element inside container (only shown on touch via CSS media).
        this.fallbackEl = document.createElement('div');
        this.fallbackEl.className = 'emje-hover-reveal__fallback';
        const fallbackImg = document.createElement('img');
        fallbackImg.src = this.config.imageUrl;
        fallbackImg.alt = '';
        fallbackImg.loading = 'lazy';
        this.fallbackEl.appendChild(fallbackImg);
        this.container.appendChild(this.fallbackEl);
        if (window.matchMedia('(hover: none), (pointer: coarse)').matches) {
            this.container.classList.add('emje-hover-reveal--mobile-fallback');
        }

        // Initial GSAP set for position, scale and rotate (avoid CSS transform conflict)
        gsap.set(this.imageEl, {
            xPercent: -50,
            yPercent: -50,
            scale: 0.9,
            rotation: this.config.rotate ?? 0,
            opacity: 0,
        });

        // GSAP quickTo for smooth follow.
        this.xTo = gsap.quickTo(this.imageEl, 'x', {
            duration: this.config.followSpeed ?? 0.12,
            ease: 'power3',
        });

        this.yTo = gsap.quickTo(this.imageEl, 'y', {
            duration: this.config.followSpeed ?? 0.12,
            ease: 'power3',
        });
    }

    getTriggerElement() {
        if (this.config.triggerArea === 'heading') {
            const heading = this.container.querySelector('h1, h2, h3, h4, h5, h6, .elementor-heading-title');
            return heading || this.container;
        }
        return this.container;
    }

    bindEvents() {
        this.triggerEl = this.getTriggerElement();

        this._onEnter = this.onEnter.bind(this);
        this._onLeave = this.onLeave.bind(this);
        this._onMove = this.onMove.bind(this);
        this.triggerEl.addEventListener('mouseenter', this._onEnter);
        this.triggerEl.addEventListener('mouseleave', this._onLeave);
        this.triggerEl.addEventListener('mousemove', this._onMove);
    }

    onEnter() {
        if (!this.imageEl) {
            return;
        }
        this.isVisible = true;
        this.imageEl.classList.add('emje-hover-reveal__image--visible');

        // Scale and Rotate always (user wants Scale selalu), regardless of animation
        var targetScale = this.config.scale ?? 1;
        var targetRotate = (this.config.rotateHover !== undefined ? this.config.rotateHover : this.config.rotate) ?? this.config.rotate ?? 0;
        var duration = this.config.animation === 'scale' ? 0.35 : 0.25;
        gsap.to(this.imageEl, {
            scale: targetScale,
            rotation: targetRotate,
            opacity: 1,
            duration: duration,
            ease: 'power2.out',
        });
        // Clip animation also needs class (already added)
    }

    onLeave() {
        if (!this.imageEl) {
            return;
        }
        this.isVisible = false;
        gsap.to(this.imageEl, {
            scale: 0.9,
            rotation: this.config.rotate ?? 0,
            opacity: 0,
            duration: 0.25,
            ease: 'power2.in',
            onComplete: function() {
                if (this.imageEl) {
                    this.imageEl.classList.remove('emje-hover-reveal__image--visible');
                }
            }.bind(this),
        });
    }

    onMove(e) {
        if (!this.isVisible || !this.xTo || !this.yTo) {
            return;
        }

        var offsetX = this.config.offsetX || 0;
        var offsetY = this.config.offsetY || 0;
        this.xTo(e.clientX + offsetX);
        this.yTo(e.clientY + offsetY);
    }

    init() {
        if (!this.shouldInit()) {
            return false;
        }

        this.createElements();
        this.bindEvents();
        // Mirror PHP render parity (class="emje-hover-reveal"); idempotent.
        try { this.container.classList.add('emje-hover-reveal'); } catch (e) {}
        return true;
    }

    destroy() {
        if (this.triggerEl) {
            try {
                if (this._onEnter) this.triggerEl.removeEventListener('mouseenter', this._onEnter);
                if (this._onLeave) this.triggerEl.removeEventListener('mouseleave', this._onLeave);
                if (this._onMove) this.triggerEl.removeEventListener('mousemove', this._onMove);
            } catch (e) {}
        }
        if (this.xTo && typeof this.xTo.kill === 'function') {
            try { this.xTo.kill(); } catch (e) {}
        }
        if (this.yTo && typeof this.yTo.kill === 'function') {
            try { this.yTo.kill(); } catch (e) {}
        }
        if (this.imageEl) {
            try { gsap.killTweensOf(this.imageEl); } catch (e) {}
        }
        if (this.imageEl && this.imageEl.parentNode) {
            this.imageEl.parentNode.removeChild(this.imageEl);
        }
        if (this.fallbackEl && this.fallbackEl.parentNode) {
            this.fallbackEl.parentNode.removeChild(this.fallbackEl);
        }
        try { this.container.classList.remove('emje-hover-reveal--mobile-fallback'); } catch (e) {}
        this.imageEl = null;
        this.fallbackEl = null;
        this.triggerEl = null;
    }

    static initAll() {
        const containers = document.querySelectorAll('[data-emje-hover-reveal]');
        containers.forEach((el) => {
            if (el.dataset.emjeHoverRevealInitialized === 'true') {
                return;
            }

            let config;
            try {
                config = JSON.parse(el.getAttribute('data-emje-hover-reveal'));
            } catch (e) {
                return;
            }

            const instance = new HoverReveal(el, config);
            if (instance.init()) {
                el.dataset.emjeHoverRevealInitialized = 'true';
                HoverReveal._instances.set(el, instance);
            }
        });
    }

    static reInit(el) {
        const old = HoverReveal._instances.get(el);
        if (old) {
            old.destroy();
            HoverReveal._instances.delete(el);
            delete el.dataset.emjeHoverRevealInitialized;
        }
        let config;
        try {
            config = JSON.parse(el.getAttribute('data-emje-hover-reveal'));
        } catch (e) {
            return;
        }
        const instance = new HoverReveal(el, config);
        if (instance.init()) {
            el.dataset.emjeHoverRevealInitialized = 'true';
            HoverReveal._instances.set(el, instance);
        }
    }
}

HoverReveal._instances = new WeakMap();
if (typeof window !== 'undefined') {
    window.EmjeMotionHoverReveal = HoverReveal;
}
