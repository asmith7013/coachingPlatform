# Core Schema Patterns

## Overview

Our platform uses a schema-driven architecture where Zod schemas serve as the definitive source of truth for all data structures. This approach ensures consistency across the frontend, backend, and database layers.

**[RULE]** Always use Zod schemas as the canonical source of truth for data structures.

## Zod Schema Organization

Schemas are organized in `src/lib/zod-schema/` by domain:

- `core/`: Base schemas for common entities (School, Staff, Cycle)
- `shared/`: Reusable schema parts (notes, enums, date helpers)
- `visits/`, `look-fors/`, etc.: Domain-specific directories

```typescript
// Example: School schema
export const SchoolZodSchema = z.object({
  _id: z.string(),
  schoolNumber: z.string(),
  district: z.string(),
  schoolName: z.string(),
  address: z.string().optional(),
  gradeLevelsSupported: z.array(GradeLevelsSupportedZod),
  staffList: z.array(z.string()),
  owners: z.array(z.string()),
  createdAt: zDateField.optional(),
  updatedAt: zDateField.optional(),
});
```

**[RULE]** When adding new fields, always start by updating the Zod schema first.

## Input vs. Full Schema Pattern

All data structures follow a consistent pattern that distinguishes between input schemas (for creating/updating records) and full schemas (for validating complete database documents):

### Input Schema Pattern

Input schemas define fields for user-provided data without system fields:

```typescript
// Input schema (for validation of user-provided data)
export const EntityInputZodSchema = z.object({
  name: z.string(),
  description: z.string(),
  // No system fields
});
```

**When to Use Input Schemas:**
- Creating new records
- Updating existing records
- Form submissions
- API request bodies
- Server actions for creation/update

### Full Schema Pattern

Full schemas extend input schemas with system fields:

```typescript
// Full schema (for validation of retrieved database documents)
export const EntityZodSchema = EntityInputZodSchema.extend({
  _id: z.string(),
  createdAt: zDateField.optional(),
  updatedAt: zDateField.optional(),
});
```

**When to Use Full Schemas:**
- Fetching records from database
- Response validation
- Search results
- Data transformation
- Server-side validation

### Implementation in CRUD Operations

```typescript
// In server actions:
export async function createEntity(data: unknown) {
  return createItem(
    EntityModel,
    EntityInputZodSchema, // Use INPUT schema for creation
    data,
    ["/dashboard/entities"]
  );
}

export async function fetchEntity(id: string) {
  const entity = await EntityModel.findById(id);
  return EntityZodSchema.parse(entity); // Use FULL schema for validation
}
```

**[RULE]** Always use input schemas for creation and update operations, and full schemas for reading operations.

## Type Generation

Always generate TypeScript types from your schemas:

```typescript
// Auto-generate TypeScript types
export type EntityInput = z.infer<typeof EntityInputZodSchema>;
export type Entity = z.infer<typeof EntityZodSchema>;
```

**[RULE]** Use `z.infer<typeof SchemaName>` to generate types from schemas.

## MongoDB Model Integration

MongoDB models are defined using the Zod schemas and stored in `src/lib/schema/mongoose-schema/`:

```typescript
import { SchoolZodSchema } from "@/lib/zod-schema/core/school";
import mongoose from "mongoose";

const schemaFields = {
  schoolNumber: { type: String, required: true },
  district: { type: String, required: true },
  schoolName: { type: String, required: true },
  // Additional fields...
};

const SchoolSchema = new mongoose.Schema(schemaFields, { 
  timestamps: true // Adds createdAt/updatedAt
});

export const SchoolModel = mongoose.models.School || 
  mongoose.model("School", SchoolSchema);
```

**Schema Alignment Rules:**
- Set `timestamps: true` in schema options for createdAt/updatedAt
- Set `_id: false` for nested document schemas
- MongoDB schema structure must align with Zod schema structure

**[RULE]** MongoDB models should reflect the structure defined in Zod schemas.

## Nested Document Patterns

Nested documents do not include system fields like `_id`:

```typescript
// Nested document schema
export const NestedItemZodSchema = z.object({
  title: z.string(),
  description: z.string(),
  // No _id or timestamps
});

// Parent schema that includes nested documents
export const ParentZodSchema = z.object({
  _id: z.string(),
  name: z.string(),
  items: z.array(NestedItemZodSchema), // Array of nested docs
  createdAt: zDateField.optional(),
  updatedAt: zDateField.optional(),
});
```

## Schema-First Design Principle

Before creating transformers or compatibility layers, always ask: "Could I fix the schema instead?"

### Priority Order for Type Issues:

1. **Modify Base Schema**: Update the core schema definition first
2. **Align Related Schemas**: Update related input/full schemas
3. **Update Types**: Generate new types with `z.infer`
4. **Adjust Models**: Update MongoDB models to match
5. **Update Consuming Code**: Finally, update components and hooks

```typescript
// ❌ Avoid creating transformers for type mismatches
const transformedResponse = transformResponseTypes(originalResponse);

// ✅ Fix the base schema definition instead
// Update the schema to match expected structure
export const EntityZodSchema = z.object({
  // Updated properties that match actual data
});
```

**[RULE]** Always update schemas first, then flow changes to types/models.

## Data Flow Sequence

The data flows through our system in this sequence:

1. **Zod Schema Definition**: Define data structure and validation (`/lib/zod-schema/`)
2. **MongoDB Model Creation**: Create database models based on schema (`/lib/schema/mongoose-schema/`)
3. **Type Generation**: Generate TypeScript types with `z.infer`
4. **Server Actions/API Routes**: Implement data operations (`/app/actions/` or `/app/api/`)
5. **React Hooks**: Create data fetching and management hooks (`/hooks/`)
6. **UI Components**: Render data and handle user interactions (`/components/`)

**[RULE]** Follow this data flow sequence when implementing new features.

## Common Pitfalls

1. **Using full schemas for creation** will result in validation errors because `_id` is required but not provided
2. **Using input schemas for fetch operations** won't validate system fields that should be present
3. **Not importing both schema variants** can lead to using the wrong schema
4. **Forgetting to update both schemas** when adding new fields

## Data Consistency

To ensure data consistency across the application:

- Start with the Zod schema as the single source of truth
- Generate TypeScript types from schemas using `z.infer<typeof SchemaName>`
- Define MongoDB models that mirror the schema structure
- Use input schemas for creation/update, full schemas for retrieval
- Validate inputs against schemas at every entry point

**[RULE]** Apply these consistency practices at every layer of the application.
