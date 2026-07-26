import { gsap } from 'gsap';
import TextSplitter from '../../services/TextSplitter';

/**
 * Handles the Text Unfold animation.
 */
export default class TextUnfold {

	/**
	 * Create a new Text Unfold animation.
	 *
	 * @param {HTMLElement} element
	 * @param {Object} config
	 */
	constructor(element, config) {

		this.element = element;
		this.config = config;

		this.splitter = new TextSplitter(this.element);

		this.originalHTML = this.element.innerHTML;

		this.wrapper = null;
		this.content = null;
		this.timeline = null;

	}

	/**
	 * Prepare the animation.
	 */
	prepare() {

		this.splitter.split({
			by: this.config.splitBy ?? 'words',
		});

		this.targets = this.splitter.getTargets();

	}

	/**
	 * Build animation markup.
	 */
	build() {

		if (this.wrapper) {
			return;
		}

		this.wrapper = document.createElement('span');
		this.content = document.createElement('span');

		this.wrapper.className = 'emje-motion-unfold';
		this.content.className = 'emje-motion-unfold__content';

		this.content.innerHTML = this.originalHTML;

		this.wrapper.appendChild(this.content);

		this.element.innerHTML = '';

		this.element.appendChild(this.wrapper);

	}

	/**
	 * Set the initial animation state.
	 */
	setInitialState() {

		gsap.set(this.wrapper, {
			display: 'inline-block',
			overflow: 'hidden',
			paddingTop: '0.05em',
			paddingBottom: '0.18em',
		});

		gsap.set(this.content, {
			display: 'inline-block',
			yPercent: 120,
			opacity: 0,
			scaleY: 1.08,
			transformOrigin: 'bottom center',
			willChange: 'transform, opacity',
		});

	}

	/**
	 * Play the animation.
	 */
	play() {

		if (this.timeline) {

			this.timeline.kill();
			this.timeline = null;

		}

		this.prepare();

		this.timeline = gsap.timeline({

			delay: this.config.delay,

			onComplete: () => {

				this.timeline = null;

			},

		});

		this.timeline

			.fromTo(
				this.content,
				{
					yPercent: 120,
					opacity: 0,
					scaleY: 1.08,
				},
				{
					yPercent: 0,
					opacity: 1,
					scaleY: 1,
					duration: this.config.duration,
					ease: this.config.ease,
				}
			)

	}

}
