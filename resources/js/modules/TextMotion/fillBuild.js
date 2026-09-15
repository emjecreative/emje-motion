/**
 * Fill Reveal DOM builders (element + html + config in, fresh
 * markup + target lists out). No GSAP, no timelines.
 */
import TextSplitter from '../../services/TextSplitter';
import { sanitizeHtml } from '../../services/sanitizeHtml';

function newState() {
	return {
		dom: { wrapper: null, background: null, mask: null, foreground: null },
		lines: [],
		masks: [],
		foregrounds: [],
	};
}

/**
 * Apply wash color to a background layer. Empty = follow text color.
 *
 * @param {HTMLElement} bg
 */
function applyWashColor(bg, config) {
	const c = config.fillWashColor;
	if (typeof c === 'string' && c !== '') {
		bg.style.color = c;
	}
}

/** Route per-line builds: paragraphs first (preserves HTML), else visual lines. */
export function buildPerLineFill(element, originalHTML, config) {
	if (element.querySelector('p')) {
		const byParagraph = buildPerParagraph(element, originalHTML, config);
		if (byParagraph) return byParagraph;
	}
	return buildPerVisualLine(element, originalHTML, config);
}

export function buildSingleFill(element, originalHTML, config) {
	const state = newState();
	state.dom.wrapper = createWrapper();
	state.dom.background = createBackground(originalHTML, config);
	state.dom.mask = createMask();
	state.dom.foreground = createForeground(originalHTML);

	state.dom.mask.appendChild( state.dom.foreground );
	state.foregrounds = [state.dom.foreground];

	state.dom.wrapper.appendChild(state.dom.background);
	state.dom.wrapper.appendChild(state.dom.mask);

	element.innerHTML = '';
	element.appendChild( state.dom.wrapper );
	state.masks = [state.dom.mask];
	return state;
	}

function buildPerParagraph(element, originalHTML, config) {
	const state = newState();
	const paragraphs = Array.from(element.querySelectorAll('p'));
	// If no <p> or single <p> with short text, fallback to visual
	if (paragraphs.length === 0) return null;
	// If single paragraph but long, we could still do visual lines inside it
	// For now, if single paragraph, try visual lines for that paragraph
	if (paragraphs.length === 1) {
		const singleText = paragraphs[0].textContent.trim();
		if (singleText.split(/\s+/).length < 6) return null;
		// Try visual lines for single paragraph
		const visual = buildVisualLinesForElement(paragraphs[0]);
		if (visual) return visual;
		// Fallback to paragraph as single line
	}

	state.dom.wrapper = createWrapper();
	state.dom.wrapper.style.display = 'block';

	paragraphs.forEach((p) => {
		const html = sanitizeHtml(p.innerHTML);
		if (!html.trim()) return;
		const lineEl = document.createElement('div');
		lineEl.className = 'emje-motion-fill__line';

	const bg = document.createElement('span');
	bg.className = 'emje-motion-fill__background';
	bg.innerHTML = html;
	if (typeof config.fillBgOpacity !== 'undefined') {
		bg.style.opacity = String(config.fillBgOpacity);
	}
	applyWashColor(bg, config);

		const mask = document.createElement('span');
		mask.className = 'emje-motion-fill__mask';

		const fg = document.createElement('span');
		fg.className = 'emje-motion-fill__foreground';
		fg.innerHTML = html;

		mask.appendChild(fg);
		lineEl.appendChild(bg);
		lineEl.appendChild(mask);

	state.dom.wrapper.appendChild(lineEl);
	state.lines.push(lineEl);
	state.masks.push(mask);
	state.foregrounds.push(fg);
});

	// Handle text nodes outside <p> (rare)
	if (state.lines.length === 0) return null;

	element.innerHTML = '';
	element.appendChild(state.dom.wrapper);
	// Keep dom refs for single compatibility (first line)
	state.dom.background = state.lines[0].querySelector('.emje-motion-fill__background');
	state.dom.mask = state.masks[0];
	state.dom.foreground = state.lines[0].querySelector('.emje-motion-fill__foreground');
	return state;
}

function buildPerVisualLine(element, originalHTML, config) {
	return buildVisualLinesForElement(element);
}

