
```markdown
<doc id="api-patterns">

# API Patterns

<section id="api-overview">

## Overview

Our application implements a consistent pattern for API route development, response formatting, and error handling. These patterns ensure a predictable experience for frontend developers and maintain data consistency across the application.

[RULE] All API routes should follow these standard patterns.

</section>

<section id="api-architecture">

## API Architecture

Our API system follows a layered architecture with clear separation of concerns:

```markdown
src/lib/api/
├── client/             # Client-side API utilities
├── fetchers/           # API-safe fetchers for MongoDB models
├── handlers/           # Endpoint factories and specialized handlers
│   └── reference/      # Reference endpoint component system
├── responses/          # Response formatting utilities
├── validation/         # Request and query validation
└── index.ts            # Central exports
```

This structure separates different aspects of API functionality while maintaining a consistent approach across the application.

[RULE] Follow the layered architecture to maintain separation of concerns.

</section>

<section id="response-format">

## Standard Response Format

All API responses follow a standardized structure:

```typescript
// Collection response (multiple items)
interface CollectionResponse<T = Record<string, unknown>> {
  items: T[];
  total: number;
  success: boolean;
  message?: string;
  empty?: boolean;
}

// Paginated response (extends collection)
interface PaginatedResponse<T = Record<string, unknown>> extends CollectionResponse<T> {
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

// Entity response (single item)
interface EntityResponse<T = Record<string, unknown>> {
  data: T;
  success: boolean;
  message?: string;
}

// Base response (for errors)
interface BaseResponse {
  success: boolean;
  error?: string;
  message?: string;
}
```

Example successful response:

```json
{
  "items": [
    { "id": "1", "name": "Item 1" },
    { "id": "2", "name": "Item 2" }
  ],
  "total": 2,
  "success": true
}
```

Example error response:

```json
{
  "items": [],
  "total": 0,
  "success": false,
  "error": "Error message details"
}
```

[RULE] Always use the standard response format for consistency across the application.

</section>

<section id="response-utilities">

## Response Formatting Utilities

Our system provides utilities to ensure consistent response formatting:

```typescript
// Create a collection response
const response = createCollectionResponse(items, "Optional message");

// Create an entity response
const response = createEntityResponse(entity, "Optional message");

// Create an error response with monitoring
const response = createMonitoredErrorResponse(
  error,
  { component: 'ComponentName', operation: 'operationName' }
);

// Standardize any response format
const standardized = collectionizeResponse(data);
```

These utilities ensure all API responses follow the standard format regardless of the data source.

[RULE] Use response formatting utilities rather than manually constructing responses.

</section>

<section id="api-safe-fetchers">

## API-Safe Fetchers Pattern

Our architecture maintains a clean separation between Server Actions and API Routes through the "API-Safe Fetchers" pattern:

```markdown
Server Actions                API Routes
     │                           │
     ▼                           ▼
"use server"                 API-Safe Fetchers
 fetchers                    (no "use server")
     │                           │
     └─────────┐      ┌──────────┘
               ▼      ▼
            MongoDB Models
                 │
                 ▼
            Zod Schemas
```

API-safe fetchers are created using the `createApiSafeFetcher` factory:

```typescript
// Create an API-safe fetcher for a model
export const fetchSchoolsForApi = createApiSafeFetcher(
  SchoolModel,
  SchoolZodSchema,
  "schoolName" // Default search field
);

// Use in API route without "use server" directive conflicts
export const GET = createReferenceEndpoint({
  fetchFunction: fetchSchoolsForApi,
  mapItem: mapSchoolToReference
});
```

This pattern solves a critical architectural challenge:
- Server Actions use the "use server" directive and connect directly to MongoDB
- API Routes cannot import files with "use server" directives
- Both need access to the same data retrieval logic

[RULE] Use API-safe fetchers for all API routes instead of importing server actions directly.

</section>

<section id="validation-system">

## Request Validation System

Our application uses a comprehensive validation system for API requests based on Zod schemas:

### Query Parameter Validation

```typescript
// Validate query parameters in an API route
export const GET = withQueryValidation(
  QueryParamsZodSchema, 
  async (validatedParams, request) => {
    // Implementation with type-safe params
    const { page, limit, search } = validatedParams;
    // ...
  }
);
```

### Request Body Validation

```typescript
// Validate request body in an API route
export const POST = withRequestValidation(
  SchoolInputZodSchema,
  async (validatedData, request) => {
    // Implementation with validated data
    // ...
  }
);
```

The validation system:

1. **Normalizes Parameters**: Properly handles multi-value parameters
2. **Validates with Zod**: Ensures data matches expected schemas
3. **Transforms Types**: Converts string parameters to appropriate types
4. **Standardizes Errors**: Returns consistent error responses

[RULE] Always validate request inputs using the validation middleware.

</section>

<section id="reference-endpoint-pattern">

## Reference Endpoint Pattern

Our application provides a standardized pattern for creating reference data endpoints using the `createReferenceEndpoint` factory:

```typescript
// Create a reference endpoint for schools
export const GET = createReferenceEndpoint({
  fetchFunction: fetchSchoolsForApi,
  mapItem: (school) => ({
    value: school._id,
    label: school.schoolName,
    district: school.district
  }),
  defaultSearchField: "schoolName",
  logPrefix: "SchoolsAPI"
});
```

The factory encapsulates:

- Query parameter validation
- Data fetching through API-safe fetchers
- Item transformation to reference format
- Pagination handling
- Error handling and logging
- Response formatting

This approach ensures consistency across all reference endpoints while reducing boilerplate code.

[RULE] Use the reference endpoint pattern for all API endpoints that return lists of entities for selection purposes.

</section>

<section id="api-client">

## API Client Pattern

For client-side API access, our application provides a standardized API client:

```typescript
// Base API client
const apiClient = new ApiClient();

// Domain-specific client
export const schoolApiClient = {
  list: (params) => 
    apiClient.getPaginated<School>('/schools', params),
  
  getById: (id) => 
    apiClient.get<CollectionResponse<School>>(`/schools/${id}`),
  
  // Additional methods...
};

// Usage in components or hooks
const { data } = useQuery(['schools'], () => 
  schoolApiClient.list({ page: 1, limit: 10 })
);
```

The API client provides:

- Consistent error handling
- Type-safe responses
- Query parameter formatting
- Response type checking

[RULE] Use domain-specific API clients for all client-side API requests.

</section>

<section id="error-handling">

## Error Handling

Our API system implements consistent error handling across all routes:

```typescript
try {
  // Implementation...
} catch (error) {
  return NextResponse.json(
    createMonitoredErrorResponse(
      error,
      { component: 'ComponentName', operation: 'operationName' }
    ),
    { status: 500 }
  );
}
```

Error responses are consistently formatted and include proper monitoring through the error system.

For reference endpoints, error handling is built into the factory:

```typescript
export const GET = createReferenceEndpoint({
  // Configuration...
});
// Error handling is automatic
```

[RULE] Use `createMonitoredErrorResponse` for all API error responses to ensure proper monitoring and formatting.

</section>

<section id="api-vs-server-actions">

## API Routes vs Server Actions

Our application uses both API routes and server actions, each with specific use cases:

### When to use API Routes:

- **External Consumption**: Endpoints needed by external systems
- **Reference Data**: Endpoints for select inputs and lookups
- **Complex Parameters**: Operations with complex filtering and sorting
- **File Operations**: Upload and download endpoints
- **Webhook Handlers**: Endpoints for external service callbacks

### When to use Server Actions:

- **Form Submissions**: Direct form action handlers
- **Component-Specific Operations**: Actions tied to specific UI components
- **RSC Optimization**: Actions that benefit from React Server Components
- **Progressive Enhancement**: Actions that should work without JavaScript

[RULE] Choose the appropriate pattern based on the specific requirements of the operation.

</section>

<section id="webhook-handlers">

## Webhook Handlers

Our application provides a standardized pattern for webhook handlers, demonstrated by the Clerk webhook implementation:

```typescript
// Webhook validation
const validation = await validateClerkWebhook(request, webhookSecret);

if (!validation.isValid) {
  return Response.json({ success: false, error: validation.error }, { status: 400 });
}

// Event type handling
const { type, data } = validation.payload;

switch (type) {
  case 'user.created':
    return Response.json(await handleUserCreation(data as UserWebhookData));
  case 'user.updated':
    return Response.json(await handleUserSync(data as UserWebhookData));
  // Additional event types...
  default:
    return Response.json({ success: true, message: `Event ${type} ignored` });
}
```

This pattern ensures:

- Proper validation of webhook signatures
- Type-safe event handling
- Consistent response format
- Separation of validation and business logic

[RULE] Follow the webhook handler pattern for all external service integrations.

</section>

</doc>
```
