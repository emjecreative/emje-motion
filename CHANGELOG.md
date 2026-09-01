# Changelog

All notable changes to Emje Motion are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.4] - 2026-09-02

### Fixed
- **Updater** — fix multisite cache (site_transient + transient) so Check for Updates in About (revolt subsite) now correctly populates Network Admin → Updates → Plugins (Hostinger multisite). Bump to force refresh.

## [1.0.3] - 2026-09-02

### Changed
- **Admin** — premium minimal dashboard: header gradient #1227E2 + nav pills (Overview/Settings/About), card 12px + shadow, switch 44x24 animated (track #E5E7EB → #1227E2), Overview summary 3 Modules • Active, Settings 2-card layout with range slider + bubble value, About hero #1227E2 + link grid 2x2. No onboarding. Copy premium minimal: Motion that feels native to Elementor.

## [1.0.2] - 2026-09-02

### Added
- **About** — Check for Updates button (English, no GitHub mention) — clears 6h cache and WordPress update transient, forces immediate check; works even when wp-cron loopback 400 (Hostinger multisite). Auto update via cron still works without clicking.

## [1.0.1] - 2026-09-02

### Changed
- **Branding** — remove vendor names (GSAP/Lenis/Kinetics/Lerp) from Admin About, Settings and tooltip; Smoothness label whitelabel
- **Editor** — add Emje Motion icon (assets/images/emje-motion-logo.svg 16px) to Text Motion & Interaction Motion section headings via JS (panel/open_editor hooks + MutationObserver, flex order arrow → icon → title)
- **Smooth Scroll** — remove `window.lenis` exposure, keep `window._emjeLenis` only (MotionEngine fallback to `window._emjeLenis || window.lenis`)

### Fixed
- **Updater** — GitHub Releases updater (Update URI, pre_set_site_transient_update_plugins 6h cache) now public repo

## [1.0.0] - 2026-09-02

### Added
- **Text Motion** — Scramble, Unfold, Fill Reveal for Heading & Text Editor widgets (14 controls, 3 triggers, GSAP)
- **Comet Trail (Interaction Motion)** — new cursor type `Comet Trail` (6 dots default, 3-12 range) with head→tail gradient (Head #111111 → Tail #FF4D5A, Global Colors support), lag `0.35` (0.1-0.5) rAF chain, fade tail, dot size `20` (4-24)
- **Text Follow** — full controls: Background/Text Color (Global), Padding Y `40` / X `32`, Border Radius `99`, Typography (Global Fonts), Box Shadow, Follow Smoothness `0.5`
- **Smooth Scroll** — Lenis 1.3.26 global smooth scroll with lerp (0.055 default) & wheel multiplier, reduced-motion & mobile handling, anchor support
- **Interaction Motion** — Hover Reveal (image follow-cursor via GSAP quickTo, fade/scale/clip, heading/container trigger) & Interactive Cursor (dot/ring/dot+ring + text-follow/comet-trail, size/color/blend mode/hover scale/hide native), per-container, 1 effect per Container
- **Admin Dashboard** — Overview (module toggles), Settings (Respect Reduced Motion, Disable on Mobile, Debug Mode, Smooth Scroll lerp/wheel), About (version/docs/support)
- **Module System** — `ModuleLoader::isEnabled()`, `SettingsRepository`, DI Container, conditional asset loading via `_elementor_data` + `emje_motion_should_load_assets` filter
- **Editor Live Preview** — direct `change:*` listeners for all cursor controls + `__globals__` + Kit sync, `buildInteractionConfig`, attribute observer + `MutationObserver`, `preview:loaded` sync (400/900/1500ms retries), tooltip clamp, no OFF→ON toggle needed

### Technical
- PHP 8.2+, PSR-4, strict types, PSR-12, php-cs-fixer, phpstan level 7
- Vite build (frontend + editor), GSAP 3.15.0, Lenis 1.3.26 (MIT) — Single bundle `dist/js/frontend.js` ~37KB gzipped, CSS ~1KB
- WordPress 6.7+ / Elementor 3.23+, `prefers-reduced-motion` & `hover:none` guards, conditional enqueue

### Tested
- WordPress 6.7/6.8 + Elementor 3.23+ — PASS
