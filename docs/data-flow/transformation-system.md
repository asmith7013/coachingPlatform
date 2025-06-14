<doc id="transformation-system">

# Data Transformation System

<section id="transformation-overview">

## Overview

Our application uses a streamlined transformation system built primarily on Mongoose's automatic transformation capabilities, with focused utilities for specific use cases. This approach ensures type safety and consistency when moving data between MongoDB and client-side code without unnecessary complexity.

[RULE] Rely on Mongoose transforms for document processing and use transformation utilities only for specific business requirements.

</section>

<section id="mongoose-transforms">

## Mongoose Transform System

Our primary transformation layer uses Mongoose's built-in transform capabilities through a standardized transform function.

### Standard Transform Function

All Mongoose models use the `standardTransform` function from `shared-options.ts`:

```typescript
import { standardSchemaOptions } from '@mongoose-schema/shared-options';

// Automatic transformation applied to all models
const EntitySchema = new mongoose.Schema(schemaFields, standardSchemaOptions);

// Documents are automatically processed on serialization
const entity = await EntityModel.findById(id);
// - ObjectIds converted to strings
// - Dates converted to ISO strings
// - id field added (mirrors _id)
// - Mongoose internals removed
```

### Transform Implementation

The `standardTransform` function handles common transformations automatically:

```typescript
export function standardTransform(_: unknown, ret: Record<string, unknown>): Record<string, unknown> {
  // Recursively transforms:
  // - ObjectIds to strings (including nested objects)
  // - Dates to ISO strings
  // - Adds id field matching _id
  // - Removes __v field
  
  return transformedDocument;
}
```

Key features:
- **Recursive Processing**: Handles nested objects and arrays
- **ObjectId Detection**: Robust identification of MongoDB ObjectIds
- **Date Handling**: Consistent ISO string formatting
- **ID Normalization**: Ensures both `_id` and `id` fields exist as strings
- **Cleanup**: Removes Mongoose internal fields

### Model Configuration

All models use standard schema options for consistent transformation:

```typescript
import { standardSchemaOptions } from '@mongoose-schema/shared-options';

const EntitySchema = new mongoose.Schema(schemaFields, {
  ...standardSchemaOptions,
  collection: 'entities'
});

// standardSchemaOptions includes:
// - timestamps: true (adds createdAt/updatedAt)
// - toJSON/toObject transforms with standardTransform
```

[RULE] Use `standardSchemaOptions` for all new Mongoose models to ensure consistent transformation behavior.

</section>

<section id="response-utilities">

## Response Processing Utilities

For handling API responses and extracting data consistently, we provide focused utilities in `response-utils.ts`.

### Data Extraction

```typescript
import { 
  extractItems, 
  extractData, 
  extractPagination 
} from '@/lib/data-processing/transformers/utils/response-utils';

// Extract items from collection responses
const schools = extractItems<School>(response);

// Extract single entity from response
const school = extractData<School>(response);

// Extract pagination metadata
const pagination = extractPagination(response);
```

### Type Guards

```typescript
import { 
  isCollectionResponse, 
  isPaginatedResponse, 
  isEntityResponse 
} from '@/lib/data-processing/transformers/utils/response-utils';

// Safely check response types
if (isCollectionResponse<School>(response)) {
  // Handle collection response
  const schools = response.items;
}

if (isEntityResponse<School>(response)) {
  // Handle single entity response
  const school = response.data;
}
```

### Response Validation

```typescript
import { validateServerResponse } from '@/lib/data-processing/transformers/utils/response-utils';

// Standardize server responses
const result = validateServerResponse<School>(serverResponse);

if (result.success) {
  const schools = result.data;
} else {
  console.error(result.error);
}
```

[RULE] Use response utilities for consistent API response handling rather than manual property access.

</section>

<section id="domain-transformers">

## Domain-Specific Transformers

For business logic transformations, we create focused transformer functions in the `domain/` directory.

### UI Component Transformers

Transform domain entities for specific UI components:

```typescript
// Transform visit data for InfoCard component
import { visitToInfoCardTransformer } from '@/lib/data-processing/transformers/domain/visit-transforms';

const infoCardProps = visitToInfoCardTransformer(visit, {
  onView: () => handleView(visit),
  onEdit: () => handleEdit(visit)
});

// Transform multiple visits
import { visitCollectionToInfoCards } from '@/lib/data-processing/transformers/domain/visit-transforms';

const infoCards = visitCollectionToInfoCards(visits, (visit) => ({
  onView: () => handleView(visit),
  onEdit: () => handleEdit(visit)
}));
```

