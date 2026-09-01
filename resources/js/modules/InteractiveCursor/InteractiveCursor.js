import gsap from 'gsap';

/**
 * Interactive Cursor per Container.
 * Types: text-follow | dot-ring | trail (Comet Trail)
 * TODO: Extract strategies TextFollowCursor/DotRingCursor/CometTrailCursor (God Class 533 LOC).
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
            // Comet Trail
            trailDots: config.trailDots ?? 6,
            trailSize: config.trailSize ?? 20,
            trailHeadColor: config.trailHeadColor ?? '#111111',
            trailTailColor: config.trailTailColor ?? '#FF4D5A',
            trailLag: config.trailLag ?? 0.35,
            trailFade: config.trailFade ?? true,
        };
        // migrate legacy dot/ring
        if (this.config.type === 'dot' || this.config.type === 'ring') {
            this.config.type = 'dot-ring';
        }
        if (['none', 'scale', 'scale-bounce'].indexOf(this.config.entrance) === -1) {
            this.config.entrance = 'scale';
        }
        this.config.followSmoothness = Math.max(0.05, Math.min(0.6, parseFloat(this.config.followSmoothness) || 0.5));
        this.config.shadowBlur = Math.max(0, Math.min(60, parseInt(this.config.shadowBlur, 10) || 32));

        // Comet Trail clamps
        this.config.trailDots = Math.max(3, Math.min(12, parseInt(this.config.trailDots, 10) || 6));
        this.config.trailSize = Math.max(4, Math.min(24, parseInt(this.config.trailSize, 10) || 20));
        this.config.trailLag = Math.max(0.1, Math.min(0.5, parseFloat(this.config.trailLag) || 0.35));
        // trailFade can be boolean or 'yes'/'no' string from PHP
        if (typeof this.config.trailFade === 'string') {
            this.config.trailFade = this.config.trailFade === 'yes' || this.config.trailFade === 'true';
        }
        this.config.trailFade = !!this.config.trailFade;

        this.cursorEl = null;
        this.dotEl = null;
        this.ringEl = null;
        this.followEl = null;
        this.labelEl = null;
        this.xTo = null;
        this.yTo = null;
        this.xDotTo = null;
        this.yDotTo = null;
        this.isInside = false;

        // Trail specific
        this.trailEls = [];
        this.trailPts = [];
        this.trailTarget = { x: 0, y: 0 };
        this.trailRaf = null;
        this.trailVisible = false;
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
            if (window.matchMedia('(hover: none)').matches
                || window.matchMedia('(pointer: coarse)').matches) {
                return false;
            }
        }
        return true;
    }

    // --- Color helpers for gradient head→tail ---
    _parseColor(str) {
        if (!str || typeof str !== 'string') return null;
        str = str.trim();
        if (str.startsWith('var(')) return null;
        // hex
        if (str.startsWith('#')) {
            let hex = str.replace('#', '');
            if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
            if (hex.length === 6) {
                const r = parseInt(hex.slice(0, 2), 16);
                const g = parseInt(hex.slice(2, 4), 16);
                const b = parseInt(hex.slice(4, 6), 16);
                if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) return { r, g, b };
            }
            if (hex.length === 8) {
                const r = parseInt(hex.slice(0, 2), 16);
                const g = parseInt(hex.slice(2, 4), 16);
                const b = parseInt(hex.slice(4, 6), 16);
                if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) return { r, g, b };
            }
            return null;
        }
        // rgb / rgba
        const rgbMatch = str.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
        if (rgbMatch) {
            return { r: parseInt(rgbMatch[1], 10), g: parseInt(rgbMatch[2], 10), b: parseInt(rgbMatch[3], 10) };
        }
        // hsl — fallback skip interpolation
        if (str.startsWith('hsl')) return null;
        // named color — skip
        return null;
    }

    _lerpColor(c1, c2, t) {
        const a = this._parseColor(c1);
        const b = this._parseColor(c2);
        if (a && b) {
            const r = Math.round(a.r + (b.r - a.r) * t);
            const g = Math.round(a.g + (b.g - a.g) * t);
            const bl = Math.round(a.b + (b.b - a.b) * t);
            return `rgb(${r}, ${g}, ${bl})`;
        }
        if (!a || !b) {
            return t < 0.5 ? c1 : c2;
        }
        return c1;
    }

    createElements() {
        // Comet Trail — separate rendering (fixed dots, rAF chain)
        if (this.config.type === 'trail') {
            this.cursorEl = document.createElement('div');
            this.cursorEl.className = 'emje-cursor emje-cursor--trail emje-cursor--hidden';
            // container itself invisible; dots are positioned fixed
            this.cursorEl.style.opacity = '0';
            document.body.appendChild(this.cursorEl);

            const n = this.config.trailDots;
            const headSize = this.config.trailSize;
            const headColor = this.config.trailHeadColor;
            const tailColor = this.config.trailTailColor;
            const fade = this.config.trailFade;

            this.trailEls = [];
            this.trailPts = [];

            for (let i = 0; i < n; i++) {
                const t = n === 1 ? 0 : i / (n - 1);
                // Size decay: head 100% → tail 35%
                const size = Math.max(3, Math.round(headSize * (1 - t * 0.65)));
                const color = this._lerpColor(headColor, tailColor, t);
                const opacity = fade ? (1 - t * 0.75) : 1;

                const dot = document.createElement('div');
                dot.className = 'emje-cursor__trail-dot';
                dot.style.width = `${size}px`;
                dot.style.height = `${size}px`;
                dot.style.background = color;
                dot.style.opacity = '0';
                // store base opacity for fade on hover
                dot.dataset.baseOpacity = String(opacity);
                dot.dataset.baseSize = String(size);

                document.body.appendChild(dot);
                this.trailEls.push(dot);
                this.trailPts.push({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
            }

            // init target to center
            this.trailTarget = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

            if (this.config.hideNative) {
                this.container.classList.add('emje-interactive-cursor--hide-native');
            }

            this._startTrailLoop();
            return;
        }

        this.cursorEl = document.createElement('div');
        this.cursorEl.className = 'emje-cursor emje-cursor--hidden';
        this.cursorEl.style.setProperty('--emje-cursor-color', this.config.color);
        this.cursorEl.style.setProperty('--emje-cursor-size', `${this.config.size}px`);

        if (this.config.type === 'text-follow') {
            this.followEl = document.createElement('div');
            this.followEl.className = 'emje-cursor__follow';
            this.followEl.style.setProperty('--emje-follow-bg', this.config.bgColor);
            this.followEl.style.setProperty('--emje-follow-text', this.config.textColor);
            this.followEl.style.setProperty('--emje-follow-py', `${this.config.paddingY}px`);
            this.followEl.style.setProperty('--emje-follow-px', `${this.config.paddingX}px`);
            this.followEl.style.setProperty('--emje-follow-radius', `${this.config.radius}px`);
            this.followEl.style.setProperty('--emje-follow-fs', `${this.config.fontSize}px`);
            // Box shadow via Elementor group (preferred) — fallback to legacy shadowBlur
            const boxShadowVal = this.config.boxShadow && this.config.boxShadow !== 'none' ? this.config.boxShadow : (this.config.shadow ? `0px 8px ${this.config.shadowBlur}px 0px rgba(0, 0, 0, 0.12)` : 'none');
            this.followEl.style.boxShadow = boxShadowVal;

            this.labelEl = document.createElement('span');
            this.labelEl.className = 'emje-cursor__label emje-cursor__label--follow';
            this.labelEl.textContent = this.config.label || 'View';

            // Typography (Elementor group) — apply inline to label
            const typo = this.config.typography;
            if (typo) {
                if (typo.fontFamily) this.labelEl.style.fontFamily = typo.fontFamily;
                if (typo.fontSize) {
                    const fs = String(typo.fontSize);
                    if (fs.startsWith('var(')) {
                        this.labelEl.style.fontSize = fs;
                    } else {
                        this.labelEl.style.fontSize = typo.fontSize + (typo.fontSizeUnit || 'px');
                    }
                } else {
                    this.labelEl.style.fontSize = `${this.config.fontSize}px`;
                }
                if (typo.fontWeight) this.labelEl.style.fontWeight = typo.fontWeight;
                if (typo.textTransform) this.labelEl.style.textTransform = typo.textTransform;
                if (typo.fontStyle) this.labelEl.style.fontStyle = typo.fontStyle;
                if (typo.lineHeight) this.labelEl.style.lineHeight = typo.lineHeight;
                if (typo.letterSpacing) this.labelEl.style.letterSpacing = typo.letterSpacing;
            } else {
                this.labelEl.style.fontSize = `${this.config.fontSize}px`;
            }
            this.followEl.appendChild(this.labelEl);
            this.cursorEl.appendChild(this.followEl);
        } else {
            // dot-ring (default fallback)
            this.dotEl = document.createElement('div');
            this.dotEl.className = 'emje-cursor__dot';
            this.cursorEl.appendChild(this.dotEl);

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

        // GSAP quickTo for smooth follow — both types now use configurable Follow Smoothness (default 0.5)
        const dur = this.config.followSmoothness ?? 0.5;
        const ease = 'power2.out';
        this.xTo = gsap.quickTo(this.cursorEl, 'x', { duration: dur, ease: ease });
        this.yTo = gsap.quickTo(this.cursorEl, 'y', { duration: dur, ease: ease });

        if (this.dotEl) {
            this.xDotTo = gsap.quickTo(this.dotEl, 'x', { duration: 0.06, ease: 'power3' });
            this.yDotTo = gsap.quickTo(this.dotEl, 'y', { duration: 0.06, ease: 'power3' });
        }

        if (this.config.hideNative) {
            this.container.classList.add('emje-interactive-cursor--hide-native');
        }
    }

    _startTrailLoop() {
        if (this.trailRaf) return;
        const lerp = this.config.trailLag;
        const tick = () => {
            if (this.trailEls.length === 0) {
                this.trailRaf = requestAnimationFrame(tick);
                return;
            }
            let leadX = this.trailTarget.x;
            let leadY = this.trailTarget.y;
            for (let i = 0; i < this.trailEls.length; i++) {
                const pt = this.trailPts[i];
                pt.x += (leadX - pt.x) * lerp;
                pt.y += (leadY - pt.y) * lerp;
                const el = this.trailEls[i];
                // Use translate3d for GPU
                el.style.transform = `translate3d(${pt.x}px, ${pt.y}px, 0) translate(-50%, -50%)`;
                leadX = pt.x;
                leadY = pt.y;
            }
            this.trailRaf = requestAnimationFrame(tick);
        };
        this.trailRaf = requestAnimationFrame(tick);
    }

    _stopTrailLoop() {
        if (this.trailRaf) {
            cancelAnimationFrame(this.trailRaf);
            this.trailRaf = null;
        }
    }

    bindEvents() {
        this.container.addEventListener('mouseenter', this.onEnter.bind(this));
        this.container.addEventListener('mouseleave', this.onLeave.bind(this));
        this.container.addEventListener('mousemove', this.onMove.bind(this));

        // Hover scaling for dot-ring only.
        if (this.config.type === 'dot-ring') {
            const interactiveEls = this.container.querySelectorAll('a, button, .elementor-button, [role="button"]');
            interactiveEls.forEach((el) => {
                el.addEventListener('mouseenter', this.onInteractiveEnter.bind(this));
                el.addEventListener('mouseleave', this.onInteractiveLeave.bind(this));
            });
        }
    }

    onEnter() {
        this.isInside = true;

        // Comet Trail enter
        if (this.config.type === 'trail') {
            this.trailVisible = true;
            this.trailEls.forEach((el) => {
                const base = parseFloat(el.dataset.baseOpacity || '1');
                gsap.to(el, { opacity: base, duration: 0.2, ease: 'power2.out' });
            });
            if (this.cursorEl) {
                this.cursorEl.classList.remove('emje-cursor--hidden');
                gsap.to(this.cursorEl, { opacity: 1, duration: 0.2, ease: 'power2.out' });
            }
            return;
        }

        if (!this.cursorEl) return;

        this.cursorEl.classList.remove('emje-cursor--hidden');

        // Reduced motion: simple fade.
        const isReduced = !this.isEditMode() && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (this.config.type === 'text-follow' && this.followEl && !isReduced) {
            const entrance = this.config.entrance;
            if (entrance === 'none') {
                gsap.to(this.cursorEl, { opacity: 1, duration: 0.2, ease: 'power2.out' });
                gsap.set(this.followEl, { scale: 1 });
            } else if (entrance === 'scale-bounce') {
                gsap.set(this.followEl, { scale: 0.3 });
                gsap.to(this.cursorEl, { opacity: 1, duration: 0.15, ease: 'power2.out' });
                gsap.to(this.followEl, { scale: 1, duration: 0.45, ease: 'back.out(1.4)' });
            } else {
                // scale — Scale Smooth (default)
                gsap.set(this.followEl, { scale: 0.5 });
                gsap.to(this.cursorEl, { opacity: 1, duration: 0.2, ease: 'power2.out' });
                gsap.to(this.followEl, { scale: 1, duration: 0.35, ease: 'power2.out' });
            }
        } else {
            gsap.to(this.cursorEl, { opacity: 1, duration: 0.2, ease: 'power2.out' });
        }
    }

    onLeave() {
        this.isInside = false;

        // Comet Trail leave
        if (this.config.type === 'trail') {
            this.trailVisible = false;
            this.trailEls.forEach((el) => {
                gsap.to(el, { opacity: 0, duration: 0.2, ease: 'power2.in' });
            });
            if (this.cursorEl) {
                gsap.to(this.cursorEl, { opacity: 0, duration: 0.15, ease: 'power2.in', onComplete: () => {
                    if (!this.isInside && this.cursorEl) this.cursorEl.classList.add('emje-cursor--hidden');
                }});
            }
            this.resetScale();
            return;
        }

        if (!this.cursorEl) return;

        const isReduced = !this.isEditMode() && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (this.config.type === 'text-follow' && this.followEl && !isReduced && this.config.entrance !== 'none') {
            const scaleTo = this.config.entrance === 'scale-bounce' ? 0.3 : 0.5;
            gsap.to(this.followEl, { scale: scaleTo, duration: 0.2, ease: 'power2.in' });
            gsap.to(this.cursorEl, { opacity: 0, duration: 0.18, ease: 'power2.in', onComplete: () => {
                if (!this.isInside) this.cursorEl.classList.add('emje-cursor--hidden');
            }});
        } else {
            gsap.to(this.cursorEl, { opacity: 0, duration: 0.15, ease: 'power2.in', onComplete: () => {
                if (!this.isInside) this.cursorEl.classList.add('emje-cursor--hidden');
            }});
        }
        this.resetScale();
    }

    onMove(e) {
        if (!this.isInside) return;

        // Comet Trail — update target for rAF chain
        if (this.config.type === 'trail') {
            this.trailTarget.x = e.clientX;
            this.trailTarget.y = e.clientY;
            return;
        }

        if (!this.xTo || !this.yTo) {
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
        this._stopTrailLoop();
        if (this.trailEls.length) {
            this.trailEls.forEach((el) => {
                if (el.parentNode) el.parentNode.removeChild(el);
            });
            this.trailEls = [];
            this.trailPts = [];
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
            instance.init();
            el.dataset.emjeCursorInitialized = 'true';
            InteractiveCursor._instances.set(el, instance);
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
        instance.init();
        el.dataset.emjeCursorInitialized = 'true';
        InteractiveCursor._instances.set(el, instance);
    }
}

InteractiveCursor._instances = new WeakMap();
if (typeof window !== 'undefined') {
    window.EmjeMotionCursor = InteractiveCursor;
}
