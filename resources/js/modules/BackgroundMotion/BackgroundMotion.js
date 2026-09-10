import AsciiInteractive from './AsciiInteractive';
import PixelGrid from './PixelGrid';

/**
 * Background Motion dispatcher — ambient Container backgrounds.
 * Effects: ascii / pixel.
 */
export default class BackgroundMotion {
    static createInstance(el, config) {
        if (!config) {
            return null;
        }
        if (config.effect === 'pixel') {
            return new PixelGrid(el, config);
        }
        return new AsciiInteractive(el, config);
    }

    static initAll() {
        const containers = document.querySelectorAll('[data-emje-background]');
        containers.forEach((el) => {
            if (el.dataset.emjeBackgroundInitialized === 'true') {
                return;
            }
            try {
                let config;
                try {
                    config = JSON.parse(el.getAttribute('data-emje-background'));
                } catch (e) {
                    return;
                }
                const instance = BackgroundMotion.createInstance(el, config);
                if (instance && instance.init()) {
                    el.dataset.emjeBackgroundInitialized = 'true';
                    BackgroundMotion._instances.set(el, instance);
                }
            } catch (e) {
                // One bad container must never kill the whole boot.
            }
        });
    }

    static reInit(el) {
        try {
            const old = BackgroundMotion._instances.get(el);
            if (old) {
                old.destroy();
                BackgroundMotion._instances.delete(el);
                delete el.dataset.emjeBackgroundInitialized;
            }
            let config;
            try {
                config = JSON.parse(el.getAttribute('data-emje-background'));
            } catch (e) {
                return;
            }
            const instance = BackgroundMotion.createInstance(el, config);
            if (instance && instance.init()) {
                el.dataset.emjeBackgroundInitialized = 'true';
                BackgroundMotion._instances.set(el, instance);
            }
        } catch (e) {
            // Never let a single container break the caller.
        }
    }
}

BackgroundMotion._instances = new WeakMap();
if (typeof window !== 'undefined') {
    window.EmjeMotionBackground = BackgroundMotion;
}
