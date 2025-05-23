
```markdown
<doc id="transformation-system">

# Data Transformation System

<section id="transformation-overview">

## Overview

Our application implements a layered data transformation system that ensures type safety, validation, and consistency when moving data between MongoDB and client-side code. This system separates concerns into distinct layers while providing a unified API for common transformation scenarios.

[RULE] Use the transformation system for all data conversions between MongoDB and client code.

</section>

<section id="transformation-architecture">

## Architecture

The transformation system is organized into three distinct layers with clear responsibilities:

1. **DB Transformers**: Low-level MongoDB document transformations (ObjectId → string, date handling)
2. **Schema Validators**: Zod schema validation with error formatting 
3. **Domain Transformers**: Business-domain specific transformations with validation

This layered approach ensures a clean separation of concerns while providing full transformation pipelines that can be composed as needed.

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│  DB Transformers    │     │  Schema Validators  │     │  Domain Transformers │
├─────────────────────┤     ├─────────────────────┤     ├─────────────────────┤
│ - ObjectId → string │ ──> │ - Zod validation    │ ──> │ - Business logic    │
│ - Date conversion   │     │ - Error formatting  │     │ - Custom mapping    │
│ - ID field handling │     │ - Type safety       │     │ - Data enrichment   │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
```

[RULE] Each transformation layer should only handle its specific responsibilities.

</section>

<section id="db-transformers">

## DB Transformers

The DB transformation layer handles MongoDB-specific concerns:

```typescript
import { transformDocument, toPlainObject } from '@/lib/data-utilities/transformers/new';

// Convert MongoDB document to a safe format
const transformed = transformDocument(mongooseDoc);

// Handle arrays of documents
const transformedDocs = transformDocuments(mongooseDocs);

// Convert Mongoose document to plain object
const plainObj = toPlainObject(mongooseDoc);
```

Key features:
- Converts ObjectIds to strings
- Ensures timestamps are proper Date objects
- Adds an 'id' field that mirrors the '_id' field
- Recursively processes nested objects and arrays
- Does not perform schema validation

[RULE] Always use DB transformers before any schema validation to ensure proper type conversion.

</section>

<section id="schema-validators">

## Schema Validators

The schema validation layer ensures data conforms to its expected structure:

```typescript
import { validateDocument, validateOrThrow } from '@/lib/data-utilities/transformers/new';

// Validate data without throwing (returns null on error)
const validated = validateDocument(doc, MyZodSchema);

// Validate data and throw formatted error if validation fails
const validatedOrThrow = validateOrThrow(doc, MyZodSchema);

// Validate and transform in one step
const validatedAndTransformed = validateAndTransformDocument(doc, MyZodSchema);
```

Key features:
- Validates data against Zod schemas
- Provides both safe (null-returning) and throwing variants
- Formats validation errors consistently
- Supports partial schema validation for updates
- Combines validation with basic transformations

[RULE] Use schema validators for all data before using it in application logic.

</section>

<section id="domain-transformers">

## Domain Transformers

The domain transformation layer applies business-specific transformations to validated data:

```typescript
import { 
  createDomainPipeline, 
  transformToDomain 
} from '@/lib/data-utilities/transformers/new';

// Create a domain transformation pipeline
const pipeline = createDomainPipeline(
  UserZodSchema,
  (validUser) => ({
    ...validUser,
    displayName: `${validUser.firstName} ${validUser.lastName}`,
    isAdmin: validUser.roles.includes('admin')
  })
);

// Apply the complete transformation pipeline
const transformedUser = transformToDomain(mongooseDoc, pipeline);
```

Key features:
- Combines DB transformation and schema validation
- Adds business domain transformations
- Provides complete end-to-end pipelines
- Supports both safe (null-returning) and throwing variants
- Maintains type safety throughout the pipeline

[RULE] Use domain transformers for complex transformations involving business logic.

</section>

<section id="usage-patterns">

## Usage Patterns

### Basic Document Transformation

For simple document transformations without business logic:

```typescript
import { validateAndTransformDocument } from '@/lib/data-utilities/transformers/new';

// In an API route or server action
const school = await SchoolModel.findById(id);
return validateAndTransformDocument(school, SchoolZodSchema);
```

### Complete Pipeline with Business Logic

For transformations that require business logic:

```typescript
import { createDomainPipeline, transformToDomain } from '@/lib/data-utilities/transformers/new';

// Define the domain transformation
const userPipeline = createDomainPipeline(
  UserZodSchema,
  (user) => ({
    ...user,
    fullName: `${user.firstName} ${user.lastName}`,
    isActive: user.lastLogin > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  })
);

// In an API route or server action
const user = await UserModel.findById(id);
return transformToDomain(user, userPipeline);
```

### Document Preparation for MongoDB

When preparing data for MongoDB:

```typescript
import { prepareForCreate } from '@/lib/data-utilities/transformers/new';

// Remove timestamp fields and prepare for MongoDB
const dataToInsert = prepareForCreate(inputData);
await UserModel.create(dataToInsert);
```

[RULE] Choose the appropriate transformation pattern based on the specific use case.

</section>

<section id="backward-compatibility">

## Backward Compatibility

The transformation system includes a compatibility layer in `compatibility.ts` that maintains support for older transformation functions. However, new code should use the specific transformers directly rather than relying on compatibility exports.

```typescript
// Older pattern (still supported)
import { transformDocument } from '@/lib/data-utilities/transformers';

// Newer, more explicit pattern (preferred)
import { validateAndTransformDocument } from '@/lib/data-utilities/transformers/new';
```

[RULE] New code should always import directly from the specific transformation modules.

</section>

</doc>
```
