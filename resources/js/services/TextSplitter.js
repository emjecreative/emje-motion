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
        this.tokens = [];

        this.isSplit = false;

    }

    /**
     * Split text.
     *
     * @param {Object} options
     */
    split(options = {}) {

        this.revert();

        const by = options.by ?? 'words';

        this.prepare();
        this.parse(by);
        this.render(by);

        this.isSplit = true;

    }

    /**
     * Prepare splitter.
     */
    prepare() {

        this.targets = [];
        this.tokens = [];

    }

    /**
     * Parse content.
     *
     * @param {String} by
     */
    parse(by) {

        const text = this.element.textContent ?? '';

        switch (by) {

            case 'characters':
                this.parseCharacters(text);
                break;

            case 'words':
                this.parseWords(text);
                break;

            case 'lines':
                this.parseLines(text);
                break;

            default:
                throw new Error(`Unsupported split type: ${by}`);

        }

    }

    /**
     * Parse characters.
     *
     * @param {String} text
     */
    parseCharacters(text) {

        this.tokens = Array.from(text).map((character) => ({

            type: 'character',
            value: character,

        }));

    }

    /**
     * Parse words.
     *
     * @param {String} text
     */
    parseWords(text) {

        const words = text.match(/\S+\s*/g) ?? [];

        this.tokens = words.map((word) => ({

            type: 'word',
            value: word,

        }));

    }

    /**
     * Placeholder.
     */
    parseLines() {

        this.tokens = [];

    }

    /**
     * Render tokens.
     *
     * @param {String} by
     */
    render(by) {

        switch (by) {

            case 'characters':
                this.renderCharacters();
                break;

            case 'words':
                this.renderWords();
                break;

            case 'lines':
                this.renderLines();
                break;

        }

    }

    /**
     * Render characters.
     */
    renderCharacters() {

        const fragment = document.createDocumentFragment();

        this.tokens.forEach((token) => {

            const wrapper = this.createWrapper(CLASSES.character);

            wrapper.textContent =
                token.value === ' '
                    ? '\u00A0'
                    : token.value;

            this.targets.push(wrapper);

            fragment.appendChild(wrapper);

        });

        this.element.replaceChildren(fragment);

    }

    /**
     * Render words.
     */
    renderWords() {

        const fragment = document.createDocumentFragment();

        this.tokens.forEach((token) => {

            const wrapper = this.createWrapper(CLASSES.word);

            wrapper.innerHTML = token.value.replace(/ /g, '&nbsp;');

            this.targets.push(wrapper);

            fragment.appendChild(wrapper);

        });

        this.element.replaceChildren(fragment);

    }

    /**
     * Placeholder.
     */
    renderLines() {

        // Coming soon.

    }

    /**
     * Create wrapper.
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
        this.tokens = [];

        this.isSplit = false;

    }

}
