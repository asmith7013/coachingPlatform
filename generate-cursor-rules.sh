#!/bin/bash

# generate-cursor-rules.sh
# Automatically generates Cursor rule files from documentation

set -e

# Ensure .cursor/rules directory exists
mkdir -p .cursor/rules

# Clear out existing rules
rm -f .cursor/rules/*.mdc

echo "Generating Cursor rules from documentation..."

# Generate documentation-index.mdc
cat > .cursor/rules/documentation-index.mdc << 'EOL'
---
description: "AI Coaching Platform Documentation Index"
globs: "**/*"
alwaysApply: true
---

# AI Coaching Platform Documentation Index

This rule provides comprehensive access to the platform's documentation for both high-level understanding and specific implementation details.

## Documentation Organization

The documentation is organized into several key areas:

- **Architecture** - Core architecture principles, design patterns, and project structure
- **Components** - Component system guidelines, core components, and composition patterns
- **Data Flow** - Data management, API patterns, schema system, and error handling
- **Workflows** - Development processes, common tasks, and utilities
- **Examples** - Practical examples of implementations
- **General Guidelines** - Platform-wide guidelines and standards

## File Path Mapping

| Code Path | Related Documentation |
|-----------|------------------------|
| `src/lib/**/*.ts` | Architecture docs (`docs/architecture/`) |
| `src/components/**/*.{ts,tsx}` | Component docs (`docs/components/`) |
| `src/{lib/data,hooks,app/api,app/actions,models}/**/*.{ts,tsx}` | Data Flow docs (`docs/data-flow/`) |
| `**/*.{ts,tsx}` | Workflow docs (`docs/workflows/`) |

## Documentation References
EOL

# Add all documentation references to the index
echo "### Architecture Documentation" >> .cursor/rules/documentation-index.mdc
find docs/architecture -name "*.md" | sort | awk '{print "@file:" $0}' >> .cursor/rules/documentation-index.mdc
[ -f docs/architecture-overview.md ] && echo "@file:docs/architecture-overview.md" >> .cursor/rules/documentation-index.mdc

echo -e "\n### Component Documentation" >> .cursor/rules/documentation-index.mdc
find docs/components -name "*.md" | sort | awk '{print "@file:" $0}' >> .cursor/rules/documentation-index.mdc
[ -f docs/atomic-component-migration.md ] && echo "@file:docs/atomic-component-migration.md" >> .cursor/rules/documentation-index.mdc

echo -e "\n### Data Flow Documentation" >> .cursor/rules/documentation-index.mdc
find docs/data-flow -name "*.md" | sort | awk '{print "@file:" $0}' >> .cursor/rules/documentation-index.mdc

echo -e "\n### Workflow Documentation" >> .cursor/rules/documentation-index.mdc
find docs/workflows -name "*.md" | sort | awk '{print "@file:" $0}' >> .cursor/rules/documentation-index.mdc

echo -e "\n### Example Documentation" >> .cursor/rules/documentation-index.mdc
find docs/examples -name "*.md" | sort | awk '{print "@file:" $0}' >> .cursor/rules/documentation-index.mdc

echo -e "\n### General Guidelines" >> .cursor/rules/documentation-index.mdc
[ -f docs/token-system-guidelines.md ] && echo "@file:docs/token-system-guidelines.md" >> .cursor/rules/documentation-index.mdc

# Generate architecture.mdc
cat > .cursor/rules/architecture.mdc << 'EOL'
---
description: "Architecture Guidelines"
globs: "src/lib/**/*.ts"
alwaysApply: false
---

# Architecture Guidelines

The platform architecture follows a modular, layer-based approach with clear separation of concerns. These guidelines help maintain consistent architecture patterns across the codebase.

## Key Architecture Principles

- **Modular Design** - Code is organized into focused, reusable modules
- **Clear Boundaries** - Well-defined interfaces between system components
- **Dependency Management** - Careful control of dependencies to prevent coupling
- **Consistent Patterns** - Standard approaches to common architectural challenges
- **Progressive Enhancement** - Core functionality works first, with enhanced features added gracefully

## Documentation References
EOL

# Add architecture documentation references
find docs/architecture -name "*.md" | sort | awk '{print "@file:" $0}' >> .cursor/rules/architecture.mdc
[ -f docs/architecture-overview.md ] && echo "@file:docs/architecture-overview.md" >> .cursor/rules/architecture.mdc

# Generate components.mdc
cat > .cursor/rules/components.mdc << 'EOL'
---
description: "Component System Guidelines"
globs: "src/components/**/*.{ts,tsx}"
alwaysApply: false
---

# Component System Guidelines

The component system follows a layered approach with atomic, domain, and composed components. These guidelines ensure consistent, reusable, and maintainable UI elements.

## Component System Principles

- **Atomic Design** - Building complex UIs from simple, reusable components
- **Composition over Inheritance** - Preferring component composition for flexibility
- **Single Responsibility** - Each component has a clear, focused purpose
- **Accessibility First** - Components are designed for universal access
- **Performance Optimization** - Components are optimized for minimal re-renders

## Documentation References
EOL

# Add component documentation references
find docs/components -name "*.md" | sort | awk '{print "@file:" $0}' >> .cursor/rules/components.mdc
[ -f docs/atomic-component-migration.md ] && echo "@file:docs/atomic-component-migration.md" >> .cursor/rules/components.mdc

# Generate data-flow.mdc
cat > .cursor/rules/data-flow.mdc << 'EOL'
---
description: "Data Flow Guidelines"
globs: "src/{lib/data,hooks,app/api,app/actions,models}/**/*.{ts,tsx}"
alwaysApply: false
---

# Data Flow Guidelines

Data management follows strict patterns for consistency, security, and maintainability. These guidelines ensure proper data handling throughout the application lifecycle.

## Data Flow Principles

- **Schema Validation** - All data is validated against defined schemas
- **Centralized Error Handling** - Consistent approach to error management
- **Separation of Concerns** - Clear separation between data fetching, transformation, and rendering
- **Sanitization Layer** - Data is sanitized at system boundaries
- **Predictable State Management** - Well-defined patterns for managing application state

## Documentation References
EOL

# Add data flow documentation references
find docs/data-flow -name "*.md" | sort | awk '{print "@file:" $0}' >> .cursor/rules/data-flow.mdc

# Generate workflows.mdc
cat > .cursor/rules/workflows.mdc << 'EOL'
---
description: "Workflow Guidelines"
globs: "**/*.{ts,tsx}"
alwaysApply: false
---

# Workflow Guidelines

Development workflows are standardized to ensure consistency and productivity. These guidelines help maintain efficient development processes across the team.

## Workflow Principles

- **Consistent Development Environment** - Standardized tools and configurations
- **Automation First** - Repetitive tasks are automated where possible
- **Progressive Development** - Incremental building and testing of features
- **Collaborative Process** - Clear guidelines for team collaboration
- **Continuous Integration** - Regular integration of code changes and testing

## Documentation References
EOL

# Add workflow documentation references
find docs/workflows -name "*.md" | sort | awk '{print "@file:" $0}' >> .cursor/rules/workflows.mdc

echo "Successfully generated Cursor rules!"
echo "Rules created:"
echo "- documentation-index.mdc"
echo "- architecture.mdc"
echo "- components.mdc"
echo "- data-flow.mdc"
echo "- workflows.mdc" 