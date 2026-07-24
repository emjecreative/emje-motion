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
}
