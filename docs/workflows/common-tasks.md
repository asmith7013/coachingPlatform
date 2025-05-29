```markdown
<doc id="common-tasks">

# Common Development Tasks

<section id="tasks-overview">

## Overview

This guide provides step-by-step instructions for common development tasks in our project. Following these standardized approaches ensures consistency and maintainability across the codebase.

[RULE] Follow these established patterns for common development tasks.

</section>

<section id="adding-entity">

## Adding a New Entity

To add a new entity to the system (e.g., a new resource type):

1. **Create the Zod Schema**

   ```typescript
   // src/lib/zod-schema/domain/entity.ts
   import { z } from "zod";
   import { zDateField } from "../shared/dateHelpers";
   
   export const EntityInputZodSchema = z.object({
     name: z.string(),
     description: z.string(),
     // Additional fields...
   });
   
   export const EntityZodSchema = EntityInputZodSchema.extend({
     _id: z.string(),
     createdAt: zDateField.optional(),
     updatedAt: zDateField.optional(),
   });
   
   export type EntityInput = z.infer<typeof EntityInputZodSchema>;
   export type Entity = z.infer<typeof EntityZodSchema>;
   ```

Create the MongoDB Model

```typescript
// src/lib/schema/domain/entity.model.ts
import mongoose from "mongoose";
import { EntityZodSchema } from "@/lib/zod-schema/domain/entity";

const schemaFields = {
  name: { type: String, required: true },
  description: { type: String, required: true },
  // Additional fields...
};

const EntitySchema = new mongoose.Schema(schemaFields, { timestamps: true });

export const EntityModel = mongoose.models.Entity || 
  mongoose.model("Entity", EntitySchema);
```
Create Field Configuration

```typescript
// src/lib/data/forms/config/domain/entity.ts
import { Field } from "@/lib/data/forms/types";
import { EntityInput } from "@/lib/zod-schema/domain/entity";

export const EntityFieldConfig: Field<EntityInput>[] = [
  {
    name: "name",
    label: "Name",
    type: "text",
    required: true,
  },
  {
    name: "description",
    label: "Description",
    type: "text",
    required: true,
  },
  // Additional fields...
];
```
Create API Routes or Server Actions

```typescript
// src/app/actions/domain/entity.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { EntityInputZodSchema } from "@/lib/zod-schema/domain/entity";
import { EntityModel } from "@/models/domain/entity.model";
import { handleValidationError } from "@/lib/core/error/handleValidationError";
import { handleServerError } from "@/lib/core/error/handleServerError";

export async function createEntity(data: unknown) {
  try {
    const validated = EntityInputZodSchema.parse(data);
    const entity = await EntityModel.create(validated);
    revalidatePath("/dashboard/entityList");
    return { success: true, data: entity };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: handleValidationError(error) };
    }
    return { success: false, error: handleServerError(error) };
  }
}
```
// Additional CRUD functions...

Implement UI Components

```typescript
// src/components/domain/entity/EntityCard.tsx
import { Card } from "@/components/composed/cards";
import { Entity } from "@/lib/zod-schema/domain/entity";

interface EntityCardProps {
  entity: Entity;
}

export function EntityCard({ entity }: EntityCardProps) {
  return (
    <Card>
      <Card.Header>{entity.name}</Card.Header>
      <Card.Body>{entity.description}</Card.Body>
    </Card>
  );
}
```

[RULE] Always follow this sequence when adding a new entity.
</section>

<section id="adding-field">
Adding a Field to an Existing Entity
To add a new field to an existing entity:

Update the Zod Schema

```typescript
// Update schema with new field
export const EntityInputZodSchema = z.object({
  name: z.string(),
  description: z.string(),
  newField: z.string().optional(), // Add new field
});
```
Update the MongoDB Model

```typescript
const schemaFields = {
  name: { type: String, required: true },
  description: { type: String, required: true },
  newField: { type: String, required: false }, // Add new field
};
```
Update Field Configuration

```typescript
export const EntityFieldConfig: Field<EntityInput>[] = [
  // Existing fields...
  {
    name: "newField",
    label: "New Field",
    type: "text",
    required: false,
  },
];
```
Update Components (if necessary)

```typescript
export function EntityCard({ entity }: EntityCardProps) {
  return (
    <Card>
      <Card.Header>{entity.name}</Card.Header>
      <Card.Body>
        {entity.description}
        {entity.newField && (
          <div className="mt-2">{entity.newField}</div>
        )}
      </Card.Body>
    </Card>
  );
}
```

[RULE] When adding fields, always update the schema first, then flow through to models, configurations, and UI.
</section>

<section id="creating-component">
Creating a New Component
To create a new UI component:

Determine Component Type

Core: Primitive UI elements
Composed: Combinations of core components
Domain: Business domain specific components
Feature: Complete feature implementations


Create Component File

```typescript
// src/components/[type]/ComponentName.tsx
import { tv } from "tailwind-variants";
import { colors, spacing } from "@/lib/ui/tokens";
// For shared behavior, import specific variants
import { interactive } from "@/lib/ui/variants";

const componentName = tv({
  base: "base-styles-here",
  variants: {
    // Primitive UI tokens for direct styling
    color: colors,
    padding: spacing,
    // Optional shared behaviors when needed
    interactive: interactive.variants.interactive,
  },
  defaultVariants: {
    color: "primary",
    padding: "md",
  }
});

export function ComponentName({ 
  color,
  padding,
  ...props 
}: ComponentNameProps) {
  // Component implementation
  return (
    <div className={componentName({ color, padding })}>
      {/* Component content */}
    </div>
  );
}
```
Create Index Export

```typescript
// src/components/[type]/index.ts
export * from './ComponentName';
```
Add Component Tests (if applicable)

```typescript
// tests/components/[type]/ComponentName.test.tsx
import { render, screen } from '@testing-library/react';
import { ComponentName } from '@/components/[type]/ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    // Assertions
  });
});
```

[RULE] Follow the component hierarchy and use variants for styling.
</section>

<section id="data-fetching">
Implementing Data Fetching
To create a new data fetching hook:

Create the Hook File

```typescript
// src/hooks/useEntityData.ts
import { useState } from "react";
import { Entity } from "@/lib/zod-schema/domain/entity";
import { useSafeSWR } from "@/hooks/utils/useSafeSWR";
import { handleClientError } from "@/lib/core/error/handleClientError";

export function useEntityData() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [mutationError, setMutationError] = useState<Error | null>(null);
  
  // Fetch data
  const { data, error, isLoading, mutate } = useSafeSWR<Entity[]>('/api/entities');
  
  // Create function
  async function createEntity(entityData: Omit<Entity, "_id">) {
    try {
      const response = await fetch('/api/entities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entityData),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Update cache
      mutate();
      
      return result.data;
    } catch (err) {
      const errorMessage = handleClientError(err);
      setMutationError(new Error(errorMessage));
      throw err;
    }
  }
  
  // Additional CRUD functions...
  
  return {
    entities: data?.items || [],
    error: error || mutationError,
    isLoading,
    createEntity,
    // Other functions...
  };
}
```
Export from Index

```typescript
// src/hooks/index.ts
export * from './useEntityData';
```
Use in Components
```typescript
// src/components/features/EntityList.tsx
import { useEntityData } from "@/hooks";

export function EntityList() {
  const { entities, error, isLoading, createEntity } = useEntityData();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {entities.map(entity => (
        <EntityCard key={entity._id} entity={entity} />
      ))}
    </div>
  );
}
```

[RULE] All data fetching hooks should handle loading and error states consistently.
</section>

</doc>
```
