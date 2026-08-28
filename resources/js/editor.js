/**
 * Editor bridge for Emje Motion live preview.
 * Loaded in Elementor editor top frame via elementor/editor/before_enqueue_scripts.
 */
(function() {
    'use strict';

    if (typeof window.elementor === 'undefined' || typeof window.jQuery === 'undefined') {
        return;
    }

    var $ = window.jQuery;

    function getPreviewWindow() {
        var iframe = document.getElementById('elementor-preview-iframe');
        return iframe && iframe.contentWindow ? iframe.contentWindow : null;
    }

    function getPreviewDocument() {
        var win = getPreviewWindow();
        return win ? win.document : null;
    }

    function findTarget(previewDoc, widgetId, attr) {
        if (!previewDoc) return null;
        if (widgetId) {
            var container = previewDoc.querySelector('[data-id="' + widgetId + '"]');
            if (container) {
                var inner = container.querySelector('[' + attr + ']');
                if (inner) return inner;
                if (container.hasAttribute(attr)) return container;
                var wrapper = container.querySelector('.elementor-widget-container');
                if (wrapper) {
                    var wInner = wrapper.querySelector('[' + attr + ']');
                    if (wInner) return wInner;
                }
                var deep = container.querySelector('*[' + attr + ']');
                if (deep) return deep;
                return container;
            }
            var byClass = previewDoc.querySelector('.elementor-element-' + widgetId + ' [' + attr + ']');
            if (byClass) return byClass;
            var byClassSelf = previewDoc.querySelector('.elementor-element-' + widgetId);
            if (byClassSelf) return byClassSelf;
        }
        var fallback = previewDoc.querySelector('[' + attr + ']');
        if (!fallback) {
            var first = previewDoc.querySelector('[data-id]');
            if (first) return first;
        }
        return fallback;
    }

    function buildTextMotionConfig(settings) {
        var get = function(key, def) {
            var v = settings.get(key);
            return v !== undefined && v !== null ? v : def;
        };

        var customChars = get('emje_motion_scramble_custom_characters', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
        if (typeof customChars !== 'string') customChars = String(customChars);
        if (customChars.length > 200) customChars = customChars.substring(0, 200);
        if (customChars === '') customChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

        var scrambleSpeed = parseFloat(get('emje_motion_scramble_speed', 1));
        if (isNaN(scrambleSpeed)) scrambleSpeed = 1;
        scrambleSpeed = Math.max(0.5, Math.min(5, scrambleSpeed));

        var duration = parseFloat(get('emje_motion_duration', 1));
        if (isNaN(duration)) duration = 1;
        duration = Math.max(0, duration);

        var delay = parseFloat(get('emje_motion_delay', 0));
        if (isNaN(delay)) delay = 0;
        delay = Math.max(0, delay);

        var stagger = parseFloat(get('emje_motion_unfold_stagger', 0.04));
        if (isNaN(stagger)) stagger = 0.04;
        stagger = Math.max(0, Math.min(0.5, stagger));

        var splitBy = get('emje_motion_unfold_split_by', 'words');
        if (['words', 'characters'].indexOf(splitBy) === -1) splitBy = 'words';

        var bgOpacity = 0.25;
        var rawOpacity = get('emje_motion_fill_bg_opacity', null);
        if (rawOpacity !== null) {
            if (typeof rawOpacity === 'object' && rawOpacity.size !== undefined) {
                bgOpacity = parseFloat(rawOpacity.size);
            } else if (!isNaN(parseFloat(rawOpacity))) {
                bgOpacity = parseFloat(rawOpacity);
            }
        }
        bgOpacity = Math.max(0, Math.min(1, bgOpacity));

        var animation = get('emje_motion_animation', 'scramble-text');
        if (['scramble-text', 'text-unfold', 'fill-reveal'].indexOf(animation) === -1) animation = 'scramble-text';

        var trigger = get('emje_motion_trigger', 'load');
        if (['load', 'viewport', 'hover'].indexOf(trigger) === -1) trigger = 'load';

        var ease = get('emje_motion_ease', 'power2.out');

        return {
            animation: animation,
            characterSet: get('emje_motion_scramble_character_set', 'letters-numbers'),
            customCharacters: customChars,
            revealOrder: get('emje_motion_scramble_reveal_order', 'left-to-right'),
            scrambleSpeed: scrambleSpeed,
            duration: duration,
            delay: delay,
            ease: ease,
            trigger: trigger,
            playOnce: get('emje_motion_play_once', 'yes') === 'yes',
            splitBy: splitBy,
            stagger: stagger,
            fillBgOpacity: bgOpacity,
            livePreview: get('emje_motion_live_preview', 'yes') === 'yes'
        };
    }

    function buildHoverConfig(settings) {
        var get = function(k, d) { var v = settings.get(k); return v !== undefined && v !== null ? v : d; };
        var img = get('emje_hover_reveal_image', null);
        var url = '';
        if (img && typeof img === 'object' && img.url) url = img.url;
        else if (typeof img === 'string') url = img;

        var follow = parseFloat(get('emje_hover_reveal_follow_speed', 0.12));
        if (isNaN(follow)) follow = 0.12;
        follow = Math.max(0.05, Math.min(0.3, follow));

        var scale = parseFloat(get('emje_hover_reveal_scale', 1));
        if (isNaN(scale)) scale = 1;
        scale = Math.max(0.8, Math.min(1.2, scale));

        var anim = get('emje_hover_reveal_animation', 'fade');
        if (['fade', 'scale', 'clip'].indexOf(anim) === -1) anim = 'fade';

        var trigger = get('emje_hover_reveal_trigger_area', 'container');
        if (['container', 'heading'].indexOf(trigger) === -1) trigger = 'container';

        var size = get('emje_hover_reveal_image_size', 'medium');
        if (['thumbnail', 'medium', 'large', 'full'].indexOf(size) === -1) size = 'medium';

        return {
            imageUrl: url,
            imageSize: size,
            followSpeed: follow,
            scale: scale,
            animation: anim,
            triggerArea: trigger,
            livePreview: get('emje_hover_reveal_live_preview', '') === 'yes'
        };
    }

    function buildCursorConfig(settings) {
        var get = function(k, d) { var v = settings.get(k); return v !== undefined && v !== null ? v : d; };
        var type = get('emje_cursor_type', 'dot-ring');
        if (['dot', 'ring', 'dot-ring'].indexOf(type) === -1) type = 'dot-ring';

        var size = 20;
        var rawSize = get('emje_cursor_size', null);
        if (rawSize && typeof rawSize === 'object' && rawSize.size !== undefined) size = parseInt(rawSize.size, 10);
        else if (!isNaN(parseInt(rawSize, 10))) size = parseInt(rawSize, 10);
        size = Math.max(12, Math.min(40, size));

        var color = get('emje_cursor_color', '#000000');
        if (!color || typeof color !== 'string') color = '#000000';
        if (!/^#([0-9A-F]{3}){1,2}$/i.test(color)) color = '#000000';

        var blend = get('emje_cursor_blend_mode', 'normal');
        if (['normal', 'difference'].indexOf(blend) === -1) blend = 'normal';

        var scale = parseFloat(get('emje_cursor_hover_scale', 1.5));
        if (isNaN(scale)) scale = 1.5;
        scale = Math.max(1.2, Math.min(2, scale));

        var hide = get('emje_cursor_hide_native', 'yes') === 'yes';
        var label = get('emje_cursor_text_label', '');
        if (typeof label !== 'string') label = String(label);
        if (label.length > 20) label = label.substring(0, 20);

        return {
            type: type,
            size: size,
            color: color,
            blendMode: blend,
            hoverScale: scale,
            hideNative: hide,
            label: label,
            livePreview: get('emje_cursor_live_preview', '') === 'yes'
        };
    }

    $(document).on('click', '.emje-motion-preview-btn', function(e) {
        e.preventDefault();
        var editedView = null;
        try {
            editedView = window.elementor.channels.editor.request('editedElementView');
        } catch (err) {}
        if (!editedView) {
            var panelView = window.elementor.getPanelView();
            editedView = panelView ? panelView.getCurrentPageView().getOption('editedElementView') : null;
        }
        var model = editedView ? editedView.model : null;
        if (!model) {
            var panelView2 = window.elementor.getPanelView();
            model = panelView2 ? panelView2.getCurrentPageView().model : null;
        }
        var widgetId = model ? model.get('id') : null;
        var settings = model ? model.get('settings') : null;
        var win = getPreviewWindow();
        var doc = getPreviewDocument();
        if (!win || !doc || !win.EmjeMotion) return;
        var target = widgetId ? findTarget(doc, widgetId, 'data-emje-motion') : doc.querySelector('[data-emje-motion]');
        if (target) {
            if (!target.hasAttribute('data-emje-motion') && settings) {
                var cfg = buildTextMotionConfig(settings);
                try { target.setAttribute('data-emje-motion', JSON.stringify(cfg)); } catch (err) {}
            }
            win.EmjeMotion.refresh(target);
        }
    });

    function bindEditorChange() {
        if (!window.elementor.channels || !window.elementor.channels.editor) return;

        window.elementor.channels.editor.on('change', function(view) {
            var editedView = null;
            try {
                editedView = window.elementor.channels.editor.request('editedElementView');
            } catch (err) {}
            var model = null;
            var settings = null;
            var widgetType = null;
            var widgetId = null;

            if (editedView && editedView.model) {
                model = editedView.model;
                settings = model.get('settings');
                widgetType = model.get('widgetType') || model.get('elType');
                widgetId = model.get('id');
            } else if (view && view.model) {
                model = view.model;
                settings = model.get('settings');
                if (settings && typeof settings.get !== 'function') {
                    settings = view.model.get('settings');
                }
                widgetType = model.get('widgetType') || model.get('elType');
                widgetId = model.get('id');
                if (!widgetType && view.container) {
                    var containerSettings = view.container.settings;
                    if (containerSettings) {
                        settings = containerSettings;
                        model = view.container.model || model;
                        widgetType = model.get('widgetType') || model.get('elType');
                        widgetId = model.get('id');
                    }
                }
            }

            if (!settings || typeof settings.get !== 'function') return;
            var win = getPreviewWindow();
            var doc = getPreviewDocument();
            if (!win || !doc) return;

            if (widgetType === 'heading' || widgetType === 'text-editor') {
                if (settings.get('emje_motion_live_preview') !== 'yes') return;
                if (settings.get('emje_motion_enable') !== 'yes') return;
                var liveView = editedView || view;
                clearTimeout(liveView._emjeLiveTimeout);
                liveView._emjeLiveTimeout = setTimeout(function() {
                    var target = findTarget(doc, widgetId, 'data-emje-motion');
                    if (!target) return;
                    var config = buildTextMotionConfig(settings);
                    try {
                        target.setAttribute('data-emje-motion', JSON.stringify(config));
                    } catch (err) {}
                    if (win.EmjeMotion && win.EmjeMotion.refresh) {
                        win.EmjeMotion.refresh(target);
                    }
                }, 100);
            }

            if (widgetType === 'container') {
                // Hover Reveal: handle enable + live preview, destroy when off
                (function() {
                    var hoverEnable = settings.get('emje_hover_reveal_enable') === 'yes';
                    var hoverLive = settings.get('emje_hover_reveal_live_preview') === 'yes';
                    var hoverTarget = findTarget(doc, widgetId, 'data-emje-hover-reveal');
                    // If enable off or live off, destroy existing instance
                    if (!hoverEnable || !hoverLive) {
                        if (hoverTarget && win.EmjeMotionHoverReveal) {
                            try { hoverTarget.removeAttribute('data-emje-hover-reveal'); } catch (e) {}
                            // Destroy instance if exists
                            try {
                                if (win.EmjeMotionHoverReveal._instances && win.EmjeMotionHoverReveal._instances.get(hoverTarget)) {
                                    var oldHover = win.EmjeMotionHoverReveal._instances.get(hoverTarget);
                                    if (oldHover && typeof oldHover.destroy === 'function') oldHover.destroy();
                                    win.EmjeMotionHoverReveal._instances.delete(hoverTarget);
                                    delete hoverTarget.dataset.emjeHoverRevealInitialized;
                                } else if (hoverTarget.dataset.emjeHoverRevealInitialized === 'true') {
                                    // Fallback: still try reInit with empty to clean
                                    if (win.EmjeMotionHoverReveal.reInit) win.EmjeMotionHoverReveal.reInit(hoverTarget);
                                    delete hoverTarget.dataset.emjeHoverRevealInitialized;
                                }
                                // Also remove any orphan hover image still in body
                                var orphanHover = doc.body ? doc.body.querySelector('.emje-hover-reveal__image') : null;
                                if (orphanHover && orphanHover.parentNode) orphanHover.parentNode.removeChild(orphanHover);
                            } catch (e) {}
                        }
                        return;
                    }
                    // Both on: reInit with new config
                    clearTimeout(editedView ? editedView._emjeHoverTimeout : view._emjeHoverTimeout);
                    var hoverTimer = setTimeout(function() {
                        var target = findTarget(doc, widgetId, 'data-emje-hover-reveal');
                        if (!target) return;
                        var cfg = buildHoverConfig(settings);
                        if (!cfg.imageUrl) {
                            try { target.removeAttribute('data-emje-hover-reveal'); } catch (e) {}
                            if (win.EmjeMotionHoverReveal && win.EmjeMotionHoverReveal._instances && win.EmjeMotionHoverReveal._instances.get(target)) {
                                var old2 = win.EmjeMotionHoverReveal._instances.get(target);
                                if (old2 && typeof old2.destroy === 'function') old2.destroy();
                                win.EmjeMotionHoverReveal._instances.delete(target);
                                delete target.dataset.emjeHoverRevealInitialized;
                            }
                            return;
                        }
                        try { target.setAttribute('data-emje-hover-reveal', JSON.stringify(cfg)); } catch (e) {}
                        if (win.EmjeMotionHoverReveal && win.EmjeMotionHoverReveal.reInit) {
                            win.EmjeMotionHoverReveal.reInit(target);
                        }
                    }, 150);
                    if (editedView) editedView._emjeHoverTimeout = hoverTimer;
                    else view._emjeHoverTimeout = hoverTimer;
                })();

                // Interactive Cursor: handle enable + live preview, destroy when off
                (function() {
                    var cursorEnable = settings.get('emje_cursor_enable') === 'yes';
                    var cursorLive = settings.get('emje_cursor_live_preview') === 'yes';
                    var cursorTarget = findTarget(doc, widgetId, 'data-emje-cursor');
                    if (!cursorEnable || !cursorLive) {
                        if (cursorTarget && win.EmjeMotionCursor) {
                            try { cursorTarget.removeAttribute('data-emje-cursor'); } catch (e) {}
                            try {
                                if (win.EmjeMotionCursor._instances && win.EmjeMotionCursor._instances.get(cursorTarget)) {
                                    var oldCur = win.EmjeMotionCursor._instances.get(cursorTarget);
                                    if (oldCur && typeof oldCur.destroy === 'function') oldCur.destroy();
                                    win.EmjeMotionCursor._instances.delete(cursorTarget);
                                    delete cursorTarget.dataset.emjeCursorInitialized;
                                } else if (cursorTarget.dataset.emjeCursorInitialized === 'true') {
                                    if (win.EmjeMotionCursor.reInit) win.EmjeMotionCursor.reInit(cursorTarget);
                                    delete cursorTarget.dataset.emjeCursorInitialized;
                                }
                                var orphanCur = doc.body ? doc.body.querySelector('.emje-cursor') : null;
                                if (orphanCur && orphanCur.parentNode) orphanCur.parentNode.removeChild(orphanCur);
                            } catch (e) {}
                        }
                        return;
                    }
                    clearTimeout(editedView ? editedView._emjeCursorTimeout : view._emjeCursorTimeout);
                    var cursorTimer = setTimeout(function() {
                        var target = findTarget(doc, widgetId, 'data-emje-cursor');
                        if (!target) return;
                        var cfg = buildCursorConfig(settings);
                        try { target.setAttribute('data-emje-cursor', JSON.stringify(cfg)); } catch (e) {}
                        if (win.EmjeMotionCursor && win.EmjeMotionCursor.reInit) {
                            win.EmjeMotionCursor.reInit(target);
                        }
                    }, 150);
                    if (editedView) editedView._emjeCursorTimeout = cursorTimer;
                    else view._emjeCursorTimeout = cursorTimer;
                })();
            }
        });
    }

    function initBridge() {
        bindEditorChange();
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
