<doc id="api-patterns">

# API Patterns

<section id="api-overview">

## Overview

Our application implements a consistent pattern for API route development, response formatting, and error handling. These patterns ensure a predictable experience for frontend developers and maintain data consistency across the application.

[RULE] All API routes should follow these standard patterns.

</section>

<section id="response-format">

## Standard Response Format

All API responses follow a standardized structure:

```typescript
interface StandardResponse<T = Record<string, unknown>> {
  items: T[];
  total?: number;
  page?: number;
  limit?: number;
  message?: string;
  success: boolean;
}
```
Example successful response:

```tsx
json{
  "items": [
    { "id": "1", "name": "Item 1" },
    { "id": "2", "name": "Item 2" }
  ],
  "total": 2,
  "success": true
}
```
Example error response:

```tsx
json{
  "items": [],
  "success": false,
  "message": "Error message details"
}
```

[RULE] Always use the standard response format for consistency across the application.
</section>

<section id="standardize-response">
Response Standardization

To ensure all API responses follow the standard format, use the standardizeResponse utility:

```typescript
import { standardizeResponse, withStandardResponse } from "@/lib/utils/server/standardizeResponse";

// Convert any data type to the standard format
const standardized = standardizeResponse(data);

// Use the decorator pattern for entire API route handlers
export const GET = withStandardResponse(async (request) => {
  // Implementation returns data directly
  // withStandardResponse will format it
  return {
    items: await fetchItems(),
    total: items.length
  };
});
```
The standardizeResponse utility handles:

Array responses (converts to items array)
Object responses with items property
Object responses without items property (wraps in array)
Error handling for invalid input

[RULE] Use withStandardResponse for all API route handlers to ensure consistent formatting.
</section>

<section id="pagination">
Pagination Patterns
For paginated resources, use the fetchPaginatedResource utility:

```typescript
import { fetchPaginatedResource } from "@/lib/utils/server/fetchPaginatedResource";

export const GET = withStandardResponse(async (request) => {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  
  return fetchPaginatedResource(
    SchoolModel,
    SchoolZodSchema,
    {
      page,
      limit,
      filters: { /* Query filters */ },
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc"
    }
  );
});
```
The pagination utility:

Handles pagination calculation
Applies proper sorting
Validates and sanitizes filters
Returns metadata about the query (total, page, limit)

[RULE] Use fetchPaginatedResource for all paginated API endpoints.
</section>

<section id="bulk-operations">
Bulk Operations
For bulk operations such as uploading multiple items, use the bulkUploadToDB utility:

```typescript
import { bulkUploadToDB } from "@/lib/utils/server/bulkUpload";

export const POST = withStandardResponse(async (request) => {
  const data = await request.json();
  
  return bulkUploadToDB(
    data,
    SchoolModel,
    SchoolZodSchema,
    ["/dashboard/schoolList"] // Paths to revalidate
  );
});
```
The bulk upload utility:

Validates all items against the schema
Inserts valid items into the database
Revalidates specified paths
Returns detailed success/error information

[RULE] Use bulkUploadToDB for all bulk upload operations.
</section>
<section id="crud-factory-pattern">

## CRUD Factory Pattern

Our application implements a standardized CRUD factory pattern to reduce duplication and ensure consistency across data operations:

```typescript
import { createCrudActions } from "@data-server/crud/crud-action-factory";

// Create standard CRUD actions for Schools
export const schoolActions = createCrudActions({
  model: SchoolModel,
  fullSchema: SchoolZodSchema,
  inputSchema: SchoolInputZodSchema,
  revalidationPaths: ["/dashboard/schools"],
  options: {
    validSortFields: ['schoolName', 'district', 'createdAt', 'updatedAt'],
    defaultSortField: 'schoolName',
    defaultSortOrder: 'asc',
    entityName: 'School'
  }
});

// Export the generated actions with connection handling
export async function fetchSchools(params = {}) {
  return withDbConnection(() => schoolActions.fetch(params));
}
```
The factory automatically provides:

Paginated fetch operations with filtering and sorting
Create operations with validation
Update operations with partial validation
Delete operations with proper cleanup
Fetch-by-ID operations
Standard error handling
Path revalidation
Database connection management

