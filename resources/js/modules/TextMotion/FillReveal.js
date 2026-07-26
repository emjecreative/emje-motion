import { gsap } from 'gsap';
import Animation from '../../core/Animation';

/**
 * Handles the Fill Reveal animation.
 */
export default class FillReveal {

	/**
	 * Create a new Fill Reveal animation.
	 *
	 * @param {HTMLElement} element
	 * @param {Object} config
	 */
	constructor( element, config ) {

		this.element = element;
		this.config = config;

		this.originalHTML = this.element.innerHTML;

		this.wrapper = null;
		this.backgroundLayer = null;
		this.mask = null;
		this.foregroundLayer = null;

		this.timeline = null;

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

		this.wrapper = document.createElement( 'span' );
		this.backgroundLayer = document.createElement( 'span' );
		this.mask = document.createElement( 'span' );
		this.foregroundLayer = document.createElement( 'span' );

		this.wrapper.className = 'emje-motion-fill';
		this.backgroundLayer.className = 'emje-motion-fill__background';
		this.mask.className = 'emje-motion-fill__mask';
		this.foregroundLayer.className = 'emje-motion-fill__foreground';

		this.backgroundLayer.innerHTML = this.originalHTML;
		this.foregroundLayer.innerHTML = this.originalHTML;

		this.mask.appendChild( this.foregroundLayer );

		this.wrapper.appendChild( this.backgroundLayer );
		this.wrapper.appendChild( this.mask );

		this.element.innerHTML = '';
		this.element.appendChild( this.wrapper );

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

		if ( this.timeline ) {

			this.timeline.kill();
			this.timeline = null;

		}

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

}
