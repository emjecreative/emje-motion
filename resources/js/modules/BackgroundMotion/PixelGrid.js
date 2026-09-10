import { smoothstep, isEditMode, applyEdgeMask, LIMITS, clampNum } from './shared';

const MAX_CELLS = LIMITS.pixel.maxCells;
const MAX_DELTA = 8;

function toNumber(value, fallback) {
    const n = parseFloat(value);
    return Number.isNaN(n) ? fallback : n;
}

/**
 * Pixel — interactive pixel grid that lights up under the cursor.
 * Radius paints a soft glow area (color-mix falloff); trail keeps lit
 * cells lingering before they fade back. DOM + CSS transitions, no canvas.
 */
export default class PixelGrid {
    constructor(container, config) {
        const gapRaw = toNumber(config.gap ?? 2, 2);
        const borderRaw = toNumber(config.borderW ?? 1, 1);
        const radiusRaw = toNumber(config.radius ?? 120, 120);
        const trailRaw = toNumber(config.trail ?? 0.4, 0.4);
        const fitRaw = typeof config.fit === 'string' ? config.fit : 'stretch';
        this.container = container;
        this.config = {
            base: typeof config.base === 'string' && config.base.trim() !== '' ? config.base : 'rgba(255, 255, 255, 0.08)',
            active: typeof config.active === 'string' && config.active.trim() !== '' ? config.active : '#3B82F6',
            fit: fitRaw === 'crop' ? 'crop' : 'stretch',
            cellSize: clampNum(toNumber(config.cellSize, 56), LIMITS.pixel.cellSize, 56),
            gap: clampNum(gapRaw, LIMITS.pixel.gap, 2),
            borderW: clampNum(borderRaw, LIMITS.pixel.borderW, 1),
            border: typeof config.border === 'string' && config.border.trim() !== '' ? config.border : 'rgba(255, 255, 255, 0.15)',
            speed: clampNum(toNumber(config.speed, 0.15), LIMITS.pixel.speed, 0.15),
            radius: clampNum(radiusRaw, LIMITS.pixel.radius, 120),
            trail: clampNum(trailRaw, LIMITS.pixel.trail, 0.4),
            fade: clampNum(toNumber(config.fade ?? 10, 10), LIMITS.pixel.fade, 10),
            livePreview: config.livePreview ?? false,
            disableOnMobile: config.disableOnMobile ?? true,
        };

        this.wrapEl = null;
        this.gridEl = null;
        this.cells = [];
        this.cols = 0;
        this.rows = 0;
        this.litCells = new Set();
        this._timers = new Map();
        this._pending = null;
        this._raf = 0;
        this.visible = true;
        this._reduced = false;
        this._supportsColorMix = typeof CSS !== 'undefined'
            && typeof CSS.supports === 'function'
            && CSS.supports('background', 'color-mix(in srgb, red 50%, blue)');
        this._onMove = null;
        this._onLeave = null;
        this._onTouchMove = null;
        this._onTouchEnd = null;
        this._onResize = null;
        this._observer = null;
    }

    shouldInit() {
        if (isEditMode()) {
            return this.config.livePreview === true;
        }
        if (this.config.disableOnMobile && (window.matchMedia('(hover: none)').matches
            || window.matchMedia('(pointer: coarse)').matches)) {
            return false;
        }
        return true;
    }

    build() {
        this.wrapEl = document.createElement('div');
        this.wrapEl.className = 'emje-pixel';
        this.wrapEl.setAttribute('aria-hidden', 'true');

        this.gridEl = document.createElement('div');
        this.gridEl.className = 'emje-pixel__grid';
        this.wrapEl.appendChild(this.gridEl);

        this.container.insertBefore(this.wrapEl, this.container.firstChild);
        this.container.classList.add('emje-background-motion');

        applyEdgeMask(this.gridEl, this.config.fade);
        this.populate();
    }

