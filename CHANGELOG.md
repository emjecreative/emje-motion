# Changelog

All notable changes to Emje Motion are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

## [1.1.0] - 2026-09-10

### Added
- **Background Motion** — new standalone Container module with ASCII ambient backgrounds (grid fills the Container, neutral white default, edge fade via transparent mask so native backgrounds show through).
- **Background Motion: Pixel** — interactive pixel grid that lights up under the cursor.
- **Background Motion: Pixel glow + trail** — Glow Radius paints a soft falloff area around the cursor (`color-mix` blend from Highlight to Base; `0` keeps the classic single cell) and Trail Fade lingers lit cells before they fade back; mousemove is rAF-coalesced and offscreen grids skip painting via IntersectionObserver.
- **Background Motion: Pixel fit modes** — new Fit control: Stretch to fill by default (cells flex to fill the container, zero leftover) or Crop edges to fill (precise size, edge cells trimmed). Dividers are now single-sided cell borders over a transparent grid so translucent Base shows the native container background. Gap tooltip clarifies it only applies when Border Width is `0`.
- **Background Motion: Pixel removals** — removed the Exact fit option and the Lift Effect control entirely (color-only glow from now on); no migration needed as Pixel is still unreleased.

### Fixed
- **Background Motion** — ASCII no longer crashes the whole frontend boot on dense grids (`ReferenceError: gridH is not defined` in the perf guard; one bad container killed `initAll` for every container on the page). Also hardened `initAll`/`reInit` with per-element try/catch like Interactive Cursor.
- **Background Motion editor preview** — first Enable → Effect → Live Preview sequence now reliably shows the effect: added verify-and-repair after every preview apply (re-applies when a late Elementor re-render wiped the layer, max 2 retries) and retry installing the preview repair hook when the iframe isn't ready yet.

### Removed
- **Legacy modules retired** — standalone `HoverReveal` + `InteractiveCursor` modules no longer boot (their editor controls were already gone) and their source files are deleted; pages built with v1.0.0 keep rendering through `InteractionMotion`'s legacy fallback, and containers with both old + new keys no longer render double layers. Note: disabling the `interaction-motion` module now also disables legacy rendering. Retired `hover-reveal`/`interactive-cursor` module IDs are dropped from settings (stale stored keys ignored).
- **Dead code** — removed unused `PixelGrid.cellFromPoint/setActive`, `AsciiInteractive` leftover `void full` + never-set `_touched` guard, `ColorResolver.getFallback` (+ `FALLBACK_*`), deprecated `TextSplitter.getTargets`, unused editor badge CSS + preview `content_classes`, unreachable `page-load` case, duplicate `preview:loaded` listener, empty preview-elements branch, double `reInit` and inline destroy in background sync.
- **Comet Trail retired** — Interactive Cursor is down to Text Follow and Dot + Ring; the 6 trail controls, trail rendering loop and styles are removed. Pages saved with `type: trail` automatically fall through to Text Follow via the existing type whitelist (PHP + JS).

### Changed
- **Shared utils** — Background Motion effects now share `smoothstep`/`isEditMode`/`applyEdgeMask`/`LIMITS`/`clampNum` from `shared.js`; PHP color/slider sanitizing unified on `ColorResolver` + `SliderResolver` (incl. `#RRGGBBAA` support everywhere). No config output changes.
- **Smoke tests** — new `npm test` suite (Node `tests/smoke/` + PHP `tests/php/`, also run in CI): config builders, type-whitelist fallbacks, color validators, clamp parity, bridge wiring.
- **Cursor strategies** — `InteractiveCursor` split into `TextFollowCursor` / `DotRingCursor` strategies; Hover Reveal new-vs-legacy builders unified via `resolveHoverFields()`. No config output changes.
- **Editor bridge split (stage 1)** — shared helpers moved to `editor/utils.js`, Background Motion bridge to `editor/backgroundBridge.js`; `editor.js` is now a thin entry. Bundled output unchanged (`dist/js/editor.js`).
- **Editor bridge split (stage 2, done)** — `textMotionBridge.js`, `interactionBridge.js`, `tooltip.js`, `previewSync.js` extracted the same way; `editor.js` is now ~40 lines of wiring. God File fully paid off.
- **Background Motion defaults** — ASCII Character Color and Pixel Highlight Color now default to blue (`#3B82F6`) instead of white/gray.

### Security
- **Editor color validation hardened** — `isValidEditorColor` now mirrors PHP `ColorResolver` (rejects break-out characters, strict hex/rgba/var shapes); cursor box-shadow color and typography keywords/measurements are validated before entering preview payloads.

## [1.0.1] - 2026-09-06

### Fixed
- **About** — Request a Feature prefill keeps its line breaks (`esc_attr` preserves encoded newlines; `esc_url` strips them)

## [1.0.0] - 2026-09-06

Initial public release.

### Added
- **Text Motion** — Scramble, Unfold & Fill Reveal animations for Heading & Text Editor, with live preview in the editor
- **Smooth Scroll** — buttery site-wide scrolling powered by Lenis, with reduced-motion and mobile guards
- **Interaction Motion** — Hover Reveal and Interactive Cursor (Dot + Ring, Text Follow, Comet Trail) for Containers, including Entrance and Blend Mode controls
- **Admin dashboard** — Overview, Settings & About screens with 1-click update checks
