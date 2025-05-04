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
lib/
├── error/
│   ├── index.ts             # Central export point for all error utilities
│   ├── handle-client-error.ts   # Client-side error handling
│   ├── handle-server-error.ts   # Server-side error handling
│   ├── handle-validation-error.ts # Zod validation error handling
│   ├── crud-error-handling.ts   # CRUD operation error handling
│   └── error-monitor.ts     # Error monitoring and reporting

Error type definitions are centrally located in `src/lib/types/core/error.ts`, providing consistent error interfaces across the application.

Error boundaries are implemented in `src/components/error/` for React component error handling.

[RULE] Import error utilities from `@/lib/error` and error types from `@core-types/error`.

</section>

<section id="error-types">

## Error Types

The system handles three primary types of errors:

1. **Client Errors** - Errors that occur in browser context, often related to network requests, SWR, or UI interactions
2. **Server Errors** - Errors that occur in server components, API routes, or server actions
3. **Validation Errors** - Errors from Zod schema validation failures
4. **Business Errors** - Domain-specific errors related to business rules

Each error type has a dedicated handler function to standardize error formatting. The core error types are defined in `src/lib/types/core/error.ts` and include:

- `ErrorResponse` - Standardized error response structure
- `ApiError` - Detailed API error information
- `ErrorSeverity` - Error severity levels (fatal, error, warning, info, debug)
- `ErrorCategory` - Error categorization (validation, network, permission, business, system, unknown)
- `ErrorContext` - Contextual information about where/when an error occurred
- `BusinessError` - Class for domain-specific errors

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
  // Returns standardized error message
  const errorMessage = handleClientError(error, "ComponentName");
  // Display error to user
}
```

handleServerError
Used in API routes, server actions, and other server-side code:

```typescript
import { handleServerError } from "@/lib/error";

try {
  // Server-side operation
} catch (error) {
  // Format and return error response
  return Response.json({
    success: false,
    error: handleServerError(error)
  });
}
```

handleValidationError
Specifically for Zod validation errors:

```tsx
import { handleValidationError } from "@/lib/error";
import { z } from "zod";

try {
  const result = schema.parse(data);
} catch (error) {
  if (error instanceof z.ZodError) {
    // Format validation errors
    return Response.json({
      success: false,
      error: handleValidationError(error)
    });
  }
}
```

handleCrudError
For standardized error handling in CRUD operations:

```typescript
import { handleCrudError } from "@/lib/error";

try {
  // CRUD operation
} catch (error) {
  // Returns standardized error response
  return handleCrudError(error, "createEntity");
}
```
[RULE] Validation errors should always be handled separately from general server errors.
</section>

<section id="error-boundaries">
Error Boundaries
For React component error handling, use the ErrorBoundary component:

```tsx
import { ErrorBoundary } from "@/components/error";

function MyComponent() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      {/* Component content */}
    </ErrorBoundary>
  );
}
```
The SentryBoundaryWrapper provides integration with Sentry error monitoring:

```tsx
import SentryBoundaryWrapper from "@/components/error/SentryBoundaryWrapper";

function MyPage() {
  return (
    <SentryBoundaryWrapper>
      {/* Page content */}
    </SentryBoundaryWrapper>
  );
}
```
[RULE] Use ErrorBoundary components to catch and handle errors in React component trees.
</section>

<section id="error-monitoring">
Error Monitoring
The system includes comprehensive error monitoring through the error-monitor.ts module:

```typescript
import { captureError, createErrorContext } from "@/lib/error";

// Capture an error with context
captureError(error, {
  component: "UserProfile",
  operation: "fetchUserData",
  severity: "error",
  category: "network"
});

// Create detailed error context
const context = createErrorContext("UserProfile", "updateUser", {
  metadata: { userId: "123" }
});
captureError(error, context);
```

Additional monitoring utilities include:

withErrorMonitoring - Higher-order function for automatic error capturing
withAsyncErrorMonitoring - Higher-order function for async functions
reportBusinessError - For reporting domain-specific business errors
createMonitoredErrorResponse - Create error responses with monitoring

[RULE] Use error monitoring utilities to capture detailed error information for debugging.
</section>

<section id="error-data-integration">

## Error Integration with Data Flow

Our application implements a layered approach to error handling that integrates seamlessly with the data management system. Each layer has specific responsibilities while maintaining a cohesive flow:

### Error Handling and Data Flow Architecture

The error handling system connects with our data management hooks following a clean, layered architecture:

1. **Foundation Layer** (`useSafeSWR`): 
   - Wraps SWR to provide standardized error catching
   - Converts all error types to a consistent format
   - Adds context to errors for better debugging
   - Prevents error cascades in data fetching

2. **Operation Layer** (`useErrorHandledMutation`):
   - Manages state lifecycle for mutation operations
   - Standardizes error messages across all server actions
   - Provides loading/error/success states for UI feedback
   - Supports automatic error timeouts and retry logic

3. **Optimistic Layer** (`useOptimisticResource` + Error Handling):
   - Handles rollback of optimistic updates when errors occur
   - Ensures data consistency if server operations fail
   - Maintains clean error states during optimistic operations

4. **Resource Layer** (`useResourceManager` + `useCrudOperations`):
   - Integrates error handling at the resource management level
   - Preserves correct pagination and filter states during errors
   - Provides consistent error interfaces across all resource types

5. **Component Layer** (`ErrorBoundary` + `useErrorBoundary`):
   - Catches unexpected rendering errors outside the data flow
   - Prevents cascading failures in the UI
   - Forwards errors to monitoring systems with proper context

### Data Flow with Error Handling

When a component requests data or performs a mutation:

1. The component uses `useResourceManager` for the resource
2. Data fetching is handled by `useSafeSWR` with error standardization
3. Mutations are processed through `useErrorHandledMutation`
4. Optimistic updates are managed by `useOptimisticResource` with rollback on error
5. All errors are displayed consistently in the UI
6. Unexpected rendering errors are caught by `ErrorBoundary` components

This layered approach ensures that errors are handled appropriately at each level of the data flow, providing both developer-friendly debugging and user-friendly error messages.

[RULE] Maintain a consistent error flow through all layers of the data management system.

</section>
<section id="error-display">
Error Display
Errors should be displayed to users in a consistent manner:

```tsx
// Form field error
{error && (
  <div className="text-sm text-red-500 mt-1">
    {error}
  </div>
)}

// API operation error
{error && (
  <Alert variant="error">
    <AlertTitle>Operation Failed</AlertTitle>
    <AlertDescription>{error}</AlertDescription>
  </Alert>
)}
```
[RULE] Always provide users with clear error messages that suggest next steps when possible.
</section>
<section id="error-hooks">
Error Handling Hooks
Our system provides specialized hooks to streamline error handling:

```typescript
import { useErrorHandledMutation } from "@/hooks/utils/useErrorHandledMutation";

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
[RULE] Always use the error-handling hooks instead of raw fetch or SWR when fetching data.
</section>

</doc>
```
