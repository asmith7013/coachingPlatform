```markdown
<doc id="implementation-workflow">

# Implementation Workflow

<section id="workflow-overview">

## Overview

This guide outlines the specific steps to implement new features in our application, following our schema-driven architecture.

[RULE] Follow this implementation sequence for all new features.

</section>

<section id="schema-implementation">

## 1. Implement Zod Schemas

Start by defining the Zod schemas in `src/lib/zod-schema/`:

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
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type EntityInput = z.infer<typeof EntityInputZodSchema>;
export type Entity = z.infer<typeof EntityZodSchema>;
```
[RULE] Define all required fields with appropriate validations.
</section>
<section id="model-implementation">
2. Create MongoDB Models
Create MongoDB models in src/lib/schema/mongoose-schema/:

```typescript
// src/lib/schema/mongoose-schema/domain/entity.model.ts
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
[RULE] Ensure model fields match the Zod schema structure.
</section>

<section id="field-config-implementation">
3. Define Field Configurations
Create field configurations in src/lib/ui/forms/fieldConfig/:

```typescript
// src/lib/ui/forms/fieldConfig/domain/entity.ts
import { Field } from "@/lib/ui/forms/types";
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
[RULE] Define configurations for all fields in the schema.
</section>

<section id="server-action-implementation">
4. Implement Server Actions
Create server actions in src/app/actions/:

```typescript
// src/app/actions/domain/entity.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { EntityInputZodSchema } from "@/lib/zod-schema/domain/entity";
import { EntityModel } from "@/lib/schema/mongoose-schema/domain/entity.model";
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
[RULE] Implement validation and error handling for all operations.
</section>
<section id="hook-implementation">
5. Create Data Hooks
Create custom hooks in src/hooks/:

```typescript
// src/hooks/useEntityData.ts
import { useState } from "react";
import { Entity } from "@/lib/zod-schema/domain/entity";
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
```
[RULE] Include proper error handling and loading states.
</section>
<section id="component-implementation">
6. Develop UI Components
Create domain components in src/components/domain/:

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
[RULE] Create components based on the component hierarchy pattern.
</section>

<section id="tanstack-form-implementation">

## 7. TanStack Form Implementation

For forms requiring complex validation and dynamic field generation, use the TanStack Form system:

### Schema-Driven Field Generation

Generate field configurations automatically from Zod schemas:

```typescript
// src/lib/ui/forms/fieldConfig/domain/entity.ts
import { createFormFields } from '@/lib/ui/forms/tanstack/factory/field-factory';
import { EntityInputZodSchema } from '@zod-schema/domain/entity';

export const entityFields = createFormFields(EntityInputZodSchema, {
  fieldOrder: ["name", "description", "category", "owners"],
  labels: {
    name: "Entity Name",
    description: "Description",
    category: "Category",
    owners: "Owners"
  },
  fieldTypes: {
    category: "select",
    owners: "reference"
  },
  urls: {
    owners: "/api/staff"
  },
  options: {
    category: [
      { value: "type1", label: "Type 1" },
      { value: "type2", label: "Type 2" }
    ]
  }
});
```

### Form Component Implementation

Create forms using the TanStack Form components:

```typescript
// src/components/features/entityManagement/EntityForm.tsx
import { useForm } from '@tanstack/react-form';
import { TanStackForm } from '@/lib/ui/forms/tanstack/components/TanStackForm';
import { entityFields } from '@/lib/ui/forms/fieldConfig/domain/entity';
import { EntityInputZodSchema } from '@zod-schema/domain/entity';

