# Server Actions

## Overview

Our application uses Next.js Server Actions for server-side operations that need to be triggered from client components. Server Actions provide a type-safe, direct way to invoke server-side code without creating separate API endpoints.

**[RULE]** Use Server Actions for form submissions and operations closely tied to specific UI components.

## CRUD Factory Pattern

Our server actions follow a standardized pattern using the CRUD factory to reduce duplication:

```typescript
"use server";

import { RubricModel } from "@mongoose-schema/look-fors/rubric.model";
import { RubricZodSchema, RubricInputZodSchema } from "@zod-schema/look-fors/rubric";
import { createCrudActions } from "@/lib/server/crud/crud-action-factory";
import { withDbConnection } from "@/lib/server/db/ensure-connection";

// Create standard CRUD actions
export const rubricActions = createCrudActions({
  model: RubricModel,
  fullSchema: RubricZodSchema,
  inputSchema: RubricInputZodSchema,
  revalidationPaths: ["/dashboard/rubrics"],
  options: {
    validSortFields: ['score', 'createdAt'],
    defaultSortField: 'score',
    defaultSortOrder: 'asc',
    entityName: 'Rubric'
  }
});

// Export the generated actions with connection handling
export async function fetchRubrics(params = {}) {
  return withDbConnection(() => rubricActions.fetch(params));
}

export async function createRubric(data: RubricInput) {
  return withDbConnection(() => rubricActions.create(data));
}

// Add specialized actions beyond basic CRUD
export async function fetchRubricScoresByStaff(staffId: string) {
  return withDbConnection(async () => {
    try {
      const scores = await RubricModel.find({ staffId });
      return { success: true, data: scores };
    } catch (error) {
      return handleServerError(error, "Failed to fetch rubric scores");
    }
  });
}
```

This pattern:

- Leverages the CRUD factory for standard operations
- Adds specialized actions as needed
- Maintains consistent error handling
- Ensures proper database connection management
- Provides consistent response formats

**[RULE]** Use the CRUD factory pattern for all new server actions to ensure consistency and maintainability.

## Domain Organization

Server Actions are organized by domain in the `src/app/actions/` directory:

```
src/app/actions/
├── cycles/                # Cycle-related actions
├── lookFors/              # Look For related actions
├── schedules/             # Schedule-related actions
├── schools/               # School-related actions
├── staff/                 # Staff-related actions
└── visits/                # Visit-related actions
```

Each domain directory contains action files with related functionality:

```typescript
// src/app/actions/schools/schools.ts
export async function createSchool(data: unknown) { /* ... */ }
export async function updateSchool(id: string, data: unknown) { /* ... */ }
export async function deleteSchool(id: string) { /* ... */ }
```

**[RULE]** Organize Server Actions by domain and group related actions together.

## Standard Action Structure

When the CRUD factory doesn't meet specific needs, follow this standard pattern:

```typescript
// src/app/actions/schools/schools.ts
'use server'

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { SchoolInputZodSchema } from "@zod-schema/core/school";
import { SchoolModel } from "@mongoose-schema/core/school.model";
import { handleValidationError } from "@/lib/core/error/handleValidationError";
import { handleServerError } from "@/lib/core/error/handleServerError";

export async function createSchool(data: unknown) {
  try {
    // Validate input against schema
    const validated = SchoolInputZodSchema.parse(data);
    
    // Perform database operation
    const school = await SchoolModel.create(validated);
    
    // Revalidate relevant paths
    revalidatePath('/dashboard/schoolList');
    
    // Return success response
    return { success: true, data: school };
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return { success: false, error: handleValidationError(error) };
    }
    
    // Handle other errors
    return { success: false, error: handleServerError(error, "Failed to create school") };
  }
}
```

Key components:
- `'use server'` directive at the top of the file
- Input validation using Zod schemas
- Database operations
- Cache revalidation
- Standardized error handling
- Consistent response format

**[RULE]** Follow the standard pattern for all Server Actions.

## Connection Management

All server actions must use the `withDbConnection` wrapper to ensure proper database connection handling:

```typescript
export async function createEntity(data: EntityInput) {
  return withDbConnection(async () => {
    // Database operations here
    const entity = await EntityModel.create(data);
    return { success: true, data: entity };
  });
}
```

This ensures:
- Database connections are properly managed
- Connection pooling is optimized
- Error handling includes connection issues

**[RULE]** Always wrap database operations with `withDbConnection`.

## Client-Side Usage

### Simple Form Actions

For basic form submissions, use the action attribute:

```tsx
'use client'

import { createSchool } from "@/app/actions/schools/schools";

export function SchoolForm() {
  const handleSubmit = async (formData: FormData) => {
    const result = await createSchool(Object.fromEntries(formData));
    
    if (result.success) {
      // Handle success
    } else {
      // Handle error
    }
  };
  
  return (
    <form action={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### Complex Interactions

For complex interactions with loading states and error handling:

```tsx
'use client'

import { createSchool } from "@/app/actions/schools/schools";
import { useErrorHandledMutation } from "@/hooks/utils/useErrorHandledMutation";

export function SchoolForm() {
  const { mutate, isLoading, error } = useErrorHandledMutation(createSchool);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    mutate(Object.fromEntries(formData));
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

**[RULE]** Use the form action attribute for simple cases and `useErrorHandledMutation` for complex interactions.

## Form Integration

Server actions integrate seamlessly with our form system:

```typescript
// Form field configuration automatically works with server actions
export const SchoolFieldConfig: Field<SchoolInput>[] = [
  {
    name: 'schoolName',
    label: 'School Name',
    type: 'text',
    required: true,
  },
  // Additional fields...
];

// Action handles validation based on schema
export async function createSchool(data: SchoolInput) {
  return withDbConnection(() => schoolActions.create(data));
}
```

## Security Considerations

Server Actions automatically handle CSRF protection, but implement additional security:

```typescript
export async function updateSchool(id: string, data: unknown) {
  // Authentication check
  const session = await getSession();
  if (!session || !session.user.canEditSchool) {
    return { success: false, error: "Unauthorized" };
  }
  
  // Input validation
  const validated = SchoolInputZodSchema.parse(data);
  
  // Proceed with operation
  return withDbConnection(() => schoolActions.update(id, validated));
}
```

Security measures:
- **Input Validation**: Always validate inputs using Zod schemas
- **Authentication**: Verify user credentials and permissions
- **Authorization**: Check specific permissions for operations
- **Error Handling**: Don't expose sensitive information in error messages

**[RULE]** Implement appropriate security measures for all Server Actions.

## When to Use Server Actions

Use Server Actions for:

- **Form Submissions**: Direct form action handlers
- **Component-Specific Operations**: Actions tied to specific UI components
- **Simple CRUD Operations**: Basic create, read, update, delete operations
- **Progressive Enhancement**: Actions that should work without JavaScript
- **RSC Optimization**: Actions that benefit from React Server Components

**[RULE]** Choose Server Actions for form submissions and component-specific operations.