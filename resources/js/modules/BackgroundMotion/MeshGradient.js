import { isEditMode, applyEdgeMask, LIMITS, clampNum, toNumber, DEFAULT_COLORS, LEGACY_PRESETS, resolveCssVar, debugLog } from './shared.js';
import { MOTIONS, QUALITY_SCALE, parseCssColor, resolveColors, resolveMotion, rgbToCss } from './meshColor.js';
import { VERT_SRC, FRAG_SRC, compileShader, linkProgram } from './meshShader.js';

export { DEFAULT_COLORS, LEGACY_PRESETS, resolveCssVar };
export { MOTIONS, QUALITY_SCALE, parseCssColor } from './meshColor.js';

function meshDebug() {
    // Opt-in tracing for the editor blank-preview diagnostic: run
    // `window._emjeBgDebug = true` in the console, then reproduce.
    var w = (typeof window !== 'undefined') ? window : null;
    var on = false;
    try {
        on = !!(w && (w._emjeBgDebug || (w.top && w.top._emjeBgDebug)));
    } catch (_e) {}
    debugLog(on, '[emje-mesh]', arguments);
}



/**
 * Mesh Gradient — animated WebGL mesh-gradient background.
 * Raw WebGL (no Three.js): four custom color lobes move according to
 * Motion Type (drift / swirl / pulse / flow) in a tiny fragment shader.
 * Ambient (no cursor needed), transparent alpha so the native Container
 * background can show through.
 */
export default class MeshGradient {
    constructor(container, config) {
        this.container = container;
        const cfg = config && typeof config === 'object' ? config : {};
        const ownerDoc = container && container.ownerDocument ? container.ownerDocument : null;
        const motionRaw = typeof cfg.motion === 'string' ? cfg.motion : 'drift';
        const qualityRaw = typeof cfg.quality === 'string' ? cfg.quality : 'balanced';
        this.config = {
            motion: resolveMotion(motionRaw),
            colors: resolveColors(cfg.colors, cfg.preset, ownerDoc, container),
            speed: clampNum(toNumber(cfg.speed ?? 2, 2), LIMITS.mesh.speed, 2),
            quality: QUALITY_SCALE[qualityRaw] ? qualityRaw : 'balanced',
            opacity: clampNum(toNumber(cfg.opacity ?? 1, 1), LIMITS.mesh.opacity, 1),
            fade: clampNum(toNumber(cfg.fade ?? 0, 0), LIMITS.mesh.fade, 0),
            livePreview: cfg.livePreview ?? false,
            disableOnMobile: cfg.disableOnMobile ?? false,
        };
        this._qualityScale = QUALITY_SCALE[this.config.quality] || QUALITY_SCALE.balanced;

        this.wrapEl = null;
        this.canvas = null;
        this.gl = null;
        this.program = null;
        this.locs = null;
        this.cssW = 0;
        this.cssH = 0;
        this.visible = true;
        this.running = false;
        this._raf = 0;
        this._animTime = 0;
        this._lastFrame = 0;
        this._slowFrames = 0;
        this._onResize = null;
        this._onVisibility = null;
        this._onContextLost = null;
        this._onContextRestored = null;
        this._observer = null;
    }

