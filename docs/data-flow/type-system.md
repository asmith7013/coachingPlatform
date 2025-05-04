```markdown
<doc id="type-system">

# Type System Organization

<section id="type-system-overview">

## Overview

Our application uses a structured approach to TypeScript types that ensures consistency and maintainability. This document outlines exactly where types should be defined and imported from.

[RULE] Follow these type organization patterns for all new development.

</section>

<section id="type-categories">

## Type Categories and Locations

Types in our system fall into specific categories, each with a designated location:

1. **Schema-Derived Types**: Types generated from Zod schemas
   - **Location**: Same file as the Zod schema definition
   - **Pattern**: Export using `type EntityName = z.infer<typeof EntityNameZodSchema>`
   - **Example**: `export type School = z.infer<typeof SchoolZodSchema>`

2. **Core System Types**: Non-domain specific types (API responses, utils, etc.)
   - **Location**: `/src/lib/types/core/{category}.ts`
   - **Example**: `/src/lib/types/core/response.ts`

3. **Domain Types**: Business domain types not directly from schemas
   - **Location**: `/src/lib/types/domain/{domain-name}.ts`
   - **Example**: `/src/lib/types/domain/coaching.ts`

4. **UI Component Props**: Types for component props
   - **Location**: Same file as the component or in a dedicated types file in the component directory
   - **Example**: `export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary' | 'secondary' }`

5. **Utility Types**: Generic type utilities
   - **Location**: `/src/lib/types/utilities.ts`
   - **Example**: `export type Nullable<T> = T | null`

[RULE] Always place types in their designated locations to maintain organization.

</section>

<section id="schema-derived-types">

## Schema-Derived Types

The primary source of data types should be Zod schemas. When defining a new entity:

1. Create the Zod schema first in the appropriate `/src/lib/zod-schema/{domain}/` directory
2. Export types derived from the schema in the same file:

```typescript
// src/lib/zod-schema/domain/entity.ts
import { z } from "zod";
import { zDateField } from "../shared/dateHelpers";

// Input schema (for creation/updates)
export const EntityInputZodSchema = z.object({
  name: z.string(),
  description: z.string(),
  // Additional fields...
});

// Full schema (including system fields)
export const EntityZodSchema = EntityInputZodSchema.extend({
  _id: z.string(),
  createdAt: zDateField.optional(),
  updatedAt: zDateField.optional(),
});

// Types derived directly from schemas
export type EntityInput = z.infer<typeof EntityInputZodSchema>;
export type Entity = z.infer<typeof EntityZodSchema>;
[RULE] Always define schema-derived types in the same file as their Zod schema.
</section>
<section id="type-imports">
```
Type Imports
When importing types, follow these patterns:

For schema-derived types: Import directly from the schema file

```typescript
import { School, SchoolInput } from "@/lib/zod-schema/core/school";
```
For core system types: Import from the appropriate core types file

```typescript
import { ApiResponse, PaginatedResult } from "@/lib/types/core/response";
```
For domain types: Import from the domain types file

```typescript
import { CoachingSessionType } from "@/lib/types/domain/coaching";
```
For utility types: Import from the utilities file

```typescript
import { Nullable, Optional } from "@/lib/types/utilities";
```

[RULE] Always import types from their canonical source file.
</section>
<section id="complex-type-relationships">
Complex Type Relationships
For types with complex relationships (extending other types, unions, etc.), use JSDoc comments to document these relationships:

```typescript
/**
 * Represents a teaching event within a visit
 * @extends {BaseEvent} Base event properties
 * @see Visit - The parent visit entity that contains this event
 * @see Staff - Staff members who participated in this event
 */
export type TeachingEvent = BaseEvent & {
  teachingStrategy: string;
  observationNotes: string;
  studentEngagement: "high" | "medium" | "low";
};
```
[RULE] Document complex type relationships with JSDoc comments.
</section>

<section id="type-naming">
Type Naming Conventions
Follow these naming conventions for types:

Schema-derived entity types: PascalCase noun (e.g., School, Visit)
Input types: PascalCase noun + "Input" (e.g., SchoolInput, VisitInput)
Props: PascalCase component name + "Props" (e.g., ButtonProps, SchoolCardProps)
Enums: PascalCase noun (e.g., GradeLevels, VisitStatus)
Utility types: Descriptive PascalCase (e.g., Nullable<T>, ApiResponse<T>)

[RULE] Follow consistent naming conventions for all types.
</section>

</doc>
```
