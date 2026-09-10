/**
 * Editor bridge for Emje Motion live preview.
 * Loaded in Elementor editor top frame via elementor/editor/before_enqueue_scripts.
 * Thin entry — bridge modules live in ./editor-bridge/.
 */
import { initBackgroundBridge } from './editor-bridge/backgroundBridge.js';
import { initInteractionBridge } from './editor-bridge/interactionBridge.js';
import { initEditorChrome } from './editor-bridge/tooltip.js';
import { initPreviewSync } from './editor-bridge/previewSync.js';

(function() {
    'use strict';

    if (typeof window.elementor === 'undefined' || typeof window.jQuery === 'undefined') {
        return;
    }

    function initBridge() {
        if (window._emjeEditorBridged) {
            return;
        }
        window._emjeEditorBridged = true;
        initInteractionBridge();
        initBackgroundBridge();
        initPreviewSync();
        initEditorChrome();
    }

    if (window.elementor && window.elementor.channels && window.elementor.channels.editor) {
        initBridge();
    }
    if (window.jQuery) {
        window.jQuery(window).on('elementor:init', initBridge);
    } else {
        window.addEventListener('elementor:init', initBridge);
    }
})();
