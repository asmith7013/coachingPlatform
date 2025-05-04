```markdown
<doc id="cursor-integration">

# Cursor Integration Guide

<section id="cursor-overview">

## Overview

Our project leverages Cursor, an AI-native code editor, to accelerate development through AI assistance. This guide outlines best practices for using Cursor effectively with our project structure and documentation.

[RULE] Use Cursor to accelerate development while maintaining code quality standards.

</section>

<section id="cursor-code-advice">
## Code Advice Format

When providing code advice or implementation guidance, almost always format the response as a Cursor prompt that follows our established Cursor prompt patterns. This should include:

1. A clear task description at the top
2. Reference to relevant documentation sections using our standard format: [document-id][section-id]
3. Scope boundaries (what's in/out of scope)
4. Implementation requirements
5. Code examples following our code example formatting guidelines 

Unless explicitly directed otherwise, assume that code advice is intended to be copy-pasted into Cursor as a prompt. Format your response accordingly, even for seemingly simple implementations.

Example:
Instead of directly providing code like this:
```typescript
function example() {
  // Code here
}
```
Format it as a Cursor prompt like this:
markdown# Implement Example Function

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
</section>

<section id="cursor-setup">

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
- component-fields
- component-form
- component-error-display
```

[RULE] Make sure Cursor can access our documentation system for better assistance.

</section>

<section id="cursor-prompting">

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

</section>

<section id="cursor-focus">

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

### Step-by-Step Structure

```markdown
## STEP-BY-STEP IMPLEMENTATION
### STEP 1: [First Task]
- Specific action to take
- CHECK: Verification step
- EXIT: When to move to the next step

### STEP 2: [Second Task]
...
```

[RULE] Include explicit focus mechanisms in complex prompts to prevent tangents.

</section>

<section id="cursor-reference">

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

</section>

<section id="cursor-workflow">

## Cursor Workflow

The optimal workflow with Cursor follows these steps:

1. **Plan**: Define what you want to build
2. **Prompt**: Create a specific prompt referencing documentation
3. **Review**: Carefully review the generated code
4. **Refine**: Iteratively improve the code with follow-up prompts
5. **Test**: Verify the code works as expected
6. **Integrate**: Merge the code into the broader codebase

For complex features, break them down into smaller parts and prompt for each:

```markdown
# First prompt
Implement the data model for the feature...

# Second prompt
Now create the UI components using the model...

# Third prompt
Connect the components with the data hooks...
```

[RULE] Use an iterative, step-by-step approach with Cursor for complex features.

</section>

<section id="cursor-limitations">

## Working with Limitations

Cursor works best when you:

- **Limit Scope**: Focus on discrete, well-defined tasks
- **Provide Context**: Include relevant project context
- **Handle Edge Cases**: Explicitly prompt for error handling
- **Review Critically**: Always review generated code for quality

When Cursor struggles:

- Break the problem down further
- Provide more specific examples
- Reference more specific documentation sections
- Take an iterative approach

[RULE] Understand Cursor's limitations and adjust your workflow accordingly.

</section>

<section id="cursor-refocus">

## Redirecting When Off Track

If Cursor begins to go off track:

1. **Interrupt**: Don't let Cursor continue down an unproductive path
2. **Refocus**: Explicitly state that you want to refocus on the primary task
3. **Reframe**: Provide a clearer, more focused prompt

Example refocusing prompt:

```markdown
Let's refocus on the original task: [restate the primary objective].

Please stop the current exploration of [tangent topic] and instead:
1. Complete [specific next step]
2. Focus specifically on [core requirement]
3. Ignore [distracting elements] for now
```

[RULE] Actively redirect Cursor when it goes on tangents rather than letting it continue.

</section>

<section id="cursor-examples">

## Example Prompts

### Good Example: Focused Prompt

```markdown
# TypeScript Error Fixing Plan

## SCOPE
- IN SCOPE: Fix import paths, create missing utility files, fix card component props
- OUT OF SCOPE: Investigating data structures, adding new features, refactoring logic

## PRIORITY TASKS
1. [HIGH] Run path fixing scripts to update imports
2. [HIGH] Create missing utility files and directories
3. [MEDIUM] Fix card component prop type issues
4. [LOW] Add type annotations to improve type safety

## STEP-BY-STEP IMPLEMENTATION
### STEP 1: Run Path Fixing Scripts
- Execute the following scripts in sequence:
  - fix-server-paths.sh
  - fix-type-paths.sh
  - fix-misc-paths.sh
- CHECK: After each script, verify error reduction
- EXIT: Move to next step after all scripts complete

### STEP 2: Create Missing Files
- Create required utility files:
  - src/lib/utils/general/cn.ts
  - src/lib/data/hooks/useItemToGroupMap.ts
- EXIT: Move to next step once files are created

### STEP 3: Fix Component Props
- Update Card component props to fix type errors
- EXIT: When Card component can be used without type errors
```

### Poor Example: Unfocused Prompt

```markdown
Fix all the TypeScript errors in the project. Also, can you improve the performance and add some new features while you're at it? Maybe look at how we handle data loading and suggest improvements. Also, check for any security issues.
```

[RULE] Learn from these examples to craft focused, effective prompts.

</section>
</doc>
```
