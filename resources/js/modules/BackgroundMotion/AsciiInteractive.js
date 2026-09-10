import { smoothstep, isEditMode, applyEdgeMask } from './shared';

const SIMPLE_CHARS = ['.', '-', ':'];
const FULL_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*_+-=|;:,.?/~`'.split('');

const MAX_CELLS = 2500;

function pickSimple() {
    return SIMPLE_CHARS[Math.floor(Math.random() * SIMPLE_CHARS.length)];
}

function pickHover(full) {
    if (!full) {
        return pickSimple();
    }
    // Bias toward symbols near the cursor core is handled by probability in update().
    return Math.random() < 0.5
        ? FULL_CHARS[Math.floor(Math.random() * FULL_CHARS.length)]
        : pickSimple();
}

/**
 * ASCII — ambient character grid with cursor glow.
 * Emje Motion original (transparent-mask implementation so it melts
 * into any Container background color/image; grid fills the Container).
 */
export default class AsciiInteractive {
    constructor(container, config) {
        this.container = container;
        this.config = {
            color: config.color ?? '#3B82F6',
            charset: config.charset === 'simple' ? 'simple' : 'full',
            cellW: Math.max(8, Math.min(60, parseFloat(config.cellW) || 22)),
            cellH: Math.max(8, Math.min(60, parseFloat(config.cellH) || 26)),
            fontSize: Math.max(6, Math.min(32, parseFloat(config.fontSize) || 14)),
            radius: Math.max(100, Math.min(600, parseFloat(config.radius) || 360)),
            innerRadius: Math.max(0, Math.min(200, parseFloat(config.innerRadius) || 30)),
            maxOpacity: Math.max(0, Math.min(1, parseFloat(config.maxOpacity ?? 0.35) || 0)),
            fade: Math.max(0, Math.min(30, parseFloat(config.fade ?? 10) || 0)),
            livePreview: config.livePreview ?? false,
            disableOnMobile: config.disableOnMobile ?? true,
        };
        // maxOpacity 0 is valid (invisible) — restore it since `|| 0` above
        // collapses to the fallback path for NaN only.
        if (parseFloat(config.maxOpacity) === 0) {
            this.config.maxOpacity = 0;
        }

        this.wrapEl = null;
        this.gridEl = null;
        this.cells = [];
        this.cols = 0;
        this.rows = 0;
        this.visible = true;
        this.twinkleTimer = null;
        this.twinkleTimeouts = [];
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
        this.wrapEl.className = 'emje-ascii';
        this.wrapEl.setAttribute('aria-hidden', 'true');

        this.gridEl = document.createElement('div');
        this.gridEl.className = 'emje-ascii__grid';
        this.gridEl.style.height = '100%';
        this.wrapEl.appendChild(this.gridEl);

        // Layer runs behind Elementor content but above the native background.
        this.container.insertBefore(this.wrapEl, this.container.firstChild);
        this.container.classList.add('emje-background-motion');

        applyEdgeMask(this.gridEl, this.config.fade);
        this.populate();
    }

    populate() {
        if (!this.gridEl) {
            return;
        }
        let { cellW, cellH } = this.config;
        const width = this.container.offsetWidth || this.container.clientWidth || window.innerWidth;
        const height = this.container.offsetHeight || this.container.clientHeight || 400;

        let cols = Math.max(1, Math.ceil(width / cellW));
        let rows = Math.max(1, Math.ceil(height / cellH));

        // Perf guard: scale cells up when the grid would be too dense.
        if (cols * rows > MAX_CELLS) {
            const scale = Math.sqrt((cols * rows) / MAX_CELLS);
            cellW *= scale;
            cellH *= scale;
            cols = Math.max(1, Math.ceil(width / cellW));
            rows = Math.max(1, Math.ceil(height / cellH));
        }

        this.cols = cols;
        this.rows = rows;
        this.gridEl.style.gridTemplateColumns = `repeat(${cols}, ${cellW}px)`;
        this.gridEl.style.gridTemplateRows = `repeat(${rows}, ${cellH}px)`;
        this.gridEl.innerHTML = '';
        this.cells = [];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = document.createElement('div');
                cell.className = 'emje-ascii__cell';
                cell.style.fontSize = `${this.config.fontSize}px`;
                cell.style.color = this.config.color;
                cell.textContent = pickSimple();
                this.gridEl.appendChild(cell);
                this.cells.push({
                    el: cell,
                    // Center in grid coordinates; refreshed on mousemove via rect.
                    col: c,
                    row: r,
                });
            }
        }
        this._cellW = cellW;
        this._cellH = cellH;
    }

    update(clientX, clientY) {
        if (!this.gridEl || !this.visible) {
            return;
        }
        const rect = this.gridEl.getBoundingClientRect();
        const relX = clientX - rect.left;
        const relY = clientY - rect.top;
        const { radius, innerRadius, maxOpacity } = this.config;
        const full = this.config.charset === 'full';
        const cellW = this._cellW || this.config.cellW;
        const cellH = this._cellH || this.config.cellH;

        for (let i = 0; i < this.cells.length; i++) {
            const cell = this.cells[i];
            const cx = (cell.col + 0.5) * cellW;
            const cy = (cell.row + 0.5) * cellH;
            const dist = Math.sqrt((cx - relX) ** 2 + (cy - relY) ** 2);
            if (dist >= radius) {
                if (cell.el.style.opacity !== '0') {
                    cell.el.style.opacity = '0';
                }
                continue;
            }
            const glow = 1 - smoothstep(innerRadius, radius, dist);
            cell.el.style.opacity = String(glow * maxOpacity);
            const heat = 1 - smoothstep(0, Math.min(216, radius * 0.6), dist);
            if (Math.random() < 0.04 + 0.55 * heat) {
                cell.el.textContent = pickHover(full);
            }
        }
    }

    reset() {
        for (let i = 0; i < this.cells.length; i++) {
            this.cells[i].el.style.opacity = '0';
        }
    }

    startTwinkle() {
        this.stopTwinkle();
        this.twinkleTimer = setInterval(() => {
            if (document.hidden || !this.visible || !this.cells.length) {
                return;
            }
            const count = Math.max(1, Math.floor(this.cells.length * 0.015));
            for (let i = 0; i < count; i++) {
                const cell = this.cells[Math.floor(Math.random() * this.cells.length)];
                if (!cell) {
                    continue;
                }
                cell.el.style.opacity = (0.02 + Math.random() * 0.05).toFixed(3);
                cell.el.textContent = pickSimple();
                const t = setTimeout(() => {
                    if (cell.el.style.opacity !== '0') {
                        cell.el.style.opacity = '0';
                    }
                }, 600 + Math.random() * 2000);
                this.twinkleTimeouts.push(t);
            }
        }, 120);
    }

    stopTwinkle() {
        if (this.twinkleTimer) {
            clearInterval(this.twinkleTimer);
            this.twinkleTimer = null;
        }
        this.twinkleTimeouts.forEach((t) => clearTimeout(t));
        this.twinkleTimeouts = [];
    }

    bindEvents() {
        this._onMove = (e) => this.update(e.clientX, e.clientY);
        this._onLeave = () => this.reset();
        this._onTouchMove = (e) => {
            if (e.touches && e.touches[0]) {
                this.update(e.touches[0].clientX, e.touches[0].clientY);
            }
        };
        this._onTouchEnd = () => this.reset();
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
                        this.reset();
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
        this.startTwinkle();
        return true;
    }

    destroy() {
        this.stopTwinkle();
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
    }
}
