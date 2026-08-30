# Emje Motion Architecture

> Technical architecture and development guidelines for the Emje Motion WordPress plugin.

This document defines the architecture of Emje Motion. Every implementation should follow this document to keep the project clean, modular, scalable, and maintainable.

---

# Table of Contents

1. Architecture Goals
2. Design Principles
3. Technology Stack
4. High-Level Architecture
5. Bootstrap Flow
6. Directory Structure
7. Core Components
8. Dependency Injection
9. Module System
10. Elementor Integration
11. Asset Management
12. Admin Architecture
13. Settings Architecture
14. Error Handling
15. Performance Strategy
16. Naming Conventions
17. Adding a New Module
18. Future Expansion
19. Architecture Rules

---

# 1. Architecture Goals

The architecture is designed to be:

- Modular
- Scalable
- Lightweight
- Performance-focused
- Easy to maintain
- Easy to extend
- AI-friendly

The Core architecture should remain stable as new modules are introduced.

---

# 2. Design Principles

The project follows these principles:

- Modular Architecture
- Single Responsibility Principle
- Dependency Injection
- PSR-4 Autoloading
- Composer Based
- Performance First
- Elementor First
- AI-Friendly Codebase

Every class should have one clear responsibility.

Modules should remain independent.

---

# 3. Technology Stack

| Component | Technology |
|------------|------------|
| Language | PHP 8.2+ |
| Frontend | JavaScript (ES6) |
| Styling | CSS |
| Builder | Elementor |
| Animation Engine | GSAP |
| Dependency Manager | Composer |
| Autoloading | PSR-4 |

---

# 4. High-Level Architecture

```
WordPress
      │
      ▼
emje-motion.php
      │
      ▼
Plugin
      │
      ▼
Container
      │
      ├───────────────┐
      ▼               ▼
ModuleLoader   ElementorManager
      │
      ▼
Modules
      │
      ▼
Frontend
```

The plugin entry point should remain lightweight.

Business logic belongs inside dedicated services.

---

# 5. Bootstrap Flow

```
WordPress

↓

Plugin Loaded

↓

Plugin Initialized

↓

Register Services

↓

Register Modules

↓

Detect Elementor

↓

Register Controls

↓

Register Assets

↓

Frontend Ready
```

The bootstrap process should remain predictable and easy to follow.

---

# 6. Directory Structure

```
assets/
docs/
languages/
src/
vendor/

composer.json
emje-motion.php
README.md
```

Inside `src/`

```
Admin/
Assets/
Contracts/
Core/
Elementor/
Modules/
```

Each directory has one clear responsibility.

---

# 7. Core Components

## Plugin

Responsible for bootstrapping the plugin.

Responsibilities:

- Initialize the plugin
- Register services
- Start the plugin lifecycle

---

## Container

Responsible for dependency management.

Responsibilities:

- Register shared services
- Resolve dependencies
- Centralize object creation

---

## ModuleLoader

Responsible for module management.

Responsibilities:

- Register modules
- Boot enabled modules
- Keep modules isolated

---

## ElementorManager

Responsible for Elementor integration.

Responsibilities:

- Register Elementor hooks
- Register controls
- Detect Elementor availability

Business logic must never live here.

---

## AssetsManager

Responsible for asset registration.

Responsibilities:

- Register CSS
- Register JavaScript
- Conditionally enqueue assets

---

## Admin

Responsible for WordPress admin functionality.

Examples:

- Overview
- Settings
- About
- Admin Notices

---

## ModuleInterface

Defines the contract every module must implement.

Every module should implement the same lifecycle.

---

# 8. Dependency Injection

Constructor Injection should be preferred whenever practical.

Objects should be created by the Container instead of being instantiated throughout the project.

Benefits:

- Easier testing
- Better separation of concerns
- Reusable services
- Cleaner architecture

---

# 9. Module System

Every feature is implemented as an independent module.

Example:

```
Modules/

TextMotion/

HoverReveal/

SmoothScroll/

InteractiveCursor/ (dot-ring/text-follow/trail via InteractionMotion)

InteractionMotion/ (HoverControls + CursorControls composition, ColorResolver/SliderResolver services)
```

Every module is responsible for:

- Registering itself
- Registering Elementor controls
- Registering assets
- Running frontend logic

Modules must never directly depend on another module.

Communication between modules should happen through shared Core services when necessary.

---

## Module Lifecycle

```
Plugin

↓

Module Registered

↓

Module Enabled

↓

Register Controls

↓

Register Assets

↓

Frontend Initialization
```

Disabled modules should perform no work.

---

# 10. Elementor Integration

Emje Motion extends Elementor instead of replacing it.

The plugin does not introduce custom widgets.

Instead, existing Elementor widgets receive additional controls.

Supported widgets include:

- Heading
- Text Editor
- Container

Future widget support should follow the same architecture.

---

# 11. Asset Management

Every module manages its own assets.

Assets should only load when required.

Never globally enqueue every JavaScript or CSS file.

Example:

```
TextMotion

↓

text-motion.css

text-motion.js
```

Conditional loading is mandatory.

---

# 12. Admin Architecture

The plugin provides three admin pages.

```
Emje Motion

Overview

Settings

About
```

Overview manages available modules.

Settings manages global configuration.

About displays plugin information.

---

# 13. Settings Architecture

Global settings should use the WordPress Settings API.

Modules should only store settings that are actually required.

Avoid unnecessary database entries.

---

# 14. Error Handling

Failures should be isolated.

One module failing must never prevent the plugin from loading.

Always fail gracefully.

---

# 15. Performance Strategy

Performance is one of the core goals.

Rules:

- Load only enabled modules.
- Conditionally enqueue assets.
- Avoid duplicate CSS.
- Avoid duplicate JavaScript.
- Minimize frontend requests.
- Keep module initialization lightweight.

---

# 16. Naming Conventions

## Classes

PascalCase

```
Plugin
ModuleLoader
AssetsManager
TextMotion
```

---

## Methods

camelCase

```
register()

boot()

registerControls()

enqueueAssets()

init()
```

---

## Files

One class per file.

Example:

```
Plugin.php

ModuleLoader.php

TextMotion.php
```

---

# 17. Adding a New Module

Every new feature should follow the same workflow.

```
Create Module Folder

↓

Create Module Class

↓

Implement ModuleInterface

↓

Create Controls

↓

Create Assets

↓

Register Module

↓

Testing
```

New modules should require minimal changes outside their own directory.

---

# 18. Future Expansion

The architecture is designed to support future modules without changing the Core.

Examples:

- Advanced Scroll
- Magnetic (extend Interactive Cursor trail)
- Tilt
- Mouse Parallax
- Background Effects
- Motion Timeline (Comet Trail done in 1.3.0 via trail rAF)

Core services should remain stable.

---

# 19. Architecture Rules

## Allowed

- Constructor Injection
- One Responsibility per Class
- One Feature per Module
- Composition over inheritance
- Independent modules
- Conditional asset loading

## Forbidden

- God Classes
- Cross-module dependencies
- Global helper functions
- Business logic inside ElementorManager
- Global asset enqueue
- Duplicate frontend logic

---

# Final Principle

Architecture decisions should prioritize long-term maintainability over short-term convenience.

Whenever the architecture changes, this document must be updated before implementing new features.