### Summary Transformers

Create summary objects for display:

```typescript
import { visitToSummaryTransformer } from '@/lib/data-processing/transformers/domain/visit-transforms';

const visitSummary = visitToSummaryTransformer(visit);
// Returns: { id, title, coach, purpose, mode, eventsCount, etc. }
```

### Creating Domain Transformers

When creating new domain transformers:

1. **Single Responsibility**: Each transformer handles one specific transformation
2. **Type Safety**: Use proper TypeScript types for inputs and outputs
3. **Pure Functions**: No side effects, predictable outputs
4. **Reusable**: Design for multiple use cases when appropriate

```typescript
// Example domain transformer structure
export function entityToSummaryTransformer(entity: Entity): EntitySummary {
  return {
    id: entity._id,
    name: entity.name,
    status: deriveStatus(entity),
    formattedDate: formatDate(entity.createdAt)
  };
}
```

[RULE] Create domain transformers only when you need business logic transformations beyond basic data formatting.

</section>

<section id="schema-compatibility">

## Schema Compatibility Utilities

For type system compatibility, we provide focused utilities without runtime changes.

### Base Document Compatibility

```typescript
import { ensureBaseDocumentCompatibility } from '@/lib/data-processing/transformers/utils/response-utils';

// Type-only compatibility helper for CRUD factories
const compatibleSchema = ensureBaseDocumentCompatibility<Entity>(EntityZodSchema);

// Used with CRUD factories that have strict type constraints
const entityActions = createCrudActions({
  model: EntityModel,
  schema: compatibleSchema,
  inputSchema: ensureBaseDocumentCompatibility<EntityInput>(EntityInputZodSchema)
});
```

This utility:
- **Type Assertion Only**: No runtime changes to schemas
- **Compatibility Bridge**: Helps with strict generic constraints
- **CRUD Integration**: Primarily used with CRUD factories
- **Original Validation**: Maintains original schema validation logic

[RULE] Use `ensureBaseDocumentCompatibility` only when working with utilities that have strict BaseDocument type constraints.

</section>

<section id="transformation-patterns">

## Common Transformation Patterns

### Server Action Pattern

Server actions automatically receive transformed documents:

```typescript
export async function fetchSchools() {
  "use server";
  
  // Documents already transformed by Mongoose
  const schools = await SchoolModel.find();
  
  // Ready for client consumption - no additional processing needed
  return { success: true, data: schools };
}
```

### API Route Pattern

API routes benefit from automatic transformation:

```typescript
export async function GET() {
  try {
    const entities = await EntityModel.find();
    // Documents automatically transformed
    
    return Response.json({
      success: true,
      items: entities, // Already client-ready
      total: entities.length
    });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Component Integration Pattern

Components receive properly formatted data:

```typescript
function EntityCard({ entity }: { entity: Entity }) {
  // entity._id is already a string
  // entity.createdAt is already an ISO string
  // No manual transformation needed
  
  return (
    <Card>
      <h3>{entity.name}</h3>
      <p>Created: {new Date(entity.createdAt).toLocaleDateString()}</p>
    </Card>
  );
}
```

[RULE] Trust the automatic transformation system - avoid manual ObjectId or date conversion in application code.

</section>

<section id="migration-strategy">

## Legacy Code Migration

When updating code that manually transforms documents:

### Before (Manual Transformation)

```typescript
// ❌ Manual transformation no longer needed
const transformedEntities = entities.map(entity => ({
  ...entity.toObject(),
  _id: entity._id.toString(),
  id: entity._id.toString(),
  createdAt: entity.createdAt.toISOString()
}));
```

### After (Automatic Transformation)

```typescript
// ✅ Automatic transformation
const entities = await EntityModel.find();
// Documents are already properly formatted
```

### Remove Manual Processing

Look for and remove these patterns:
- Manual `.toString()` calls on ObjectIds
- Manual date formatting
- Manual addition of `id` fields
- Custom transform functions that duplicate `standardTransform`

[RULE] Remove manual transformation code that duplicates the automatic Mongoose transformation system.

</section>

</doc>
```
