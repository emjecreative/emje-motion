import { gsap } from 'gsap';
import Animation from '../../core/Animation';
import TextSplitter from '../../services/TextSplitter';

/**
 * Handles the Fill Reveal animation.
 * Supports per-line stagger for multi-line headings/text-editors.
 */
export default class FillReveal extends Animation {

	/**
	 * Create a new Fill Reveal animation.
	 *
	 * @param {HTMLElement} element
	 * @param {Object} config
	 */
	constructor(element, config) {

		super(element, config);

		this.originalHTML = this.element.innerHTML;

		this.dom = {
			wrapper: null,
			background: null,
			mask: null,
			foreground: null,
		};

		// Per-line state
		this.lines = [];
		this.masks = [];
		this.isPerLine = false;
		this.resizeObserver = null;
		this.resizeTimer = null;
		this._lastWidth = 0;

	}

	/**
	 * Whether to use per-line stagger mode.
	 */
	shouldUsePerLine() {
		const stagger = parseFloat(this.config.fillStagger);
		if (!stagger || stagger <= 0) return false;
		// Need at least 2 lines to stagger
		// Quick check: if element contains block paragraphs, we can stagger per paragraph
		// For plain heading, we will detect visual lines later
		const text = (this.element.textContent || '').trim();
		if (!text) return false;
		// If single word, no need
		if (text.split(/\s+/).length <= 2) return false;
		return true;
	}

	/**
	 * Check if element has block paragraphs (text-editor).
	 */
	hasBlockParagraphs() {
		return !!this.element.querySelector('p');
	}

	/**
	 * Prepare the animation.
	 */
	prepare() {

		this.build();
		this.setInitialState();

	}

	/**
	 * Build animation markup.
	 */
	build() {

		if ( this.dom.wrapper ) {
			return;
		}

		if (this.shouldUsePerLine()) {
			const built = this.buildPerLine();
			if (built) {
				this.isPerLine = true;
				this.observeResize();
				return;
			}
		}

		this.isPerLine = false;
		this.buildSingle();

	}

	buildSingle() {
		this.dom.wrapper = this.createWrapper();
		this.dom.background = this.createBackground();
		this.dom.mask = this.createMask();
		this.dom.foreground = this.createForeground();

		this.dom.mask.appendChild( this.dom.foreground );

		this.dom.wrapper.appendChild(this.dom.background);
		this.dom.wrapper.appendChild(this.dom.mask);

		this.element.innerHTML = '';
		this.element.appendChild( this.dom.wrapper );
		this.masks = [this.dom.mask];
	}

	buildPerLine() {
		// If has <p> paragraphs, stagger per paragraph (preserves HTML)
		if (this.hasBlockParagraphs()) {
			return this.buildPerParagraph();
		}
		return this.buildPerVisualLine();
	}

	buildPerParagraph() {
		const paragraphs = Array.from(this.element.querySelectorAll('p'));
		// If no <p> or single <p> with short text, fallback to visual
		if (paragraphs.length === 0) return false;
		// If single paragraph but long, we could still do visual lines inside it
		// For now, if single paragraph, try visual lines for that paragraph
		if (paragraphs.length === 1) {
			const singleText = paragraphs[0].textContent.trim();
			if (singleText.split(/\s+/).length < 6) return false;
			// Try visual lines for single paragraph
			const visual = this.buildVisualLinesForElement(paragraphs[0]);
			if (visual) return true;
			// Fallback to paragraph as single line
		}

		this.dom.wrapper = this.createWrapper();
		this.dom.wrapper.style.display = 'block';

		paragraphs.forEach((p) => {
			const html = p.innerHTML;
			if (!html.trim()) return;
			const lineEl = document.createElement('div');
			lineEl.className = 'emje-motion-fill__line';

			const bg = document.createElement('span');
			bg.className = 'emje-motion-fill__background';
			bg.innerHTML = html;
			if (typeof this.config.fillBgOpacity !== 'undefined') {
				bg.style.opacity = String(this.config.fillBgOpacity);
			}

			const mask = document.createElement('span');
			mask.className = 'emje-motion-fill__mask';

			const fg = document.createElement('span');
			fg.className = 'emje-motion-fill__foreground';
			fg.innerHTML = html;

			mask.appendChild(fg);
			lineEl.appendChild(bg);
			lineEl.appendChild(mask);

			this.dom.wrapper.appendChild(lineEl);
			this.lines.push(lineEl);
			this.masks.push(mask);
		});

		// Handle text nodes outside <p> (rare)
		if (this.lines.length === 0) return false;

		this.element.innerHTML = '';
		this.element.appendChild(this.dom.wrapper);
		// Keep dom refs for single compatibility (first line)
		this.dom.background = this.lines[0].querySelector('.emje-motion-fill__background');
		this.dom.mask = this.masks[0];
		this.dom.foreground = this.lines[0].querySelector('.emje-motion-fill__foreground');
		return true;
	}

