<doc id="implementation-workflow">

# Implementation Workflow

<section id="workflow-overview">

## Overview

This guide outlines the specific steps to implement new features in our application, following our schema-driven architecture.

[RULE] Follow this implementation sequence for all new features.

</section>

<section id="schema-implementation">

## 1. Implement Zod Schemas

Start by defining the Zod schemas in `src/lib/data-schema/zod-schema/`:

```typescript
// src/lib/data-schema/zod-schema/domain/entity.ts
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
[RULE] Define all required fields with appropriate validations.
</section>
<section id="model-implementation">
2. Create MongoDB Models
Create MongoDB models in src/lib/data-schema/mongoose-schema/:
typescript// src/lib/data-schema/mongoose-schema/domain/entity.model.ts
import mongoose from "mongoose";
import { EntityZodSchema } from "@/lib/data-schema/zod-schema/domain/entity";

const schemaFields = {
  name: { type: String, required: true },
  description: { type: String, required: true },
  // Additional fields...
};

const EntitySchema = new mongoose.Schema(schemaFields, { timestamps: true });

export const EntityModel = mongoose.models.Entity || 
  mongoose.model("Entity", EntitySchema);
[RULE] Ensure model fields match the Zod schema structure.
</section>
<section id="field-config-implementation">
3. Define Field Configurations
Create field configurations in src/lib/ui/forms/fieldConfig/:
typescript// src/lib/ui/forms/fieldConfig/domain/entity.ts
import { Field } from "@/lib/ui/forms/types";
import { EntityInput } from "@/lib/data-schema/zod-schema/domain/entity";

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
[RULE] Define configurations for all fields in the schema.
</section>
<section id="server-action-implementation">
4. Implement Server Actions
Create server actions in src/app/actions/:
typescript// src/app/actions/domain/entity.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { EntityInputZodSchema } from "@/lib/data-schema/zod-schema/domain/entity";
import { EntityModel } from "@/lib/data-schema/mongoose-schema/domain/entity.model";
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

// Additional CRUD functions...
[RULE] Implement validation and error handling for all operations.
</section>
<section id="hook-implementation">
5. Create Data Hooks
Create custom hooks in src/hooks/:
typescript// src/hooks/useEntityData.ts
import { useState } from "react";
import { Entity } from "@/lib/data-schema/zod-schema/domain/entity";
import { useSafeSWR } from "@/hooks/utils/useSafeSWR";
import { handleClientError } from "@/lib/core/error/handleClientError";

export function useEntityData() {
  const { data, error, isLoading } = useSafeSWR<Entity[]>('/api/entities');
  
  // Additional CRUD functions...
  
  return {
    entities: data?.items || [],
    error,
    isLoading,
    // CRUD operations...
  };
}
[RULE] Include proper error handling and loading states.
</section>
<section id="component-implementation">
6. Develop UI Components
Create domain components in src/components/domain/:
typescript// src/components/domain/entity/EntityCard.tsx
import { Card } from "@/components/composed/cards";
import { Entity } from "@/lib/data-schema/zod-schema/domain/entity";

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
[RULE] Create components based on the component hierarchy pattern.
</section>
<section id="page-implementation">
7. Create Pages
Finally, implement pages in src/app/:
typescript// src/app/dashboard/entityList/page.tsx
import { useEntityData } from "@/hooks/useEntityData";
import { EntityCard } from "@/components/domain/entity/EntityCard";
import { PageHeader } from "@/components/shared";

export default function EntityListPage() {
  const { entities, error, isLoading } = useEntityData();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <PageHeader title="Entities" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {entities.map(entity => (
          <EntityCard key={entity._id} entity={entity} />
        ))}
      </div>
    </div>
  );
}
[RULE] Follow this complete implementation workflow for all new features.
</section>
</doc>