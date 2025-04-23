<doc id="dev-workflow">

# Development Workflow

<section id="workflow-overview">

## Overview

Our development workflow uses a combination of tools and practices to ensure consistent, high-quality code. We use Claude for planning and reasoning, and Cursor (an AI-native code editor) for implementation.

[RULE] Follow established patterns and workflows for all development tasks.

</section>

<section id="workflow-cursor">

## Working with Cursor

Cursor is our primary code editor for implementation. When creating prompts for Cursor:

- Use detailed, specific instructions
- Reference documentation sections explicitly
- Include code snippets and examples

Example prompt:
Implement a new hook for fetching teacher schedules, following our error handling standards.
Reference documentation:

[error-handling][error-hooks] Custom Hook Error Requirements
[data-flow][data-reference-hook] Reference Data Hook

Create a new file at src/hooks/useTeacherSchedule.ts that:

Uses useSafeSWR for data fetching
Includes proper error handling with handleClientError
Returns the standard { data, error, isLoading } structure
Includes appropriate TypeScript types


[RULE] Always reference specific documentation sections in Cursor prompts.

</section>

<section id="workflow-tasks">

## Common Development Tasks

### Adding a New Field

1. Update the Zod schema first
2. Add the field to the field configuration
3. Add any necessary overrides
4. Update the MongoDB model if needed

### Creating a New Component

1. Start with core/primitive components
2. Compose them into more complex components
3. Use tokens directly for basic visual styling and shared variants for common behaviors:
   - Direct token usage for colors, spacing, typography in atomic components
   - Shared variants for interactive states, loading states, etc.
   - Combine both approaches when appropriate
4. Include proper error handling
### Implementing a New Feature

1. Define the data schema
2. Create the form configuration
3. Implement the server actions
4. Build the UI components
5. Connect everything together

[RULE] Follow the established sequence for development tasks.

</section>

<section id="workflow-principles">

## Development Principles

When developing new features or components, prioritize:

- **Clarity**: Code should be easy to understand
- **Maintainability**: Future developers should be able to work with your code
- **Scalability**: Solutions should work at scale
- **Consistency**: Follow established patterns

[RULE] Prioritize clarity, maintainability, scalability, and consistency.

</section>

</doc>