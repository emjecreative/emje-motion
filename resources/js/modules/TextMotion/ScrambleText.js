import { gsap } from 'gsap';

/**
 * Handles the Scramble Text animation.
 */
export default class ScrambleText {

    /**
     * Create a new Scramble Text animation.
     *
     * @param {HTMLElement} element
     * @param {Object} config
     */
    constructor(element, config) {
        this.element = element;
        this.config = config;

		this.originalText = '';
		this.characters = [];
		this.revealSequence = [];
    }

	/**
	 * Prepare the animation.
	 */
	prepare() {
		this.originalText = this.element.textContent;

		this.characters = Array.from(
        	this.originalText
    	);

    	this.revealSequence = this.buildRevealSequence();

	}

	/**
	 * Build the reveal sequence.
	 *
	 * @returns {number[]}
	 */
	buildRevealSequence() {

		const sequence = this.characters.map(
			(_, index) => index
		);

		switch (this.config.revealOrder) {

			case 'right-to-left':
				return sequence.reverse();

			default:
				return sequence;

		}

	}

	/**
	 * Get a random character.
	 *
	 * @returns {string}
	 */
	getRandomCharacter() {

		let characters = '';

		switch (this.config.characterSet) {

		case 'letters':
			characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
			break;

		case 'numbers':
			characters = '0123456789';
			break;

		case 'letters-numbers':
			characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
			break;

		case 'symbols':
			characters = '!@#$%^&*()[]{}<>?/+=-_';
			break;

		case 'custom':
			characters = this.config.customCharacters;
			break;

		default:
			characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

		}

		if (!characters.length) {
			characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		}

		const randomIndex = Math.floor(
			Math.random() * characters.length
		);

		return characters[randomIndex];

	}

	/**
	 * Render a single animation frame.
	 *
	 * @param {number} progress
	 */
	renderFrame(progress) {

		const revealedCharacters = Math.floor(
			this.characters.length * progress
		);

		const revealedIndexes = new Set(
			this.revealSequence.slice(
				0,
				revealedCharacters
			)
		);

		const output = this.characters.map((character, index) => {

			if (/\s/.test(character)) {
				return character;
			}

			if (revealedIndexes.has(index)) {
				return character;
			}

			return this.getRandomCharacter();

		});

		this.element.textContent = output.join('');

	}

	/**
	 * Play the animation.
	 */
	play() {

		this.prepare();
		const animation = {
			progress: 0,
		};

		gsap.to(animation, {
			progress: 1,
			duration: this.config.duration,
    		ease: this.config.ease,
			onUpdate: () => {

				this.renderFrame(animation.progress);

			},

		});

	}

}
