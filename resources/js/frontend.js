import '../css/modules/text-motion.css';
import '../css/modules/smooth-scroll.css';
import '../css/modules/hover-reveal.css';
import '../css/modules/interactive-cursor.css';
import '../css/modules/background-motion.css';
import MotionEngine from './core/MotionEngine';
import LenisScroll from './modules/SmoothScroll/LenisScroll';
import HoverReveal from './modules/HoverReveal/HoverReveal';
import InteractiveCursor from './modules/InteractiveCursor/InteractiveCursor';
import BackgroundMotion from './modules/BackgroundMotion/BackgroundMotion';

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

    if (window._emjeSmoothScrollBooted) {
        return;
    }
    window._emjeSmoothScrollBooted = true;

    const scroller = new LenisScroll(config);
    scroller.init();
}

function bootstrapEmjeMotion() {
    if (window._emjeFrontendBooted) {
        return;
    }
    window._emjeFrontendBooted = true;
    const engine = getEngine();
    engine.init();
}

function bootstrapHoverReveal() {
    HoverReveal.initAll();
}

function bootstrapInteractiveCursor() {
    InteractiveCursor.initAll();
}

function bootstrapBackgroundMotion() {
    BackgroundMotion.initAll();
}

function bootstrapAll() {
    bootstrapSmoothScroll();
    bootstrapEmjeMotion();
    bootstrapHoverReveal();
    bootstrapInteractiveCursor();
    bootstrapBackgroundMotion();
}

function handleNode(node) {
    if (!(node instanceof HTMLElement)) {
        return;
    }
    // Text Motion — engine.initElement aman dipanggil ulang (guard flag).
    if (node.matches && node.matches('[data-emje-motion]')) {
        getEngine().initElement(node);
    }
    if (node.querySelectorAll) {
        node.querySelectorAll('[data-emje-motion]').forEach(function(e) { getEngine().initElement(e); });
    }
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
    if (node.matches && node.matches('[data-emje-background]')) {
        BackgroundMotion.reInit(node);
    }
    if (node.querySelectorAll) {
        node.querySelectorAll('[data-emje-background]').forEach(function(e) { BackgroundMotion.reInit(e); });
    }
}

// Perubahan atribut config (misal ditulis ulang oleh bridge preview):
// refresh hanya yang konfigurasinya benar-benar berubah.
function handleAttributeChange(node) {
    if (!(node instanceof HTMLElement)) {
        return;
    }
    if (node.hasAttribute('data-emje-motion')) {
        getEngine().refreshIfChanged(node);
    }
    if (node.hasAttribute('data-emje-hover-reveal') && window.EmjeMotionHoverReveal) {
        window.EmjeMotionHoverReveal.reInit(node);
    }
    if (node.hasAttribute('data-emje-cursor') && window.EmjeMotionCursor) {
        window.EmjeMotionCursor.reInit(node);
    }
    if (node.hasAttribute('data-emje-background') && window.EmjeMotionBackground) {
        window.EmjeMotionBackground.reInit(node);
    }
}

function hookElementorFrontend() {
    if (typeof window.elementorFrontend === 'undefined' || !window.elementorFrontend.hooks) {
        return;
    }
    var unwrap = function($el) {
        var el = (typeof jQuery !== 'undefined' && $el instanceof jQuery) ? $el[0] : $el;
        return el || null;
    };
    // Ensure container added via Elementor AJAX/preview is handled
    window.elementorFrontend.hooks.addAction('frontend/element_ready/container', function($el) {
        var el = unwrap($el);
        if (!el) return;
        handleNode(el);
    });
    // Text Motion widgets — didelegasikan ke engine (satu-satunya hook).
    var motionHandler = function($el) {
        var el = unwrap($el);
        if (!el || !el.matches) return;
        if (el.matches('[data-emje-motion]')) getEngine().initElement(el);
        if (el.querySelectorAll) {
            el.querySelectorAll('[data-emje-motion]').forEach(function(child) { getEngine().initElement(child); });
        }
    };
    window.elementorFrontend.hooks.addAction('frontend/element_ready/heading', motionHandler);
    window.elementorFrontend.hooks.addAction('frontend/element_ready/text-editor', motionHandler);
    window.elementorFrontend.hooks.addAction('frontend/element_ready/global', function() { bootstrapAll(); });
}

function observeNewElements() {
    if (typeof MutationObserver === 'undefined' || !document.body) {
        return;
    }
    if (window._emjeFrontendObserver) {
        return;
    }
    // Satu-satunya observer: elemen baru + perubahan atribut config.
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(m) {
            if (m.type === 'childList') {
                m.addedNodes.forEach(function(node) {
                    handleNode(node);
                });
            } else if (m.type === 'attributes') {
                handleAttributeChange(m.target);
            }
        });
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-emje-motion', 'data-emje-hover-reveal', 'data-emje-cursor', 'data-emje-background'],
    });
    window._emjeFrontendObserver = observer;
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
    window.EmjeMotionBackground = BackgroundMotion;
}
