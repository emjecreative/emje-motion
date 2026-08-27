import '../css/modules/text-motion.css';
import '../css/modules/smooth-scroll.css';
import '../css/modules/hover-reveal.css';
import '../css/modules/interactive-cursor.css';
import MotionEngine from './core/MotionEngine';
import LenisScroll from './modules/SmoothScroll/LenisScroll';
import HoverReveal from './modules/HoverReveal/HoverReveal';
import InteractiveCursor from './modules/InteractiveCursor/InteractiveCursor';

/**
 * Bootstrap Emje Motion.
 */
function bootstrapSmoothScroll() {
    const config = window.EmjeMotionSmoothScrollConfig || null;

    if (!config) {
        return;
    }

    const scroller = new LenisScroll(config);
    scroller.init();
}

function bootstrapEmjeMotion() {

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    const engine = new MotionEngine();

    engine.init();

}

function bootstrapHoverReveal() {
    HoverReveal.initAll();
}

function bootstrapInteractiveCursor() {
    InteractiveCursor.initAll();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        bootstrapSmoothScroll();
        bootstrapEmjeMotion();
        bootstrapHoverReveal();
        bootstrapInteractiveCursor();
    });
} else {
    bootstrapSmoothScroll();
    bootstrapEmjeMotion();
    bootstrapHoverReveal();
    bootstrapInteractiveCursor();
}

// Also bootstrap on Elementor frontend init for editor/preview.
if (typeof window.elementorFrontend !== 'undefined') {
    window.addEventListener('elementor/frontend/init', bootstrapEmjeMotion);
} else {
    window.addEventListener('elementor/frontend/init', bootstrapEmjeMotion);
}
