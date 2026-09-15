import { gsap } from 'gsap';
import Animation from '../../core/Animation';
import { sanitizeHtml } from '../../services/sanitizeHtml';
import { buildSingleFill, buildPerLineFill } from './fillBuild';
import { resolveFillStagger } from './fillTiming';

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

		this.originalHTML = sanitizeHtml(this.element.innerHTML);

		this.dom = {
			wrapper: null,
			background: null,
			mask: null,
			foreground: null,
		};

		// Per-line state
		this.lines = [];
		this.masks = [];
		this.foregrounds = [];
		this.isPerLine = false;
		this.resizeObserver = null;
		this.resizeTimer = null;
		this._lastWidth = 0;

	}

	/**
	 * Foreground blur in px. 0 = off (pure wipe).
	 *
	 * @returns {number}
	 */
	getFillBlur() {
		const b = parseFloat(this.config.fillBlur ?? 0);
		if (isNaN(b)) return 0;
		return Math.max(0, Math.min(20, b));
	}

	/**
	 * Starting vars for foreground blur. Null when blur is off.
	 *
	 * @returns {Object|null}
	 */
	getForegroundFromVars() {
		const blur = this.getFillBlur();
		if (!(blur > 0)) return null;
		return { filter: `blur(${blur}px)` };
	}

	/**
	 * End vars for foreground blur.
	 *
	 * @returns {Object}
	 */
	getForegroundToVars() {
		return { filter: 'blur(0px)' };
	}

	/**
	 * Effective stagger between lines. Sequence mode waits a full duration.
	 *
	 * @returns {number}
	 */
	getEffectiveStagger() {
		return resolveFillStagger(
			this.config.fillLineMode,
			this.config.fillStagger,
			this.config.duration,
		);
	}

	/**
	 * Set foreground progress directly (for scrub).
	 *
	 * @param {HTMLElement} fg
	 * @param {number} local 0..1
	 */
	applyForegroundProgress(fg, local) {
		const blur = this.getFillBlur();
		if (!(blur > 0)) return;
		const rest = 1 - local;
		gsap.set(fg, { filter: rest <= 0 ? 'blur(0px)' : `blur(${blur * rest}px)` });
	}

	/**
	 * Whether to use per-line stagger mode.
	 */
	shouldUsePerLine() {
		const stagger = this.getEffectiveStagger();
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
			const built = buildPerLineFill(this.element, this.originalHTML, this.config);
			if (built) {
				this.dom = built.dom;
				this.lines = built.lines;
				this.masks = built.masks;
				this.foregrounds = built.foregrounds;
				if (typeof built.width === 'number') this._lastWidth = built.width;
				this.isPerLine = true;
				this.observeResize();
				return;
			}
		}

		this.isPerLine = false;
		const single = buildSingleFill(this.element, this.originalHTML, this.config);
		this.dom = single.dom;
		this.masks = single.masks;
		this.foregrounds = single.foregrounds;

	}

	/**
	 * Set progress directly for scrub (linear, no ease).
	 * Supports per-line stagger scaling: total = duration + (n-1)*stagger.
	 * @param {number} p
	 */
	setProgress(p) {
		const clamped = Math.max(0, Math.min(1, p));

		// Per-line stagger for scrub: distribute p across lines with normalized total
		if (this.isPerLine && this.masks.length > 1) {
			const stagger = this.getEffectiveStagger();
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
					if (this.foregrounds[i]) {
						this.applyForegroundProgress(this.foregrounds[i], local);
					}
				});
				return;
			}
		}

		const clip = `inset(0 ${(1 - clamped) * 100}% 0 0)`;
		if (this.masks && this.masks.length) {
			gsap.set(this.masks, { clipPath: clip });
			this.foregrounds.forEach((fg) => this.applyForegroundProgress(fg, clamped));
		} else if (this.dom.mask) {
			gsap.set(this.dom.mask, { clipPath: clip });
			if (this.dom.foreground) {
				this.applyForegroundProgress(this.dom.foreground, clamped);
			}
		} else {
			// Not yet built, prepare then set
			this.prepare();
			const targets = this.masks && this.masks.length ? this.masks : this.dom.mask;
			if (targets) gsap.set(targets, { clipPath: clip });
			const fgs = this.foregrounds.length ? this.foregrounds : (this.dom.foreground ? [this.dom.foreground] : []);
			fgs.forEach((fg) => this.applyForegroundProgress(fg, clamped));
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

		const from = this.getForegroundFromVars();
		if (from) {
			const fgs = this.foregrounds.length
				? this.foregrounds
				: (this.dom.foreground ? [this.dom.foreground] : []);
			if (fgs.length) gsap.set(fgs, from);
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

		const stagger = this.getEffectiveStagger();
		const duration = this.config.duration;
		const ease = this.config.ease;

		if (this.isPerLine && this.masks.length > 1 && stagger > 0) {
			this.timeline.to( this.masks, {
				clipPath: 'inset(0 0% 0 0)',
				duration: duration,
				ease: ease,
				stagger: stagger,
			} );
		} else {
			const target = this.isPerLine ? this.masks : this.dom.mask;
			this.timeline.to( target, {
				clipPath: 'inset(0 0% 0 0)',
				duration: duration,
				ease: ease,
			} );
		}

		const from = this.getForegroundFromVars();
		if (from) {
			const fgs = this.foregrounds.length
				? this.foregrounds
				: (this.dom.foreground ? [this.dom.foreground] : []);
			if (fgs.length) {
				this.timeline.fromTo( fgs, from, {
					...this.getForegroundToVars(),
					duration: duration,
					ease: ease,
					stagger: (this.isPerLine && this.masks.length > 1) ? stagger : 0,
					onComplete: () => {
						gsap.set(fgs, { clearProps: 'filter' });
					},
				}, 0 );
			}
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
				this.foregrounds = [];
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
		this.foregrounds = [];
		this.isPerLine = false;

	}

}
