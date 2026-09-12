import { isEditMode, applyEdgeMask, LIMITS, clampNum, toNumber, DEFAULT_COLORS, LEGACY_PRESETS, resolveCssVar } from './shared.js';

export { DEFAULT_COLORS, LEGACY_PRESETS, resolveCssVar };

function meshDebug() {
    // Opt-in tracing for the editor blank-preview diagnostic: run
    // `window._emjeBgDebug = true` in the console, then reproduce.
    // Zero overhead when off; never logs per-frame.
    try {
        var w = (typeof window !== 'undefined') ? window : null;
        if (!w) {
            return;
        }
        var on = w._emjeBgDebug || (w.top && w.top._emjeBgDebug);
        if (!on) {
            return;
        }
        var args = Array.prototype.slice.call(arguments);
        args.unshift('[emje-mesh]');
        if (w.console && w.console.log) {
            w.console.log.apply(w.console, args);
        }
    } catch (_e) {}
}

// Motion Type → shader branch index for `u_motion`.
export const MOTIONS = {
    drift: 0,
    swirl: 1,
    pulse: 2,
    flow: 3,
};

// Render resolution per quality setting (fraction of container size).
export const QUALITY_SCALE = {
    low: 0.5,
    balanced: 0.75,
    high: 1.0,
};

