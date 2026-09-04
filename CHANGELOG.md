# Changelog

All notable changes to Emje Motion are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.23] - 2026-09-05

### Fixed
- **Updater** — install "zombie" tidak mungkin lagi: arsip source (zipball/tarball, tanpa `vendor/`+`dist/`) ditolak dengan pesan jelas; updater dimuat langsung tanpa Composer sehingga 1-click update + prune banner tetap hidup walau `vendor/` hilang; aktivasi copy tak-lengkap tidak lagi fatal + notice merah minta install ulang

## [1.0.22] - 2026-09-05

### Changed
- **Modal** — tab Changelog di View details kini HTML rapi (1 versi terbaru saja + link full changelog), bukan markdown mentah dalam `<pre>`; mirror di mu stub untuk Network Admin
- **Updater** — helper mu anti-basi: sync berdasar isi (bukan `filemtime`), refresh diri sendiri tepat setelah plugin di-update (termasuk update via Network Admin), heal tiap admin load

## [1.0.21] - 2026-09-05

### Fixed
- **Release** — zip rilis kini punya wrapper folder tunggal `emje-motion/` (fix `Filesystem error. A directory could not be read.` saat upload via Network Admin); `languages/` kosong tidak lagi ikut di-zip; workflow gagal cepat kalau `emje-motion/emje-motion.php` tidak ada di zip

## [1.0.20] - 2026-09-04

### Changed
- **Repo** — `docs/` keluar dari GitHub (internal only, lokal tetap ada, `.gitignore`), README ramping total (tagline + 3 fitur + syarat + install + link)
- **Release** — asset zip berversi (`emje-motion-1.0.x.zip`); updater (plugin + mu stub) mengenali nama berversi, tetap terima legacy `emje-motion.zip`, zipball jadi cadangan terakhir

## [1.0.19] - 2026-09-04

### Changed
- **Copy** — new tagline "Beautiful motion for your website." everywhere (plugin header, About hero, README, update modal): timeless, no performance claims, no feature names. About hero desc: "Give your pages movement with a purpose — simple controls, visitors who stay."

## [1.0.18] - 2026-09-04

### Changed
- **Compat** — `Tested up to: 7.1` (header + updater `tested` field + mu stub + PRD): warning "Compatibility with WordPress 7.1: Not tested" di Dashboard → Updates kini jadi "Yes (according to its author)". Verified live di WP 7.1 + Elementor 4.2.4 + PHP 8.3.33.

## [1.0.17] - 2026-09-04

### Added
- **Updater** — logo biru di Dashboard → Updates → Plugins dan modal View details: transient `update_plugins` + `plugins_api` kini kirim `icons.svg` (local `assets/images/emje-motion-logo.svg`), entry cache lama tanpa icon disembuhkan di tempat. Mirror di `mu-emje-motion-updater.php` untuk multisite.

## [1.0.16] - 2026-09-04

### Fixed
- **Updater** — banner "There is a new version..." no longer sticks after update (e.g. 1.0.13 → still shows 1.0.13): `mergeUpdate` now prunes instantly when stored `new_version <= installed` without API call, `checkUpdate` unsets when remote <= local, `upgrader_process_complete` clears `emje_motion_update_check` + `update_plugins` right after update. Same fix mirrored in `mu-emje-motion-updater.php` for multisite per-site Activate.

## [1.0.15] - 2026-09-03

### Changed
- **About** — Check for Updates result moved from top toast to persistent inline notice left of the button (blue info when update available, green success when up to date, dismiss only via X, no auto-hide)

## [1.0.14] - 2026-09-03

### Changed
- **About** — Opsi B polish: hero card (20px title, 1-line desc), About card links-only 4-across, System Status with live WP/PHP/Elementor versions, Updates header with right-aligned button, icon ph-info → ph-article, copy Read Guide/Get Help (no GitHub mention)
- **Settings** — split disable_on_mobile into disable_interaction_on_mobile + disable_smooth_on_mobile (legacy fallback), Smooth Scroll defaults lerp 0.075 / wheel 1.2, JS-driven mobile guard (drop hard CSS hide)

### Fixed
- **Security** — allow-list characterSet/revealOrder/ease in TextMotionFrontend, gate mu-plugin install behind activate_plugins, GitHub updater package host allow-list (https + github.com/objects/codeload/api)

## [1.0.13] - 2026-09-03

### Changed
- **Admin** — header system: sticky blur full-width (inner 1080) + hamburger Duotone, Geist font (400/500/600), logo blue 3-pilar, 16px inner padding, no subtitle/divider
- **Overview** — Features/Save Changes + A+D hybrid status (No features active / All active / 2 of 3 active), icon circle 42px, divider, badge left, no Enable module text/dot
- **Overview** — card hover 1px blue, main 16px radius, SaveChanges dirty check (disabled by PHP + noscript, enabled .92), toast center top green 8px .32s spring 3s wrapper fix

### Added
- **Icons** — migrate Dashicons → Phosphor Duotone (text-t / mouse-simple / cursor-click, squares-four / gear / info), dashboard-logo-blue.svg variant
- **Font** — Geist via Google Fonts CDN (dashboard only)
- **Toast** — fixed center top hijau WP familiar, auto 3s, X duotone centered, negative margin fix, translate3d spring

## [1.0.12] - 2026-09-02

### Changed
- **Admin** — 1080 center all pages (wrap + header/main/hero max-width 1080 margin auto, top bar left logo right nav, main card header button right + thin line, netral white like card)

## [1.0.11] - 2026-09-02

### Fixed
- **Updater** — auto-heal mu-plugin helper on every admin load (if missing) for multisite per-site Activate — update via zip without re-Activate now auto-creates `mu-plugins/emje-motion-updater.php` so next `Check for Updates` shows in Network Admin without manual deactivate/activate.

## [1.0.10] - 2026-09-02

### Fixed
- **Admin** — sidebar menu icon padding: viewBox expanded to -20 -15 279 280 (16px effective in 20px container) and dynamic base64 via file_get_contents so dashboard icon no longer oversized.

## [1.0.9] - 2026-09-02

### Changed
- **Admin** — replace WP dashicons-controls-play menu icon with emje-motion-dashboard-logo.svg (assets/images/emje-motion-dashboard-logo.svg, data:image/svg+xml).

## [1.0.8] - 2026-09-02

### Added
- **Updater** — auto-install mu-plugin helper (`wp-content/mu-plugins/emje-motion-updater.php`) on Activate (multisite) so per-site Activate still shows update in Network Admin → Updates without forcing Network Activate. Auto-removed when deactivated everywhere.

## [1.0.7] - 2026-09-02

### Fixed
- **Admin** — hide Elementor nag banner (Want to shape the future) on Emje Motion pages only via CSS + JS (keeps our own notices); enqueue assets/js/admin.js.

## [1.0.6] - 2026-09-02

### Fixed
- **Updater** — register updater in all contexts (including wp-cron) and add site_transient_update_plugins merge so per-site Activate in multisite now shows update in both subsite and Network Admin. Add About note: Network Activate recommended.

## [1.0.5] - 2026-09-02

### Fixed
- **Release** — include `assets/` (admin.css + logo.svg) in `emje-motion.zip` — dashboard was unstyled live (404) because workflow omitted `assets/`; local worked via git clone. Fix `release.yml` to zip `assets/`.

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
