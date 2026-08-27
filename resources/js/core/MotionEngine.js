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

			case 'load':
			case 'page-load':
			default:

				playAnimation();

				break;

		}

	}

	/**
	 * Check whether reduced motion is preferred.
	 *
	 * @returns {boolean}
	 */
	prefersReducedMotion() {

		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	}

	/**
	 * Initialize a single element.
	 *
	 * @param {HTMLElement} element
	 */
	initElement(element) {

		if (element.dataset.emjeMotionInitialized === 'true') {
			return;
		}

		const config = this.elementManager.getConfig(element);

		if (!config) {
			return;
		}

		// Respect prefers-reduced-motion — do not animate.
		if (this.prefersReducedMotion()) {
			return;
		}

		const targetElement = this.elementManager.getTargetElement(element);

		const animation = this.createAnimation(targetElement, config);

		if (!animation) {
			return;
		}

		element.dataset.emjeMotionInitialized = 'true';

		this.setupTrigger(animation, element, config);

	}

	/**
	 * Initialize the engine.
	 */
	init() {

		const elements = this.elementManager.getElements();

		if (elements.length > 0) {
			elements.forEach((element) => this.initElement(element));
		}

		this.observeNewElements();

		this.hookElementorFrontend();

	}

	/**
	 * Observe dynamically added elements (popups, AJAX, infinite scroll).
	 */
	observeNewElements() {

		if (typeof MutationObserver === 'undefined') {
			return;
		}

		const observer = new MutationObserver((mutations) => {

			mutations.forEach((mutation) => {

				mutation.addedNodes.forEach((node) => {

					if (!(node instanceof HTMLElement)) {
						return;
					}

					if (node.matches('[data-emje-motion]')) {
						this.initElement(node);
					}

					node.querySelectorAll('[data-emje-motion]').forEach((el) => {

						this.initElement(el);

					});

				});

			});

		});

		observer.observe(document.body, { childList: true, subtree: true });

	}

	/**
	 * Hook into Elementor frontend lifecycle.
	 */
	hookElementorFrontend() {

		if (typeof window.elementorFrontend === 'undefined') {
			window.addEventListener('elementor/frontend/init', () => this.hookElementorFrontend());

			return;
		}

		if (window.elementorFrontend.hooks) {
			window.elementorFrontend.hooks.addAction('frontend/element_ready/global', ($el) => {

				const el = $el instanceof jQuery ? $el[0] : $el;

				if (!el) {
					return;
				}

				if (el.matches('[data-emje-motion]')) {
					this.initElement(el);
				}

				el.querySelectorAll('[data-emje-motion]').forEach((child) => {

					this.initElement(child);

				});

			});
		}

	}

}
