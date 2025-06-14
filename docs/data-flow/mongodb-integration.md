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

## Mongoose Transform System

Our application uses Mongoose's built-in transform system to ensure consistent ObjectId → string conversion and document formatting across all models. This eliminates the need for manual sanitization.

### Standard Schema Options

All Mongoose models use standardized schema options that include automatic transforms:

```typescript
import { standardSchemaOptions, createSchemaOptions } from '@/lib/server/db/shared-options';

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

### Automatic Document Transformation

Mongoose models with standard schema options automatically handle transformations:

```typescript
// Model definition with standard options
const EntitySchema = new mongoose.Schema(schemaFields, standardSchemaOptions);

// Documents are automatically transformed when queried
const entity = await EntityModel.findById(id); 
// entity._id is already a string
// entity.id is automatically added  
// entity.__v is removed
// Dates are ISO strings due to timestamps: true
```

The `standardSchemaOptions` configuration handles all necessary transformations without requiring custom transform functions.

### Mongoose Transform Integration

Mongoose automatically converts Date objects to ISO strings when `timestamps: true` is configured:

```typescript
// Schema with automatic timestamps
const EntitySchema = new mongoose.Schema(schemaFields, {
  timestamps: true, // Automatically adds createdAt/updatedAt as Dates
  // Transform options convert to strings for JSON serialization
});

// When documents are serialized (toJSON), dates become ISO strings
const entity = await EntityModel.findById(id);
// entity.createdAt and entity.updatedAt are ISO strings when sent to client
```

This automatic conversion ensures consistency between server Date objects and client string representations.

### Server Action Integration

Server actions receive properly transformed documents without additional processing:

```typescript
export async function fetchEntities() {
  "use server";
  
  try {
    const entities = await EntityModel.find();
    // Documents already have string IDs and proper format
    // No sanitization needed
    
    return {
      success: true,
      data: entities // Ready for client consumption
    };
  } catch (error) {
    return handleServerError(error);
  }
}
```

### Avoiding .lean() for Client Data

When returning data to client components, avoid using `.lean()` as it bypasses the transform functions:

```typescript
// ❌ Bad: .lean() prevents transforms, requires manual sanitization
const entity = await EntityModel.findById(id).lean();

// ✅ Good: Transforms apply automatically
const entity = await EntityModel.findById(id);
// Document is already client-safe with string IDs and proper formatting
```

### API Response Integration

The Mongoose transforms work seamlessly with API responses:

```typescript
// In API routes
export async function GET() {
  try {
    const entities = await EntityModel.find();
    // Documents are already transformed by Mongoose
    
    return Response.json({
      success: true,
      items: entities, // No additional transformation needed
      total: entities.length
    });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Schema Compatibility

Mongoose transforms ensure automatic compatibility with Zod schemas:

```typescript
// Zod schema expects string _id and dates
export const EntityZodSchema = z.object({
  _id: z.string(),
  name: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Mongoose documents automatically match schema
const entity = await EntityModel.findById(id);
const validated = EntityZodSchema.parse(entity); // ✅ Passes validation automatically
```

[RULE] Rely on Mongoose transforms for automatic document formatting and avoid .lean() when returning data to client components.

</section>

<section id="date-handling-patterns">

## Date Handling Patterns

Our application uses string-based date handling throughout to ensure consistency between client and server components.

### Schema Date Fields

Zod schemas define date fields as strings rather than Date objects:

```typescript
// Consistent string-based date handling
export const EntityZodSchema = z.object({
  _id: z.string(),
  name: z.string(),
  createdAt: z.string().optional(), // String, not Date
  updatedAt: z.string().optional(), // String, not Date
});
```

### Mongoose Transform Integration

Mongoose automatically converts Date objects to ISO strings when `timestamps: true` is configured:

```typescript
// Schema with automatic timestamps
const EntitySchema = new mongoose.Schema(schemaFields, {
  timestamps: true, // Automatically adds createdAt/updatedAt as Dates
  // Transform options convert to strings for JSON serialization
});

// When documents are serialized (toJSON), dates become ISO strings
const entity = await EntityModel.findById(id);
// entity.createdAt and entity.updatedAt are ISO strings when sent to client
```

This automatic conversion ensures consistency between server Date objects and client string representations.

### Client-Server Date Consistency

This approach ensures that dates remain consistent across the application:

```typescript
// Server action returns string dates
export async function fetchEntity(id: string) {
  const entity = await EntityModel.findById(id);
  // Dates are already strings due to transform
  return { success: true, data: entity };
}

// Client receives string dates
function EntityComponent({ entityId }: { entityId: string }) {
  const { data: entity } = useEntity(entityId);
  
  // Dates are strings, no conversion needed
  const formattedDate = entity?.createdAt 
    ? new Date(entity.createdAt).toLocaleDateString()
    : 'Unknown';
    
  return <div>Created: {formattedDate}</div>;
}
```

### Date Utilities

When working with dates in components, convert strings to Date objects as needed:

```typescript
// Convert string dates for manipulation
function formatEntityDate(dateString: string | undefined): string {
  if (!dateString) return 'Unknown';
  
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

// For complex date operations
function calculateDaysSince(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
```

[RULE] Always use string dates in schemas and convert to Date objects only when needed for manipulation or formatting in client components.

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
