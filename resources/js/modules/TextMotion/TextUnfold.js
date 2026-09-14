import { gsap } from 'gsap';
import Animation from '../../core/Animation';
import TextSplitter from '../../services/TextSplitter';

/**
 * Handles the Text Unfold animation.
 */
export default class TextUnfold extends Animation {

    /**
     * @param {HTMLElement} element
     * @param {Object} config
     */
    constructor(element, config) {

        super(element, config);

        this.splitter = new TextSplitter(element);

        this.targets = [];
        this.masks = [];

    }

    /**
     * Prepare animation.
     */
    prepare() {

	this.targets = this.splitter.split({
		by: this.config.splitBy ?? 'words',
	});

        this.masks = [];

        if (this.config.mask === true) {
            this.wrapTargets();
        }

    }

    /**
     * Wrap each target in an overflow-hidden mask for the premium
     * "rise from inside a box" look. Masks are static — only the
     * inner targets animate. Splitter.revert() removes them.
     */
    wrapTargets() {
        const block = this.config.splitBy === 'lines';

        this.targets.forEach((target) => {
            const mask = document.createElement(block ? 'div' : 'span');
            mask.className = 'emje-motion-mask' + (block ? ' emje-motion-mask--block' : '');
            target.parentNode.insertBefore(mask, target);
            mask.appendChild(target);
            this.masks.push(mask);
        });

    }

    /**
     * Travel distance multiplier. 1.2 keeps the legacy 120% motion.
     *
     * @returns {number}
     */
    getDistance() {
        const d = parseFloat(this.config.distance ?? 1.2);
        if (isNaN(d)) return 1.2;
        return Math.max(0, Math.min(2, d));
    }

    /**
     * Starting blur in px. 0 = off.
     *
     * @returns {number}
     */
    getBlur() {
        const b = parseFloat(this.config.blur ?? 0);
        if (isNaN(b)) return 0;
        return Math.max(0, Math.min(20, b));
    }

    /**
     * Map direction + distance to GSAP from-vars.
     * Up + 1.2 keeps the legacy yPercent: 120 motion.
     *
     * @returns {Object}
     */
    getFromVars() {
        const amount = this.getDistance() * 100;
        const blur = this.getBlur();
        const from = { yPercent: 0, xPercent: 0, opacity: 0 };

        switch (this.config.direction) {
            case 'down':
                from.yPercent = -amount;
                break;
            case 'left':
                from.xPercent = amount;
                break;
            case 'right':
                from.xPercent = -amount;
                break;
            case 'up':
            default:
                from.yPercent = amount;
                break;
        }

        if (blur > 0) {
            from.filter = `blur(${blur}px)`;
        }

        return from;
    }

    /**
     * End state for the unfold tween.
     *
     * @returns {Object}
     */
    getToVars() {
        const to = { yPercent: 0, xPercent: 0, opacity: 1 };

        if (this.getBlur() > 0) {
            to.filter = 'blur(0px)';
        }

        return to;
    }

    /**
     * Apply base display to targets (masks carry their own CSS class).
     */
    applyBaseDisplay() {
        gsap.set(this.targets, { display: 'inline-block', willChange: 'transform, opacity' });

        if (this.config.splitBy === 'lines' && this.config.mask !== true) {
            gsap.set(this.targets, { display: 'block' });
        }
    }

    /**
     * Props to clear when the animation settles.
     *
     * @returns {string}
     */
    getClearProps() {
        return this.getBlur() > 0 ? 'willChange,filter' : 'willChange';
    }

    /**
     * Set progress directly for scrub.
     * @param {number} p
     */
    setProgress(p) {
        const clamped = Math.max(0, Math.min(1, p));
        if (!this.targets.length) {
            this.prepare();
            if (!this.targets.length) return;
            this.applyBaseDisplay();
        }
        // Lazily create a paused timeline for scrubbing
        if (!this.timeline || this.timeline._emjeIsScrub !== true) {
            if (this.timeline) this.timeline.kill();
            this.timeline = gsap.timeline({ paused: true });
            this.timeline._emjeIsScrub = true;
            this.timeline.fromTo(
                this.targets,
                this.getFromVars(),
                { ...this.getToVars(), duration: 1, stagger: this.config.stagger ?? 0.04, ease: 'none' }
            );
        }
        this.timeline.progress(clamped);
        if (clamped >= 1) {
            gsap.set(this.targets, { clearProps: this.getClearProps() });
        }
    }

    /**
     * Play animation.
     */
    play() {

		this.killTimeline();

        this.prepare();

        if (!this.targets.length) {
            return;
        }

        this.applyBaseDisplay();

        this.timeline = gsap.timeline({

            delay: this.config.delay ?? 0,

            onComplete: () => {

                this.timeline = null;

            },

        });

        this.timeline.fromTo(

            this.targets,

            this.getFromVars(),

            {
                ...this.getToVars(),
                duration: this.config.duration ?? 0.8,
                stagger: this.config.stagger ?? 0.04,
                ease: this.config.ease ?? 'power2.out',
                onComplete: () => {
                    gsap.set(this.targets, { clearProps: this.getClearProps() });
                },
            }

        );

    }

    /**
     * Cleanup.
     */
    destroy() {

        if (this.timeline) {

            this.timeline.kill();
            this.timeline = null;

        }

        this.masks = [];

        this.splitter.revert();

    }

}
