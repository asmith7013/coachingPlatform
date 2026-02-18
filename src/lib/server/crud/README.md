# CRUD Operations Error Handling

This directory contains standardized utilities for CRUD operations and error handling in the AI Coaching Platform.

## Overview

The CRUD operations system provides a consistent way to interact with the database and handle errors across the application. It includes:

- Standardized response interfaces (`types.ts`)
- Unified error handling utilities (`error-handling.ts`)
- CRUD action factory for generating standardized database operations (`crud-action-factory.ts`)
- Bulk upload operations with consistent error handling (`bulk-operations.ts`)

## Key Components

### Response Types (`types.ts`)

Contains standardized interfaces for all CRUD operations:

- `ErrorResponse`: Base error response interface
- `BulkUploadResult`: For bulk operations
- `ResourceResponse`: For single resource operations
- `PaginatedResult`: For paginated lists
- `CrudResult`: For basic CRUD operations

### Error Handling (`error-handling.ts`)

Provides utilities for consistent error handling:

- `handleCrudError()`: Converts any error into a standardized error response
- `getErrorMessage()`: Extracts error messages from various response formats
- `createErrorResponse()`: Creates a new error response with proper formatting

### CRUD Action Factory (`crud-action-factory.ts`)

Generates standardized CRUD operations for any model:

```typescript
const userActions = createCrudActions({
  model: UserModel,
  fullSchema: UserZodSchema,
  inputSchema: UserInputZodSchema,
  revalidationPaths: ["/dashboard/users"],
  options: {
    validSortFields: ["name", "createdAt"],
    defaultSortField: "name",
    defaultSortOrder: "asc",
    entityName: "User",
  },
});

// Use the generated actions
export async function fetchUsers(params = {}) {
  return withDbConnection(() => userActions.fetch(params));
}
```

### Bulk Operations (`bulk-operations.ts`)

Handles batch operations with consistent error reporting:

```typescript
const result = await bulkUploadToDB(usersData, UserModel, UserInputZodSchema, [
  "/dashboard/users",
]);
```

## Error Handling Transition

The system includes backward compatibility for transitioning from the old error format (using `error` property) to the new format (using `errors` array and `message`):

1. New code should use `message` and `errors` properties
2. Existing code using `error` will continue to work
3. All error handlers now populate both formats for compatibility

## Type Safety

Error responses are fully typed to ensure consistent handling across the application:

```typescript
// Example error response
{
  success: false,
  message: "User not found",
  error: "User not found", // For backward compatibility
  errors: [{ error: "User not found" }]
}
```
