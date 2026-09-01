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

function hookElementorFrontend() {
    if (typeof window.elementorFrontend === 'undefined' || !window.elementorFrontend.hooks) {
        return;
    }
    // Ensure container added via Elementor AJAX/preview is handled
    window.elementorFrontend.hooks.addAction('frontend/element_ready/container', function($el) {
        var el = (typeof jQuery !== 'undefined' && $el instanceof jQuery) ? $el[0] : $el;
        if (!el) return;
        if (el.matches && el.matches('[data-emje-hover-reveal]')) {
            HoverReveal.reInit(el);
        }
        if (el.querySelectorAll) {
            el.querySelectorAll('[data-emje-hover-reveal]').forEach(function(e) { HoverReveal.reInit(e); });
        }
        if (el.matches && el.matches('[data-emje-cursor]')) {
            InteractiveCursor.reInit(el);
        }
        if (el.querySelectorAll) {
            el.querySelectorAll('[data-emje-cursor]').forEach(function(e) { InteractiveCursor.reInit(e); });
        }
    });
    window.elementorFrontend.hooks.addAction('frontend/element_ready/global', function() { bootstrapAll(); });
}

function observeNewElements() {
    if (typeof MutationObserver === 'undefined' || !document.body) {
        return;
    }
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(m) {
            m.addedNodes.forEach(function(node) {
                if (!(node instanceof HTMLElement)) return;
                if (node.matches && node.matches('[data-emje-hover-reveal]')) {
                    HoverReveal.reInit(node);
                }
                if (node.querySelectorAll) {
                    node.querySelectorAll('[data-emje-hover-reveal]').forEach(function(e) { HoverReveal.reInit(e); });
                }
                if (node.matches && node.matches('[data-emje-cursor]')) {
                    InteractiveCursor.reInit(node);
                }
                if (node.querySelectorAll) {
                    node.querySelectorAll('[data-emje-cursor]').forEach(function(e) { InteractiveCursor.reInit(e); });
                }
            });
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        bootstrapAll();
        observeNewElements();
        hookElementorFrontend();
    });
} else {
    bootstrapAll();
    observeNewElements();
    hookElementorFrontend();
}

// Elementor frontend init — ensure hooks are registered even if frontend.js loads before elementorFrontend
function onElementorFrontendInit() {
    bootstrapAll();
    observeNewElements();
    hookElementorFrontend();
}

if (typeof window.elementorFrontend !== 'undefined' && window.elementorFrontend.hooks) {
    hookElementorFrontend();
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