	buildPerVisualLine() {
		return this.buildVisualLinesForElement(this.element);
	}

	buildVisualLinesForElement(targetEl) {
		// Create off-screen measuring container with same styles
		const rect = targetEl.getBoundingClientRect();
		const width = rect.width || targetEl.offsetWidth || targetEl.clientWidth || 300;
		if (width < 50) return false;

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

		temp.innerHTML = this.originalHTML;
		document.body.appendChild(temp);

		// Use TextSplitter to split into visual lines
		const splitter = new TextSplitter(temp);
		let lineEls = [];
		try {
			lineEls = splitter.split({ by: 'lines' });
		} catch (e) {
			document.body.removeChild(temp);
			return false;
		}

		// If only 1 line, no need for per-line
		if (!lineEls || lineEls.length <= 1) {
			document.body.removeChild(temp);
			return false;
		}

		// Build real DOM per line using lineEls' word contents
		this.dom.wrapper = this.createWrapper();
		this.dom.wrapper.style.display = 'block';

		lineEls.forEach((lineDiv) => {
			// lineDiv contains word spans with &nbsp;
			const lineHTML = lineDiv.innerHTML;
			if (!lineHTML.trim()) return;

			const lineEl = document.createElement('div');
			lineEl.className = 'emje-motion-fill__line';

			const bg = document.createElement('span');
			bg.className = 'emje-motion-fill__background';
			bg.innerHTML = lineHTML;
			if (typeof this.config.fillBgOpacity !== 'undefined') {
				bg.style.opacity = String(this.config.fillBgOpacity);
			}

			const mask = document.createElement('span');
			mask.className = 'emje-motion-fill__mask';

			const fg = document.createElement('span');
			fg.className = 'emje-motion-fill__foreground';
			fg.innerHTML = lineHTML;

			mask.appendChild(fg);
			lineEl.appendChild(bg);
			lineEl.appendChild(mask);

			this.dom.wrapper.appendChild(lineEl);
			this.lines.push(lineEl);
			this.masks.push(mask);
		});

		document.body.removeChild(temp);

		if (this.masks.length <= 1) {
			// Fallback to single
			if (this.dom.wrapper && this.dom.wrapper.parentNode) {
				this.dom.wrapper.remove();
			}
			this.lines = [];
			this.masks = [];
			return false;
		}

		this.element.innerHTML = '';
		this.element.appendChild(this.dom.wrapper);
		this.dom.background = this.lines[0].querySelector('.emje-motion-fill__background');
		this.dom.mask = this.masks[0];
		this.dom.foreground = this.lines[0].querySelector('.emje-motion-fill__foreground');
		this._lastWidth = width;
		return true;
	}

	/**
	 * Create the wrapper element.
	 *
	 * @returns {HTMLElement}
	 */
	createWrapper() {

		const wrapper = document.createElement( 'span' );

		wrapper.className = 'emje-motion-fill';

		return wrapper;

	}

	/**
	 * Create the background layer.
	 *
	 * @returns {HTMLElement}
	 */
	createBackground() {

		const background = document.createElement( 'span' );

		background.className = 'emje-motion-fill__background';
		background.innerHTML = this.originalHTML;

		if (typeof this.config.fillBgOpacity !== 'undefined') {
			background.style.opacity = String(this.config.fillBgOpacity);
		}

		return background;

	}

	/**
	 * Create the mask element.
	 *
	 * @returns {HTMLElement}
	 */
	createMask() {

		const mask = document.createElement( 'span' );

		mask.className = 'emje-motion-fill__mask';

		return mask;

	}

	/**
	 * Create the foreground layer.
	 *
	 * @returns {HTMLElement}
	 */
	createForeground() {

		const foreground = document.createElement( 'span' );

		foreground.className = 'emje-motion-fill__foreground';
		foreground.innerHTML = this.originalHTML;

		return foreground;

	}

