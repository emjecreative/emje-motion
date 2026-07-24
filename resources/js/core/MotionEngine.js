import ElementManager from './ElementManager';

/**
 * Main Motion Engine.
 */
export default class MotionEngine {
    constructor() {
        this.elementManager = new ElementManager();
    }

    /**
     * Initialize the engine.
     */
    init() {
        const elements = this.elementManager.getElements();

        console.log(
            'Motion Engine Initialized',
            elements
        );
    }
}
