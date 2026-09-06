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

    }

    /**
     * Prepare animation.
     */
    prepare() {

	this.targets = this.splitter.split({
		by: this.config.splitBy ?? 'words',
	});

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
            gsap.set(this.targets, { display: 'inline-block', willChange: 'transform, opacity' });
        }
        // Lazily create a paused timeline for scrubbing
        if (!this.timeline || this.timeline._emjeIsScrub !== true) {
            if (this.timeline) this.timeline.kill();
            this.timeline = gsap.timeline({ paused: true });
            this.timeline._emjeIsScrub = true;
            this.timeline.fromTo(
                this.targets,
                { yPercent: 120, opacity: 0 },
                { yPercent: 0, opacity: 1, duration: 1, stagger: this.config.stagger ?? 0.04, ease: 'none' }
            );
        }
        this.timeline.progress(clamped);
        if (clamped >= 1) {
            gsap.set(this.targets, { clearProps: 'willChange' });
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

        gsap.set(this.targets, {
			display: 'inline-block',
            willChange: 'transform, opacity',
        });

        this.timeline = gsap.timeline({

            delay: this.config.delay ?? 0,

            onComplete: () => {

                this.timeline = null;

            },

        });

        this.timeline.fromTo(

            this.targets,

            {
                yPercent: 120,
                opacity: 0,
            },

            {
                yPercent: 0,
                opacity: 1,
                duration: this.config.duration ?? 0.8,
                stagger: this.config.stagger ?? 0.04,
                ease: this.config.ease ?? 'power2.out',
                onComplete: () => {
                    gsap.set(this.targets, { clearProps: 'willChange' });
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

        this.splitter.revert();

    }

}
