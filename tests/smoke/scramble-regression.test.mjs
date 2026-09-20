import { tmpUrl, model, eq } from './helpers.mjs';

const { default: ScrambleText } = await import(tmpUrl('mod-scrambletext.mjs'));
const { buildTextMotionConfig } = await import(tmpUrl('eb-textMotionBridge.mjs'));

const baseConfig = {
    characterSet: 'letters-numbers',
    customCharacters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    revealOrder: 'left-to-right',
    scrambleSpeed: 1,
    duration: 1,
    delay: 0,
    ease: 'power2.out',
};

const el = (text) => ({ textContent: text });

// 1. Reported bug: destroy() before first play must NOT wipe the text.
// (Viewport trigger below the fold: re-init destroys an instance that
// never played, then play() captures the wiped '' forever.)
const fresh = el('HALO');
new ScrambleText(fresh, { ...baseConfig }).destroy();
eq('scramble-destroy-before-play-keeps-text', fresh.textContent, 'HALO');

// 2. Normal cycle: prepare + frame + destroy restores the original.
const played = el('HALO');
const anim = new ScrambleText(played, { ...baseConfig });
anim.prepare();
anim.renderFrame(0);
anim.destroy();
eq('scramble-destroy-after-play-restores', played.textContent, 'HALO');

// 3. Replay mid-animation must not corrupt the stored original.
const replay = el('HALO');
const anim2 = new ScrambleText(replay, { ...baseConfig });
anim2.prepare();
anim2.renderFrame(0.3);
anim2.prepare();
eq('scramble-replay-keeps-original', anim2.originalText, 'HALO');
eq('scramble-replay-chars-clean', anim2.characters.join(''), 'HALO');

// 4. Empty DOM is never adopted as the original; a later retry captures it.
const late = el('');
const anim3 = new ScrambleText(late, { ...baseConfig });
anim3.prepare();
anim3.destroy();
eq('scramble-empty-not-adopted', anim3.hasOriginal, false);
eq('scramble-empty-dom-untouched', late.textContent, '');
late.textContent = 'HALO';
anim3.prepare();
eq('scramble-late-capture', anim3.originalText, 'HALO');

// 5. External edits (typing in the editor) are not clobbered by destroy().
const edited = el('HALO');
const anim4 = new ScrambleText(edited, { ...baseConfig });
anim4.prepare();
anim4.renderFrame(0.5);
edited.textContent = 'BARU';
anim4.destroy();
eq('scramble-external-edit-kept', edited.textContent, 'BARU');

// 6. Custom emoji set stays intact (no split surrogate pairs).
const emojiAnim = new ScrambleText(el('AB'), {
    ...baseConfig,
    characterSet: 'custom',
    customCharacters: '😀😃',
});
const picked = emojiAnim.getRandomCharacter();
eq('scramble-emoji-intact', Array.from(picked).length, 1);
eq('scramble-emoji-from-pool', ['😀', '😃'].includes(picked), true);

// 7. Random reveal order is a valid permutation (Fisher-Yates).
const randAnim = new ScrambleText(el('ABCDE'), { ...baseConfig, revealOrder: 'random' });
randAnim.prepare();
eq('scramble-random-permutation', [...randAnim.revealSequence].sort((a, b) => a - b), [0, 1, 2, 3, 4]);

// 8. Bridge falls back on garbage character set / reveal order (parity with PHP).
const bogus = buildTextMotionConfig(model({
    emje_motion_scramble_character_set: 'huruf',
    emje_motion_scramble_reveal_order: 'acak',
}));
eq('scramble-charset-fallback', bogus.characterSet, 'letters-numbers');
eq('scramble-reveal-fallback', bogus.revealOrder, 'left-to-right');
