import '../css/modules/text-motion.css';
import '../css/modules/smooth-scroll.css';
import '../css/modules/hover-reveal.css';
import '../css/modules/interactive-cursor.css';
import MotionEngine from './core/MotionEngine';
import LenisScroll from './modules/SmoothScroll/LenisScroll';
import HoverReveal from './modules/HoverReveal/HoverReveal';
import InteractiveCursor from './modules/InteractiveCursor/InteractiveCursor';

/**
 * Singleton engine instance.
 */
let _engineInstance = null;

function getEngine() {
    if (!_engineInstance) {
        _engineInstance = new MotionEngine();
    }
    return _engineInstance;
}

function bootstrapSmoothScroll() {
    const config = window.EmjeMotionSmoothScrollConfig || null;

    if (!config) {
        return;
    }

    const scroller = new LenisScroll(config);
    scroller.init();
}

function bootstrapEmjeMotion() {
    const engine = getEngine();
    // Prevent double init: MotionEngine.init is idempotent via hook + observer
    if (engine._bootstrapped) {
        return;
    }
    engine._bootstrapped = true;
    engine.init();
}

function bootstrapHoverReveal() {
    HoverReveal.initAll();
}

function bootstrapInteractiveCursor() {
    InteractiveCursor.initAll();
}

function bootstrapAll() {
    bootstrapSmoothScroll();
    bootstrapEmjeMotion();
    bootstrapHoverReveal();
    bootstrapInteractiveCursor();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapAll);
} else {
    bootstrapAll();
}

// Elementor frontend init — use proper hook, bootstrap all modules (Opsi B: Hover/Cursor also live in editor)
function onElementorFrontendInit() {
    bootstrapAll();
}

if (typeof window.elementorFrontend !== 'undefined' && window.elementorFrontend.hooks) {
    // If already initialized, hook directly
    window.elementorFrontend.hooks.addAction('frontend/element_ready/global', () => bootstrapAll());
} else {
    window.addEventListener('elementor/frontend/init', onElementorFrontendInit);
}

// Expose for editor bridge debugging
if (typeof window !== 'undefined') {
    window.EmjeMotion = window.EmjeMotion || {};
    window.EmjeMotion.getEngine = getEngine;
    window.EmjeMotionHoverReveal = HoverReveal;
    window.EmjeMotionCursor = InteractiveCursor;
}
