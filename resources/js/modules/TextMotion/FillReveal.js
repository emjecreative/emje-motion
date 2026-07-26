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

		this.wrapper = null;
		this.backgroundLayer = null;
		this.mask = null;
		this.foregroundLayer = null;

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

		if ( this.wrapper ) {
			return;
		}

		this.wrapper = this.createWrapper();
		this.backgroundLayer = this.createBackground();
		this.mask = this.createMask();
		this.foregroundLayer = this.createForeground();

		this.mask.appendChild( this.foregroundLayer );

		this.wrapper.appendChild( this.backgroundLayer );
		this.wrapper.appendChild( this.mask );

		this.element.innerHTML = '';
		this.element.appendChild( this.wrapper );

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

		gsap.set( this.mask, {
			width: 0,
		} );

	}

	/**
	 * Play the animation.
	 */
	play() {

		this.killTimeline();

		this.prepare();

		this.timeline = gsap.timeline( {

			delay: this.config.delay,

			onComplete: () => {

				this.timeline = null;

			},

		} );

		this.timeline.to( this.mask, {

			width: this.wrapper.offsetWidth,

			duration: this.config.duration,

			ease: this.config.ease,

		} );

	}

	/**
	 * Destroy the animation.
	 */
	destroy() {

		super.destroy();

		if ( ! this.wrapper ) {
			return;
		}

		this.element.innerHTML = this.originalHTML;

		this.wrapper = null;
		this.backgroundLayer = null;
		this.mask = null;
		this.foregroundLayer = null;

	}

}