const VERT_SRC = `
attribute vec2 a_pos;
void main() {
    gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG_SRC = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 u_res;
uniform float u_time;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform vec3 u_c3;
uniform vec3 u_c4;
uniform float u_opacity;
uniform float u_motion;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_res;
    float aspect = u_res.x / u_res.y;
    vec2 p = vec2(uv.x * aspect, uv.y);
    float t = u_time;
    float ax = 0.5 * aspect;
    vec2 q1;
    vec2 q2;
    vec2 q3;
    vec2 q4;
    // Per-lobe weight modulation (Pulse mode breathes through these).
    float wm1 = 1.0;
    float wm2 = 1.0;
    float wm3 = 1.0;
    float wm4 = 1.0;
    if (u_motion < 0.5) {
        // Drift: domain warp (two strong octaves) so the mesh folds into
        // deep marbled curves, four lobes on slow Lissajous paths.
        p += 0.45 * vec2(sin(p.y * 4.0 + t * 0.22) + 0.6 * sin(p.y * 8.0 - t * 0.14),
                         cos(p.x * 4.0 - t * 0.19) + 0.6 * cos(p.x * 8.0 + t * 0.12));
        q1 = vec2(ax + 0.32 * aspect * sin(t * 0.23), 0.5 + 0.32 * cos(t * 0.19 + 1.7));
        q2 = vec2(ax + 0.34 * aspect * cos(t * 0.16 + 4.2), 0.5 + 0.30 * sin(t * 0.25 + 0.6));
        q3 = vec2(ax + 0.30 * aspect * sin(t * 0.13 + 2.1), 0.5 + 0.34 * cos(t * 0.21 + 3.3));
        q4 = vec2(ax + 0.33 * aspect * cos(t * 0.18 + 5.4), 0.5 + 0.31 * sin(t * 0.15 + 2.6));
    } else if (u_motion < 1.5) {
        // Swirl: rotate the domain around the center, lobes orbit in
        // phase quadrature for a vortex feel.
        float ang = t * 0.18;
        float ca = cos(ang);
        float sa = sin(ang);
        vec2 pc = p - vec2(ax, 0.5);
        pc = mat2(ca, -sa, sa, ca) * pc;
        p = vec2(ax, 0.5) + pc
            + 0.25 * vec2(sin(p.y * 5.0 + t * 0.30), cos(p.x * 5.0 - t * 0.26));
        q1 = vec2(ax + 0.32 * aspect * cos(t * 0.22), 0.5 + 0.32 * sin(t * 0.22));
        q2 = vec2(ax + 0.34 * aspect * cos(t * 0.19 + 1.57), 0.5 + 0.30 * sin(t * 0.19 + 1.57));
        q3 = vec2(ax + 0.30 * aspect * cos(t * 0.16 + 3.14), 0.5 + 0.34 * sin(t * 0.16 + 3.14));
        q4 = vec2(ax + 0.33 * aspect * cos(t * 0.18 + 4.71), 0.5 + 0.31 * sin(t * 0.18 + 4.71));
    } else if (u_motion < 2.5) {
        // Pulse: lobes sit near the corners, gentle warp, weights breathe
        // in sequence so colors swell in place instead of traveling.
        p += 0.18 * vec2(sin(p.y * 3.0 + t * 0.15), cos(p.x * 3.0 - t * 0.13));
        q1 = vec2(ax - 0.22 * aspect, 0.72);
        q2 = vec2(ax + 0.22 * aspect, 0.72);
        q3 = vec2(ax - 0.22 * aspect, 0.28);
        q4 = vec2(ax + 0.22 * aspect, 0.28);
        wm1 = 0.65 + 0.35 * sin(t * 0.70);
        wm2 = 0.65 + 0.35 * sin(t * 0.70 + 1.57);
        wm3 = 0.65 + 0.35 * sin(t * 0.70 + 3.14);
        wm4 = 0.65 + 0.35 * sin(t * 0.70 + 4.71);
    } else {
        // Flow: traveling diagonal bands, lobes slide along one diagonal
        // axis with a slight perpendicular wobble.
        p += vec2(0.14 * sin(p.y * 6.0 - t * 0.50), 0.14 * cos(p.x * 4.0 - t * 0.40));
        vec2 axis = vec2(0.35 * aspect, 0.21);
        vec2 perp = vec2(-0.06 * aspect, 0.06);
        q1 = vec2(ax, 0.5) + axis * sin(t * 0.30) + perp * cos(t * 0.23);
        q2 = vec2(ax, 0.5) + axis * sin(t * 0.26 + 1.57) + perp * cos(t * 0.21 + 1.57);
        q3 = vec2(ax, 0.5) + axis * sin(t * 0.24 + 3.14) + perp * cos(t * 0.19 + 3.14);
        q4 = vec2(ax, 0.5) + axis * sin(t * 0.28 + 4.71) + perp * cos(t * 0.22 + 4.71);
    }
    vec2 d1 = p - q1;
    vec2 d2 = p - q2;
    vec2 d3 = p - q3;
    vec2 d4 = p - q4;
    // Wide lobes: heavy overlap for smooth transitions, no hard edges.
    float w1 = exp(-dot(d1, d1) * 2.0) * wm1;
    float w2 = exp(-dot(d2, d2) * 2.0) * wm2;
    float w3 = exp(-dot(d3, d3) * 1.6) * wm3;
    float w4 = exp(-dot(d4, d4) * 1.8) * wm4;
    // Normalized mix, no dark base: every pixel blends all four colors,
    // full-bleed across the whole canvas.
    float tot = w1 + w2 + w3 + w4 + 1e-4;
    vec3 col = (w1 * u_c1 + w2 * u_c2 + w3 * u_c3 + w4 * u_c4) / tot;
    // Sliding grain kills gradient banding without a visible pattern.
    col += (hash(gl_FragCoord.xy + vec2(t * 13.0, t * 7.0)) - 0.5) * 0.03;
    // Premultiplied output: with blending disabled the buffer is
    // premultiplied-alpha, so rgb must be scaled too — otherwise
    // opacity 0 would still show full color.
    gl_FragColor = vec4(col * u_opacity, u_opacity);
}
`;

/**
 * Parse a CSS color into [r, g, b] 0-1. Supports #RGB, #RRGGBB,
 * #RRGGBBAA (alpha ignored — opacity has its own control),
 * rgb()/rgba() (numeric or % channels), and hsl()/hsla().
 * Returns null when unparseable.
 */
