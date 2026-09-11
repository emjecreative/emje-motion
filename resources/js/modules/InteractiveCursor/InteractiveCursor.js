import gsap from 'gsap';
import { buildTextFollow, enterTextFollow, leaveTextFollow } from './strategies/TextFollowCursor.js';
import { buildDotRing, bindDotRingHover } from './strategies/DotRingCursor.js';

/**
 * Interactive Cursor per Container.
 * Types: text-follow | dot-ring (strategies in ./strategies/).
 */
export default class InteractiveCursor {
    constructor(container, config) {
        this.container = container;
        this.config = {
            type: config.type ?? 'text-follow',
            size: config.size ?? 20,
            color: config.color ?? '#000000',
            hoverScale: config.hoverScale ?? 1.5,
            hideNative: config.hideNative ?? false,
            label: config.label ?? 'View',
            bgColor: config.bgColor ?? '#FFFFFF',
            textColor: config.textColor ?? '#111111',
            paddingY: config.paddingY ?? 40,
            paddingX: config.paddingX ?? 32,
            radius: config.radius ?? 99,
            fontSize: config.fontSize ?? 14,
            typography: config.typography ?? null,
            entrance: config.entrance ?? 'scale',
            followSmoothness: config.followSmoothness ?? 0.5,
            boxShadow: config.boxShadow ?? '0px 8px 32px 0px rgba(0, 0, 0, 0.12)',
            shadow: config.shadow ?? true,
            shadowBlur: config.shadowBlur ?? 32,
            disableOnMobile: config.disableOnMobile ?? true,
        };
        // migrate legacy dot/ring
        if (this.config.type === 'dot' || this.config.type === 'ring') {
            this.config.type = 'dot-ring';
        }
        // Retired Comet Trail: old saved payloads fall through to text-follow
        // (PHP whitelist already does the same server-side).
        if (this.config.type === 'trail') {
            this.config.type = 'text-follow';
        }
        if (['none', 'scale', 'scale-bounce'].indexOf(this.config.entrance) === -1) {
            this.config.entrance = 'scale';
        }
        this.config.followSmoothness = Math.max(0.05, Math.min(0.6, parseFloat(this.config.followSmoothness) || 0.5));
        this.config.shadowBlur = Math.max(0, Math.min(60, parseInt(this.config.shadowBlur, 10) || 32));

        this.cursorEl = null;
        this.dotEl = null;
        this.ringEl = null;
        this.followEl = null;
        this.labelEl = null;
        this.xTo = null;
        this.yTo = null;
        this.isInside = false;
    }

    isEditMode() {
        if (document.body.classList.contains('elementor-editor-active')) {
            return true;
        }
        if (typeof window.elementorFrontend !== 'undefined' && window.elementorFrontend.isEditMode) {
            try { return window.elementorFrontend.isEditMode(); } catch (_e) { return false; }
        }
        return false;
    }

