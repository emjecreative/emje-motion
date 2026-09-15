/**
 * Mesh Gradient GLSL sources + program helpers (operate on a GL context only).
 */
import { debugLog } from '../../core/env.js';

// Same opt-in flag as the main module (window._emjeBgDebug).
function traceEnabled() {
    try {
        const w = (typeof window !== 'undefined') ? window : null;
        return !!(w && (w._emjeBgDebug || (w.top && w.top._emjeBgDebug)));
    } catch (_e) {
        return false;
    }
}

export const VERT_SRC = `
attribute vec2 a_pos;
void main() {
    gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;
export const FRAG_SRC = `
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
export function compileShader(gl, type, src) {
    const shader = gl.createShader(type);
    if (!shader) {
        debugLog(traceEnabled(), '[emje-mesh]', ['gl-fail', { stage: 'create-shader' }]);
        return null;
    }
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        debugLog(traceEnabled(), '[emje-mesh]', ['gl-fail', { stage: 'compile', shader: type === gl.VERTEX_SHADER ? 'vert' : 'frag' }]);
        try { gl.deleteShader(shader); } catch (_e) {}
        return null;
    }
    return shader;
}

export function linkProgram(gl, vs, fs) {
    const program = gl.createProgram();
    if (!program) {
        debugLog(traceEnabled(), '[emje-mesh]', ['gl-fail', { stage: 'create-program' }]);
        return null;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        debugLog(traceEnabled(), '[emje-mesh]', ['gl-fail', { stage: 'link' }]);
        return null;
    }
    gl.useProgram(program);
    return program;
}
