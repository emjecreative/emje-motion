# Emje Motion

A lightweight motion toolkit for Elementor — extend existing widgets with modern motion effects without adding custom widgets.

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

### Hover Reveal (Container)
- Image follow-cursor (GSAP quickTo)
- Reveal animation: fade / scale / clip-path
- Trigger area: whole container or heading only

### Interactive Cursor (Container)
- Cursor types: dot / ring / dot+ring
- Size, color, blend mode (normal/difference), hover scale, hide native, text label
- Per-container, not global — preserves accessibility

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
- Single bundle: `dist/js/frontend.js` ~36.81KB gzipped, CSS ~0.98KB
- Respects `prefers-reduced-motion: reduce`
- Mobile fallback for Hover Reveal & Interactive Cursor

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
