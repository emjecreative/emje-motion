# Emje Motion — User Guide

Beautiful motion for your website.

> This guide follows the latest release. The plugin dashboard is at **Emje Motion → Overview / Settings / About**.

## Contents

- [Quick start](#quick-start)
- [Text Motion](#text-motion)
- [Interaction Motion](#interaction-motion)
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
- **Comet Trail** — a fading tail of dots. Customize **Dots** (default `6`, up to 12), **Dot Size**, **Head/Tail Colors** (gradient from head to tail), **Trail Lag**, and **Fade Tail**.

Common settings: **Hide Native Cursor** (hide the real cursor inside the container) and **Follow Smoothness** (lower is snappier, higher trails more; Dot + Ring and Text Follow only).

Note: Hover Reveal and Interactive Cursor hide themselves on touch devices — mobile visitors get the normal experience.

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

- **Behavior** — **Respect Reduced Motion** (skip motion for visitors whose system prefers less animation) and **Disable Interaction Motion on Mobile**.
- **Smooth Scroll** — visible only while the Smooth Scroll module is enabled; see above.

### About

Version info, **System Status** (plugin, WordPress, Elementor, and PHP versions — handy when asking for support), update checks, and links to the website, guide, support, and feature requests.

## Troubleshooting

**Motion doesn't appear.** Check in order: the module toggle in Overview is on → **Enable** is on in the widget's Style tab → clear any cache (page cache, Elementor → Tools → Regenerate CSS) → confirm you're viewing the frontend, not a cached copy.

**"405 Not Allowed" when uploading the zip.** Some hosts block dashboard uploads at the server level — this is not caused by the plugin. Install via File Manager instead: delete the old `emje-motion` folder, extract the release zip so the main file sits directly at `wp-content/plugins/emje-motion/emje-motion.php`, then Activate.

**Multisite.** Network Activate is recommended. When activated per site, run update checks from that site's dashboard.

**Reduced motion.** If effects silently skip, the visitor's system likely prefers reduced motion and **Respect Reduced Motion** is on — that is working as intended.

**Still stuck?** Open an issue at [GitHub Issues](https://github.com/emjecreative/emje-motion/issues) with your System Status versions, or suggest an improvement via **Emje Motion → About → Request a Feature**.
