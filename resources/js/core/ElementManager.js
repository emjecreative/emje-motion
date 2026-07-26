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
	 * @returns {Object}
	 */
	getConfig(element) {

		return JSON.parse(
			element.dataset.emjeMotion
		);

	}

}
