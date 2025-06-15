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
// Example: School schema with string dates
export const SchoolZodSchema = z.object({
  _id: z.string(),
  schoolNumber: z.string(),
  district: z.string(),
  schoolName: z.string(),
  address: z.string().optional(),
  gradeLevelsSupported: z.array(GradeLevelsSupportedZod),
  staffList: z.array(z.string()),
  owners: z.array(z.string()),
  createdAt: z.string().optional(), // String dates for consistency
  updatedAt: z.string().optional(), // String dates for consistency
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
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
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

## BaseDocument Integration Pattern

All schemas now extend from `BaseDocumentSchema` to ensure consistent document structure and eliminate duplication across entity definitions.

### BaseDocument Schema Structure

```typescript
// Core base document with common fields
export const BaseDocumentSchema = z.object({
  _id: z.string(),
  owners: z.array(z.string()).describe("User IDs with ownership permissions"),
  createdAt: z.string().optional().describe("ISO timestamp"),
  updatedAt: z.string().optional().describe("ISO timestamp"),
});

// Utility to create input schemas by removing system fields
export function toInputSchema<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  return schema.omit({
    _id: true,
    createdAt: true,
    updatedAt: true,
  });
}
```

### Entity Schema Implementation

All entity schemas follow this standardized pattern:

```typescript
// 1. Define entity-specific fields
export const EntityFieldsSchema = z.object({
  name: z.string(),
  description: z.string(),
  // Additional entity-specific fields...
});

// 2. Create full schema by merging with BaseDocument
export const EntityZodSchema = BaseDocumentSchema.merge(EntityFieldsSchema);

// 3. Generate input schema using utility
export const EntityInputZodSchema = toInputSchema(EntityZodSchema);

// 4. Create client schema for Next.js serialization (when needed)
export const EntityClientZodSchema = EntityZodSchema.extend({
  createdAt: z.string().optional().describe("ISO string from Next.js serialization"),
  updatedAt: z.string().optional().describe("ISO string from Next.js serialization"),
});
```

### Reference Schema Pattern

For entities used in dropdowns and selection components, implement reference schemas:

```typescript
// Reference schema extends base reference with entity-specific fields
export const EntityReferenceZodSchema = BaseReferenceZodSchema.merge(
  EntityFieldsSchema
    .pick({
      name: true,
      category: true,
    })
    .partial() // Make picked fields optional
).extend({
  // Add computed/derived fields
  itemCount: z.number().optional().describe("Number of related items"),
});

// Create transformer functions for reference conversion
export const entityToReference = createReferenceTransformer<Entity, EntityReference>(
  (entity: Entity) => entity.name, // Label function
  (entity: Entity) => ({ // Additional fields function
    name: entity.name,
    category: entity.category,
    itemCount: entity.relatedItems?.length || 0,
  }),
  EntityReferenceZodSchema // Validation schema
);
```

**Benefits of BaseDocument Integration:**
- **Consistency**: All entities have the same base structure
- **Type Safety**: Automatic inheritance of common fields
- **Maintainability**: Changes to base fields apply to all entities
- **DRY Principle**: No duplication of common field definitions
- **Reference Support**: Standardized pattern for dropdown/selection components

**[RULE]** All new entity schemas must extend BaseDocumentSchema and use the toInputSchema utility for input schemas.

## Type Generation

Always generate TypeScript types from your schemas, leveraging the BaseDocument pattern:

```typescript
// Auto-generate TypeScript types from schemas
export type EntityInput = z.infer<typeof EntityInputZodSchema>;
export type Entity = z.infer<typeof EntityZodSchema>;
export type EntityClient = z.infer<typeof EntityClientZodSchema>; // When needed
export type EntityReference = z.infer<typeof EntityReferenceZodSchema>; // For dropdowns
```

**[RULE]** Use `z.infer<typeof SchemaName>` to generate types from schemas, ensuring all schemas follow the BaseDocument pattern.

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
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
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
