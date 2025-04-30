<doc id="server-actions">

# Server Actions

<section id="server-actions-overview">

## Overview

Our application uses Next.js Server Actions for server-side operations that need to be triggered from client components. Server Actions provide a type-safe, direct way to invoke server-side code without creating separate API endpoints.

[RULE] Use Server Actions for form submissions and operations closely tied to specific UI components.

</section>

<section id="server-actions-structure">

## Server Action Structure

Server Actions follow a consistent pattern:

```typescript
// src/app/actions/schools/schools.ts
'use server'

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { SchoolInputZodSchema } from "@/lib/data-schema/zod-schema/core/school";
import { SchoolModel } from "@/lib/data-schema/mongoose-schema/core/school.model";
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

'use server' directive at the top of the file
Input validation using Zod schemas
Database operations
Cache revalidation
Standardized error handling
Consistent response format

[RULE] Follow the standard pattern for all Server Actions.
</section>

<section id="standardized-action-patterns">

## Standardized Action Patterns

Our server actions follow a standardized pattern using the CRUD factory to reduce duplication:

```typescript
"use server";

import { z } from "zod";
import { RubricModel } from "@mongoose-schema/look-fors/rubric.model";
import { RubricZodSchema, RubricInputZodSchema } from "@data-schema/zod-schema/look-fors/rubric";
import { createCrudActions } from "@data-server/crud/crud-action-factory";
import { withDbConnection } from "@data-server/db/ensure-connection";

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

// Add any specialized actions beyond basic CRUD
export async function fetchRubricScoresByStaff(staffId: string) {
  return withDbConnection(async () => {
    try {
      // Custom implementation...
    } catch (error) {
      // Error handling...
    }
  });
}
```

This pattern:

Leverages the CRUD factory for standard operations
Adds specialized actions as needed
Maintains consistent error handling
Ensures proper database connection management
Provides consistent response formats

[RULE] Use the standardized action pattern for all server actions to ensure consistency and maintainability.
</section>

<section id="server-actions-organization">
Organization
Server Actions are organized by domain in the src/app/actions/ directory:
src/app/actions/
├── cycles/                # Cycle-related actions
├── lookFors/              # Look For related actions
├── schedules/             # Schedule-related actions
├── schools/               # School-related actions
├── staff/                 # Staff-related actions
└── visits/                # Visit-related actions
Each domain directory contains action files with related functionality:
typescript// src/app/actions/schools/schools.ts
export async function createSchool(data: unknown) { /* ... */ }
export async function updateSchool(id: string, data: unknown) { /* ... */ }
export async function deleteSchool(id: string) { /* ... */ }
[RULE] Organize Server Actions by domain and group related actions together.
</section>

<section id="server-actions-usage">
Client-Side Usage
Server Actions can be used directly in client components:

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
For more complex interactions, use the useErrorHandledMutation hook:

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
[RULE] Use the form action attribute for simple cases and useErrorHandledMutation for complex interactions.
</section>

<section id="server-actions-vs-api">
Server Actions vs. API Routes
When to use Server Actions:

Form submissions
Simple CRUD operations
Operations closely tied to specific UI components
When you need built-in progressive enhancement

When to use API Routes:

External API integrations
Complex operations requiring middleware
Custom request/response handling
Endpoints that need to be called from multiple places

[RULE] Choose the appropriate approach based on the operation's requirements.
</section>

<section id="server-actions-security">
Security Considerations
Server Actions automatically handle CSRF protection, but additional security measures should be implemented:

Input Validation: Always validate inputs using Zod schemas
Authentication: Verify user credentials and permissions
Rate Limiting: Implement rate limiting for public-facing actions
Error Handling: Don't expose sensitive information in error messages

```typescript
export async function updateSchool(id: string, data: unknown) {
  // Get the current user
  const session = await getSession();
  
  // Check permissions
  if (!session || !session.user.canEditSchool) {
    return { success: false, error: "Unauthorized" };
  }
  
  // Validate input
  const validated = SchoolInputZodSchema.parse(data);
  
  // Proceed with operation
  // ...
}
```
[RULE] Implement appropriate security measures for all Server Actions.
</section>
</doc>