```markdown
<doc id="core-principles">

# Core Architecture Principles

<section id="architecture-overview">

## Overview

Our AI Coaching Platform is built on a set of foundational architectural principles that guide all development decisions. These high-level principles establish the "why" behind our technical choices and ensure the application remains maintainable, scalable, and aligned with our goals.

[RULE] All development decisions should align with these core principles.

</section>

<section id="schema-driven-philosophy">

## Schema-Driven Philosophy

We adopt a schema-first approach where data definitions precede implementation. This philosophy:

- Establishes a **single source of truth** for all data structures
- Ensures **consistency** across frontend, backend, and database
- Drives **automated code generation** and validation
- Provides a **clear contract** between system components

See `data-flow/schema-system.md` for detailed implementation guidelines.

[RULE] Data structures should be defined abstractly before specific implementations.

</section>

<section id="atomic-composition">

## Atomic Composition

We build complex interfaces from simple, composable parts following progressive levels of complexity. This principle:

- Promotes **reusability** through composition over inheritance
- Establishes **clear boundaries** between layers of abstraction
- Enables **independent testing** of isolated components
- Creates a **shared vocabulary** for UI elements

See `components/component-system.md` for the component hierarchy implementation.

[RULE] Build complex systems from simple, composable parts with clear boundaries.

</section>

<section id="design-token-centralization">

## Design Token Centralization

We centralize design decisions in tokens rather than distributing them throughout the codebase. This principle:

- Creates a **unified design language** across the application
- Simplifies **theme customization** and brand adjustments
- Enforces **consistency** in the user experience
- Reduces **design drift** over time

See `components/styling-patterns.md` for token implementation details.

[RULE] Centralize design decisions in a single source of truth.

</section>

<section id="standardized-interfaces">

## Standardized Interfaces

We establish consistent patterns for communication between system components. This principle:

- Creates **predictable contracts** between modules
- Enables **interchangeable implementations**
- Simplifies **testing and debugging**
- Reduces **cognitive load** for developers

See `data-flow/api-patterns.md` for API standardization guidelines.

[RULE] Define clear, consistent interfaces between system components.

</section>

<section id="developer-efficiency">

## Developer Efficiency

We optimize for developer productivity and code maintainability. This principle:

- Reduces **repetitive tasks** through automation
- Improves **code comprehension** through consistent patterns
- Accelerates **onboarding** of new developers
- Enables **rapid iteration** on features

See `workflows/development-workflow.md` for developer experience best practices.

[RULE] Value developer efficiency as a foundation for product quality.

</section>

</doc>
```
