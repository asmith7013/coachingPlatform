<doc id="error-handling">

# Error Handling System

<section id="error-overview">

## Overview

Our application implements a comprehensive error handling architecture that ensures consistent error processing across client, server, and validation layers. This system provides standardized error messages, appropriate status codes, and useful debugging information while maintaining good user experience.

[RULE] Always use the appropriate error handler for the context of your operation.

</section>

<section id="error-types">

## Error Types

The system handles three primary types of errors:

1. **Client Errors** - Errors that occur in browser context, often related to network requests, SWR, or UI interactions
2. **Server Errors** - Errors that occur in server components, API routes, or server actions
3. **Validation Errors** - Errors from Zod schema validation failures

Each error type has a dedicated handler function to standardize error formatting.

</section>

<section id="error-handlers">

## Error Handler Functions

### handleClientError

Used in hooks, UI event handlers, and other client-side code:

```typescript
import { handleClientError } from "@/lib/core/error/handleClientError";

try {
  // Client-side operation
} catch (error) {
  // Returns standardized error message
  const errorMessage = handleClientError(error);
  // Display error to user
}
handleServerError
Used in API routes, server actions, and other server-side code:
typescriptimport { handleServerError } from "@/lib/core/error/handleServerError";

try {
  // Server-side operation
} catch (error) {
  // Format and return error response
  return Response.json({
    success: false,
    error: handleServerError(error)
  });
}
handleValidationError
Specifically for Zod validation errors:
typescriptimport { handleValidationError } from "@/lib/core/error/handleValidationError";
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
[RULE] Validation errors should always be handled separately from general server errors.
</section>
<section id="error-display">
Error Display
Errors should be displayed to users in a consistent manner:

Form field errors: Display inline below the relevant field
Operation errors: Use the Alert component with appropriate variant
Fatal errors: Use ErrorBoundary components to catch and display unhandled errors

tsx// Form field error
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
[RULE] Always provide users with clear error messages that suggest the next steps when possible.
</section>
<section id="error-hooks">
Error Handling Hooks
Our system provides specialized hooks to streamline error handling:
useErrorHandledMutation
typescriptconst { mutate, isLoading, error } = useErrorHandledMutation(
  async (data) => {
    const response = await fetch('/api/resource', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    return response.json();
  }
);
useSafeSWR
typescriptconst { data, error, isLoading } = useSafeSWR('/api/resource', fetcher);
[RULE] Always use the error-handling hooks instead of raw fetch or SWR when fetching data.
</section>
</doc>