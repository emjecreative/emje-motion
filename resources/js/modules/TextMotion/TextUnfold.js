import { gsap } from 'gsap';
import TextSplitter from '../../services/TextSplitter';

/**
 * Handles the Text Unfold animation.
 */
export default class TextUnfold {

    /**
     * @param {HTMLElement} element
     * @param {Object} config
     */
    constructor(element, config) {

        this.element = element;
        this.config = config;

        this.splitter = new TextSplitter(element);

        this.targets = [];
        this.timeline = null;

    }

    /**
     * Prepare animation.
     */
    prepare() {

        this.splitter.split({
            by: this.config.splitBy ?? 'words',
        });

        this.targets = this.splitter.getTargets();

		console.log(this.targets);

    }

    /**
     * Play animation.
     */
    play() {

        if (this.timeline) {

            this.timeline.kill();
            this.timeline = null;

        }

        this.prepare();

        if (!this.targets.length) {
            return;
        }

        gsap.set(this.targets, {
			// yPercent: 120,
    		// opacity: 0,
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
