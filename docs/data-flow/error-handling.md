```markdown
<doc id="error-handling">

# Error Handling System

<section id="error-overview">

## Overview

Our application implements a comprehensive error handling architecture that ensures consistent error processing across client, server, and validation layers. This system provides standardized error messages, appropriate status codes, and useful debugging information while maintaining good user experience.

[RULE] Always use the appropriate error handler for the context of your operation.

</section>

<section id="error-organization">

## Error System Organization

The error handling system is centralized in the `src/lib/error` directory with the following structure:
```
lib/
├── error/
│   ├── core/                # Core error functionality
│   │   ├── classification.ts    # Error type classification
│   │   ├── context.ts           # Error context creation
│   │   ├── logging.ts           # Error logging and monitoring
│   │   ├── responses.ts         # Standard response creators
│   │   └── transformation.ts    # Error message formatting
│   ├── handlers/             # Context-specific handlers
│   │   ├── client.ts            # Client-side error handling
│   │   ├── crud.ts              # CRUD operation error handling
│   │   ├── server.ts            # Server-side error handling
│   │   └── validation.ts        # Zod validation error handling
│   └── index.ts              # Central export point
```

Error type definitions are located in `src/lib/types/error/`, while React component error boundaries are in `src/components/error/`.

[RULE] Import error utilities from `@/lib/error` and error types from `@error-types`.

</section>

<section id="error-types">

## Error Types

The system handles four primary types of errors:

1. **Client Errors** - Errors in browser context (network requests, SWR, UI interactions)
2. **Server Errors** - Errors in server components, API routes, or server actions
3. **Validation Errors** - Errors from Zod schema validation failures
4. **Business Errors** - Domain-specific errors related to business rules

Error types are now centrally managed in a structured directory (`src/lib/types/error/`) with specialized files:
- `core.ts` - Defines fundamental types like `ErrorSeverity` and `ErrorCategory`
- `context.ts` - Contains the `ErrorContext` interface for detailed error context information
- `api.ts` - API-specific error types like `ApiError` and `GraphQLError`
- `response.ts` - Response-related error types like `ErrorResponse` and `ValidationErrorResponse`
- `classes.ts` - Error class hierarchy with `AppError`, `ValidationError`, `NetworkError`, etc.

This structured organization ensures type consistency across the entire error handling system.

[RULE] Use the appropriate error type for each error context to ensure consistent error handling.

</section>

<section id="error-handlers">

## Error Handler Functions

### handleClientError

Used in hooks, UI event handlers, and other client-side code:

```typescript
import { handleClientError } from "@/lib/error";

try {
  // Client-side operation
} catch (error) {
  const errorMessage = handleClientError(error, "ComponentName");
  // Display error to user
}
```

### handleServerError

Used in API routes, server actions, and other server-side code:

```typescript
import { handleServerError } from "@/lib/error";

try {
  // Server-side operation
} catch (error) {
  return Response.json({
    success: false,
    error: handleServerError(error)
  });
}
```

### handleValidationError

Specifically for Zod validation errors:

```typescript
import { handleValidationError } from "@/lib/error";
import { z } from "zod";

try {
  const result = schema.parse(data);
} catch (error) {
  if (error instanceof z.ZodError) {
    return Response.json({
      success: false,
      error: handleValidationError(error)
    });
  }
}
```

### handleCrudError

For standardized error handling in CRUD operations:

```typescript
import { handleCrudError } from "@/lib/error";

try {
  // CRUD operation
} catch (error) {
  return handleCrudError(error, "createEntity");
}
```

[RULE] Validation errors should always be handled separately from general server errors.
</section>

<section id="error-boundaries">

## Error Boundaries

For React component error handling, use the ErrorBoundary component:

```tsx
import { ErrorBoundary } from "@/components/error";

function MyComponent() {
  return (
    <ErrorBoundary 
      fallback={<ErrorFallback />}
      context="MyComponentRender"
      variant="default"
    >
      {/* Component content */}
    </ErrorBoundary>
  );
}
```

For React Query integration, use the QueryErrorBoundary component:

```tsx
import { QueryErrorBoundary } from "@/components/error";

function MyDataComponent() {
  return (
    <QueryErrorBoundary context="DataFetching">
      {/* Components using React Query */}
    </QueryErrorBoundary>
  );
}
```

[RULE] Use ErrorBoundary components to catch and handle errors in React component trees.
</section>

<section id="error-monitoring">

## Error Monitoring

The system includes error monitoring through the core error system:

```typescript
import { logError, createErrorContext } from "@/lib/error";

// Capture an error with context
logError(error, {
  component: "UserProfile",
  operation: "fetchUserData",
  severity: "error",
  category: "network"
});

// Create detailed error context
const context = createErrorContext("UserProfile", "updateUser");
logError(error, context);
```

[RULE] Use error monitoring utilities to capture detailed error information for debugging.
</section>

<section id="error-data-integration">

## Error Integration with Data Flow

Our application implements a layered approach to error handling that integrates with the data management system:

1. **Foundation Layer** (`useQuery`) - Standard error catching in data fetching
2. **Operation Layer** (`useErrorHandledMutation`) - Error handling for mutations
3. **Component Layer** (`ErrorBoundary`) - Catches rendering errors

When a component requests data or performs a mutation:
1. Data fetching is handled by `useSafeSWR` with error standardization
2. Mutations are processed through `useErrorHandledMutation`
3. Unexpected rendering errors are caught by `ErrorBoundary` components

[RULE] Maintain a consistent error flow through all layers of the data management system.
</section>

<section id="error-hooks">

## Error Handling Hooks

Our system provides specialized hooks for error handling:

### useErrorHandledMutation

For handling API mutations with standardized error processing:

```typescript
const { mutate, isLoading, error } = useErrorHandledMutation(
  async (data) => {
    const response = await fetch('/api/resource', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    return response.json();
  },
  { errorContext: "ResourceCreation" }
);
```

### useErrorBoundary

For component-level error boundary functionality:

```typescript
const { error, handleError, resetError } = useErrorBoundary({
  context: "ComponentName"
});
```

[RULE] Use the error-handling hooks for consistent error management across components.
</section>

</doc>
```