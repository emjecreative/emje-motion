# Changelog

All notable changes to Emje Motion are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- **Background Motion** — new standalone Container module with ASCII ambient backgrounds (grid fills the Container, neutral white default, edge fade via transparent mask so native backgrounds show through). Aurora listed as a name-only placeholder.

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