    shouldInit() {
        if (this.isEditMode() && this.config.livePreview === false) {
            return false;
        }
        if (!this.isEditMode()) {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                return false;
            }
            const disableOnMobile = this.config.disableOnMobile ?? true;
            if (disableOnMobile && (window.matchMedia('(hover: none)').matches
                || window.matchMedia('(pointer: coarse)').matches)) {
                return false;
            }
        }
        return true;
    }

    createElements() {
        this.cursorEl = document.createElement('div');
        this.cursorEl.className = 'emje-cursor emje-cursor--hidden';
        this.cursorEl.style.setProperty('--emje-cursor-color', this.config.color);
        this.cursorEl.style.setProperty('--emje-cursor-size', `${this.config.size}px`);

        if (this.config.type === 'text-follow') {
            buildTextFollow(this);
        } else {
            // dot-ring (default fallback)
            buildDotRing(this);
        }

        document.body.appendChild(this.cursorEl);

        // GSAP quickTo for smooth follow — both types now use configurable Follow Smoothness (default 0.5)
        const dur = this.config.followSmoothness ?? 0.5;
        const ease = 'power2.out';
        this.xTo = gsap.quickTo(this.cursorEl, 'x', { duration: dur, ease: ease });
        this.yTo = gsap.quickTo(this.cursorEl, 'y', { duration: dur, ease: ease });

        if (this.config.hideNative) {
            this.container.classList.add('emje-interactive-cursor--hide-native');
        }
    }

    bindEvents() {
        this._onEnter = this.onEnter.bind(this);
        this._onLeave = this.onLeave.bind(this);
        this._onMove = this.onMove.bind(this);
        this.container.addEventListener('mouseenter', this._onEnter);
        this.container.addEventListener('mouseleave', this._onLeave);
        this.container.addEventListener('mousemove', this._onMove);

        // Hover scaling for dot-ring only.
        this._interactiveHandlers = [];
        if (this.config.type === 'dot-ring') {
            bindDotRingHover(this);
        }
    }

    onEnter() {
        this.isInside = true;

        if (!this.cursorEl) return;

        this.cursorEl.classList.remove('emje-cursor--hidden');

        // Reduced motion: simple fade.
        const isReduced = !this.isEditMode() && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (this.config.type === 'text-follow' && this.followEl && !isReduced) {
            enterTextFollow(this);
        } else {
            gsap.to(this.cursorEl, { opacity: 1, duration: 0.2, ease: 'power2.out' });
        }
    }

    onLeave() {
        this.isInside = false;

        if (!this.cursorEl) return;

        const isReduced = !this.isEditMode() && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (this.config.type === 'text-follow' && this.followEl && !isReduced && this.config.entrance !== 'none') {
            leaveTextFollow(this);
        } else {
            gsap.to(this.cursorEl, { opacity: 0, duration: 0.15, ease: 'power2.in', onComplete: () => {
                if (!this.isInside) this.cursorEl.classList.add('emje-cursor--hidden');
            }});
        }
        this.resetScale();
    }

    onMove(e) {
        if (!this.isInside) return;

        if (!this.xTo || !this.yTo) {
            return;
        }

        this.xTo(e.clientX);
        this.yTo(e.clientY);
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
            return false;
        }

        this.createElements();
        this.bindEvents();
        // Mirror PHP render parity (class="emje-interactive-cursor"); idempotent.
        try { this.container.classList.add('emje-interactive-cursor'); } catch (e) {}
        return true;
    }

    destroy() {
        if (this._onEnter) {
            try { this.container.removeEventListener('mouseenter', this._onEnter); } catch (e) {}
            try { this.container.removeEventListener('mouseleave', this._onLeave); } catch (e) {}
            try { this.container.removeEventListener('mousemove', this._onMove); } catch (e) {}
        }
        if (this._interactiveHandlers) {
            this._interactiveHandlers.forEach(([el, enter, leave]) => {
                try { el.removeEventListener('mouseenter', enter); } catch (e) {}
                try { el.removeEventListener('mouseleave', leave); } catch (e) {}
            });
            this._interactiveHandlers = [];
        }
        if (this.xTo && typeof this.xTo.kill === 'function') {
            try { this.xTo.kill(); } catch (e) {}
        }
        if (this.yTo && typeof this.yTo.kill === 'function') {
            try { this.yTo.kill(); } catch (e) {}
        }
        if (this.cursorEl) {
            try { gsap.killTweensOf(this.cursorEl); } catch (e) {}
        }
        if (this.cursorEl && this.cursorEl.parentNode) {
            this.cursorEl.parentNode.removeChild(this.cursorEl);
        }

        this.container.classList.remove('emje-interactive-cursor--hide-native');
        this.cursorEl = null;
    }

    static initAll() {
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
            if (instance.init()) {
                el.dataset.emjeCursorInitialized = 'true';
                InteractiveCursor._instances.set(el, instance);
            }
        });
    }

    static reInit(el) {
        const old = InteractiveCursor._instances.get(el);
        if (old) {
            old.destroy();
            InteractiveCursor._instances.delete(el);
            delete el.dataset.emjeCursorInitialized;
        }
        let config;
        try {
            config = JSON.parse(el.getAttribute('data-emje-cursor'));
        } catch (e) {
            return;
        }
        const instance = new InteractiveCursor(el, config);
        if (instance.init()) {
            el.dataset.emjeCursorInitialized = 'true';
            InteractiveCursor._instances.set(el, instance);
        }
    }
}

InteractiveCursor._instances = new WeakMap();
if (typeof window !== 'undefined') {
    window.EmjeMotionCursor = InteractiveCursor;
}
