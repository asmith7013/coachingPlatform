# Claude Skills for AI Coaching Platform

This directory contains specialized Claude skills that provide comprehensive documentation and patterns for working on the AI Coaching Platform.

## Available Skills

### 1. `architecture` - Core Architecture & Patterns
**Use when**: Planning features, understanding system architecture, learning conventions

**Includes**:
- Exemplar stack documentation
- Path aliases and import patterns
- CRUD factory patterns
- File organization standards
- Naming conventions

**Invoke with**: `/skill architecture` or reference in Cursor with `@architecture`

---

### 2. `data-flow` - Backend, APIs & Database
**Use when**: Server actions, database operations, API development, state management

**Includes**:
- Server action patterns
- MongoDB/Mongoose integration
- React Query patterns
- Schema system (Zod + Mongoose)
- Authentication with Clerk
- Error handling
- Data transformations

**Invoke with**: `/skill data-flow` or reference in Cursor with `@data-flow`

---

### 3. `component-system` - UI Components & Design
**Use when**: Building UI components, styling, design system work

**Includes**:
- Component hierarchy (core → composed → domain → features)
- Design token system
- Tailwind CSS v4 patterns
- Layout systems
- Styling best practices
- Common component patterns

**Invoke with**: `/skill component-system` or reference in Cursor with `@component-system`

---

### 4. `workflows` - Development Processes
**Use when**: Starting new features, following best practices, managing changes

**Includes**:
- Development workflow
- Implementation checklists
- Common tasks guides
- Breaking changes management
- Hook development patterns
- Development utilities

**Invoke with**: `/skill workflows` or reference in Cursor with `@workflows`

---

### 5. `tanstack-table` - Data Tables
**Use when**: Building tables with TanStack Table (React Table v8)

**Includes**:
- Table setup and configuration
- Sorting, filtering, pagination
- Editable cells
- Row selection
- Custom cell rendering
- Performance optimization

**Invoke with**: `/skill tanstack-table` or reference in Cursor with `@tanstack-table`

---

## Usage Guide

### In Claude Code CLI

```bash
# Invoke a skill when you need specialized knowledge
/skill architecture

# Or ask Claude to use a specific skill
"Use the data-flow skill to help me create a new server action"
```

### In Cursor AI

Skills can be referenced in Cursor using the `@` syntax:

```
@architecture help me understand the import patterns

@data-flow show me how to create a server action for fetching students

@component-system build a new card component following the design system

@workflows what's the process for implementing a new feature?

@tanstack-table help me add sorting to my table
```

### Combining Skills

You can reference multiple skills when working on complex tasks:

```
I need to build a new student management feature.
- @architecture for overall structure
- @data-flow for server actions and database
- @component-system for the UI components
- @workflows for the implementation process
```

## Skill Organization

Each skill references specific documentation files using the `@` prefix:

```markdown
@exemplar-stack.md
@architecture/core-principles.md
@data-flow/server-actions.md
```

These references point to actual documentation files in `/docs/`.

## When to Use Which Skill

### Starting a New Feature
1. **`workflows`** - Understand the implementation process
2. **`architecture`** - Plan the structure and patterns
3. **`data-flow`** - Implement backend operations
4. **`component-system`** - Build UI components

### Debugging/Refactoring
1. **`architecture`** - Understand current patterns
2. **`data-flow`** or **`component-system`** - Depending on frontend/backend issue

### Learning the Codebase
1. **`architecture`** - Start here for overview
2. **`workflows`** - Understand development practices
3. **`data-flow`** and **`component-system`** - Deep dive into specific areas

## Maintenance

### Adding New Documentation

When adding new docs to `/docs/`, consider which skill should reference them:

1. **Architecture docs** → Update `architecture.md`
2. **Backend/API docs** → Update `data-flow.md`
3. **UI/Component docs** → Update `component-system.md`
4. **Process/Workflow docs** → Update `workflows.md`
5. **Table-related docs** → Update `tanstack-table.md`

### Updating Skills

To update a skill:
1. Edit the `.md` file in `.claude/skills/`
2. Add new documentation references with `@path/to/doc.md`
3. Update code examples if patterns change
4. Test by invoking the skill and asking questions

## Tips for Effective Skill Usage

1. **Be Specific**: "Use the data-flow skill to help me create a mutation" is better than "help me with data"

2. **Reference Patterns**: Ask to follow existing patterns: "Using the data-flow skill, create a server action following the standard pattern"

3. **Combine with Code Context**: "Look at TrackingTables.tsx and use the tanstack-table skill to add filtering"

4. **Chain Skills**: "First use the architecture skill to plan, then data-flow to implement the backend"

## Troubleshooting

**Skill not loading?**
- Check that the `.md` file exists in `.claude/skills/`
- Verify the syntax: `/skill skill-name` (no `.md` extension)

**Getting incorrect information?**
- The skill may reference outdated docs
- Check the actual documentation files in `/docs/`
- Update the skill to reference current docs

**Need more context?**
- Skills are focused on specific areas
- Combine multiple skills for complex tasks
- Reference actual code files for implementation details

## Contributing

When you create new documentation or patterns:

1. Add the documentation to `/docs/`
2. Update the relevant skill(s) in `.claude/skills/`
3. Add examples to the skill if it's a common pattern
4. Update this README if you add a new skill

---

## Quick Reference

| Task | Primary Skill | Secondary Skills |
|------|---------------|------------------|
| New feature planning | `architecture` | `workflows` |
| Server action | `data-flow` | `architecture` |
| UI component | `component-system` | `architecture` |
| Database query | `data-flow` | - |
| Data table | `tanstack-table` | `component-system` |
| Form handling | `data-flow`, `component-system` | `workflows` |
| Debugging | Depends on area | `architecture` |
| Learning codebase | `architecture` | All others |

---

**Last Updated**: November 2024
**Maintained By**: AI Coaching Platform Team
