# Staged Context Loading Strategy

## The Problem
Your sophisticated, DRY architecture creates a context paradox:
- More abstraction = Better code quality
- Better code quality = More interdependencies  
- More interdependencies = More context needed
- More context needed = Context window limits

## The Solution: Staged Context Loading

### Stage 1: Architecture Planning (Minimal Context)
**Goal:** Create implementation strategy without diving into specifics
**Context:** High-level patterns and documentation only

```markdown
# Planning Prompt Template
"Plan implementation strategy for [feature] following our established patterns:

Context:
- /docs/components/component-system.md (component hierarchy)
- /docs/data-flow/schema-system.md (data flow patterns) 
- /docs/workflows/implementation-workflow.md (sequence)

Output: High-level task breakdown with context requirements for each task"
```

### Stage 2: Schema Implementation (Schema Context)
**Goal:** Implement data layer following established patterns
**Context:** Schema patterns and related domain examples

```markdown
# Schema Prompt Template  
"Implement [Entity]ZodSchema following established patterns:

Context Stack:
- /src/lib/zod-schema/core/school.ts (input/full pattern)
- /src/lib/zod-schema/shared/enums.ts (enums to reuse)
- /docs/data-flow/schema-system.md (schema standards)

Quality Gate: Extend existing types, don't duplicate"
```

### Stage 3: Model Implementation (Model Context)
**Goal:** Create MongoDB model aligned with schema
**Context:** Model patterns and corresponding schema

```markdown
# Model Prompt Template
"Create [Entity]Model based on [Entity]ZodSchema:

Context Stack:
- /src/lib/schema/mongoose-schema/core/school.model.ts (model pattern)
- [Entity]ZodSchema from previous task
- /docs/data-flow/mongodb-integration.md (model standards)

Quality Gate: Fields mirror schema structure exactly"
```

### Stage 4: Server Actions (Action Context)
**Goal:** Implement CRUD operations with proper validation
**Context:** Action patterns and corresponding model/schema

```markdown
# Action Prompt Template
"Create server actions for [Entity] CRUD operations:

Context Stack:
- /src/app/actions/schools/schools.ts (action pattern)
- [Entity]Model and [Entity]ZodSchema from previous tasks
- /docs/data-flow/server-actions.md (action standards)

Quality Gate: Follow established error handling patterns"
```

### Stage 5: Component Implementation (UI Context)
**Goal:** Build UI components following design system
**Context:** Component patterns and design tokens

```markdown
# Component Prompt Template
"Build [Entity]Card component following design system:

Context Stack:
- /src/components/domain/schools/SchoolCard.tsx (domain component pattern)
- /src/lib/ui/tokens/ (design tokens)
- /src/lib/ui/variants/shared-variants.ts (shared behaviors)
- [Entity] types from previous tasks

Quality Gate: Reuse tokens and variants, extend existing patterns"
```

## Benefits of Staged Context Loading

1. **Focused Context:** Each stage only includes what's needed for that specific task
2. **Progressive Building:** Each stage builds on previous results  
3. **Quality Gates:** Explicit checks at each stage prevent architectural drift
4. **Context Efficiency:** Never load more than needed for the current task
5. **Pattern Consistency:** Each stage explicitly references established patterns

## Implementation in Your Rules

Add this staging strategy to:
- **PRD Generation:** Include suggested staging in requirements
- **Task Generation:** Break tasks into these natural stages
- **Task Processing:** Use appropriate context template for each stage

## Quality Verification at Each Stage

### DRY Check:
- Stage 2: "Does this schema extend existing types?"
- Stage 3: "Does this model follow existing patterns?"  
- Stage 4: "Do these actions reuse established utilities?"
- Stage 5: "Do these components reuse existing tokens/variants?"

### Abstraction Check:
- Each stage: "Does this fit the established abstraction layer?"
- Each stage: "Is this at the right level of the component hierarchy?"

### Separation Check:
- Each stage: "Does this have a single, clear responsibility?"
- Each stage: "Are concerns properly separated?"
