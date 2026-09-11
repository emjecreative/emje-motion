# Emje Motion — User Guide

Beautiful motion for your website.

> This guide follows the latest release. The plugin dashboard is at **Emje Motion → Overview / Settings / About**.

## Contents

- [Quick start](#quick-start)
- [Text Motion](#text-motion)
- [Interaction Motion](#interaction-motion)
- [Background Motion](#background-motion)
- [Smooth Scroll](#smooth-scroll)
- [Dashboard](#dashboard)
- [Troubleshooting](#troubleshooting)

## Quick start

1. Open **Emje Motion → Overview** and enable the modules you want (Text Motion and Interaction Motion are on by default; Smooth Scroll is opt-in).
2. Edit any page with Elementor.
3. Select a Heading, Text Editor, or Container widget, open the **Style** tab, and turn on **Enable** in the Emje Motion section.
4. Tweak the controls — **Live Preview** replays the effect as you change it.

## Text Motion

Available on **Heading** and **Text Editor** widgets, **Style** tab, **Text Motion** section. Turn on **Enable**, then pick an **Animation**.

### Scramble

Random characters cycle before settling into your real text.

- **Character Set** — Letters, Numbers, Letters & Numbers (default), Symbols, or Custom.
- **Custom Characters** — your own pool (only when Character Set is Custom).
- **Reveal Order** — Left to Right (default), Right to Left, Center Out, or Random.
- **Scramble Speed** — how fast characters change. `1` is normal (range 0.5–5).

### Unfold

Words or characters rise into place one after another.

- **Split By** — Words (default) or Characters.
- **Stagger** — delay between each piece, in seconds (default `0.04`).

### Fill Reveal

Text fades in from a soft background wash, line by line.

- **Background Opacity** — strength of the wash (default `0.25`).
- **Line Stagger** — delay between lines (default `0.15`; `0` reveals all lines together).

### Timing (all Text Motion effects)

- **Duration** — total length in seconds (default `1`).
- **Delay** — waiting time before it starts (default `0`).
- **Ease** — motion feel: Linear, Power1–4 Out (default Power2 Out), Back Out, Elastic Out.

### Trigger (all Text Motion effects)

- **Event** — Page Load (default), Scroll Into View, Hover, or On Scroll (Scrub, follows the scroll position).
- **Play Once** — with Scroll Into View, stop replaying after the first run.

Tip: keep **Live Preview** on while designing, and use the **Preview Animation** button to replay on demand (it replays even when Play Once is set).

## Interaction Motion

Available on **Container** elements, **Style** tab, **Interaction Motion** section. One effect per Container — turn on **Enable**, then choose **Effect**.

### Hover Reveal

An image follows the visitor's cursor inside the container.

- **Reveal Image** — pick any media image.
- **Image Size** — Thumbnail, Medium (default), Large, or Full.
- **Follow Speed** — how quickly the image chases the cursor (default `0.12`; lower is smoother).
- **Scale on Hover** — image scale while hovering (default `1.0`).
- **Reveal Animation** — Fade (default), Scale, or Clip Path.
- **Trigger Area** — Whole Container (default) or Heading Only.
- **Offset X / Offset Y** — nudge the image, in pixels (negative moves left/up).
- **Rotate / Hover Rotate** — resting tilt and tilt while hovering (default `0°` / `15°`).

### Interactive Cursor

Replaces the native cursor inside the container. Pick a **Cursor Type**:

- **Text Follow** (default) — a label pill that trails the cursor. Customize the **Text Label** (default `View`), typography, colors, padding, corner radius, and shadow.
- **Dot + Ring** — a dot with a lagging ring. Customize **Size** (default `20px`), **Color**, and **Hover Scale** over links and buttons.

Common settings: **Hide Native Cursor** (hide the real cursor inside the container) and **Follow Smoothness** (lower is snappier, higher trails more).

Each effect has its own **Disable on Mobile & Tablet** switch (on by default) — turn it off per effect if you want it visible on touch devices.

## Background Motion

Available on **Container** elements, **Style** tab, **Background Motion** section. Standalone from Interaction Motion — one ambient effect per Container, rendered behind your content so the native Container background (color, gradient, or image) still shows through.

### ASCII

An interactive character grid filling the Container: faint dots idle, glowing letters/numbers/symbols near the cursor.

- **Character Color** — default blue (`#3B82F6`).
- **Hover Characters** — Full (default) or Simple.
- **Cell Width / Cell Height** — grid density (defaults `22px` / `26px`).
- **Font Size** — character size (default `14px`).
- **Glow Radius / Inner Radius** — cursor light reach (defaults `360px` / `30px`).
- **Max Opacity** — brightest glow (default `0.35`).
- **Edge Fade** — top/bottom feather so the grid melts into the background (default `10%`).
- **Disable on Mobile & Tablet** — hide on touch devices (on by default).

Respects reduced motion.

### Pixel

Interactive pixel grid that lights up under your cursor.

- **Base Color** — resting cell color (default translucent white).
- **Highlight Color** — lit cell color (default `#3B82F6`).
- **Fit** — Stretch to fill (default; cells resize to fill the container, zero leftover) or Crop edges to fill (Cell Size stays precise, edge cells trimmed).
- **Cell Size / Gap** — grid density (defaults `56px` / `2px`). Gap is the spacing between cells when Border Width is `0`; it is ignored while dividers are active.
- **Border Width / Border Color** — single shared divider lines between cells like the reference (defaults `1px` translucent white; `0` hides them and Gap spacing applies instead).
- **Transition Speed** — fade in/out pace (default `0.15`).
- **Glow Radius** — cursor light reach in pixels (default `120px`; `0` lights a single cell).
- **Trail Fade** — how long lit cells linger before fading back, in seconds (default `0.4`; `0` snaps back instantly).
- **Edge Fade** — top/bottom feather so the grid melts into the background (default `10%`).
- **Disable on Mobile & Tablet** — hide on touch devices (on by default).

Respects reduced motion.

### Dither

Ambient animated retro-dither background, inspired by shader-style dither art. It lives on its own — no cursor needed — and a click/tap sends an expanding ripple through the pattern.

- **Dot Color** — pattern color (default `#3B82F6`).
- **Background Color** — canvas fill (default transparent, so the native container background shows through).
- **Look** — square dots (single fast path, smooth at 60fps even while scrolling).
- **Pixel Size** — base cell size (default `8px`; larger is blockier).
- **Pattern Density / Pattern Scale** — how full the pattern looks and the size of the underlying noise (defaults `0.5` / `1.5`).
- **Animation Speed** — evolution pace (default `0.6`; `0` freezes on a single frame).
- **Enable Ripples + Strength / Width / Speed** — click/tap ripple (defaults on, `0.6` / `140px` / `420`).
- **Edge Fade** — top/bottom feather so the pattern melts into the background (default `10%`).
- **Disable on Mobile & Tablet** — hide on touch devices (off by default, so it stays visible — tap sends a ripple).

Respects reduced motion. Resolution auto-scales down under load and the animation pauses offscreen.

## Smooth Scroll

Site-wide buttery scrolling. It is **opt-in**: enable it at **Emje Motion → Overview → Smooth Scroll**. Fine-tune at **Emje Motion → Settings → Smooth Scroll**:

- **Smoothness** — lower is smoother and floatier (default `0.075`, range 0.05–0.15).
- **Wheel Multiplier** — scroll distance per wheel tick (default `1.2`; above 1 travels farther, below 1 shorter).
- **Disable on Mobile** — fall back to native scrolling on touch devices (on by default).

Smooth Scroll automatically respects visitors who prefer reduced motion (see Dashboard below) and never runs inside the Elementor editor.

## Dashboard

### Overview

Toggle the three feature modules individually. The status line tells you how many are active. Smooth Scroll stays off until you opt in, so existing sites never change behavior by surprise. Press **Save Changes**.

### Settings

- **Behavior** — **Respect Reduced Motion** (skip motion for visitors whose system prefers less animation). Mobile visibility is controlled per effect in Elementor (**Disable on Mobile & Tablet**).
- **Smooth Scroll** — visible only while the Smooth Scroll module is enabled; see above.

### About

Version info, **System Status** (plugin, WordPress, Elementor, and PHP versions — handy when asking for support), update checks, and links to the website, guide, support, and feature requests.

## Troubleshooting

**Motion doesn't appear.** Check in order: the module toggle in Overview is on → **Enable** is on in the widget's Style tab → clear any cache (page cache, Elementor → Tools → Regenerate CSS) → confirm you're viewing the frontend, not a cached copy.

**Motion missing on mobile/tablet.** Each effect has its own **Disable on Mobile & Tablet** switch (on by default except Dither) — turn it off on that effect to show it on touch devices.

**"405 Not Allowed" when uploading the zip.** Some hosts block dashboard uploads at the server level — this is not caused by the plugin. Install via File Manager instead: delete the old `emje-motion` folder, extract the release zip so the main file sits directly at `wp-content/plugins/emje-motion/emje-motion.php`, then Activate.

**Multisite.** Network Activate is recommended. When activated per site, run update checks from that site's dashboard.

**Reduced motion.** If effects silently skip, the visitor's system likely prefers reduced motion and **Respect Reduced Motion** is on — that is working as intended.

**Still stuck?** Open an issue at [GitHub Issues](https://github.com/emjecreative/emje-motion/issues) with your System Status versions, or suggest an improvement via **Emje Motion → About → Request a Feature**.
