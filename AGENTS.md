# AGENTS.md

# Emje Motion

This repository contains the source code for **Emje Motion**, a modern WordPress plugin that brings advanced motion and animation capabilities to Elementor.

---

# Before You Start

Before making any code changes, always read the following documentation:

1. docs/PRD.md
2. docs/ARCHITECTURE.md
3. docs/CODE_STYLE.md

These documents define the product vision, architecture, and coding standards.

Do not make assumptions that conflict with the documentation.

---

# Project Goals

The project prioritizes:

- Maintainability
- Readability
- Scalability
- Performance
- WordPress best practices
- Modern PHP architecture

This project is intended to grow over time. Prefer long-term maintainability over short-term convenience.

---

# Development Principles

Always:

- Follow PSR-12.
- Follow the project's CODE_STYLE.md.
- Keep classes focused on a single responsibility.
- Prefer composition over inheritance.
- Keep methods small and readable.
- Write self-explanatory code.
- Add PHPDoc where appropriate.
- Use strict typing whenever possible.

Never:

- Introduce unnecessary complexity.
- Create procedural code unless explicitly requested.
- Modify unrelated files.
- Rename existing public APIs without instruction.
- Add third-party dependencies without approval.

---

# WordPress Guidelines

- Keep `emje-motion.php` as a lightweight bootstrap file.
- Place business logic inside the `src` directory.
- Respect WordPress coding practices where applicable.
- Avoid global state whenever possible.
- Load assets only when necessary.

---

# Architecture Rules

Follow the architecture described in:

docs/ARCHITECTURE.md

Do not introduce new architectural patterns without explaining the reason.

---

# File Creation

Before creating new classes:

- Check whether a similar class already exists.
- Follow the existing namespace structure.
- Keep folder organization consistent.

Do not duplicate logic.

---

# Making Changes

When implementing a task:

1. Read the relevant documentation.
2. Explain the implementation plan briefly.
3. Make the smallest reasonable change.
4. Preserve existing behavior.
5. Avoid unrelated refactoring.

---

# Code Quality

Generated code should be:

- Clean
- Predictable
- Easy to review
- Production-ready

Optimize for readability before cleverness.

---

# Communication

When a request is ambiguous:

- Ask for clarification instead of guessing.

When making architectural decisions:

- Explain the reasoning first.

Do not invent features that were not requested.

---

# Success Criteria

Every contribution should make the project:

- Easier to maintain
- Easier to extend
- Easier to understand
