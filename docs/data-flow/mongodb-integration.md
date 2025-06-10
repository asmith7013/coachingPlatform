```markdown
<doc id="mongodb-integration">

# MongoDB Integration Patterns

<section id="mongodb-overview">

## Overview

Our application implements a consistent pattern for MongoDB integration, with a focus on type safety, validation, and data integrity. This system bridges the gap between MongoDB's document model and our application's TypeScript types.

[RULE] All database interactions should follow these patterns.

</section>

<section id="model-definition">

## Model Definition

MongoDB models are defined using a consistent pattern that integrates with our Zod schemas:

```typescript
import { SchoolZodSchema } from "@/lib/zod-schema/core/school";
import mongoose from "mongoose";

// Define schema fields, mirroring Zod schema structure
const schemaFields = {
  schoolNumber: { type: String, required: true },
  district: { type: String, required: true },
  schoolName: { type: String, required: true },
  address: { type: String, required: false },
  gradeLevelsSupported: [{ type: String, required: true }],
  staffList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }],
  owners: [{ type: String, required: true }],
};

// Create schema with timestamps
const SchoolSchema = new mongoose.Schema(schemaFields, { timestamps: true });

// Create model, checking for existing models
export const SchoolModel = mongoose.models.School || 
  mongoose.model("School", SchoolSchema);
  ```
[RULE] MongoDB schema fields should mirror the structure of the corresponding Zod schema.
</section>

<section id="crud-operations">
CRUD Operations
Our system provides standardized CRUD operations through the crud.ts utility:

```typescript 
import { createItem, updateItem, deleteItem } from "@/lib/server/crud/crud-operations";

// Create a new item
const result = await createItem(
  SchoolModel,
  SchoolZodSchema,
  data,
  ["/dashboard/schoolList"] // Paths to revalidate
);

// Update an existing item
const result = await updateItem(
  SchoolModel,
  SchoolZodSchema,
  id,
  data,
  ["/dashboard/schoolList"]
);

// Delete an item
const result = await deleteItem(
  SchoolModel,
  SchoolZodSchema,
  id,
  ["/dashboard/schoolList"]
);
```
These utilities:

Ensure database connection
Validate data against Zod schemas
Handle type conversions
Manage revalidation of specified paths
Provide consistent error handling

[RULE] Use the CRUD utilities for all standard database operations.
</section>

<section id="connection-management">

## Connection Management

Our system provides a consistent pattern for managing MongoDB connections through the `withDbConnection` utility:

```typescript
import { withDbConnection } from "@/lib/server/db/ensure-connection";

export async function fetchSchools(params = {}) {
  return withDbConnection(() => schoolActions.fetch(params));
}
```

This utility:

Ensures database connection is established before running the operation
Handles connection errors consistently
Reduces boilerplate code in server actions
Works with both standard CRUD operations and custom queries

[RULE] Always wrap database operations with the withDbConnection utility to ensure consistent connection management.
</section>

<section id="object-id-handling">
ObjectId Handling
MongoDB uses ObjectId for document IDs, but our client-side code works with string IDs. Our system handles this conversion automatically:
Server to Client
When sending documents to the client:

ObjectIds are converted to strings
Documents include both _id and id fields with the same string value
Timestamps are properly formatted as Date objects

Client to Server
When receiving data from the client:

String IDs are converted to ObjectIds when needed for database operations
The system handles references and nested document IDs

[RULE] Never manually convert between ObjectId and string; use the sanitization utilities.
</section>

<section id="mongoose-transform-helper">

## Mongoose Transform Helper System

Our application provides a standardized transform helper system that ensures consistent ObjectId → string conversion and document formatting across all Mongoose models.

### Standard Transform Function

All Mongoose models use the `standardMongooseTransform` function:

```typescript
import { standardMongooseTransform, standardSchemaOptions } from '@/lib/server/db/mongoose-transform-helper';

/**
 * Standard transform function for all Mongoose models
 * Converts ObjectId to string and adds id field
 */