export function EntityForm({ onSubmit, defaultValues }: EntityFormProps) {
  const form = useForm({
    defaultValues: defaultValues || {},
    validators: {
      onChange: EntityInputZodSchema,
      onBlur: EntityInputZodSchema,
      onSubmit: EntityInputZodSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <TanStackForm
      form={form}
      fields={entityFields}
      title="Create Entity"
      description="Fill out the form to create a new entity"
      submitLabel="Create Entity"
      onCancel={() => window.history.back()}
    />
  );
}
```

### Custom Field Rendering

For complex fields, use custom rendering with TanStack integration:

```typescript
// Custom field within TanStackForm
<TanStackForm form={form} fields={[]} title="Custom Form">
  <form.Field name="complexField">
    {(field) => (
      <CustomFieldComponent
        value={field.state.value}
        onChange={field.handleChange}
        error={field.state.meta.errors?.[0]}
      />
    )}
  </form.Field>
</TanStackForm>
```

### Form Factory Pattern

For domain-specific forms, use the form factory:

```typescript
// src/hooks/forms/useEntityForm.ts
import { createResourceForm } from '@/lib/ui/forms/tanstack/factory/form-factory';
import { EntityInputZodSchema } from '@zod-schema/domain/entity';
import { entityFields } from '@/lib/ui/forms/fieldConfig/domain/entity';

export const entityFormHooks = createResourceForm(
  EntityInputZodSchema,
  entityFields
);

// Usage in components
export function useEntityForm(onSubmit: (data: EntityInput) => Promise<void>) {
  return entityFormHooks.useResourceForm({
    onSubmit,
    mode: 'create'
  });
}
```

### Integration with Existing Patterns

The TanStack Form system integrates seamlessly with existing patterns:

- **Error Handling**: Uses the established error handling system
- **Design Tokens**: Follows token-first styling approach
- **Reference Fields**: Built-in support for ReferenceSelect components
- **CRUD Operations**: Works with existing server actions and hooks

[RULE] Use TanStack Forms for complex forms requiring dynamic validation, while maintaining simple forms with existing patterns.

</section>

<section id="component-layout-patterns">

## Component Layout Patterns

When implementing compound components with multiple elements (like titles and descriptions):

1. Use the `responsiveLayoutVariant` for the container element
2. Apply appropriate title spacing using the `responsiveLayoutVariant.variants.titleSpacing`
3. Nest the elements in a responsive container that handles the layout changes automatically

Example implementation:

```tsx
<div className={styles.container}>
  <ComponentTitle className={styles.title}>{title}</ComponentTitle>
  <ComponentDescription>{description}</ComponentDescription>
</div>
```
This ensures consistent responsive behavior across all component types.
[RULE] Use responsive layout patterns for all compound components with title/description pairs.
</section>

<section id="schedule-feature-implementation">

## Schedule Feature Implementation Guide

When implementing schedule-related features, follow this specific workflow that builds on our standard implementation sequence.

### 1. Implement Schedule Types

Start by defining schedule-specific types in feature types file:

```typescript
// src/components/features/schedulesNew/types.ts
export interface VisitCreationData {
  teacherId: string;
  periodNumber: number;
  portion: ScheduleAssignmentType;
  purpose: string;
}

export interface ScheduleUIState {
  selectedTeacher: string | null;
  selectedPeriod: number | null;
  activeDropdown: string | null;
}

export interface ConflictCheckData {
  teacherId: string;
  periodNumber: number;
  portion: ScheduleAssignmentType;
}
```

### 2. Create Conflict Detection Logic

Implement conflict detection before building the UI:

```typescript
// src/components/features/schedulesNew/utils/visit-conflict-detector.ts
export class VisitConflictDetector {
  constructor(private existingVisits: ScheduledVisitMinimal[]) {}
  
  checkConflict(newVisit: ConflictCheckData): ConflictResult {
    // Implement clear business logic for conflicts
    const conflictingVisit = this.existingVisits.find(existing => 
      existing.teacherId === newVisit.teacherId && 
      existing.periodNumber === newVisit.periodNumber &&
      this.hasTimeConflict(existing.portion, newVisit.portion)
    );
    
    return conflictingVisit ? 
      { hasConflict: true, message: "Conflict detected" } :
      { hasConflict: false };
  }
}
```

### 3. Implement Modular Hooks

Create focused hooks following the modular pattern:

```typescript
// Data hook - pure delegation
export function useScheduleData({ schoolId, date }: ScheduleDataProps) {
  const schoolData = useSchoolDailyView(schoolId, date);
  const visits = useVisits.list({ filters: { school: schoolId, date } });
  
  return {
    teachers: schoolData.staff || [],
    visits: visits.items || [],
    isLoading: schoolData.isLoading || visits.isLoading
  };
}

// Actions hook - operations with validation
export function useScheduleActions({ visits }: ScheduleActionsProps) {
  const visitsManager = useVisits.manager();
  const conflictDetector = useMemo(() => createConflictDetector(visits), [visits]);
  
  const scheduleVisit = useCallback(async (data: VisitCreationData) => {
    const conflict = conflictDetector.checkConflict(data);
    if (conflict.hasConflict) return { success: false, error: conflict.message };
    
    return await visitsManager.createAsync(transformToVisitData(data));
  }, [conflictDetector, visitsManager]);
  
  return { scheduleVisit, isLoading: visitsManager.isCreating };
}
```

### 4. Create Context Provider

Compose the modular hooks in a context provider:

```typescript
export function ScheduleProvider({ schoolId, date, children }: ScheduleProviderProps) {
  const scheduleData = useScheduleData({ schoolId, date });
  const scheduleActions = useScheduleActions({ visits: scheduleData.visits });
  const scheduleState = useScheduleState();
  
  const contextValue = {
    ...scheduleData,
    ...scheduleActions,
    ...scheduleState
  };
  
  return (
    <ScheduleContext.Provider value={contextValue}>
      {children}
    </ScheduleContext.Provider>
  );
}
```

### 5. Implement Selective Context Hooks

Create hooks that expose specific slices of context:

```typescript
export function useScheduleSelection() {
  const context = useScheduleContext();
  return {
    selectedTeacher: context.uiState.selectedTeacher,
    selectedPeriod: context.uiState.selectedPeriod,
    selectTeacherPeriod: context.selectTeacherPeriod
  };
}

export function useScheduleOperations() {
  const context = useScheduleContext();
  return {
    scheduleVisit: context.scheduleVisit,
    hasVisitConflict: context.hasVisitConflict,
    isLoading: context.isLoading
  };
}
```

[RULE] Follow this schedule feature workflow for any complex scheduling functionality requiring conflict detection and state management.

</section>


<section id="page-implementation">

## 8. Create Pages
Finally, implement pages in src/app/:

```typescript
// src/app/dashboard/entityList/page.tsx
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
```
[RULE] Follow this complete implementation workflow for all new features.
</section>

</doc>
```
