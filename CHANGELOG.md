# Changelog

All notable changes to Emje Motion are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.4.0] - 2026-09-15

### Fixed
- **Scrub preset `visible` ignored** — `TextMotionFrontend` translated the retired `visible` preset to custom 100/100 and then overwrote it while parsing positions. Order fixed; retired `leave` mapping and legacy translation covered by new PHP tests.

### Changed
- **Code cleanup batch 1+2** — removed dead code (zombie `_emjeScroller` global, unreachable scrub fallbacks + `killTimeline` fallback in `MotionEngine`, dead reduced-motion forks in `InteractiveCursor`, unreachable `else` in editor entry) and unified duplications (cursor/hover payload serializers, `resolveEditedModel`, `destroyLayerInstance` everywhere, `clampNum`/`toNumber` bridge helpers, `SmoothScrollConfig` bounds, `Support\ColorField` for all color settings). No behavior changes except: editor preview payloads now include `disableOnMobile` (matching the frontend), and garbage Smooth Scroll input keeps the current value instead of snapping to the minimum.
- **Updater duplication documented** — `GitHubUpdater` and the mu stub intentionally mirror each other (the mu copy must stay standalone to heal missing plugin files); both files now say so.
- **Cosmetic sweep** — `isEditMode` method wrappers removed (direct `core/env` import), the three tracing wrappers unified behind `debugLog`, stale/duplicate comments cleaned. Verified intentional and left alone: per-effect `disableOnMobile` defaults, idempotent frontend boot, updater mirroring.

### Added
- **Text Motion Unfold: Direction + Lines** — new Direction control (Up/Down/Left/Right, default Up so existing pages are unchanged) and new Split By Lines option (animates per visual line). Covers play + On Scroll scrub + editor live preview.
- **Text Motion Unfold: Distance + Mask + Blur** — new Distance control (`0`–`2`, default `1.2` so existing pages are unchanged; `0` fades without moving), Mask switch (premium slide-from-inside-a-box reveal, off by default), and Blur control (`0`–`20px`, default `0` off; nicest with Words or Lines). Covers play + On Scroll scrub + editor live preview.
- **Text Motion scrub boundaries** — On Scroll (Scrub) gains Scrub Start + Scrub End controls (preset positions, defaults reproduce the legacy enter→leave range so existing pages are unchanged) each with a Custom screen-line position (`0`–`100`). Degenerate ranges now behave as a step instead of freezing at 0.
- **Text Motion scrub simplified** — separate Scrub Start/End menus merged into one Scrub menu (Enter + Leave, Center Stage, Custom) with tooltips on the Custom Start/End Position fields. Previously saved separate Start/End values translate automatically.
- **Text Motion scrub new defaults** — On Scroll now defaults to Custom 100/30 (starts as text enters, finishes at the 30% screen line) instead of the full enter→leave range, so effects complete earlier. The Fully Enters and While Leaving presets were removed (`visible` maps to Custom 100/100, `leave` falls back to Enter + Leave).
- **Text Motion Fill Reveal: Wash Color + Blur** — new Wash Color control (empty follows the text color, supports Global Colors) and Blur control (`0`–`20px`, default `0` off; text sharpens as it is revealed, per line, in sync with On Scroll scrub).
- **Text Motion Fill Reveal: Line Mode** — new One by One mode (each line waits until the previous finishes, each getting the full Duration; Line Stagger hides in this mode, and Ease auto-switches to Linear when selected). Default Overlapping is unchanged.

## [1.3.2] - 2026-09-14

### Fixed
- **Multisite: single "View details" link** — the plugin row showed "View details | View details" whenever an update was available because WordPress core auto-adds the link once the updater sets the plugin slug, on top of our custom link. Both `AdminManager` and the mu-helper now skip adding theirs when core's link is already present (Network Admin + subsite).

## [1.3.1] - 2026-09-13

### Changed
- **Feature descriptions generalized** — Overview Dashboard cards, README, and updater details no longer name individual effects; each feature now has a short functional description that stays valid as new effects are added.
- **Background Motion overview icon** — card icon changed from `sparkle` to `sphere` (Phosphor).

## [1.3.0] - 2026-09-13