export function standardMongooseTransform(
  doc: Document, 
  ret: RawMongoDocument
): BaseDocument {
  // Convert _id to string and add id field
  if (ret._id) {
    const idString = ret._id.toString();
    ret.id = idString;
    ret._id = idString;
  }
  
  // Remove __v field (Mongoose version key)
  delete ret.__v;
  
  return ret as BaseDocument;
}
```

### Standard Schema Options

Use `standardSchemaOptions` for all new models:

```typescript
import { standardSchemaOptions, createSchemaOptions } from '@/lib/server/db/mongoose-transform-helper';

// Basic usage with standard options
const SchoolSchema = new mongoose.Schema(schemaFields, standardSchemaOptions);

// With custom collection name
const SchoolSchema = new mongoose.Schema(
  schemaFields, 
  createSchemaOptions('schools', { 
    // Additional options if needed
  })
);
```

### Schema Options Configuration

The standard schema options include:

```typescript
export const standardSchemaOptions: SchemaOptions = {
  timestamps: true,
  toJSON: { 
    transform: standardMongooseTransform
  },
  toObject: { 
    transform: standardMongooseTransform
  }
};
```

This ensures:
- Automatic `createdAt` and `updatedAt` timestamps
- Consistent ObjectId → string conversion
- Automatic `id` field addition
- Removal of Mongoose internal fields

### Model Implementation Pattern

All models should follow this pattern:

```typescript
import mongoose from "mongoose";
import { standardSchemaOptions } from '@/lib/server/db/mongoose-transform-helper';

const schemaFields = {
  name: { type: String, required: true },
  // Additional fields...
};

const EntitySchema = new mongoose.Schema(schemaFields, standardSchemaOptions);

export const EntityModel = mongoose.models.Entity || 
  mongoose.model("Entity", EntitySchema);
```

### Custom Schema Options

For models requiring custom configuration:

```typescript
import { createSchemaOptions } from '@/lib/server/db/mongoose-transform-helper';

const CustomSchema = new mongoose.Schema(
  schemaFields,
  createSchemaOptions('custom_collection', {
    // Override defaults
    strict: false,
    // Additional mongoose options
  })
);
```

### Type Safety Benefits

The transform helper system provides:

- **Consistent Types**: All documents have string `_id` and `id` fields
- **Automatic Conversion**: No manual ObjectId handling needed
- **Schema Alignment**: Transforms align with our Zod schemas
- **Type Compatibility**: Documents work seamlessly with client code

[RULE] Use the standard transform helper system for all new Mongoose models to ensure consistency.

</section>

<section id="query-sanitization">
Query Sanitization
User-provided query parameters are sanitized before use in MongoDB operations:

```typescript
import { sanitizeFilters } from "@/lib/server/api/responses/formattersFilters";
import { buildTextSearchQuery, buildDateRangeQuery } from "@/lib/server/api/responses/formattersFilters";

// Sanitize filters
const safeFilters = sanitizeFilters({
  // Remove empty values
  name: userProvidedName
});

// Build complex queries
const textSearchQuery = buildTextSearchQuery(
  ["name", "description"], // Fields to search
  searchTerm
);

const dateRangeQuery = buildDateRangeQuery(
  "createdAt", // Field to query
  startDate,
  endDate
);

// Combine queries
const combinedQuery = {
  ...safeFilters,
  ...textSearchQuery,
  ...dateRangeQuery
};
```
[RULE] Always sanitize user-provided queries before using them in database operations.
</section>

<section id="pagination-queries">
Pagination Queries
For paginated database queries, use the pagination utilities:

```typescript
import { buildPaginatedQuery, executePaginatedQuery } from "@/lib/server/db/mongodb-query-utils";

// Build a paginated query
const query = buildPaginatedQuery(
  SchoolModel,
  filters,
  { page, limit, sortBy, sortOrder }
);

// Execute the query with metadata
const result = await executePaginatedQuery(
  SchoolModel,
  filters,
  SchoolZodSchema,
  { page, limit, sortBy, sortOrder }
);
```
The pagination utilities:

Apply proper skip/limit for pagination
Handle sorting with validation
Count total documents matching filters
Calculate total pages
Include metadata in the response

[RULE] Use pagination utilities for all list or collection API endpoints.
</section>

</doc>
```