This pattern:

Reduces code duplication across server actions
Ensures consistent error handling
Maintains type safety through schemas
Standardizes response formats

[RULE] Use the CRUD factory pattern for all standard data operations to reduce duplication and ensure consistency.
</section>

<section id="api-safe-fetchers">
API-Safe Fetchers Pattern
Our application maintains a clear separation between Server Actions and API Routes through an "API-Safe Fetchers" pattern. This architecture ensures that API routes don't import server actions directly (which would cause "use server" directive conflicts).
Pattern Overview

Server Actions: Direct database operations with "use server" directive
API-Safe Fetchers: Wrappers that can be safely imported into API routes
API Routes: HTTP endpoints that use API-safe fetchers instead of server actions

Implementation Structure
src/
├── app/
│   ├── actions/        # Server Actions (with "use server" directive)
│   └── api/            # API Routes (using API-safe fetchers)
└── lib/
    ├── api/
    │   ├── fetchers/   # API-safe fetchers
    │   └── handlers/   # API route handlers and utilities
    └── data-server/    # Database operations
Creating API-Safe Fetchers
API-safe fetchers use the createApiSafeFetcher utility to generate MongoDB query functions that can be safely imported into API routes:

```typescript
// src/lib/api/handlers/api-adapter.ts
export function createApiSafeFetcher<T, M>(
  model: Model<M>,
  schema: ZodSchema<T>,
  defaultSearchField?: string
) {
  return async function(params: FetchParams) {
    // Implementation that connects to DB and performs query
    // without using "use server" directive
  };
}
```
Example usage:

```typescript
// src/lib/api/fetchers/school.ts
import { SchoolModel } from '@/lib/data-schema/mongoose-schema/core/school.model';
import { SchoolZodSchema } from '@/lib/data-schema/zod-schema/core/school';
import { createApiSafeFetcher } from '@/lib/api/handlers/api-adapter';

export const fetchSchoolsForApi = createApiSafeFetcher(
  SchoolModel,
  SchoolZodSchema,
  "schoolName" // Default search field
);
Building API Routes
API routes should always use API-safe fetchers rather than importing server actions directly:
typescript// src/app/api/schools/route.ts
import { fetchSchoolsForApi } from "@/lib/api/fetchers/school";
import { createReferenceEndpoint } from "@/lib/api/handlers/reference-endpoint";

export const GET = createReferenceEndpoint({
  fetchFunction: fetchSchoolsForApi, // Use API-safe fetcher
  // Other options...
});
```
[RULE] Never import server actions (from app/actions/) directly into API routes. Always use API-safe fetchers.
[RULE] All API routes must export functions named after HTTP methods (GET, POST, etc.).
[RULE] Never include "use server" directive in API route files.
</section>

<section id="reference-endpoint-pattern">
Reference Endpoint Pattern
Our application provides a standardized pattern for creating reference data endpoints using the createReferenceEndpoint factory function. This approach ensures consistency across all API endpoints that serve reference data.

```typescript
// src/app/api/entity/route.ts
import { fetchEntityForApi } from "@/lib/api/fetchers/entity";
import { createReferenceEndpoint } from "@/lib/api/handlers/reference-endpoint";

export const GET = createReferenceEndpoint({
  fetchFunction: fetchEntityForApi,
  mapItem: mapEntityToReference,
  defaultSearchField: "name",
  defaultLimit: 20,
  logPrefix: "Entity API"
});
```
The factory automatically provides:

Standardized parameter handling
Consistent error formatting
Default pagination
Search capability
Proper response structure

[RULE] Use the reference endpoint pattern for all API endpoints that return lists of entities.
</section>

<section id="api-vs-server-actions">
API Routes vs Server Actions
Our application uses both API routes and server actions, each with specific use cases:
When to use API Routes:

External API integrations
Complex filtering, sorting, and pagination
File uploads
Operations that need custom request/response handling
Endpoints that need to be called from multiple places

When to use Server Actions:

Form submissions
Simple CRUD operations
Operations closely tied to specific UI components
Operations that benefit from React Server Components optimizations

[RULE] Choose the appropriate pattern based on the specific requirements of the operation.
</section>

</doc>