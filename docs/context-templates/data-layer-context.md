# Data Layer Context Template

## Always Include (Core Context):
- `/docs/data-flow/schema-system.md` - Schema-driven architecture patterns
- `/docs/data-flow/server-actions.md` - Server action implementation patterns
- `/src/lib/zod-schema/shared/enums.ts` - Shared enumerations

## Domain-Specific Context (Choose Based on Data Type):

### Core Entities (School, Staff, Cycle):
- `/src/lib/zod-schema/core/school.ts` - Input/full schema pattern
- `/src/lib/schema/mongoose-schema/core/school.model.ts` - Model structure
- `/src/app/actions/schools/schools.ts` - CRUD action patterns

### Operation Entities (Visits, Coaching):
- `/src/lib/zod-schema/visits/visit.ts` - Complex schema pattern
- `/src/lib/schema/mongoose-schema/visits/visit.model.ts` - Complex model
- `/src/app/actions/visits/visits.ts` - Operation patterns

### Configuration Entities (Schedules, LookFors):
- `/src/lib/zod-schema/scheduling/schedule.ts` - Nested schema pattern
- `/src/lib/schema/mongoose-schema/scheduling/schedule.model.ts` - Nested model
- `/src/app/actions/schedules/schedules.ts` - Configuration patterns

## Conditional Context (Include If Needed):
- `/docs/data-flow/mongodb-integration.md` - If complex queries needed
- `/docs/data-flow/transformation-system.md` - If data transformation needed
- `/src/lib/server/crud/crud-operations.ts` - If standardized CRUD needed

## Quality Gates:
- **Schema Consistency:** Ensure input/full schema pattern
- **Model Alignment:** MongoDB fields mirror Zod schema
- **Action Standards:** Follow established error handling
- **Type Safety:** Generate types from schemas, don't create separate

## Staged Implementation Template:
```
# Stage 1: Schema Definition
Context: [Relevant schema examples]
Task: Create [Entity]InputZodSchema and [Entity]ZodSchema
Pattern: Follow input/full schema separation

# Stage 2: Model Creation  
Context: [Relevant model examples]
Task: Create MongoDB model reflecting schema structure
Pattern: Include timestamps, proper field types

# Stage 3: Server Actions
Context: [Relevant action examples] 
Task: Implement CRUD operations with validation
Pattern: Follow established error handling
```
