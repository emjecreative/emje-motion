# Emje Motion

Beautiful motion for your website.

Emje Motion gives your pages movement with a purpose — every animation earns its place. Simple controls, visitors who stay.

## Features

### Text Motion (Widget: Heading, Text Editor)
- **Scramble Text** — character set, reveal order, scramble speed
- **Text Unfold** — split by words/characters, stagger
- **Fill Reveal** — background opacity
- Timing: Duration, Delay, Ease (GSAP)
- Trigger: Page Load / Scroll Into View / Hover + Play Once

### Smooth Scroll (Global)
- Lenis 1.3.26 (MIT) — lerp & wheel multiplier
- Respects `prefers-reduced-motion` and mobile disable
- Anchor handling with `data-lenis-prevent`

### Interaction Motion (Container) — 1 effect per Container
- **Effect:** Hover Reveal or Interactive Cursor (like Text Motion)
- **Hover Reveal** — Image follow-cursor (GSAP quickTo), Reveal animation: fade / scale / clip-path, Trigger area: whole container or heading only, Image Size/Scale/Offset/Rotate
- **Interactive Cursor** — Cursor types: **Text Follow** (label + bg/text, padding Y 40 / X 32, radius 99, typography Global, shadow, smoothness), **Dot + Ring** (size, color, hover scale), **Comet Trail** (3-12 dots, size 20, head/tail gradient, lag 0.35, fade) — hide native, per-Container
- Per-container, not global — preserves accessibility, Style tab

### Admin Dashboard
- **Overview** — enable/disable modules individually
- **Settings** — Respect Reduced Motion, Disable on Mobile, Debug Mode, Smooth Scroll lerp/wheel
- **About** — version, docs, support links

## Requirements

- WordPress 6.7+
- Elementor 3.23+ (Free)
- PHP 8.2+
- Modern browser (Chrome/Edge/Firefox/Safari latest 2)

## Installation

1. Upload `emje-motion` to `/wp-content/plugins/`
2. Activate via **Plugins** menu
3. Ensure Elementor is active
4. Configure at **Emje Motion → Overview / Settings**

## Performance

- Conditional asset loading — only on pages with motion
- Single bundle: `dist/js/frontend.js` ~39.88KB gzipped, CSS ~1.17KB (Comet Trail + Text Follow)
- Respects `prefers-reduced-motion: reduce`
- Mobile fallback for Interaction Motion (Hover Reveal & Cursor hidden on touch)

## Development

```bash
composer install
npm install
npm run build        # vite build → dist/
composer format      # php-cs-fixer
composer analyse     # phpstan level 7
```

## Documentation

- `docs/PRD.md` — Product requirements & roadmap
- `docs/ARCHITECTURE.md` — Module system, DI, conventions
- `docs/CODE_STYLE.md` — PSR-12, strict types

## License

GPL-2.0-or-later. See `LICENSE`.

## Changelog

See `CHANGELOG.md`.
