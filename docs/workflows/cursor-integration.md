# Cursor Integration Guide

## Overview

Our project leverages Cursor, an AI-native code editor, to accelerate development through AI assistance. This guide outlines best practices for using Cursor effectively with our project structure and documentation.

[RULE] Use Cursor to accelerate development while maintaining code quality standards.

## Code Advice Format

When providing code advice or implementation guidance, format the response as a Cursor prompt that follows our established patterns. This should include:

1. A clear task description at the top
2. Reference to relevant documentation sections using our standard format: [document-id][section-id]
3. Scope boundaries (what's in/out of scope)
4. Implementation requirements
5. Code examples following our formatting guidelines 

Unless explicitly directed otherwise, assume that code advice is intended to be copy-pasted into Cursor as a prompt.

Example format:
```markdown
# Implement Example Function

## SCOPE
- IN SCOPE: Create a basic example function
- OUT OF SCOPE: Complex error handling, advanced features

## COMPLETE CODE EXAMPLE
```typescript
// src/utils/example.ts
export function example() {
  // Code implementation
}
```
```

## Setting Up Cursor

When setting up Cursor for this project:

1. Ensure you have the latest version of Cursor installed
2. Enable the `.cursor` directory in your project root
3. Configure Cursor to use our documentation system:
   - Add pointers to our documentation in `.cursor/rules`
   - Set appropriate model settings for our project

```bash
# Example rule file: .cursor/rules/component-system-pointer.md
# Component System Reference
See: /docs/components/component-system.md

Key section IDs:
- component-overview
- component-organization
- component-tokens
- component-variants
```

[RULE] Make sure Cursor can access our documentation system for better assistance.

## Effective Prompting

Cursor works best with specific, well-structured prompts. Follow these guidelines:

### Structure Your Prompts

```markdown
[Task Description]
Create a new component that [purpose].

[Reference Documentation]
- [component-system][component-variants] Component Variants
- [data-flow][data-hooks] Data Fetching Hooks

[Implementation Requirements]
1. Follow the [specific pattern]
2. Implement [specific feature]
3. Handle [specific edge cases]
```

### Include Examples

```markdown
[Example Usage]
The component should be used like this:

<MyComponent
  prop1="value"
  prop2={data}
  onEvent={handler}
/>
```

[RULE] Structure prompts with clear tasks, references, and requirements.

## Maintaining Focus

To prevent Cursor from going on tangents and keep it focused on the primary task:

### Define Clear Boundaries

```markdown
## SCOPE
- IN SCOPE: [list of specific tasks that should be done]
- OUT OF SCOPE: [list of distractions to avoid]
```

### Provide Explicit Exit Conditions

```markdown
## EXIT CRITERIA
- Stop when [specific condition is met]
- Move to next step after [specific milestone]
- Ignore [specific distractions] if encountered
```

### Use Priority Markers

```markdown
## PRIORITY TASKS (Execute in this order)
1. [HIGH] Essential task that must be completed first
2. [MEDIUM] Important but secondary task
3. [LOW] Optional enhancement if time permits
```

[RULE] Include explicit focus mechanisms in complex prompts to prevent tangents.

## Documentation References

When referencing our documentation in prompts, use the standardized format:

```markdown
[document-id][section-id] Section Title
```

For example:

- `[component-system][component-variants]` - References the variants section of the component system
- `[error-handling][error-hooks]` - References the hooks section of error handling
- `[data-flow][data-schemas]` - References the schemas section of data flow

This allows Cursor to quickly find and apply the relevant guidance.

[RULE] Use consistent documentation references in all Cursor prompts.

## Scope Definition Requirements

All Cursor prompts for multi-file changes must include a complete file list to ensure proper scope definition and prevent incomplete implementations.

### File List Requirements

When working with multiple files, always include:

```markdown
## FILES TO MODIFY
- src/components/NewComponent.tsx (CREATE)
- src/hooks/useNewHook.ts (CREATE)
- src/types/index.ts (UPDATE - add new types)
- src/utils/helpers.ts (UPDATE - add utility function)
```

### Implementation Boundaries

Define clear boundaries for what should and shouldn't be implemented:

```markdown
## IMPLEMENTATION SCOPE
- IN SCOPE: Core component functionality, basic styling, type definitions
- OUT OF SCOPE: Advanced animations, complex state management, testing setup
```

[RULE] Always provide complete file lists and clear scope boundaries for multi-file changes.

## Common Patterns

### Component Creation

```markdown
# Create [ComponentName] Component

## REFERENCE
- [component-system][component-tokens] Token-First Design
- [component-system][component-variants] Variant Patterns

## REQUIREMENTS
1. Use tv() for styling variants
2. Follow atomic design principles
3. Include proper TypeScript types
4. Export from component index
```

### Hook Development

```markdown
# Create [HookName] Hook

## REFERENCE
- [hook-development][domain-hooks] Domain Hook Patterns
- [data-flow][crud-factory] CRUD Factory Usage

## REQUIREMENTS
1. Use CRUD factory if applicable
2. Follow domain organization
3. Include proper error handling
4. Export from hooks index
```

### API Integration

```markdown
# Implement [EntityName] API Integration

## REFERENCE
- [api-patterns][api-routes] Standard API Patterns
- [schema-system][core-patterns] Schema Validation

## REQUIREMENTS
1. Follow standard response format
2. Implement proper validation
3. Use withDbConnection wrapper
4. Include error handling
```

[RULE] Use these common patterns as templates for consistent Cursor prompts.

## Best Practices

1. **Be Specific**: Provide exact requirements rather than vague descriptions
2. **Reference Documentation**: Always include relevant documentation sections
3. **Define Scope**: Clearly state what should and shouldn't be implemented
4. **Include Examples**: Show expected usage patterns
5. **Set Exit Criteria**: Define when the task is complete

[RULE] Follow these best practices for effective Cursor collaboration.
```
