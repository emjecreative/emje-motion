import { isEditMode, applyEdgeMask, LIMITS, clampNum } from './shared';

// 4x4 Bayer matrix, normalized 0-1. Gives the retro print feel
// on top of the smooth noise field.
const BAYER_4 = [
    0, 8, 2, 10,
    12, 4, 14, 6,
    3, 11, 1, 9,
    15, 7, 13, 5,
].map((v) => (v + 0.5) / 16);

function toNumber(value, fallback) {
    const n = parseFloat(value);
    return Number.isNaN(n) ? fallback : n;
}

function isPaintableColor(color) {
    if (typeof color !== 'string' || color.trim() === '') {
        return false;
    }
    const c = color.trim();
    // Canvas fillStyle can't resolve CSS var() — fall back instead.
    if (c.indexOf('var(') !== -1 || c.indexOf('globals/') !== -1) {
        return false;
    }
    return true;
}

function isTransparentColor(color) {
    if (typeof color !== 'string') {
        return true;
    }
    const c = color.replace(/\s+/g, '').toLowerCase();
    if (c === 'transparent') {
        return true;
    }
    const m = c.match(/^rgba?\(([^)]+)\)$/);
    if (m) {
        const parts = m[1].split(',').map((p) => p.trim());
        const alpha = parts.length === 4 ? parseFloat(parts[3]) : 1;
        return !(alpha > 0);
    }
    const hexAlpha = c.match(/^#([0-9a-f]{8})$/);
    if (hexAlpha) {
        return hexAlpha[1].slice(6, 8) === '00';
    }
    return false;
}

/**
 * Dither — ambient animated retro-dither background (Emje original,
 * inspired by the Framer DitherShader reference).
 *
 * Canvas 2D, zero dependencies: a slow noise field thresholded through
 * a Bayer matrix, drawn as square dots (fillRect fast path).
 * Click/tap sends an expanding ripple through the field. Always
 * transparent-friendly so the native Container background shows through.
 */
export default class DitherCanvas {
    constructor(container, config) {
        this.container = container;
        // NOTE: `config.shape` from older payloads is intentionally ignored —
        // Dither is square-only (single fast path, no shape branching).
        this.config = {
            fg: isPaintableColor(config.fg) ? config.fg : '#3B82F6',
            bg: isPaintableColor(config.bg) ? config.bg : 'rgba(255, 255, 255, 0)',
            pixel: clampNum(toNumber(config.pixel, 8), LIMITS.dither.pixel, 8),
            density: clampNum(toNumber(config.density ?? 0.5, 0.5), LIMITS.dither.density, 0.5),
            scale: clampNum(toNumber(config.scale ?? 1.5, 1.5), LIMITS.dither.scale, 1.5),
            speed: clampNum(toNumber(config.speed ?? 0.6, 0.6), LIMITS.dither.speed, 0.6),
            ripple: config.ripple !== false,
            rippleStrength: clampNum(toNumber(config.rippleStrength ?? 0.6, 0.6), LIMITS.dither.rippleStrength, 0.6),
            rippleWidth: clampNum(toNumber(config.rippleWidth ?? 140, 140), LIMITS.dither.rippleWidth, 140),
            rippleSpeed: clampNum(toNumber(config.rippleSpeed ?? 420, 420), LIMITS.dither.rippleSpeed, 420),
            fade: clampNum(toNumber(config.fade ?? 10, 10), LIMITS.dither.fade, 10),
            livePreview: config.livePreview ?? false,
            disableOnMobile: config.disableOnMobile ?? true,
        };
        if (isTransparentColor(this.config.bg)) {
            this._bgTransparent = true;
        } else {
            this._bgTransparent = false;
        }

        this.wrapEl = null;
        this.canvas = null;
        this.ctx = null;
        this.cols = 0;
        this.rows = 0;
        this.cssW = 0;
        this.cssH = 0;
        this.ripples = [];
        this.visible = true;
        this.running = false;
        this._raf = 0;
        // Accumulated animation time (seconds). Advanced only by drawn
        // frames — never by wall-clock — so a hidden tab resumes without
        // a visible pattern jump.
        this._animTime = 0;
        this._lastFrame = 0;
        this._autoPixel = this.config.pixel;
        this._slowFrames = 0;
        this._onClick = null;
        this._onTouch = null;
        this._onResize = null;
        this._observer = null;
        this._onVisibility = null;
    }

