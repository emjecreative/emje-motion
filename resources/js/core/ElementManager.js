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
