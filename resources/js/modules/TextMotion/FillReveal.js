import { gsap } from 'gsap';
import Animation from '../../core/Animation';

/**
 * Handles the Fill Reveal animation.
 */
export default class FillReveal extends Animation {

	/**
	 * Create a new Fill Reveal animation.
	 *
	 * @param {HTMLElement} element
	 * @param {Object} config
	 */
	constructor(element, config) {

		super(element, config);

		this.originalHTML = this.element.innerHTML;

		this.dom = {
			wrapper: null,
			background: null,
			mask: null,
			foreground: null,
		};

	}

	/**
	 * Prepare the animation.
	 */
	prepare() {

		this.build();
		this.setInitialState();

	}

	/**
	 * Build animation markup.
	 */
	build() {

		if ( this.dom.wrapper ) {
			return;
		}

		this.dom.wrapper = this.createWrapper();
		this.dom.background = this.createBackground();
		this.dom.mask = this.createMask();
		this.dom.foreground = this.createForeground();

		this.dom.mask.appendChild( this.dom.foreground );

		this.dom.wrapper.appendChild(this.dom.background);
		this.dom.wrapper.appendChild(this.dom.mask);

		this.element.innerHTML = '';
		this.element.appendChild( this.dom.wrapper );

	}

	/**
	 * Create the wrapper element.
	 *
	 * @returns {HTMLElement}
	 */
	createWrapper() {

		const wrapper = document.createElement( 'span' );

		wrapper.className = 'emje-motion-fill';

		return wrapper;

	}

	/**
	 * Create the background layer.
	 *
	 * @returns {HTMLElement}
	 */
	createBackground() {

		const background = document.createElement( 'span' );

		background.className = 'emje-motion-fill__background';
		background.innerHTML = this.originalHTML;

		if (typeof this.config.fillBgOpacity !== 'undefined') {
			background.style.opacity = String(this.config.fillBgOpacity);
		}

		return background;

	}

	/**
	 * Create the mask element.
	 *
	 * @returns {HTMLElement}
	 */
	createMask() {

		const mask = document.createElement( 'span' );

		mask.className = 'emje-motion-fill__mask';

		return mask;

	}

	/**
	 * Create the foreground layer.
	 *
	 * @returns {HTMLElement}
	 */
	createForeground() {

		const foreground = document.createElement( 'span' );

		foreground.className = 'emje-motion-fill__foreground';
		foreground.innerHTML = this.originalHTML;

		return foreground;

	}

	/**
	 * Set the initial animation state.
	 */
	setInitialState() {

		gsap.set( this.dom.mask, {
			width: 0,
		} );

	}

	/**
	 * Play the animation.
	 */
	play() {

		this.killTimeline();

		this.prepare();

		this.animate();

	}

	/**
	 * Run the animation.
	 */
	animate() {

		this.timeline = gsap.timeline( {

			delay: this.config.delay ?? 0,

			onComplete: () => {

				this.timeline = null;

			},

		} );

		this.timeline.to( this.dom.mask, {

			width: '100%',

			duration: this.config.duration,

			ease: this.config.ease,

		} );

	}

	/**
	 * Destroy the animation.
	 */
	destroy() {

		super.destroy();

		if ( ! this.dom.wrapper ) {
			return;
		}

		this.element.innerHTML = this.originalHTML;

		this.dom = {
			wrapper: null,
			background: null,
			mask: null,
			foreground: null,
		};

	}

}