    shouldInit() {
        if (isEditMode()) {
            return this.config.livePreview === true;
        }
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return false;
        }
        if (this.config.disableOnMobile && (window.matchMedia('(hover: none)').matches
            || window.matchMedia('(pointer: coarse)').matches)) {
            return false;
        }
        return true;
    }

    build() {
        this.wrapEl = document.createElement('div');
        this.wrapEl.className = 'emje-dither';
        this.wrapEl.setAttribute('aria-hidden', 'true');

        this.canvas = document.createElement('canvas');
        this.canvas.className = 'emje-dither__canvas';
        this.wrapEl.appendChild(this.canvas);

        this.container.insertBefore(this.wrapEl, this.container.firstChild);
        this.container.classList.add('emje-background-motion');

        applyEdgeMask(this.wrapEl, this.config.fade);
        this.ctx = this.canvas.getContext('2d');
        this._autoPixel = this.config.pixel;
        this.resize();
    }

    resize() {
        if (!this.canvas || !this.container) {
            return;
        }
        const w = this.container.clientWidth || this.container.offsetWidth || window.innerWidth;
        const h = this.container.clientHeight || this.container.offsetHeight || 400;
        this.cssW = Math.max(1, w);
        this.cssH = Math.max(1, h);

        let pixel = this._autoPixel || this.config.pixel;
        let cols = Math.max(1, Math.ceil(this.cssW / pixel));
        let rows = Math.max(1, Math.ceil(this.cssH / pixel));
        if (cols * rows > LIMITS.dither.maxCells) {
            const scale = Math.sqrt((cols * rows) / LIMITS.dither.maxCells);
            pixel = Math.min(LIMITS.dither.pixel[1], pixel * scale);
            this._autoPixel = pixel;
            cols = Math.max(1, Math.ceil(this.cssW / pixel));
            rows = Math.max(1, Math.ceil(this.cssH / pixel));
        }
        this.cols = cols;
        this.rows = rows;

        const dpr = Math.min(LIMITS.dither.maxDpr, window.devicePixelRatio || 1);
        this.canvas.width = Math.max(1, Math.round(this.cssW * dpr));
        this.canvas.height = Math.max(1, Math.round(this.cssH * dpr));
        this.canvas.style.width = `${this.cssW}px`;
        this.canvas.style.height = `${this.cssH}px`;
        try {
            this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        } catch (_e) {}
    }

    fieldAt(gx, gy, t) {
        // Cheap animated noise: layered sin/cos, scaled by Pattern Scale.
        // Output roughly 0-1 before density shift. The radial term uses
        // r-squared instead of sqrt() — same organic motion, cheaper.
        const s = this.config.scale;
        const x = gx * 0.55 * s;
        const y = gy * 0.55 * s;
        const a = Math.sin(x * 0.9 + t * 1.1) * Math.cos(y * 0.8 - t * 0.7);
        const b = Math.sin((x + y) * 0.45 - t * 0.9);
        const c = Math.sin((x * x + y * y) * 0.08 - t * 1.4);
        return 0.5 + 0.22 * a + 0.16 * b + 0.12 * c;
    }

    /**
     * Precompute per-frame ripple params once (instead of per cell):
     * wavefront position, age decay and reach. Cells outside the wave
     * band are skipped without any exp()/sin() cost.
     */
    activeRipples(now) {
        if (!this.config.ripple || !this.ripples.length) {
            return null;
        }
        const width = Math.max(1, this.config.rippleWidth);
        const out = [];
        for (let i = 0; i < this.ripples.length; i++) {
            const r = this.ripples[i];
            const age = (now - r.t0) / 1000;
            if (age < 0 || age > 3.5) {
                continue;
            }
            out.push({
                x: r.x,
                y: r.y,
                front: age * this.config.rippleSpeed,
                amp: Math.exp(-age * 1.4) * this.config.rippleStrength,
                age,
                reach: age * this.config.rippleSpeed + width * 2.5,
            });
        }
        return out.length ? out : null;
    }

    rippleAt(px, py, ripples, width) {
        let sum = 0;
        for (let i = 0; i < ripples.length; i++) {
            const r = ripples[i];
            const dx = px - r.x;
            const dy = py - r.y;
            const distSq = dx * dx + dy * dy;
            // Quick reject: wavefront hasn't arrived or already passed.
            if (distSq > r.reach * r.reach) {
                continue;
            }
            const dist = Math.sqrt(distSq);
            const band = (dist - r.front) / width;
            if (band < -2.5 || band > 2.5) {
                continue;
            }
            const envelope = Math.exp(-band * band * 4) * r.amp;
            sum += Math.sin(dist * 0.08 - r.age * 9) * envelope;
        }
        return sum;
    }

    draw(now) {
        const ctx = this.ctx;
        if (!ctx) {
            return;
        }
        const time = this._animTime * (0.4 + this.config.speed);
        const pixel = this._autoPixel || this.config.pixel;
        const { cols, rows, cssW, cssH } = this;

        if (!this._bgTransparent) {
            ctx.fillStyle = this.config.bg;
            ctx.fillRect(0, 0, cssW, cssH);
        } else {
            ctx.clearRect(0, 0, cssW, cssH);
        }

        ctx.fillStyle = this.config.fg;
        const densityShift = (this.config.density - 0.5) * 0.9;
        const ripples = this.activeRipples(now);
        const rippleWidth = Math.max(1, this.config.rippleWidth);

        // Square-only: fillRect needs no path at all — the cheapest
        // canvas primitive, full 60fps even while scrolling.
        for (let r = 0; r < rows; r++) {
            const py = (r + 0.5) * pixel;
            for (let c = 0; c < cols; c++) {
                const px = (c + 0.5) * pixel;
                const v = this.fieldAt(c, r, time) + densityShift
                    + (ripples ? this.rippleAt(px, py, ripples, rippleWidth) : 0);
                // Bayer gate: only cells above their matrix threshold draw.
                const threshold = BAYER_4[((r % 4) * 4 + (c % 4)) % 16];
                // Map field 0-1 onto a fill ratio; threshold offsets it.
                const fill = (v - (1 - threshold) * 0.55) / 0.55;
                if (fill <= 0.03) {
                    continue;
                }
                const s = Math.min(1, fill) * pixel * 0.92;
                const half = s / 2;
                ctx.fillRect(px - half, py - half, s, s);
            }
        }
    }

    tick = (now) => {
        this._raf = 0;
        if (!this.running || !this.visible || document.hidden) {
            return;
        }
        if (this.config.speed <= 0) {
            // Frozen frame — no loop.
            this.running = false;
            return;
        }
        // Full 60fps at all times (including scroll): the square-only
        // fillRect path is cheap enough that throttling just reads as
        // stutter. Advance the animation clock by real elapsed time
        // (clamped so a hidden tab or long jank never causes a jump).
        if (!this._lastFrame) {
            this._lastFrame = now;
        }
        const dt = Math.min(0.1, Math.max(0, (now - this._lastFrame) / 1000));
        this._lastFrame = now;
        this._animTime += dt;
        const perfNow = (typeof performance !== 'undefined' && performance.now)
            ? () => performance.now()
            : () => Date.now();
        const frameStart = perfNow();
        try {
            this.draw(now);
        } catch (_e) {}
        // Prune dead ripples.
        if (this.ripples.length) {
            this.ripples = this.ripples.filter((r) => now - r.t0 < 3500);
        }
        // Auto-scale resolution: react fast (10 slow frames) so a heavy
        // shape degrades gracefully instead of janking for a full second.
        // Growth is capped at 2x the configured Pixel Size — beyond that
        // the dots would visibly change character ("grew by itself").
        const cost = perfNow() - frameStart;
        if (cost > 24) {
            this._slowFrames += 1;
        } else if (cost < 14) {
            this._slowFrames = Math.max(0, this._slowFrames - 1);
        }
        const autoCap = Math.min(LIMITS.dither.pixel[1], this.config.pixel * 2);
        if (this._slowFrames >= 10 && this._autoPixel < autoCap) {
            this._slowFrames = 0;
            this._autoPixel = Math.min(autoCap, this._autoPixel * 1.3);
            this.resize();
            // resize() blanks the canvas (width reset) — repaint in the
            // SAME frame instead of leaving one blank flash for the
            // browser to paint before the next tick.
            try {
                this.draw(now);
            } catch (_e) {}
        }
        this._raf = requestAnimationFrame(this.tick);
    };

    start() {
        if (this.running) {
            return;
        }
        this.running = true;
        // Don't reset _animTime here: start/stop cycles (IntersectionObserver,
        // tab switch) must resume the pattern, never restart or jump it.
        this._lastFrame = 0;
        if (this.config.speed <= 0) {
            // Single static frame.
            try {
                this.draw((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now());
            } catch (_e) {}
            this.running = false;
            return;
        }
        this._raf = requestAnimationFrame(this.tick);
    }

    stop() {
        this.running = false;
        if (this._raf) {
            cancelAnimationFrame(this._raf);
            this._raf = 0;
        }
    }

    addRipple(clientX, clientY) {
        if (!this.config.ripple || !this.wrapEl) {
            return;
        }
        try {
            const rect = this.canvas.getBoundingClientRect();
            const x = clientX - rect.left;
            const y = clientY - rect.top;
            if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
                return;
            }
            const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
            this.ripples.push({ x, y, t0: now });
            if (this.ripples.length > 6) {
                this.ripples.splice(0, this.ripples.length - 6);
            }
            // If frozen (speed 0), kick a short burst so the ripple is visible.
            // Ripples run on wall-clock `now`, independent of _animTime.
            if (this.config.speed <= 0) {
                this.start();
                setTimeout(() => this.stop(), 1800);
                // Re-freeze on the resting frame after the burst.
                setTimeout(() => {
                    if (this.config.speed <= 0 && this.visible) {
                        this.ripples = [];
                        try {
                            this.draw(((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()));
                        } catch (_e) {}
                    }
                }, 2000);
            }
        } catch (_e) {}
    }

    bindEvents() {
        this._onClick = (e) => this.addRipple(e.clientX, e.clientY);
        this._onTouch = (e) => {
            if (e.touches && e.touches[0]) {
                this.addRipple(e.touches[0].clientX, e.touches[0].clientY);
            }
        };
        this.container.addEventListener('click', this._onClick);
        this.container.addEventListener('touchstart', this._onTouch, { passive: true });

        let resizeTimer = null;
        this._onResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.resize();
                if (this.config.speed <= 0 && this.visible) {
                    try {
                        this.draw(((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()));
                    } catch (_e) {}
                }
            }, 200);
        };
        window.addEventListener('resize', this._onResize);

        this._onVisibility = () => {
            if (document.hidden) {
                return;
            }
            if (this.visible && !this.running && this.config.speed > 0) {
                this.start();
            } else if (this.config.speed <= 0 && this.visible) {
                try {
                    this.draw(((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()));
                } catch (_e) {}
            }
        };
        document.addEventListener('visibilitychange', this._onVisibility);

        if (typeof IntersectionObserver !== 'undefined') {
            this._observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    const was = this.visible;
                    this.visible = entry.isIntersecting;
                    if (this.visible && !was) {
                        this.start();
                    } else if (!this.visible) {
                        this.stop();
                    }
                });
            }, { threshold: 0 });
            this._observer.observe(this.container);
        }
    }

    init() {
        if (!this.shouldInit()) {
            return false;
        }
        if (typeof HTMLCanvasElement === 'undefined') {
            return false;
        }
        this.build();
        if (!this.ctx) {
            this.destroy();
            return false;
        }
        this.bindEvents();
        this.start();
        return true;
    }

    destroy() {
        this.stop();
        if (this._observer) {
            try { this._observer.disconnect(); } catch (_e) {}
            this._observer = null;
        }
        if (this._onResize) {
            try { window.removeEventListener('resize', this._onResize); } catch (_e) {}
        }
        if (this._onVisibility) {
            try { document.removeEventListener('visibilitychange', this._onVisibility); } catch (_e) {}
        }
        if (this.container) {
            try {
                if (this._onClick) this.container.removeEventListener('click', this._onClick);
                if (this._onTouch) this.container.removeEventListener('touchstart', this._onTouch);
            } catch (_e) {}
        }
        if (this.wrapEl && this.wrapEl.parentNode) {
            this.wrapEl.parentNode.removeChild(this.wrapEl);
        }
        this.wrapEl = null;
        this.canvas = null;
        this.ctx = null;
        this.ripples = [];
    }
}
