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
Example successful response:
json{
  "items": [
    { "id": "1", "name": "Item 1" },
    { "id": "2", "name": "Item 2" }
  ],
  "total": 2,
  "success": true
}
Example error response:
json{
  "items": [],
  "success": false,
  "message": "Error message details"
}
[RULE] Always use the standard response format for consistency across the application.
</section>
<section id="standardize-response">
Response Standardization
To ensure all API responses follow the standard format, use the standardizeResponse utility:
typescriptimport { standardizeResponse, withStandardResponse } from "@/lib/utils/server/standardizeResponse";

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
typescriptimport { fetchPaginatedResource } from "@/lib/utils/server/fetchPaginatedResource";

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
typescriptimport { bulkUploadToDB } from "@/lib/utils/server/bulkUpload";

export const POST = withStandardResponse(async (request) => {
  const data = await request.json();
  
  return bulkUploadToDB(
    data,
    SchoolModel,
    SchoolZodSchema,
    ["/dashboard/schoolList"] // Paths to revalidate
  );
});
The bulk upload utility:

Validates all items against the schema
Inserts valid items into the database
Revalidates specified paths
Returns detailed success/error information

[RULE] Use bulkUploadToDB for all bulk upload operations.
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