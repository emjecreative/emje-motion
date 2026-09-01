# Emje Motion Code Style Guide

> Coding standards and development guidelines for the Emje Motion WordPress plugin.

This document defines the coding standards for the Emje Motion project.

Every developer and AI coding assistant must follow these rules when creating or modifying code.

The goal is to keep the codebase clean, consistent, maintainable, and predictable.

---

# Table of Contents

1. General Principles
2. PHP Standards
3. Project Structure
4. File Rules
5. Class Design
6. Method Design
7. Naming Conventions
8. Dependency Injection
9. Container Rules
10. Module Rules
11. Elementor Rules
12. Asset Rules
13. WordPress Standards
14. Security
15. Performance
16. Error Handling
17. Documentation
18. AI Development Rules
19. Git Workflow
20. Prohibited Patterns
21. Final Principle

---

# 1. General Principles

Every piece of code should be:

- Clean
- Readable
- Predictable
- Maintainable
- Modular
- Consistent

Readable code is always preferred over clever code.

Whenever possible, code should explain itself through good naming and clear structure.

---

# 2. PHP Standards

The project uses:

- PHP 8.2+
- PSR-4 Autoloading
- PSR-12 Formatting
- Composer Autoload
- Strict Types

Every PHP file should begin with:

```php
<?php

declare(strict_types=1);
```

---

# 3. Project Structure

Respect the existing project architecture.

Never create new folders without a valid architectural reason.

Follow the directory structure defined in:

```
docs/ARCHITECTURE.md
```

Business logic should remain inside the appropriate module.

---

# 4. File Rules

Every file should have one primary responsibility.

Rules:

- One class per file
- One interface per file
- Keep files reasonably small
- Avoid large files whenever possible

Split responsibilities into multiple classes instead of creating large files.

Avoid "God Files".

---

# 5. Class Design

Every class should follow the Single Responsibility Principle.

A class should have:

- One responsibility
- One purpose
- One reason to change

Prefer composition over inheritance.

Keep public APIs small.

Avoid unnecessary public methods.

---

# 6. Method Design

Methods should:

- Perform one task
- Have descriptive names
- Return early when appropriate
- Avoid unnecessary nesting
- Stay reasonably small

Methods should be easy to understand without reading additional comments.

---

# 7. Naming Conventions

## Classes

Use PascalCase.

Examples:

```
Plugin
ModuleLoader
AssetsManager
ElementorManager
TextMotion
```

---

## Interfaces

Interfaces should end with:

```
Interface
```

Example:

```
ModuleInterface
```

---

## Traits

Traits should end with:

```
Trait
```

---

## Exceptions

Exceptions should end with:

```
Exception
```

---

## Methods

Use camelCase.

Examples:

```
register()

boot()

init()

registerControls()

enqueueAssets()
```

Methods should clearly describe their purpose.

---

## Variables

Use camelCase.

Avoid abbreviations unless they are widely understood.

Good:

```
$moduleLoader

$assetsManager

$textMotion
```

Bad:

```
$ml

$am

$tmp
```

---

# 8. Dependency Injection

Prefer Constructor Injection whenever practical.

Shared services should be injected instead of created manually.

Good:

```php
public function __construct(
    ModuleLoader $moduleLoader
) {
    $this->moduleLoader = $moduleLoader;
}
```

Avoid:

```php
$this->moduleLoader = new ModuleLoader();
```

---

# 9. Container Rules

Services managed by the Container should always be resolved through the Container.

Do not instantiate shared services manually.

The Container is responsible for:

- Service registration
- Dependency resolution
- Shared service lifecycle

---

# 10. Module Rules

Every feature belongs to its own module.

A module owns:

- Controls
- Assets
- Frontend behavior
- Module configuration

A module should:

- Register itself
- Register Elementor controls
- Register assets
- Execute frontend logic

Modules must never directly depend on another module.

Communication between modules should happen through shared Core services when necessary.

---

# 11. Elementor Rules

Never modify Elementor core.

Only use official Elementor APIs.

ElementorManager is responsible for:

- Elementor integration
- Hook registration
- Control registration

Business logic must never live inside ElementorManager.

Keep Elementor controls simple and intuitive.

Hide controls that are not relevant.

---

# 12. Asset Rules

Never enqueue every asset globally.

Every module manages its own assets.

Rules:

- Register assets first
- Enqueue only when required
- Avoid duplicate CSS
- Avoid duplicate JavaScript

Conditional loading is mandatory.

---

# 13. WordPress Standards

Every user-facing string must be translatable.

Examples:

```php
__()

esc_html__()

esc_attr__()
```

Always escape output.

Examples:

```php
esc_html()

esc_attr()

esc_url()

wp_kses_post()
```

Always sanitize user input.

Examples:

```php
sanitize_text_field()

sanitize_key()

absint()

sanitize_email()
```

Never trust user input.

---

# 14. Security

Always verify:

- User capabilities
- Permissions
- Nonces

Never expose unsafe endpoints.

Never trust external input.

Always sanitize before storing.

Always escape before rendering.

---

# 15. Performance

Performance is a core principle.

Rules:

- Load only enabled modules
- Register controls only when required
- Load assets conditionally
- Avoid unnecessary database queries
- Avoid duplicated logic
- Keep frontend assets lightweight

Performance should never be sacrificed for convenience.

---

# 16. Error Handling

Fail gracefully.

A single module failure must never prevent the plugin from loading.

Recover whenever possible.

Never expose sensitive information to end users.

---

# 17. Documentation

Code should explain itself through:

- Clear naming
- Small methods
- Well-defined classes

Do not write comments that explain obvious code.

Good:

```php
registerControls();
```

Bad:

```php
// Register controls
registerControls();
```

Only write comments when explaining complex business logic.

Public classes should include a short PHPDoc summary.

---

# 18. AI Development Rules

Before generating code:

1. Read PRD.md
2. Read ARCHITECTURE.md
3. Read CODE_STYLE.md
4. Inspect the existing implementation
5. Reuse existing services
6. Follow the current architecture
7. Generate code

Never introduce a new architecture without updating the documentation.

Avoid duplicate implementations.

Always prefer consistency over personal preference.

---

# 19. Git Workflow

Every meaningful change should be committed.

Commit messages should include:

## Summary

A concise description of the change.

## Description

A detailed explanation of:

- What changed
- Why it changed
- Any important implementation notes

---

# 20. Prohibited Patterns

Avoid:

- God Classes
- God Methods
- Singleton pattern
- Global helper functions
- Hidden side effects
- Cross-module dependencies
- Duplicate business logic
- Premature abstraction
- Unused code
- Dead code

Business logic must never live inside:

- ElementorManager
- AssetsManager
- Admin classes

---

# 21. Final Principle

Every change should make the project easier to understand and easier to maintain.

If an implementation conflicts with this document, either:

- Update the implementation, or
- Update the documentation.

The source code and documentation should always remain aligned.
