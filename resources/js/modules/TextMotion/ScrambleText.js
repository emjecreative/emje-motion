import { gsap } from 'gsap';
import Animation from '../../core/Animation';

/**
 * Handles the Scramble Text animation.
 */
export default class ScrambleText extends Animation {

    /**
     * Create a new Scramble Text animation.
     *
     * @param {HTMLElement} element
     * @param {Object} config
     */
    constructor(element, config) {
        super(element, config);

		this.originalText = '';
		this.hasOriginal = false;
		this.characters = [];
		this.revealSequence = [];

		this.scrambledCharacters = [];
		this.lastScrambleUpdate = 0;

		// Tracks what this instance last wrote, so destroy() never wipes
		// content it didn't create (e.g. re-init before first play) and
		// never clobbers external edits (e.g. typing in the editor).
		this.hasRendered = false;
		this.lastRendered = '';
    }

	/**
	 * Prepare the animation.
	 *
	 * Captures the clean text once and keeps it. Re-captures only when
	 * the DOM shows our own stale output (replay) or a genuine external
	 * change (edit / re-render). An empty DOM is never adopted, so a
	 * too-early init can be retried later instead of locking in ''.
	 */
	prepare() {
		const current = this.element.textContent ?? '';

		if (!this.hasOriginal) {
			if (current === '') {
				this.characters = [];
				this.revealSequence = [];
				this.scrambledCharacters = [];
				return;
			}

			this.originalText = current;
			this.hasOriginal = true;
		} else if (current !== this.originalText) {
			if (this.hasRendered && current === this.lastRendered) {
				this.element.textContent = this.originalText;
			} else {
				this.originalText = current;
			}
		}

		this.characters = Array.from(
        	this.originalText
    	);

    	this.revealSequence = this.buildRevealSequence();

		this.scrambledCharacters = this.characters.map((character) => {

			if (/\s/.test(character)) {
				return character;
			}

			return this.getRandomCharacter();

		});

		this.lastScrambleUpdate = performance.now();

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

			case 'center-out': {
				const result = [];
				let left = Math.floor((sequence.length - 1) / 2);
				let right = left + 1;

				if (sequence.length % 2 !== 0) {
					result.push(left);
					left -= 1;
				}

				while (left >= 0 || right < sequence.length) {
					if (left >= 0) {
						result.push(left);
						left -= 1;
					}
					if (right < sequence.length) {
						result.push(right);
						right += 1;
					}
				}

				return result;
			}

			case 'random': {
				const shuffled = [...sequence];

				for (let i = shuffled.length - 1; i > 0; i -= 1) {
					const j = Math.floor(Math.random() * (i + 1));
					[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
				}

				return shuffled;
			}

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

		const pool = Array.from(
			characters.length
				? characters
				: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
		);

		const randomIndex = Math.floor(
			Math.random() * pool.length
		);

		return pool[randomIndex];

	}

	/**
	 * Update scrambled characters.
	 */
	updateScrambledCharacters() {

		const now = performance.now();

		const speed = Math.min(5, Math.max(0.5, parseFloat(this.config.scrambleSpeed) || 1));
		const refreshInterval = 100 / speed;

		if (now - this.lastScrambleUpdate < refreshInterval) {
			return;
		}

		this.scrambledCharacters = this.characters.map((character) => {

			if (/\s/.test(character)) {
				return character;
			}

			return this.getRandomCharacter();

		});

		this.lastScrambleUpdate = now;

	}

	/**
	 * Render a single animation frame.
	 *
	 * @param {number} progress
	 */
	renderFrame(progress) {

		if (!this.characters.length) {
			return;
		}

		const revealedCharacters = Math.floor(
			this.characters.length * progress
		);

		const revealedIndexes = new Set(
			this.revealSequence.slice(
				0,
				revealedCharacters
			)
		);

		this.updateScrambledCharacters();

		const output = this.characters.map((character, index) => {

			if (/\s/.test(character)) {
				return character;
			}

			if (revealedIndexes.has(index)) {
				return character;
			}

			return this.scrambledCharacters[index];

		});

		this.lastRendered = output.join('');
		this.hasRendered = true;
		this.element.textContent = this.lastRendered;

	}

	/**
	 * Set progress directly (for scroll scrub).
	 * @param {number} p 0..1
	 */
	setProgress(p) {
		const clamped = Math.max(0, Math.min(1, p));
		if (!this.characters.length) {
			this.prepare();
		}
		this.renderFrame(clamped);
	}

	/**
	 * Play the animation.
	 */
	play() {

		this.killTimeline();

		this.prepare();

		if (!this.characters.length) {
			return;
		}

		const animation = {
			progress: 0,
		};

		this.timeline = gsap.to(animation, {
			progress: 1,
			duration: this.config.duration,
			delay: this.config.delay ?? 0,
			ease: this.config.ease,

			onUpdate: () => {
				this.renderFrame(animation.progress);
			},

			onComplete: () => {
				this.timeline = null;
			},

		});

	}

	/**
	 * Cleanup.
	 */
	destroy() {

		super.destroy();

		if (!this.hasRendered || !this.hasOriginal) {
			return;
		}

		if ((this.element.textContent ?? '') !== this.lastRendered) {
			return;
		}

		this.element.textContent = this.originalText;

	}

}
