/**
 * Handles Emje Motion elements.
 */
export default class ElementManager {

	/**
	 * Get all motion elements.
	 *
	 * @returns {HTMLElement[]}
	 */
	getElements() {

		return Array.from(
			document.querySelectorAll('[data-emje-motion]')
		);

	}

	/**
	 * Get animation target element.
	 *
	 * @param {HTMLElement} element
	 * @returns {HTMLElement}
	 */
	getTargetElement(element) {

		return (
			element.querySelector('.elementor-heading-title') ??
			element.querySelector('.elementor-text-editor') ??
			element
		);

	}

	/**
	 * Get motion configuration.
	 *
	 * @param {HTMLElement} element
	 * @returns {Object|null}
	 */
	getConfig(element) {

		const raw = element.dataset.emjeMotion;

		if (!raw) {
			return null;
		}

		try {
			const config = JSON.parse(raw);

			if (!config || typeof config !== 'object') {
				return null;
			}

			const allowedAnimations = ['scramble-text', 'text-unfold', 'fill-reveal'];
			const allowedTriggers = ['load', 'viewport', 'hover', 'scroll', 'page-load'];

			if (config.animation && !allowedAnimations.includes(config.animation)) {
				return null;
			}

			if (config.trigger && !allowedTriggers.includes(config.trigger)) {
				config.trigger = 'load';
			}

			return config;
		} catch (e) {
			return null;
		}

	}

}