export function parseCssColor(color) {
    if (typeof color !== 'string') {
        return null;
    }
    const c = color.trim().toLowerCase();
    let m = c.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/);
    if (m) {
        let hex = m[1];
        if (hex.length === 3) {
            hex = hex.split('').map((ch) => ch + ch).join('');
        }
        return [
            parseInt(hex.slice(0, 2), 16) / 255,
            parseInt(hex.slice(2, 4), 16) / 255,
            parseInt(hex.slice(4, 6), 16) / 255,
        ];
    }
    m = c.match(/^rgba?\(\s*([0-9.%]+)\s*,\s*([0-9.%]+)\s*,\s*([0-9.%]+)/);
    if (m) {
        const conv = (v) => (v.indexOf('%') !== -1
            ? parseFloat(v) / 100
            : parseFloat(v) / 255);
        const parts = [m[1], m[2], m[3]].map(conv);
        if (parts.every((v) => !Number.isNaN(v))) {
            return [Math.min(1, Math.max(0, parts[0])), Math.min(1, Math.max(0, parts[1])), Math.min(1, Math.max(0, parts[2]))];
        }
    }
    m = c.match(/^hsla?\(\s*([0-9.+-]+)\s*,\s*([0-9.]+)%\s*,\s*([0-9.]+)%/);
    if (m) {
        const h = parseFloat(m[1]);
        const s = parseFloat(m[2]) / 100;
        const l = parseFloat(m[3]) / 100;
        if (!Number.isNaN(h) && !Number.isNaN(s) && !Number.isNaN(l)) {
            return hslToRgb(h, s, l);
        }
    }
    return null;
}

function hslToRgb(h, s, l) {
    const hh = (((h % 360) + 360) % 360) / 360;
    const ss = Math.min(1, Math.max(0, s));
    const ll = Math.min(1, Math.max(0, l));
    if (ss === 0) {
        return [ll, ll, ll];
    }
    const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss;
    const p = 2 * ll - q;
    const tc = (t) => {
        let tt = t;
        if (tt < 0) tt += 1;
        if (tt > 1) tt -= 1;
        if (tt < 1 / 6) return p + (q - p) * 6 * tt;
        if (tt < 1 / 2) return q;
        if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
        return p;
    };
    return [tc(hh + 1 / 3), tc(hh), tc(hh - 1 / 3)];
}

function resolveColors(customColors, legacyPreset, doc, el) {
    const legacy = (typeof legacyPreset === 'string' && LEGACY_PRESETS[legacyPreset])
        ? LEGACY_PRESETS[legacyPreset]
        : null;
    return DEFAULT_COLORS.map((fallback, i) => {
        let raw = Array.isArray(customColors) ? customColors[i] : null;
        if (typeof raw === 'string') {
            const resolved = resolveCssVar(raw, doc, el);
            if (resolved !== null) {
                raw = resolved;
            }
        }
        const fromCustom = parseCssColor(raw);
        if (fromCustom) {
            return fromCustom;
        }
        if (legacy) {
            const fromLegacy = parseCssColor(legacy[i]);
            if (fromLegacy) {
                return fromLegacy;
            }
        }
        return parseCssColor(fallback);
    });
}

function resolveMotion(motion) {
    return (typeof motion === 'string' && MOTIONS[motion] !== undefined) ? motion : 'drift';
}

function rgbToCss(rgb) {
    const ch = (v) => Math.max(0, Math.min(255, Math.round(v * 255)));
    return `rgb(${ch(rgb[0])}, ${ch(rgb[1])}, ${ch(rgb[2])})`;
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

    compile(gl, type, src) {
        const shader = gl.createShader(type);
        if (!shader) {
            meshDebug('gl-fail', { stage: 'create-shader' });
            return null;
        }
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            meshDebug('gl-fail', { stage: 'compile', shader: type === gl.VERTEX_SHADER ? 'vert' : 'frag' });
            try { gl.deleteShader(shader); } catch (_e) {}
            return null;
        }
        return shader;
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
        const vs = this.compile(gl, gl.VERTEX_SHADER, VERT_SRC);
        const fs = this.compile(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
        if (!vs || !fs) {
            return false;
        }
        const program = gl.createProgram();
        if (!program) {
            meshDebug('gl-fail', { stage: 'create-program' });
            return false;
        }
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            meshDebug('gl-fail', { stage: 'link' });
            return false;
        }
        gl.useProgram(program);
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
