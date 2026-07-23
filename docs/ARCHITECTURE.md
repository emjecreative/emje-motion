# Emje Motion Architecture

This document defines the technical architecture of Emje Motion.

The goal is to keep the project clean, modular, scalable, and easy to maintain.

---

# Core Principles

The project follows these principles:

- Modular Architecture
- PSR-4 Autoloading
- Composer Based
- WordPress Coding Standards
- Performance First
- Elementor First
- AI-Friendly Code Structure

---

# Technology Stack

| Component | Technology |
|-----------|------------|
| Language | PHP 8.2+ |
| Frontend | JavaScript (ES6) |
| Styling | CSS |
| Builder | Elementor |
| Animation Engine | GSAP |
| Dependency Manager | Composer |
| Autoload | PSR-4 |

---

# Project Structure

```
emje-motion/

assets/
    css/
    js/
    images/

docs/

languages/

src/

vendor/

composer.json

emje-motion.php

README.md
```

---

# Source Structure

```
src/

Admin/

Assets/

Core/

Elementor/

Helpers/

Modules/
```

---

# Folder Responsibilities

## Admin

Responsible for everything inside WordPress Admin.

Examples:

- Admin Menu
- Overview Page
- Settings Page
- About Page

---

## Core

Contains the plugin bootstrap.

Responsible for:

- Plugin Initialization
- Service Registration
- Module Loader
- Asset Loader
- Settings Manager

---

## Elementor

Contains all Elementor integrations.

Examples:

- Register Controls
- Register Sections
- Register Widgets Support
- Elementor Hooks

No animation logic should exist here.

---

## Modules

Each feature lives inside its own module.

Example:

```text
Modules/

SmoothScroll/

TextMotion/

HoverReveal/

InteractiveCursor/
```

Each module is responsible for:

- Registering itself
- Registering Elementor controls
- Loading its own assets
- Running its frontend logic

Modules should not depend on each other.

---

## Helpers

Contains reusable helper classes.

Examples:

- Utilities
- Validation
- Sanitization
- Common Functions

---

# Module Architecture

Every feature should be treated as an independent module.

Example:

```
Modules/

SmoothScroll/

TextMotion/

HoverReveal/

InteractiveCursor/
```

Each module is responsible for:

- Registering itself
- Loading assets
- Registering Elementor controls
- Running frontend logic

Modules should not depend on each other.

---

# Module Lifecycle

Each module should follow this lifecycle:

```
Plugin Starts

↓

Module Registered

↓

Module Enabled?

↓

YES

↓

Register Controls

↓

Load Assets

↓

Run Feature
```

Disabled modules should do nothing.

---

# Admin Architecture

The plugin provides three admin pages.

```
Emje Motion

Overview

Settings

About
```

---

## Overview

Purpose:

Manage available modules.

Every module can be enabled or disabled.

This page acts as the plugin dashboard.

---

## Settings

Reserved for global plugin settings.

Examples:

- Performance
- Debug
- Reduced Motion

---

## About

Displays:

- Plugin Version
- Documentation
- Website
- Changelog
- Support

---

# Elementor Architecture

The plugin extends Elementor instead of replacing it.

No custom Elementor widgets should be added.

Supported widgets receive additional controls.

---

## Heading

Location:

```
Content

Text Motion
```

---

## Text Editor

Location:

```
Content

Text Motion
```

---

## Container

Location:

```
Advanced

Emje Motion
```

---

# Assets

Assets should be loaded only when necessary.

Never enqueue every CSS and JS file globally.

Every module manages its own assets.

Example:

```
SmoothScroll

↓

smooth-scroll.css

smooth-scroll.js
```

---

# Settings Storage

Plugin settings should use the WordPress Settings API.

Modules should store only the necessary configuration.

Avoid unnecessary database entries.

---

# Performance Strategy

Performance is a top priority.

Rules:

- Load only enabled modules.
- Load assets conditionally.
- Minimize frontend requests.
- Avoid duplicated JavaScript.
- Avoid duplicated CSS.

---

# Dependency Rules

Modules should never directly depend on another module.

Communication should happen through Core services when necessary.

This keeps the architecture modular.

---

# Naming Conventions

Folders

```
TextMotion

HoverReveal

InteractiveCursor
```

Classes

```
Plugin

ModuleLoader

AssetLoader

SettingsManager

TextMotion

HoverReveal
```

Methods

```
register()

boot()

enqueue_assets()

register_controls()

init()
```

Files

```
class-plugin.php

class-module-loader.php

class-text-motion.php
```

---

# AI Development Guidelines

When implementing code:

- Keep files small.
- Prefer composition over large classes.
- One responsibility per class.
- Avoid global functions.
- Avoid duplicated logic.
- Write self-documenting code.
- Use dependency injection when appropriate.

---

# Future Expansion

The architecture should support future modules without changing the core.

Examples:

- Advanced Scroll
- Magnetic
- Tilt
- Mouse Parallax
- Background Effects
- Motion Timeline

New modules should only require registration through the module loader.

The core architecture should remain unchanged.

---

# Architecture Goal

The final architecture should be:

- Clean
- Modular
- Scalable
- Easy to maintain
- Easy to extend
- AI-friendly
- Performance-focused
