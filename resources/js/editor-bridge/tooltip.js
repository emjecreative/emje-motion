export function bindTooltips() {
    var process = function() {
        document.querySelectorAll('.emje-control--has-tooltip').forEach(function(ctrl) {
            if (ctrl.querySelector('.emje-tooltip')) return;
            var desc = ctrl.querySelector('.elementor-control-field-description');
            if (!desc) return;
            var text = (desc.textContent || '').trim();
            if (!text) return;
            var titleEl = ctrl.querySelector('.elementor-control-title');
            if (!titleEl) return;
            var tip = document.createElement('span');
            tip.className = 'emje-tooltip';
            tip.setAttribute('tabindex', '0');
            tip.setAttribute('aria-label', text);
            var icon = document.createElement('span');
            icon.className = 'emje-tooltip__icon';
            icon.textContent = 'i';
            var bubble = document.createElement('span');
            bubble.className = 'emje-tooltip__bubble';
            bubble.setAttribute('role', 'tooltip');
            bubble.textContent = text;
            tip.appendChild(icon);
            tip.appendChild(bubble);
            titleEl.appendChild(tip);

            // Position bubble with margin from viewport edges (never cut off left/right)
            var positionBubble = function() {
                var rect = tip.getBoundingClientRect();
                var bw = bubble.offsetWidth || 180;
                var bh = bubble.offsetHeight || 60;
                var vw = document.documentElement.clientWidth || window.innerWidth;
                var vh = document.documentElement.clientHeight || window.innerHeight;
                var margin = 12;
                // Centered above the icon, clamped with 12px margin so it never touches sidebar edges
                var left = rect.left + rect.width / 2 - bw / 2;
                left = Math.max(margin, Math.min(left, vw - bw - margin));
                var top = rect.top - bh - 8;
                if (top < margin) {
                    top = rect.bottom + 8;
                }
                bubble.style.left = left + 'px';
                bubble.style.top = top + 'px';
                bubble.style.transform = 'none';
            };
            tip.addEventListener('mouseenter', positionBubble);
            tip.addEventListener('focus', positionBubble);
            tip.addEventListener('mouseleave', function() {
                bubble.style.left = '';
                bubble.style.top = '';
            });
        });
    };
    process();
    // Observe panel for re-render (condition changes)
    try {
        var panel = document.querySelector('#elementor-panel');
        if (panel && typeof MutationObserver !== 'undefined') {
            var obs = new MutationObserver(function() { process(); });
            obs.observe(panel, { childList: true, subtree: true });
        }
    } catch (e) {}
    try {
        if (window.elementor && window.elementor.hooks) {
            window.elementor.hooks.addAction('panel/open_editor/container', process);
            window.elementor.hooks.addAction('panel/open_editor/heading', process);
            window.elementor.hooks.addAction('panel/open_editor/text-editor', process);
        }
    } catch (e) {}
    // Also re-run on elementor init
    try {
        if (window.jQuery) {
            window.jQuery(window).on('elementor:init', process);
        }
    } catch (e) {}
}

export function bindHeadingIcons() {
    var logoUrl = (window.EmjeMotionConfig && window.EmjeMotionConfig.logoUrl) ? window.EmjeMotionConfig.logoUrl : (window.EMJE_MOTION_URL ? window.EMJE_MOTION_URL + 'assets/images/emje-motion-logo.svg' : 'assets/images/emje-motion-logo.svg');
    var inject = function() {
        var headings = document.querySelectorAll('#elementor-panel .elementor-panel__heading, #elementor-panel .elementor-panel-heading');
        headings.forEach(function(h) {
            var titleEl = h.querySelector('.elementor-panel-heading__title, .elementor-panel__heading-title, .elementor-panel-heading-title-wrapper, .elementor-panel__heading-title');
            var text = (titleEl ? titleEl.textContent : h.textContent).trim();
            var isText = text === 'Text Motion' || text.indexOf('Text Motion') === 0;
            var isInter = text === 'Interaction Motion' || text.indexOf('Interaction Motion') === 0;
            var isBg = text === 'Background Motion' || text.indexOf('Background Motion') === 0;
            if (!isText && !isInter && !isBg) return;
            if (h.querySelector('.emje-panel-heading-icon')) return;
            var img = document.createElement('img');
            img.className = 'emje-panel-heading-icon';
            img.src = logoUrl;
            img.alt = '';
            img.width = 16;
            img.height = 16;
            img.loading = 'eager';
            img.decoding = 'async';
            // Place icon right after arrow: [arrow] [icon] [Text] — enforce visual order via flex order
            var arrow = h.querySelector('.elementor-panel__heading__toggle, .elementor-panel-heading__toggle, .eicon-chevron-down, .eicon-chevron-up, .eicon, i');
            try {
                h.style.display = 'flex';
                h.style.alignItems = 'center';
                h.style.gap = '6px';
            } catch (e) {}
            // Append icon to heading (DOM position irrelevant — CSS order fixes visual)
            h.appendChild(img);
            try {
                if (arrow) { arrow.style.order = '0'; }
                img.style.order = '1';
                if (titleEl) { titleEl.style.order = '2'; }
                // If arrow is not a direct child, ensure heading order still works
                h.style.flexDirection = 'row';
            } catch (e) {}
        });
    };
    var debounced = function() { clearTimeout(debounced._t); debounced._t = setTimeout(inject, 80); };
    try {
        if (window.elementor && window.elementor.hooks) {
            window.elementor.hooks.addAction('panel/open_editor/container', debounced);
            window.elementor.hooks.addAction('panel/open_editor/heading', debounced);
            window.elementor.hooks.addAction('panel/open_editor/text-editor', debounced);
        }
    } catch (e) {}
    try {
        var panel = document.querySelector('#elementor-panel');
        if (panel && typeof MutationObserver !== 'undefined') {
            var obs = new MutationObserver(debounced);
            obs.observe(panel, { childList: true, subtree: true });
        }
    } catch (e) {}
    try { if (window.jQuery) window.jQuery(window).on('elementor:init', debounced); } catch (e) {}
    debounced();
}

/**
 * Register editor panel chrome (tooltips + heading icons).
 */
export function initEditorChrome() {
    bindTooltips();
    bindHeadingIcons();
}
