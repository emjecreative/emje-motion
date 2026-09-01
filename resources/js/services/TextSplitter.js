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
     * Split by visual lines (wrap-aware).
     * Wraps words into spans, groups by offsetTop, wraps each line into div.
     */
    splitLines() {
        // Step 1: split into words first (re-uses walk but we need fresh)
        this.walk(this.element, CLASSES.word, false);

        if (!this.targets.length) {
            return;
        }

        // Force layout so getBoundingClientRect is accurate
        // Group words by visual row (top)
        const groups = [];
        let currentGroup = [];
        let lastTop = null;

        this.targets.forEach((word) => {
            const rect = word.getBoundingClientRect();
            const top = rect.top;
            if (lastTop === null || Math.abs(top - lastTop) < 2) {
                currentGroup.push(word);
            } else {
                groups.push(currentGroup);
                currentGroup = [word];
            }
            lastTop = top;
        });
        if (currentGroup.length) {
            groups.push(currentGroup);
        }

        // Fallback: if all words on same line (single row) but we still want line wrapper
        // Create line wrappers
        const lineElements = [];
        groups.forEach((group) => {
            const lineEl = document.createElement('div');
            lineEl.className = CLASSES.line;
            // Move words into line element preserving order
            // Need to insert lineEl at position of first word in group
            const firstWord = group[0];
            const parent = firstWord.parentNode;
            // Insert lineEl before first word
            parent.insertBefore(lineEl, firstWord);
            group.forEach((w) => {
                lineEl.appendChild(w);
            });
            lineElements.push(lineEl);
        });

        // Update targets to be line elements
        this.targets = lineElements;
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
