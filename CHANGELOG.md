# Changelog

All notable changes to Emje Motion are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.0] - 2026-08-29

### Added
- **Text Motion** — Scramble, Unfold, Fill Reveal for Heading & Text Editor widgets (14 controls, 3 triggers, GSAP)
- **Smooth Scroll** — Lenis 1.3.26 global smooth scroll with lerp (0.055 default) & wheel multiplier, reduced-motion & mobile handling, anchor support
- **Hover Reveal** — Container module, image follow-cursor via GSAP quickTo, fade/scale/clip animations, heading/container trigger area, mobile fallback
- **Interactive Cursor** — Container module, dot/ring/dot+ring, size/color/blend mode/hover scale/hide native/text label, GSAP quickTo, per-container
- **Admin Dashboard** — Overview (module toggles), Settings (Respect Reduced Motion, Disable on Mobile, Debug Mode, Smooth Scroll lerp/wheel), About (version/docs/support)
- **Module System** — `ModuleLoader::isEnabled()`, `SettingsRepository`, DI Container, conditional asset loading via `_elementor_data` + `emje_motion_should_load_assets` filter
- **Performance** — Single bundle `dist/js/frontend.js` 36.81KB gzipped, CSS 0.98KB, conditional enqueue, `prefers-reduced-motion` everywhere, `hover:none` guards
- **Docs** — PRD (17 sections), ARCHITECTURE, CODE_STYLE, README, CHANGELOG

### Technical
- PHP 8.2+, PSR-4, strict types, PSR-12, php-cs-fixer, phpstan level 7
- Vite build, GSAP 3.15.0, Lenis 1.3.26 (MIT)
- WordPress 6.7+ / Elementor 3.23+

### Known Limitations
- Single frontend entry (`vite.config.mjs` cssCodeSplit false) — all Text Motion effects bundled together; conditional load prevents loading on non-motion pages. Per-module code-split planned if bundle exceeds 50KB.
