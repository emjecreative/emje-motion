import gsap from 'gsap';

/**
 * Text Follow strategy: label pill that trails the cursor.
 * Each function operates on the host InteractiveCursor instance (ctx).
 */
export function buildTextFollow(ctx) {
    ctx.followEl = document.createElement('div');
    ctx.followEl.className = 'emje-cursor__follow';
    ctx.followEl.style.setProperty('--emje-follow-bg', ctx.config.bgColor);
    ctx.followEl.style.setProperty('--emje-follow-text', ctx.config.textColor);
    ctx.followEl.style.setProperty('--emje-follow-py', `${ctx.config.paddingY}px`);
    ctx.followEl.style.setProperty('--emje-follow-px', `${ctx.config.paddingX}px`);
    ctx.followEl.style.setProperty('--emje-follow-radius', `${ctx.config.radius}px`);
    ctx.followEl.style.setProperty('--emje-follow-fs', `${ctx.config.fontSize}px`);
    // Box shadow via Elementor group (preferred) — fallback to legacy shadowBlur
    const boxShadowVal = ctx.config.boxShadow && ctx.config.boxShadow !== 'none' ? ctx.config.boxShadow : (ctx.config.shadow ? `0px 8px ${ctx.config.shadowBlur}px 0px rgba(0, 0, 0, 0.12)` : 'none');
    ctx.followEl.style.boxShadow = boxShadowVal;

    ctx.labelEl = document.createElement('span');
    ctx.labelEl.className = 'emje-cursor__label emje-cursor__label--follow';
    ctx.labelEl.textContent = ctx.config.label || 'View';

    // Typography (Elementor group) — apply inline to label
    const typo = ctx.config.typography;
    if (typo) {
        if (typo.fontFamily) ctx.labelEl.style.fontFamily = typo.fontFamily;
        if (typo.fontSize) {
            const fs = String(typo.fontSize);
            if (fs.startsWith('var(')) {
                ctx.labelEl.style.fontSize = fs;
            } else {
                ctx.labelEl.style.fontSize = typo.fontSize + (typo.fontSizeUnit || 'px');
            }
        } else {
            ctx.labelEl.style.fontSize = `${ctx.config.fontSize}px`;
        }
        if (typo.fontWeight) ctx.labelEl.style.fontWeight = typo.fontWeight;
        if (typo.textTransform) ctx.labelEl.style.textTransform = typo.textTransform;
        if (typo.fontStyle) ctx.labelEl.style.fontStyle = typo.fontStyle;
        if (typo.lineHeight) ctx.labelEl.style.lineHeight = typo.lineHeight;
        if (typo.letterSpacing) ctx.labelEl.style.letterSpacing = typo.letterSpacing;
    } else {
        ctx.labelEl.style.fontSize = `${ctx.config.fontSize}px`;
    }
    ctx.followEl.appendChild(ctx.labelEl);
    ctx.cursorEl.appendChild(ctx.followEl);
}

export function enterTextFollow(ctx) {
    const entrance = ctx.config.entrance;
    if (entrance === 'none') {
        gsap.to(ctx.cursorEl, { opacity: 1, duration: 0.2, ease: 'power2.out' });
        gsap.set(ctx.followEl, { scale: 1 });
    } else if (entrance === 'scale-bounce') {
        gsap.set(ctx.followEl, { scale: 0.3 });
        gsap.to(ctx.cursorEl, { opacity: 1, duration: 0.15, ease: 'power2.out' });
        gsap.to(ctx.followEl, { scale: 1, duration: 0.45, ease: 'back.out(1.4)' });
    } else {
        // scale — Scale Smooth (default)
        gsap.set(ctx.followEl, { scale: 0.5 });
        gsap.to(ctx.cursorEl, { opacity: 1, duration: 0.2, ease: 'power2.out' });
        gsap.to(ctx.followEl, { scale: 1, duration: 0.35, ease: 'power2.out' });
    }
}

export function leaveTextFollow(ctx) {
    const scaleTo = ctx.config.entrance === 'scale-bounce' ? 0.3 : 0.5;
    gsap.to(ctx.followEl, { scale: scaleTo, duration: 0.2, ease: 'power2.in' });
    gsap.to(ctx.cursorEl, {
        opacity: 0, duration: 0.18, ease: 'power2.in', onComplete: () => {
            if (!ctx.isInside) ctx.cursorEl.classList.add('emje-cursor--hidden');
        },
    });
}