    populate() {
        if (!this.gridEl) {
            return;
        }
        this.clearTimers();
        this.cancelPending();
        this.litCells = new Set();

        let cellSize = this.config.cellSize;
        const gap = this.config.gap;
        // Single shared dividers (like the reference): when a border is set,
        // each cell draws only its right + bottom edge (last column/row skip),
        // so every gutter is painted exactly ONCE — never doubled-up — while
        // the grid background stays transparent so a translucent Base Color
        // composites over the native Elementor container background
        // (image/video/color) instead of over the divider color.
        const divider = this.config.borderW > 0 ? this.config.borderW : 0;
        const stepGap = divider > 0 ? 0 : gap;
        const width = this.container.offsetWidth || this.container.clientWidth || window.innerWidth;
        const height = this.container.offsetHeight || this.container.clientHeight || 400;

        const fit = this.config.fit;
        const countFor = (size) => fit === 'crop'
            ? Math.max(1, Math.ceil(size / (cellSize + stepGap)))
            : Math.max(1, Math.floor(size / (cellSize + stepGap)));
        let cols = countFor(width);
        let rows = countFor(height);

        // Perf guard: grow cells when the grid would be too dense.
        if (cols * rows > MAX_CELLS) {
            const scale = Math.sqrt((cols * rows) / MAX_CELLS);
            cellSize = Math.min(96, cellSize * scale);
            cols = countFor(width);
            rows = countFor(height);
        }

        this.cols = cols;
        this.rows = rows;
        // Zero leftover: the grid box fills the whole container.
        // Stretch uses flexible tracks (cells resize to fit, actual size
        // may deviate slightly from Cell Size); crop uses exact-size
        // tracks over-filling the box with edge cells clipped by the
        // wrapper's overflow:hidden.
        this.gridEl.classList.add('emje-pixel__grid--fill');
        this.gridEl.style.width = '';
        this.gridEl.style.height = '';
        if (fit === 'stretch') {
            this.gridEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
            this.gridEl.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        } else {
            this.gridEl.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
            this.gridEl.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;
        }
        this._stepX = cellSize + stepGap;
        this._stepY = cellSize + stepGap;
        this.gridEl.style.gridAutoRows = '';
        this.gridEl.style.gap = `${stepGap}px`;
        this.gridEl.style.background = 'transparent';
        this.gridEl.innerHTML = '';
        this.cells = [];

        const { base, speed, border } = this.config;
        const dividerStyle = divider > 0 ? `${divider}px solid ${border}` : '';
        const frag = document.createDocumentFragment();
        for (let i = 0; i < cols * rows; i++) {
            const cell = document.createElement('div');
            cell.className = 'emje-pixel__cell';
            cell.style.background = base;
            cell.style.transitionDuration = `${speed}s`;
            if (dividerStyle !== '') {
                if ((i % cols) < cols - 1) {
                    cell.style.borderRight = dividerStyle;
                }
                if (Math.floor(i / cols) < rows - 1) {
                    cell.style.borderBottom = dividerStyle;
                }
            }
            frag.appendChild(cell);
            this.cells.push(cell);
        }
        this.gridEl.appendChild(frag);
        if (fit === 'stretch' && this.cells.length > 0) {
            // Flexible tracks: measure the rendered cell so cursor mapping
            // stays exact even when cells aren't square. Single reflow here
            // (build/resize only), never per mousemove.
            try {
                const r = this.cells[0].getBoundingClientRect();
                if (r.width > 0) {
                    this._stepX = r.width + stepGap;
                }
                if (r.height > 0) {
                    this._stepY = r.height + stepGap;
                }
            } catch (_e) {}
        }
    }

    mixColor(intensity) {
        const { base, active } = this.config;
        if (intensity >= 0.99) {
            return active;
        }
        if (intensity <= 0) {
            return base;
        }
        if (!this._supportsColorMix) {
            return intensity >= 0.35 ? active : base;
        }
        const pct = Math.round(intensity * 100);
        return `color-mix(in srgb, ${active} ${pct}%, ${base})`;
    }

    paintAt(clientX, clientY) {
        if (!this.gridEl || !this.visible || !this.cells.length) {
            return;
        }
        const rect = this.gridEl.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        if (x < 0 || y < 0 || x >= rect.width || y >= rect.height) {
            this.releaseAll();
            return;
        }
        const stepX = this._stepX || this.config.cellSize;
        const stepY = this._stepY || this.config.cellSize;
        const centerCol = Math.floor(x / stepX);
        const centerRow = Math.floor(y / stepY);
        if (centerCol < 0 || centerRow < 0 || centerCol >= this.cols || centerRow >= this.rows) {
            this.releaseAll();
            return;
        }

        const radius = this.config.radius;
        if (!radius) {
            const cell = this.cells[centerRow * this.cols + centerCol] || null;
            this.paintSingle(cell);
            return;
        }

        const deltaC = Math.min(MAX_DELTA, Math.ceil(radius / stepX));
        const deltaR = Math.min(MAX_DELTA, Math.ceil(radius / stepY));
        const c0 = Math.max(0, centerCol - deltaC);
        const c1 = Math.min(this.cols - 1, centerCol + deltaC);
        const r0 = Math.max(0, centerRow - deltaR);
        const r1 = Math.min(this.rows - 1, centerRow + deltaR);

        const next = new Set();
        for (let r = r0; r <= r1; r++) {
            for (let c = c0; c <= c1; c++) {
                const px = (c + 0.5) * stepX;
                const py = (r + 0.5) * stepY;
                const dx = px - x;
                const dy = py - y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist >= radius) {
                    continue;
                }
                const heat = 1 - smoothstep(0, radius, dist);
                if (heat <= 0) {
                    continue;
                }
                const cell = this.cells[r * this.cols + c];
                if (!cell) {
                    continue;
                }
                next.add(cell);
                cell.style.background = this.mixColor(heat);
                const pending = this._timers.get(cell);
                if (pending) {
                    clearTimeout(pending);
                    this._timers.delete(cell);
                }
            }
        }

