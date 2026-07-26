import ElementManager from './ElementManager';
import ScrambleText from '../modules/TextMotion/ScrambleText';
import TextUnfold from '../modules/TextMotion/TextUnfold';
import FillReveal from '../modules/TextMotion/FillReveal';

/**
 * Main Motion Engine.
 */
export default class MotionEngine {

	constructor() {
		this.elementManager = new ElementManager();
	}

	/**
	 * Create animation instance.
	 *
	 * @param {HTMLElement} element
	 * @param {Object} config
	 *
	 * @returns {Object|null}
	 */
	createAnimation(element, config) {

		switch (config.animation) {

			case 'scramble-text':
				return new ScrambleText(element, config);

			case 'text-unfold':
				return new TextUnfold(element, config);

			case 'fill-reveal':
				return new FillReveal(element, config );

			default:
				return null;

		}

	}

	/**
	 * Setup animation trigger.
	 *
	 * @param {Object} animation
	 * @param {HTMLElement} element
	 * @param {Object} config
	 */
	setupTrigger(animation, element, config) {

		let hasPlayed = false;

		const playAnimation = () => {

			if (config.playOnce && hasPlayed) {
				return;
			}

			animation.play();

			hasPlayed = true;

		};

		switch (config.trigger) {

			case 'hover':

				element.addEventListener('mouseenter', () => {

					playAnimation();

				});

				break;

			case 'viewport': {

				const observer = new IntersectionObserver((entries) => {

					entries.forEach((entry) => {

						if (!entry.isIntersecting) {
							return;
						}

						playAnimation();

						if (config.playOnce) {
							observer.unobserve(element);
						}

					});

				});

				observer.observe(element);

				break;

			}

			case 'page-load':
			default:

				playAnimation();

				break;

		}

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

			const targetElement = this.elementManager.getTargetElement(
				element
			);

			const animation = this.createAnimation(
				targetElement,
				config
			);

			if (!animation) {
				return;
			}

			this.setupTrigger(
				animation,
				element,
				config
			);

		});

	}

}