### Changed
- **Mesh Gradient: new Lagoon default palette** — Color 1–4 now default to deep sea navy (`#0C4A6E`), blue (`#0284C7`), mint (`#5EEAD4`), sea foam (`#F0FDFA`) instead of the old red/blue Beach. Saved pages (explicit colors or legacy presets) are unaffected; only fresh sections and unparseable-color fallbacks use the new palette.
- **Code cleanup sweep** — removed dead code (deprecated `PRESETS` alias, empty `MotionEngine` branches, unreachable `FillReveal` cleanup, redundant `HoverReveal` fallback, unused `MOTION_LIST`) and unified duplicated helpers into single sources of truth (`core/env`, `BackgroundMotion/shared`, bridge `utils`, `Support/ModuleRegistry`, `Support/RenderAttributes`). No behavior changes.
- **Code cleanup round 3** — fixed a dropped `livePreview` in Interactive Cursor (editor gate was dead), a Dither `disableOnMobile` default mismatch, and an ASCII numeric-fallback quirk; removed write-only fields (`rawColors`, cursor `dotEl`/`labelEl`); aligned legacy cursor bridge defaults with PHP; routed TextMotion through `RenderAttributes`; fixed stale comments.
- **Background Motion: new indigo defaults + quieter mobile switches** — ASCII Character Color, Pixel Highlight Color, and Dither Dot Color now default to indigo (`#1227E2`); Pixel Base/Border and Dither Background default to its faint tint (`#1227E21A`); Pixel and Dither Edge Fade default to `0`. The tooltip text on all six "Disable on Mobile & Tablet" switches was removed. Saved pages keep their stored values; only fresh sections and fallbacks use the new defaults.
- **Background Motion: tidier control order** — ASCII Font Size now sits before Cell Width/Height, Pixel Fit before Cell Size, and Mesh Motion Type above the four colors. No setting values changed.
- **Mesh Gradient: quieter panel** — tooltips removed from Motion Type, Animation Speed, Quality, and Edge Fade; Quality now sits above Animation Speed.
- **Dither: quieter panel + ripple divider** — tooltips removed from Background Color, Pixel Size, Animation Speed, and Edge Fade; a divider line now sits above the Enable Ripples toggle.
- **Pixel + ASCII: quieter panel** — tooltips removed from Pixel Fit, Glow Radius, Trail Fade, Edge Fade, and ASCII Edge Fade.
- **Background Motion: clearer Live Preview hint + mobile dividers** — the Live Preview tooltip now explains the OFF→ON repair trick, and each effect shows a divider line above its "Disable on Mobile & Tablet" switch.

### Fixed
- **Mesh Gradient: Global Colors now render** — picking an Elementor Global Color previously fell back to the default palette silently; `var()` references are now resolved against the page. `rgb()` percentages and `hsl()` colors are parsed too.
- **Mesh Gradient: sharper long sessions on mobile GPUs** — the shader prefers `highp` precision where available so the animation doesn't degrade after running a long time.
- **Mesh Gradient: smoother editor preview** — changing colors or Motion Type updates the running layer in place instead of re-creating the WebGL context.
- **Mesh Gradient: blank-preview hardening** — the live-update path now refuses detached nodes and dead canvases (falls back to a full re-init), failed inits no longer leave a zombie data attribute behind, and opt-in tracing (`window._emjeBgDebug = true`) covers init/apply/update paths.
- **Mesh Gradient: no more orphan layers in the editor** — every apply sweeps stale wrappers (one container, one layer), the render hook re-resolves the live node by data-id, and loops on detached containers stop instead of burning rAF + GL contexts.
- **Dither: translucent backgrounds no longer fade to solid** — a non-transparent `Background Color` (e.g. the new `#1227E21A` tint) used to stack its alpha every frame, flashing then settling on full blue. The veil now starts from a cleared frame each paint, so it stays a constant tint.
- **Dither: Global Colors now render** — Dot/Background Colors picked from Elementor Global Colors previously fell back to defaults silently (canvas 2D cannot resolve `var()`); they are now resolved against the page like Mesh Gradient. Pixel and ASCII needed no fix (plain CSS resolves `var()` natively).
- **Global Colors resolve kit-scoped variables too** — `var()` lookup now tries the container element first (inheriting kit-scoped custom properties), then body, then `:root`, instead of `:root` only.

### Added
- **Background Motion: Mesh Gradient** — animated WebGL mesh-gradient background (raw WebGL, no Three.js): four custom color lobes move and blend, alive without mouse input. Controls: Color 1–4, Motion Type (Drift/Swirl/Pulse/Flow), Animation Speed (`0` freezes), Quality (render resolution), Opacity, Edge Fade, Disable on Mobile & Tablet (visible by default). Static-gradient fallback where WebGL is unavailable, auto-degrades under load, pauses offscreen, respects reduced motion.

## [1.2.0] - 2026-09-12

### Changed
- **Mobile gating is now per-effect** — the global dashboard toggle "Disable Interaction Motion on Mobile" is removed. Each effect (ASCII, Pixel, Dither, Hover Reveal, Interactive Cursor) has its own "Disable on Mobile & Tablet" switch in Elementor (on by default, except Dither which stays visible on touch since it needs no hover — tap sends a ripple). Runtime JSON key `disableOnMobile` is unchanged, so no frontend JS changes were needed.

### Removed
- **Interactive Cursor: Blend Mode control removed** — the option never reached the runtime (no `mix-blend-mode` was ever applied), so it was a no-op control. Removed the Elementor control, the `blendMode` config key, forwarding in editor bridges, and the dead `.emje-cursor--difference` CSS.
- **Dead code cleanup** — removed write-only fields (`DitherCanvas._dpr`, stale `_scrollTick`), unused dot quickTos, an unused tooltip var + import, and dead `$version` assignments in admin views.

### Added
- **Background Motion: Dither** — ambient animated retro-dither background (Canvas 2D, no dependencies): Bayer-thresholded noise field drawn as square dots via the `fillRect` fast path (full 60fps, no shape options by design), alive without mouse input. Click/tap sends an expanding ripple (strength/width/speed). Controls: Dot + Background Color (transparent keeps native background), Pixel Size, Density, Scale, Speed (`0` freezes), Ripples, Edge Fade. Auto-scales resolution under load (capped at 2x Pixel Size), pauses offscreen, respects reduced motion + mobile guard.

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
