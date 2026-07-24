import MotionEngine from './core/MotionEngine';

/**
 * Bootstrap Emje Motion.
 */
document.addEventListener('DOMContentLoaded', () => {
    const engine = new MotionEngine();

    engine.init();
});