    shouldInit() {
        if (isEditMode()) {
            const ok = this.config.livePreview === true;
            if (!ok) {
                meshDebug('skip', { reason: 'edit-no-live' });
            }
            return ok;
        }
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            meshDebug('skip', { reason: 'reduced-motion' });
            return false;
        }
        if (this.config.disableOnMobile && (window.matchMedia('(hover: none)').matches
            || window.matchMedia('(pointer: coarse)').matches)) {
            meshDebug('skip', { reason: 'mobile' });
            return false;
        }
        return true;
    }

    cssFallback() {
        // Static gradient for the no-WebGL path only, built from the
        // resolved custom colors.
        try {
            const list = (Array.isArray(this.config.colors) && this.config.colors.length === 4)
                ? this.config.colors.map(rgbToCss)
                : DEFAULT_COLORS;
            if (this.wrapEl) {
                this.wrapEl.style.background = `linear-gradient(135deg, ${list[0]}, ${list[1]} 40%, ${list[2]} 70%, ${list[3]})`;
            }
        } catch (_e) {}
    }

    build() {
        // Idempotent apply: several bridge paths (element_ready hook,
        // debounced settings sync, verify-repair) can race a single
        // control change, and Elementor template re-renders replace the
        // node underneath us. Sweep stale wrappers first so one container
        // never accumulates orphan layers (blank stacking canvases).
        try {
            const stale = this.container.querySelectorAll(':scope > .emje-mesh');
            for (let i = 0; i < stale.length; i++) {
                if (stale[i].parentNode) {
                    stale[i].parentNode.removeChild(stale[i]);
                }
            }
        } catch (_e) {}
        this.wrapEl = document.createElement('div');
        this.wrapEl.className = 'emje-mesh';
        this.wrapEl.setAttribute('aria-hidden', 'true');

        this.canvas = document.createElement('canvas');
        this.canvas.className = 'emje-mesh__canvas';
        this.wrapEl.appendChild(this.canvas);

        this.container.insertBefore(this.wrapEl, this.container.firstChild);
        this.container.classList.add('emje-background-motion');

        applyEdgeMask(this.wrapEl, this.config.fade);
        this.resize();
    }

    initGL() {
        if (!this.canvas || typeof HTMLCanvasElement === 'undefined') {
            meshDebug('gl-fail', { stage: 'no-canvas' });
            return false;
        }
        let gl = null;
        try {
            gl = this.canvas.getContext('webgl', {
                alpha: true,
                antialias: false,
                depth: false,
                stencil: false,
                powerPreference: 'low-power',
            }) || this.canvas.getContext('experimental-webgl', { alpha: true, antialias: false, depth: false, stencil: false });
        } catch (_e) {
            gl = null;
        }
        if (!gl) {
            meshDebug('gl-fail', { stage: 'no-webgl' });
            return false;
        }
        const vs = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC);
        const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
        if (!vs || !fs) {
            return false;
        }
        const program = linkProgram(gl, vs, fs);
        if (!program) {
            return false;
        }
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(program, 'a_pos');
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND);
        this.gl = gl;
        this.program = program;
        this.locs = {
            res: gl.getUniformLocation(program, 'u_res'),
            time: gl.getUniformLocation(program, 'u_time'),
            c1: gl.getUniformLocation(program, 'u_c1'),
            c2: gl.getUniformLocation(program, 'u_c2'),
            c3: gl.getUniformLocation(program, 'u_c3'),
            c4: gl.getUniformLocation(program, 'u_c4'),
            opacity: gl.getUniformLocation(program, 'u_opacity'),
            motion: gl.getUniformLocation(program, 'u_motion'),
        };
        const [c1, c2, c3, c4] = this.config.colors;
        gl.uniform3f(this.locs.c1, c1[0], c1[1], c1[2]);
        gl.uniform3f(this.locs.c2, c2[0], c2[1], c2[2]);
        gl.uniform3f(this.locs.c3, c3[0], c3[1], c3[2]);
        gl.uniform3f(this.locs.c4, c4[0], c4[1], c4[2]);
        gl.uniform1f(this.locs.opacity, this.config.opacity);
        gl.uniform1f(this.locs.motion, MOTIONS[this.config.motion] ?? MOTIONS.drift);
        return true;
    }

    resize() {
        if (!this.canvas || !this.container) {
            return;
        }
        const w = this.container.clientWidth || this.container.offsetWidth || window.innerWidth;
        const h = this.container.clientHeight || this.container.offsetHeight || 400;
        this.cssW = Math.max(1, w);
        this.cssH = Math.max(1, h);
        const q = this._qualityScale || QUALITY_SCALE.balanced;
        this.canvas.width = Math.max(2, Math.round(this.cssW * q));
        this.canvas.height = Math.max(2, Math.round(this.cssH * q));
        this.canvas.style.width = `${this.cssW}px`;
        this.canvas.style.height = `${this.cssH}px`;
        if (this.gl) {
            try {
                this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            } catch (_e) {}
        }
    }

    draw() {
        const gl = this.gl;
        if (!gl || !this.locs) {
            return;
        }
        const time = this._animTime * (0.35 + this.config.speed);
        gl.uniform2f(this.locs.res, this.canvas.width, this.canvas.height);
        gl.uniform1f(this.locs.time, time);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    /**
     * Live-update Motion Type + colors on the running instance without
     * re-creating the WebGL context (editor color drags / motion switch).
     * Returns true when applied in place; false means the caller should
     * fall back to a full destroy + re-init.
     * @param {{motion?: string, colors?: string[]}} patch
     */
    updateLive(patch) {
        if (!patch || typeof patch !== 'object') {
            return false;
        }
        const ownerDoc = this.container && this.container.ownerDocument
            ? this.container.ownerDocument
            : null;
        if (typeof patch.motion === 'string') {
            this.config.motion = resolveMotion(patch.motion);
        }
        if (Array.isArray(patch.colors)) {
            this.config.colors = resolveColors(patch.colors, null, ownerDoc, this.container);
        }
        if (!this.gl || !this.locs) {
            // No GL (static-gradient fallback mode): repaint it.
            try {
                this.cssFallback();
            } catch (_e) {}
            meshDebug('updateLive', { mode: 'css-fallback', motion: this.config.motion });
            return true;
        }
        try {
            this.gl.uniform1f(this.locs.motion, MOTIONS[this.config.motion] ?? MOTIONS.drift);
            const cols = this.config.colors;
            const locs = [this.locs.c1, this.locs.c2, this.locs.c3, this.locs.c4];
            for (let i = 0; i < 4; i++) {
                this.gl.uniform3f(locs[i], cols[i][0], cols[i][1], cols[i][2]);
            }
        } catch (_e) {
            meshDebug('updateLive', { failed: true });
            return false;
        }
        if (this.config.speed <= 0 && this.visible) {
            try {
                this.draw();
            } catch (_e) {}
        }
        meshDebug('updateLive', { motion: this.config.motion });
        return true;
    }

    tick = (now) => {
        this._raf = 0;
        if (!this.running || !this.visible || document.hidden) {
            return;
        }
        // Orphaned loop (node replaced/removed by a template re-render):
        // stop instead of burning rAF + GL context on a detached canvas.
        if (this.container && this.container.isConnected === false) {
            this.running = false;
            this.visible = false;
            return;
        }
        if (this.config.speed <= 0) {
            // Frozen frame — no loop.
            this.running = false;
            return;
        }
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
            this.draw();
        } catch (_e) {}
        // Auto-degrade: sustained slow frames step the render scale down
        // (never below 0.4) so weak GPUs degrade gracefully.
        const cost = perfNow() - frameStart;
        if (cost > 24) {
            this._slowFrames += 1;
        } else if (cost < 14) {
            this._slowFrames = Math.max(0, this._slowFrames - 1);
        }
        if (this._slowFrames >= 20 && this._qualityScale > 0.4) {
            this._slowFrames = 0;
            this._qualityScale = Math.max(0.4, this._qualityScale * 0.8);
            this.resize();
            try {
                this.draw();
            } catch (_e) {}
        }
        this._raf = requestAnimationFrame(this.tick);
    };

    start() {
        if (this.running) {
            return;
        }
        this.running = true;
        this._lastFrame = 0;
        if (this.config.speed <= 0) {
            // Single static frame.
            try {
                this.draw();
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

    bindEvents() {
        let resizeTimer = null;
        this._onResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.resize();
                if (this.config.speed <= 0 && this.visible) {
                    try {
                        this.draw();
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
                    this.draw();
                } catch (_e) {}
            }
        };
        document.addEventListener('visibilitychange', this._onVisibility);

        // GPU context loss (tab switch, driver reset): stop cleanly and
        // rebuild when the context comes back.
        this._onContextLost = (e) => {
            try { e.preventDefault(); } catch (_e) {}
            this.stop();
            this.gl = null;
            this.program = null;
            this.locs = null;
        };
        this._onContextRestored = () => {
            if (this.initGL()) {
                this.resize();
                if (this.visible) {
                    this.start();
                }
            }
        };
        if (this.canvas) {
            this.canvas.addEventListener('webglcontextlost', this._onContextLost, false);
            this.canvas.addEventListener('webglcontextrestored', this._onContextRestored, false);
        }

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
        // Refuse a detached container (stale node after a template
        // re-render): building here would strand a layer the user never
        // sees while the visible node stays blank. The caller + verify
        // loop converge on the live node instead.
        if (this.container && this.container.isConnected === false) {
            meshDebug('init', { failed: true, reason: 'detached' });
            return false;
        }
        if (typeof HTMLCanvasElement === 'undefined') {
            meshDebug('init', { failed: true, reason: 'no-canvas-api' });
            return false;
        }
        this.build();
        if (!this.initGL()) {
            // No WebGL: static CSS gradient fallback instead of an empty
            // layer. Still counts as initialized. Only applied here (not
            // in build) so it never covers the native container
            // background when WebGL is working.
            this.cssFallback();
            meshDebug('init', { mode: 'css-fallback' });
            return true;
        }
        this.bindEvents();
        this.start();
        meshDebug('init', { motion: this.config.motion, quality: this.config.quality });
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
        if (this.canvas) {
            try {
                if (this._onContextLost) this.canvas.removeEventListener('webglcontextlost', this._onContextLost);
                if (this._onContextRestored) this.canvas.removeEventListener('webglcontextrestored', this._onContextRestored);
                const ext = this.gl ? this.gl.getExtension('WEBGL_lose_context') : null;
                if (ext) {
                    try { ext.loseContext(); } catch (_e) {}
                }
            } catch (_e) {}
        }
        if (this.wrapEl && this.wrapEl.parentNode) {
            this.wrapEl.parentNode.removeChild(this.wrapEl);
        }
        this.wrapEl = null;
        this.canvas = null;
        this.gl = null;
        this.program = null;
        this.locs = null;
    }
}
