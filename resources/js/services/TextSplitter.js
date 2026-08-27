const CLASSES = {
    character: 'emje-motion-char',
    word: 'emje-motion-word',
    line: 'emje-motion-line',
};

export default class TextSplitter {

    /**
     * @param {HTMLElement} element
     */
    constructor(element) {

        this.element = element;
        this.originalHTML = element.innerHTML;

        this.targets = [];
        this.isSplit = false;

    }

    /**
     * Split element.
     *
     * @param {Object} options
     */
    split(options = {}) {

        this.revert();

        this.targets = [];

        const type = options.type ?? options.by ?? 'words';

        switch (type) {

            case 'characters':
                this.splitCharacters();
                break;

            case 'words':
                this.splitWords();
                break;

            case 'lines':
                this.splitLines();
                break;

            default:
                throw new Error(`Unsupported split type: ${type}`);

        }

        this.isSplit = true;

		return this.targets;

    }

    /**
     * Split by words.
     */
    splitWords() {

        this.walk(this.element, CLASSES.word, false);

    }

    /**
     * Split by characters.
     */
    splitCharacters() {

        this.walk(this.element, CLASSES.character, true);

    }

    /**
     * Placeholder.
     */
    splitLines() {

        // Coming later.

    }

	/**
	 * Check whether node can be split.
	 *
	 * @param {Node} node
	 * @returns {Boolean}
	 */
	isSplittable(node) {

		return (
			node.nodeType === Node.TEXT_NODE &&
			node.textContent.trim() !== ''
		);

	}

    /**
     * Walk recursively through the DOM.
     *
     * @param {Node} node
     * @param {String} className
     * @param {Boolean} characters
     */
    walk(node, className, characters) {

        const children = Array.from(node.childNodes);

        children.forEach((child) => {

            if (this.isSplittable(child)) {

                this.splitTextNode(
                    child,
                    className,
                    characters
                );

                return;

            }

            if (child.nodeType === Node.ELEMENT_NODE) {

                this.walk(
                    child,
                    className,
                    characters
                );

            }

        });

    }

    /**
     * Split a single text node.
     *
     * @param {Text} node
     * @param {String} className
     * @param {Boolean} characters
     */
	splitTextNode(node, className, characters) {

		const fragment = document.createDocumentFragment();

		const parts = characters
			? Array.from(node.textContent)
			: node.textContent.match(/\S+\s*/g) ?? [];

		parts.forEach((part) => {

			const wrapper = this.createWrapper(className);

			if (characters) {

				wrapper.textContent =
					part === ' '
						? '\u00A0'
						: part;

			} else {

				wrapper.innerHTML =
					part.replace(/ /g, '&nbsp;');

			}

			this.targets.push(wrapper);

			fragment.appendChild(wrapper);

		});

		node.replaceWith(fragment);

	}

    /**
     * Create wrapper element.
     *
     * @param {String} className
     * @returns {HTMLSpanElement}
     */
	createWrapper(className) {

		const wrapper = document.createElement('span');

		wrapper.className = className;

		return wrapper;

	}

    /**
     * Get animation targets.
     *
     * @returns {HTMLElement[]}
     */
	/**
	 * @deprecated
	 * Use split() return value instead.
	 */
    getTargets() {

        return this.targets;

    }

    /**
     * Restore original markup.
     */
    revert() {

        if (!this.isSplit) {
            return;
        }

        this.element.innerHTML = this.originalHTML;

        this.targets = [];

        this.isSplit = false;

    }

}