	/**
	 * Set progress directly for scrub (linear, no ease).
	 * Supports per-line stagger diskalakan: total = duration + (n-1)*stagger.
	 * @param {number} p
	 */
	setProgress(p) {
		const clamped = Math.max(0, Math.min(1, p));

		// Per-line stagger for scrub: distribute p across lines with normalized total
		if (this.isPerLine && this.masks.length > 1) {
			const stagger = parseFloat(this.config.fillStagger) || 0;
			if (stagger > 0) {
				const duration = parseFloat(this.config.duration) || 1;
				const total = duration + (this.masks.length - 1) * stagger;
				this.masks.forEach((mask, i) => {
					const start = (i * stagger) / total;
					const end = (i * stagger + duration) / total;
					const span = end - start;
					const local = Math.max(0, Math.min(1, span > 0 ? (clamped - start) / span : clamped));
					const clip = `inset(0 ${(1 - local) * 100}% 0 0)`;
					gsap.set(mask, { clipPath: clip });
				});
				return;
			}
		}

		const clip = `inset(0 ${(1 - clamped) * 100}% 0 0)`;
		if (this.masks && this.masks.length) {
			gsap.set(this.masks, { clipPath: clip });
		} else if (this.dom.mask) {
			gsap.set(this.dom.mask, { clipPath: clip });
		} else {
			// Not yet built, prepare then set
			this.prepare();
			const targets = this.masks && this.masks.length ? this.masks : this.dom.mask;
			if (targets) gsap.set(targets, { clipPath: clip });
		}
	}

	/**
	 * Set the initial animation state.
	 */
	setInitialState() {

		if (this.isPerLine && this.masks.length) {
			gsap.set( this.masks, {
				clipPath: 'inset(0 100% 0 0)',
			} );
		} else if (this.dom.mask) {
			gsap.set( this.dom.mask, {
				clipPath: 'inset(0 100% 0 0)',
			} );
		}

	}

	/**
	 * Play the animation.
	 */
	play() {

		this.killTimeline();

		this.prepare();

		this.animate();

	}

	/**
	 * Run the animation.
	 */
	animate() {

		this.timeline = gsap.timeline( {
			delay: this.config.delay ?? 0,
			onComplete: () => {
				this.timeline = null;
			},
		} );

		const stagger = parseFloat(this.config.fillStagger) || 0;

		if (this.isPerLine && this.masks.length > 1 && stagger > 0) {
			this.timeline.to( this.masks, {
				clipPath: 'inset(0 0% 0 0)',
				duration: this.config.duration,
				ease: this.config.ease,
				stagger: stagger,
			} );
		} else {
			const target = this.isPerLine ? this.masks : this.dom.mask;
			this.timeline.to( target, {
				clipPath: 'inset(0 0% 0 0)',
				duration: this.config.duration,
				ease: this.config.ease,
			} );
		}

	}

	observeResize() {
		if (!this.isPerLine || this.hasBlockParagraphs()) return;
		if (typeof ResizeObserver === 'undefined') return;
		if (this.resizeObserver) return;

		this.resizeObserver = new ResizeObserver(() => {
			clearTimeout(this.resizeTimer);
			this.resizeTimer = setTimeout(() => {
				const newWidth = this.element.getBoundingClientRect().width;
				if (Math.abs(newWidth - this._lastWidth) < 5) return;
				// Rebuild lines if width changed significantly
				const wasPlaying = !!this.timeline;
				this.killTimeline();
				// Save if already completed
				const hadCompleted = this.masks.length && this.masks[0].style.clipPath.includes('0% 0 0');
				// Rebuild
				try {
					this.element.innerHTML = this.originalHTML;
				} catch (e) {}
				this.dom = { wrapper: null, background: null, mask: null, foreground: null };
				this.lines = [];
				this.masks = [];
				this.isPerLine = false;
				this._lastWidth = newWidth;
				this.build();
				this.setInitialState();
				// If previously completed, show completed state
				if (hadCompleted && !wasPlaying) {
					gsap.set(this.masks.length ? this.masks : this.dom.mask, { clipPath: 'inset(0 0% 0 0)' });
				}
			}, 200);
		});

		try {
			this.resizeObserver.observe(this.element);
		} catch (e) {}
	}

	/**
	 * Destroy the animation.
	 */
	destroy() {

		super.destroy();

		if (this.resizeObserver) {
			try { this.resizeObserver.disconnect(); } catch (e) {}
			this.resizeObserver = null;
		}
		clearTimeout(this.resizeTimer);

		if ( ! this.dom.wrapper ) {
			return;
		}

		// TextSplitter revert is handled via destroy recreating innerHTML
		this.element.innerHTML = this.originalHTML;

		this.dom = {
			wrapper: null,
			background: null,
			mask: null,
			foreground: null,
		};
		this.lines = [];
		this.masks = [];
		this.isPerLine = false;

	}

}
