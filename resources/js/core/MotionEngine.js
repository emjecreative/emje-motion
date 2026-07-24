import ElementManager from './ElementManager';
import ScrambleText from '../modules/TextMotion/ScrambleText';

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

		if (elements.length === 0) {
			return;
		}

		elements.forEach((element) => {
			const config = this.elementManager.getConfig(element);

			switch (config.animation) {

				case 'scramble-text':
					new ScrambleText(element, config).play();
					break;

				default:
					break;
			}
		});
	}
}
