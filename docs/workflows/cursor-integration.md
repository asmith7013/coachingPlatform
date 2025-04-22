<doc id="cursor-integration">

# Cursor Integration Guide

<section id="cursor-overview">

## Overview

Our project leverages Cursor, an AI-native code editor, to accelerate development through AI assistance. This guide outlines best practices for using Cursor effectively with our project structure and documentation.

[RULE] Use Cursor to accelerate development while maintaining code quality standards.

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
[RULE] Make sure Cursor can access our documentation system for better assistance.
</section>
<section id="cursor-prompting">
Effective Prompting
Cursor works best with specific, well-structured prompts. Follow these guidelines:
Structure Your Prompts
[Task Description]
Create a new component that [purpose].

[Reference Documentation]
- [component-system][component-variants] Component Variants
- [data-flow][data-hooks] Data Fetching Hooks

[Implementation Requirements]
1. Follow the [specific pattern]
2. Implement [specific feature]
3. Handle [specific edge cases]
Include Examples
[Example Usage]
The component should be used like this:

<MyComponent
  prop1="value"
  prop2={data}
  onEvent={handler}
/>
[RULE] Structure prompts with clear tasks, references, and requirements.
</section>
<section id="cursor-reference">
Documentation References
When referencing our documentation in prompts, use the standardized format:
[document-id][section-id] Section Title
For example:

[component-system][component-variants] - References the variants section of the component system
[error-handling][error-hooks] - References the hooks section of error handling
[data-flow][data-schemas] - References the schemas section of data flow

This allows Cursor to quickly find and apply the relevant guidance.
[RULE] Use consistent documentation references in all Cursor prompts.
</section>
<section id="cursor-workflow">
Cursor Workflow
The optimal workflow with Cursor follows these steps:

Plan: Define what you want to build
Prompt: Create a specific prompt referencing documentation
Review: Carefully review the generated code
Refine: Iteratively improve the code with follow-up prompts
Test: Verify the code works as expected
Integrate: Merge the code into the broader codebase

For complex features, break them down into smaller parts and prompt for each:
# First prompt
Implement the data model for the feature...

# Second prompt
Now create the UI components using the model...

# Third prompt
Connect the components with the data hooks...
[RULE] Use an iterative, step-by-step approach with Cursor for complex features.
</section>
<section id="cursor-limitations">
Working with Limitations
Cursor works best when you:

Limit Scope: Focus on discrete, well-defined tasks
Provide Context: Include relevant project context
Handle Edge Cases: Explicitly prompt for error handling
Review Critically: Always review generated code for quality

When Cursor struggles:

Break the problem down further
Provide more specific examples
Reference more specific documentation sections
Take an iterative approach

[RULE] Understand Cursor's limitations and adjust your workflow accordingly.
</section>
</doc>