        // Cells that fell out of the glow start their trail fade.
        this.litCells.forEach((cell) => {
            if (!next.has(cell)) {
                this.scheduleReset(cell);
            }
        });
        this.litCells = next;
    }

    paintSingle(cell) {
        const next = new Set(cell ? [cell] : []);
        this.litCells.forEach((old) => {
            if (!next.has(old)) {
                this.scheduleReset(old);
            }
        });
        if (cell) {
            const pending = this._timers.get(cell);
            if (pending) {
                clearTimeout(pending);
                this._timers.delete(cell);
            }
            if (cell.style.background !== this.config.active) {
                cell.style.background = this.config.active;
            }
        }
        this.litCells = next;
    }

    trailMs() {
        if (this._reduced) {
            return 0;
        }
        return this.config.trail * 1000;
    }

    scheduleReset(cell) {
        if (!cell) {
            return;
        }
        if (this._timers.has(cell)) {
            return;
        }
        const ms = this.trailMs();
        if (!ms) {
            this.resetCell(cell);
            return;
        }
        const id = setTimeout(() => {
            this._timers.delete(cell);
            this.resetCell(cell);
        }, ms);
        this._timers.set(cell, id);
    }

    resetCell(cell) {
        if (!cell) {
            return;
        }
        if (cell.style.background !== this.config.base) {
            cell.style.background = this.config.base;
        }
        this.litCells.delete(cell);
    }

    releaseAll() {
        if (!this.litCells.size) {
            return;
        }
        const done = Array.from(this.litCells);
        done.forEach((cell) => this.scheduleReset(cell));
    }

    reset() {
        this.cancelPending();
        this.clearTimers();
        for (let i = 0; i < this.cells.length; i++) {
            const cell = this.cells[i];
            if (cell.style.background !== this.config.base) {
                cell.style.background = this.config.base;
            }
        }
        this.litCells = new Set();
    }

    clearTimers() {
        this._timers.forEach((id) => clearTimeout(id));
        this._timers.clear();
    }

    cancelPending() {
        this._pending = null;
        if (this._raf) {
            cancelAnimationFrame(this._raf);
            this._raf = 0;
        }
    }

    queuePaint(clientX, clientY) {
        this._pending = { x: clientX, y: clientY };
        if (this._raf) {
            return;
        }
        this._raf = requestAnimationFrame(() => {
            this._raf = 0;
            const p = this._pending;
            this._pending = null;
            if (p) {
                this.paintAt(p.x, p.y);
            }
        });
    }

    bindEvents() {
        this._reduced = !isEditMode() && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (this.gridEl && this._reduced) {
            this.gridEl.classList.add('emje-pixel__grid--instant');
        }

        this._onMove = (e) => this.queuePaint(e.clientX, e.clientY);
        this._onLeave = () => this.releaseAll();
        this._onTouchMove = (e) => {
            if (e.touches && e.touches[0]) {
                this.queuePaint(e.touches[0].clientX, e.touches[0].clientY);
            }
        };
        this._onTouchEnd = () => this.releaseAll();
        this.container.addEventListener('mousemove', this._onMove);
        this.container.addEventListener('mouseleave', this._onLeave);
        this.container.addEventListener('touchmove', this._onTouchMove, { passive: true });
        this.container.addEventListener('touchend', this._onTouchEnd);

        let resizeTimer = null;
        this._onResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.populate();
                this.reset();
            }, 200);
        };
        window.addEventListener('resize', this._onResize);

        if (typeof IntersectionObserver !== 'undefined') {
            this._observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    this.visible = entry.isIntersecting;
                    if (!this.visible) {
                        this.releaseAll();
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
        this.build();
        this.bindEvents();
        return true;
    }

    destroy() {
        this.cancelPending();
        this.clearTimers();
        if (this._observer) {
            try { this._observer.disconnect(); } catch (_e) {}
            this._observer = null;
        }
        if (this._onResize) {
            try { window.removeEventListener('resize', this._onResize); } catch (_e) {}
        }
        if (this.container) {
            try {
                if (this._onMove) this.container.removeEventListener('mousemove', this._onMove);
                if (this._onLeave) this.container.removeEventListener('mouseleave', this._onLeave);
                if (this._onTouchMove) this.container.removeEventListener('touchmove', this._onTouchMove);
                if (this._onTouchEnd) this.container.removeEventListener('touchend', this._onTouchEnd);
            } catch (_e) {}
        }
        if (this.wrapEl && this.wrapEl.parentNode) {
            this.wrapEl.parentNode.removeChild(this.wrapEl);
        }
        this.wrapEl = null;
        this.gridEl = null;
        this.cells = [];
        this.litCells = new Set();
    }
}
