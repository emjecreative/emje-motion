# Changelog

All notable changes to Emje Motion are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.2.2] - 2026-08-28

### Fixed
- **Hover Reveal** — Image Size now uses sized src (thumbnail/medium/large/full) + CSS size mapping, Scale always applied regardless of animation (was gated to scale only), Position Offset X/Y -200..200 and Rotate 0-360 + Hover Rotate via GSAP
- **Editor** — Offset/Rotate/Scale/Image Size now live preview via buildInteractionConfig slider size handling, tooltip bubble fixed with viewport clamp + 12px margin (was cut off left/right)

## [1.2.1] - 2026-08-28

### Fixed
- **Container Style** — Hover Reveal & Interactive Cursor moved Layout → Style tab now correctly hooks to `section_background` (Container has no `section_style`), plus `vite emptyOutDir false` to preserve `editor.js`
- **Editor Live Preview** — Interaction Motion live preview now correctly handles `Enable Off` / `Live Off` (destroy preview, remove orphan DOM) and `frontend.js` hook + `MutationObserver` for preview reload race
- **Editor Reopen** — live preview now syncs on `preview:loaded` via `elementor.elements` models (400/900/1500ms retries), so toggle ON survives publish/close/reopen without needing OFF→ON

## [1.2.0] - 2026-08-28

### Changed
- **Interaction Motion** — unified Hover Reveal & Interactive Cursor into `Interaction Motion` (Style tab, 1 effect per Container, no both). Effect select like Text Motion, single Live Preview, controls deprecated keep Frontend backward compat.
- **Container Style** — Hover Reveal & Interactive Cursor moved Layout → Style tab (section_background), now unified
- **Editor** — buildInteractionConfig + destroy on Enable/Live off (1 effect per Container), editor.js 29.9KB

### Added
- InteractionMotion module (Controls + Frontend), handling for new `emje_interaction_*` + legacy fallback

## [1.1.1] - 2026-08-28

### Changed
- **Docs** — PRD sync live preview (TextMotion default On + Preview button, Hover/Cursor default Off), Status Completed Phase 2/3/4/5, Performance actual 37.66KB gzipped
- **Version** — bump to 1.1.1 (patch docs sync, no API change, `v1.0.0`/`v1.1.0` immutable)

## [1.1.0] - 2026-08-28

### Added
- **Editor Live Preview** — TextMotion toggle+button, HoverReveal/Cursor toggle Off hemat, MotionEngine attribute observer + reInit, editor.js bridge, AssetsManager preview enqueue, vite 37.66KB

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

### Tested
- WordPress 6.7/6.8 + Elementor 3.23+ — PASS (Elementor aman, LCP 45ms <100ms, FPS >55)
- `composer format:check` 0 files, `php -l` 25 OK, `vite build` 20 modules 36.81KB/0.98KB

### Technical
- PHP 8.2+, PSR-4, strict types, PSR-12, php-cs-fixer, phpstan level 7
- Vite build, GSAP 3.15.0, Lenis 1.3.26 (MIT)
- WordPress 6.7+ / Elementor 3.23+

### Known Limitations
- Single frontend entry (`vite.config.mjs` cssCodeSplit false) — all Text Motion effects bundled together; conditional load prevents loading on non-motion pages. Per-module code-split planned if bundle exceeds 50KB.
