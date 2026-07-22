# Emje Motion Code Style Guide

This document defines the coding standards for the Emje Motion project.

Every AI coding assistant must follow these rules when generating or modifying code.

---

# General Principles

Code should always be:

- Clean
- Readable
- Modular
- Maintainable
- Predictable

Readable code is preferred over clever code.

---

# WordPress Standards

Always follow:

- WordPress Coding Standards
- PSR-4 Autoloading
- Composer Autoload
- PHP 8.2+

Never mix different coding styles.

---

# Project Structure

Respect the existing folder structure.

Do not create new folders unless absolutely necessary.

Never place unrelated classes together.

---

# File Rules

- One class per file.
- One primary responsibility per file.
- Keep files reasonably small.
- Split large classes into multiple classes.

Avoid "God Classes".

---

# Class Rules

Classes should follow the Single Responsibility Principle.

Each class should do one thing only.

Examples:

Good

- Plugin
- ModuleLoader
- AssetLoader
- SettingsManager
- TextMotion

Avoid classes like:

- PluginManagerEverything

---

# Method Rules

Methods should:

- Be small.
- Have descriptive names.
- Perform one task.

Good:

register()

boot()

enqueue_assets()

register_controls()

Bad:

doEverything()

runPlugin()

---

# Naming

Use PascalCase for classes.

Example:

TextMotion

HoverReveal

AssetLoader

Use camelCase for methods.

Example:

registerControls()

enqueueAssets()

Use snake_case for WordPress hooks when appropriate.

---

# Dependency Injection

Prefer constructor injection whenever practical.

Avoid creating objects inside other classes unless necessary.

---

# Global Functions

Avoid global helper functions.

Prefer dedicated helper classes.

---

# Static Methods

Avoid static methods unless they clearly improve readability.

Favor object-oriented design.

---

# Comments

Do not write comments that explain obvious code.

Bad:

// Register controls

registerControls();

Good:

Use clear class names and method names so comments become unnecessary.

Only add comments when explaining complex business logic.

---

# Translation

Every user-facing string must be translatable.

Use WordPress translation functions.

Example:

__()

esc_html__()

esc_attr__()

Never hardcode UI strings.

---

# Escaping

Always escape output.

Use appropriate WordPress escaping functions.

Examples:

esc_html()

esc_attr()

esc_url()

wp_kses_post()

---

# Sanitization

Always sanitize user input.

Examples:

sanitize_text_field()

sanitize_key()

absint()

sanitize_email()

Never trust user input.

---

# Security

Always verify:

- Nonces
- User capabilities
- Permissions

Never expose unsafe endpoints.

---

# Performance

Performance is a priority.

Rules:

- Load assets only when needed.
- Register controls only for enabled modules.
- Avoid duplicate CSS.
- Avoid duplicate JavaScript.
- Avoid unnecessary database queries.

---

# Elementor

Never modify Elementor core.

Only use public Elementor APIs.

Keep Elementor controls simple.

Hide controls that are not relevant.

---

# Modules

Every module should be independent.

A module should:

- Register itself
- Register Elementor controls
- Load its own assets
- Execute its own frontend logic

Modules should never directly depend on other modules.

---

# Database

Store only necessary settings.

Avoid creating unnecessary options.

Keep the database clean.

---

# Error Handling

Fail gracefully.

Never allow a single module failure to break the entire plugin.

---

# AI Coding Rules

Before writing code:

- Read PRD.md
- Read ARCHITECTURE.md

When generating code:

- Follow existing architecture.
- Reuse existing services.
- Avoid duplicated logic.
- Keep implementations consistent.

Never invent a different architecture without updating the documentation.

---

# Pull Request Mindset

Every code change should:

- Improve readability.
- Preserve consistency.
- Avoid breaking existing APIs.
- Keep backward compatibility whenever possible.

---

# Final Principle

Every piece of code should make the project easier to maintain, not harder.