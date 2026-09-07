import AsciiInteractive from './AsciiInteractive';

/**
 * Background Motion dispatcher — one ambient effect per Container.
 * Effects: ascii (v1). Aurora is a name placeholder (renders nothing).
 */
export default class BackgroundMotion {
    static initAll() {
        const containers = document.querySelectorAll('[data-emje-background]');
        containers.forEach((el) => {
            if (el.dataset.emjeBackgroundInitialized === 'true') {
                return;
            }
            let config;
            try {
                config = JSON.parse(el.getAttribute('data-emje-background'));
            } catch (e) {
                return;
            }
            if (!config || (config.effect !== 'ascii' && config.effect !== 'ascii-interactive')) {
                return;
            }
            const instance = new AsciiInteractive(el, config);
            if (instance.init()) {
                el.dataset.emjeBackgroundInitialized = 'true';
                BackgroundMotion._instances.set(el, instance);
            }
        });
    }

    static reInit(el) {
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
        if (!config || (config.effect !== 'ascii' && config.effect !== 'ascii-interactive')) {
            return;
        }
        const instance = new AsciiInteractive(el, config);
        if (instance.init()) {
            el.dataset.emjeBackgroundInitialized = 'true';
            BackgroundMotion._instances.set(el, instance);
        }
    }
}

BackgroundMotion._instances = new WeakMap();
if (typeof window !== 'undefined') {
    window.EmjeMotionBackground = BackgroundMotion;
}