function buildVisualLinesForElement(targetEl, originalHTML, config) {
	const state = newState();
	// Create off-screen measuring container with same styles
	const rect = targetEl.getBoundingClientRect();
	const width = rect.width || targetEl.offsetWidth || targetEl.clientWidth || 300;
	if (width < 50) return null;

	const temp = document.createElement('div');
	temp.style.position = 'absolute';
	temp.style.visibility = 'hidden';
	temp.style.pointerEvents = 'none';
	temp.style.top = '-9999px';
	temp.style.left = '-9999px';
	temp.style.width = width + 'px';
	temp.style.whiteSpace = 'normal';
	temp.style.overflowWrap = 'break-word';
	temp.style.wordBreak = 'break-word';

	// Copy relevant computed styles
	try {
		const cs = window.getComputedStyle(targetEl);
		temp.style.font = cs.font;
		temp.style.fontFamily = cs.fontFamily;
		temp.style.fontSize = cs.fontSize;
		temp.style.fontWeight = cs.fontWeight;
		temp.style.letterSpacing = cs.letterSpacing;
		temp.style.lineHeight = cs.lineHeight;
		temp.style.wordSpacing = cs.wordSpacing;
		temp.style.textTransform = cs.textTransform;
		temp.style.padding = cs.padding;
	} catch (e) {}

	temp.innerHTML = sanitizeHtml(originalHTML);
	document.body.appendChild(temp);

	// Use TextSplitter to split into visual lines
	const splitter = new TextSplitter(temp);
	let lineEls = [];
	try {
		lineEls = splitter.split({ by: 'lines' });
	} catch (e) {
		document.body.removeChild(temp);
		return null;
	}

	// If only 1 line, no need for per-line
	if (!lineEls || lineEls.length <= 1) {
		document.body.removeChild(temp);
		return null;
	}

	// Build real DOM per line using lineEls' word contents
	state.dom.wrapper = createWrapper();
	state.dom.wrapper.style.display = 'block';

	lineEls.forEach((lineDiv) => {
		// lineDiv contains word spans with \u00A0
		const lineHTML = sanitizeHtml(lineDiv.innerHTML);
		if (!lineHTML.trim()) return;

		const lineEl = document.createElement('div');
		lineEl.className = 'emje-motion-fill__line';

	const bg = document.createElement('span');
	bg.className = 'emje-motion-fill__background';
	bg.innerHTML = lineHTML;
	if (typeof config.fillBgOpacity !== 'undefined') {
		bg.style.opacity = String(config.fillBgOpacity);
	}
	applyWashColor(bg, config);

		const mask = document.createElement('span');
		mask.className = 'emje-motion-fill__mask';

		const fg = document.createElement('span');
		fg.className = 'emje-motion-fill__foreground';
		fg.innerHTML = lineHTML;

		mask.appendChild(fg);
		lineEl.appendChild(bg);
		lineEl.appendChild(mask);

	state.dom.wrapper.appendChild(lineEl);
	state.lines.push(lineEl);
	state.masks.push(mask);
	state.foregrounds.push(fg);
});

	document.body.removeChild(temp);

	if (state.masks.length <= 1) {
		// Fallback to single (wrapper is still detached here, nothing to remove)
		state.lines = [];
		state.masks = [];
		return null;
	}

	element.innerHTML = '';
	element.appendChild(state.dom.wrapper);
	state.dom.background = state.lines[0].querySelector('.emje-motion-fill__background');
	state.dom.mask = state.masks[0];
	state.dom.foreground = state.lines[0].querySelector('.emje-motion-fill__foreground');
	state.width = width;
	return state;
}

function createWrapper() {

	const wrapper = document.createElement( 'span' );

	wrapper.className = 'emje-motion-fill';

	return wrapper;

}

/**
 * Create the background layer.
 *
 * @returns {HTMLElement}
 */
function createBackground(originalHTML, config) {

	const background = document.createElement( 'span' );

	background.className = 'emje-motion-fill__background';
	background.innerHTML = sanitizeHtml(originalHTML);
	background.setAttribute('aria-hidden', 'true');
	applyWashColor(background, config);

	if (typeof config.fillBgOpacity !== 'undefined') {
		background.style.opacity = String(config.fillBgOpacity);
	}

	return background;

}

/**
 * Create the mask element.
 *
 * @returns {HTMLElement}
 */
function createMask() {

	const mask = document.createElement( 'span' );

	mask.className = 'emje-motion-fill__mask';

	return mask;

}

/**
 * Create the foreground layer.
 *
 * @returns {HTMLElement}
 */
function createForeground(originalHTML) {

	const foreground = document.createElement( 'span' );

	foreground.className = 'emje-motion-fill__foreground';
	foreground.innerHTML = sanitizeHtml(originalHTML);

	return foreground;

}
