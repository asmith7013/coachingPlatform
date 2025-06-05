# Coding Session Control Template

Use this template at the start of coding sessions to control MCP file system usage:

## Option 1: Full Control Flow
```markdown
# Coding Session: [Feature/Task Name]

## MCP Control Flow:
1. **Analysis Phase** - Read files only, no modifications
2. **Planning Phase** - Present strategy without file operations  
3. **Review Phase** - Show exactly what would be created/modified
4. **Implementation Phase** - Execute with my approval

## Context Requirements:
- Primary Context Template: [ui-component-context.md | data-layer-context.md | integration-context.md]
- Domain Reference: [school | staff | visit | coaching | scheduling]
- Quality Gates: DRY, proper abstraction, separation of concerns

## Current Phase: ANALYSIS
Proceed with analysis only - do not create or modify files until I approve the plan.
```

## Option 2: Planning Only Session
```markdown
# Planning Session: [Feature/Task Name]

## Session Type: PLANNING ONLY
- Read files for analysis if needed
- Create implementation strategy
- DO NOT create, modify, or update any files
- Present findings and plans as text/artifacts only

## Context: [specify context template and domain]

Task: [describe what you want planned]
```

## Option 3: Implementation Ready Session
```markdown
# Implementation Session: [Feature/Task Name]

## Session Type: IMPLEMENTATION READY
- You may read, create, and modify files as needed
- Follow the approved plan from previous session
- Use established patterns and quality gates

## Context Stack:
[List specific files and patterns to follow]

Proceed with implementation.
```

## Option 4: Exploratory Session
```markdown
# Exploration Session: [Topic/Area]

## Session Type: EXPLORATION
- Read files to understand current state
- Analyze patterns and architecture
- Present findings and suggestions
- DO NOT make any changes

Focus: [what you want to explore/understand]
```

## Benefits:
- **Clear Expectations**: Both you and Claude know the session boundaries
- **Prevents Accidents**: No unwanted file modifications during planning
- **Systematic Approach**: Follows your quality-focused workflow
- **Context Control**: Ensures right context is loaded for each phase
- **Reusable**: Standard template for all coding sessions
