/**
 * Base class for all animations.
 */
export default class Animation {

    /**
     * @param {HTMLElement} element
     * @param {Object} config
     */
    constructor(element, config) {

        this.element = element;
        this.config = config;

        this.timeline = null;

    }

    /**
     * Destroy active timeline.
     */
    killTimeline() {

        if (!this.timeline) {
            return;
        }

        this.timeline.kill();

        this.timeline = null;

    }

    /**
     * Cleanup animation.
     */
    destroy() {

        this.killTimeline();

    }

}
