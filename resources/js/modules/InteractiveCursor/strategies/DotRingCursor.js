import gsap from 'gsap';

/**
 * Dot + Ring strategy: dot with a lagging ring, hover scale over links.
 * Each function operates on the host InteractiveCursor instance (ctx).
 */
export function buildDotRing(ctx) {
    ctx.dotEl = document.createElement('div');
    ctx.dotEl.className = 'emje-cursor__dot';
    ctx.cursorEl.appendChild(ctx.dotEl);

    ctx.ringEl = document.createElement('div');
    ctx.ringEl.className = 'emje-cursor__ring';

    if (ctx.config.label) {
        ctx.labelEl = document.createElement('span');
        ctx.labelEl.className = 'emje-cursor__label';
        ctx.labelEl.textContent = ctx.config.label;
        ctx.ringEl.appendChild(ctx.labelEl);
    }

    ctx.cursorEl.appendChild(ctx.ringEl);
}

export function onInteractiveEnter(ctx) {
    if (!ctx.ringEl) {
        return;
    }

    gsap.to(ctx.ringEl, {
        scale: ctx.config.hoverScale,
        duration: 0.25,
        ease: 'power2.out',
    });

    if (ctx.cursorEl) {
        ctx.cursorEl.classList.add('emje-cursor--hover');
    }
}

export function onInteractiveLeave(ctx) {
    ctx.resetScale();
}

export function bindDotRingHover(ctx) {
    ctx._interactiveHandlers = [];
    const interactiveEls = ctx.container.querySelectorAll('a, button, .elementor-button, [role="button"]');
    interactiveEls.forEach((el) => {
        const enter = onInteractiveEnter.bind(null, ctx);
        const leave = onInteractiveLeave.bind(null, ctx);
        el.addEventListener('mouseenter', enter);
        el.addEventListener('mouseleave', leave);
        ctx._interactiveHandlers.push([el, enter, leave]);
    });
}
