# Exemplar Stack Documentation

**Purpose**: Single comprehensive reference for AI assistants working on this codebase. This document contains all architectural patterns, conventions, and examples needed to maintain consistency across the application.

---

## Table of Contents

1. [Path Aliases & Import Conventions](#path-aliases--import-conventions)
2. [CRUD Factory Pattern](#crud-factory-pattern)
3. [Schema Architecture](#schema-architecture)
4. [Server Actions Pattern](#server-actions-pattern)
5. [Component Patterns](#component-patterns)
6. [Error Handling System](#error-handling-system)
7. [File Organization](#file-organization)
8. [Naming Conventions](#naming-conventions)
9. [Complete Full-Stack Example](#complete-full-stack-example)
10. [React Query Patterns](#react-query-patterns)
11. [Database Connection Patterns](#database-connection-patterns)

---

## Path Aliases & Import Conventions

**`[RULE]`** Always use path aliases instead of relative imports for better maintainability.

### Complete Path Alias Reference

```typescript
// tsconfig.json paths
"@/*": ["./src/*"]                                    // Root src
"@actions/*": ["./src/app/actions/*"]                 // Server actions
"@zod-schema/*": ["./src/lib/schema/zod-schema/*"]    // Zod schemas
"@mongoose-schema/*": ["./src/lib/schema/mongoose-schema/*"] // Mongoose models
"@components/*": ["./src/components/*"]               // All components
"@core-components/*": ["./src/components/core/*"]     // Core atomic components
"@server/*": ["./src/lib/server/*"]                   // Server utilities
"@error/*": ["./src/lib/error/*"]                     // Error handling
"@ui/*": ["./src/components/ui/*"]                    // UI components
"@hooks/*": ["./src/hooks/*"]                         // React hooks
"@utils/*": ["./src/lib/utils/*"]                     // Utilities
"@types/*": ["./src/types/*"]                         // Type definitions
```

### Import Usage Examples

```typescript
// ✅ CORRECT - Using path aliases
import { fetchRoadmapsSkills } from "@actions/scm/roadmaps-skills";
import { RoadmapsSkillZodSchema } from "@zod-schema/scm/roadmap-skill";
import { RoadmapsSkillModel } from "@mongoose-schema/313/roadmap-skill.model";
import { Alert } from "@core-components/feedback/Alert";
import { createCrudActions } from "@server/crud/crud-factory";
import { handleServerError } from "@error/handlers/server";

// ❌ WRONG - Using relative imports
import { fetchRoadmapsSkills } from "../../../app/actions/313/roadmaps-skills";
import { Alert } from "../../components/core/feedback/Alert";
```

**`[RULE]`** When to use which alias:
- `@actions/*` - All server actions (Next.js "use server" functions)
- `@zod-schema/*` - All Zod validation schemas
- `@mongoose-schema/*` - All Mongoose model definitions
- `@core-components/*` - Atomic design system components
- `@server/*` - Server-side utilities (CRUD, DB, etc.)
- `@error/*` - Error handling utilities

---

## CRUD Factory Pattern

**`[RULE]`** Use the CRUD factory for all database operations. Never write raw Mongoose queries in server actions.

### CRUD Config Interface

```typescript
interface CrudConfig<T extends BaseDocument, TInput = Partial<T>> {
  model: Model<Document>;              // Mongoose model
  schema: ZodType<T>;                  // Zod schema for validation
  inputSchema?: ZodType<TInput>;       // Zod schema for input (omits system fields)
  name?: string;                       // Entity name for error messages
  revalidationPaths?: string[];        // Next.js paths to revalidate on mutations
  sortFields?: string[];               // Allowed sort fields
  defaultSortField?: string;           // Default field to sort by
  defaultSortOrder?: 'asc' | 'desc';   // Default sort order
}
```

### Complete CRUD Factory Example

From `/src/app/actions/313/roadmaps-skills.ts`:

```typescript
"use server";

import { createCrudActions } from "@server/crud/crud-factory";
import { RoadmapsSkillModel } from "@mongoose-schema/313/roadmap-skill.model";
import {
  RoadmapsSkillZodSchema,
  RoadmapsSkillInputZodSchema
} from "@zod-schema/scm/roadmap-skill";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";

// Create CRUD operations
const roadmapsSkillCrud = createCrudActions({
  model: RoadmapsSkillModel,
  schema: RoadmapsSkillZodSchema,
  inputSchema: RoadmapsSkillInputZodSchema,
  name: 'RoadmapsSkill',
  revalidationPaths: ['/roadmaps/units', '/roadmaps/unit-scraper'],
  sortFields: ['skillNumber', 'title', 'createdAt', 'updatedAt'],
  defaultSortField: 'skillNumber',
  defaultSortOrder: 'asc'
});

// Export CRUD operations
export const fetchRoadmapsSkills = roadmapsSkillCrud.fetch;
export const fetchRoadmapsSkillById = roadmapsSkillCrud.fetchById;
export const createRoadmapsSkill = roadmapsSkillCrud.create;
export const updateRoadmapsSkill = roadmapsSkillCrud.update;
export const deleteRoadmapsSkill = roadmapsSkillCrud.delete;

// Custom server action example (when CRUD isn't enough)
export async function fetchRoadmapsSkillsByNumbers(
  skillNumbers: string[]
): Promise<EntityResponse<RoadmapsSkill[]>> {
  return withDbConnection(async () => {
    try {
      const skills = await RoadmapsSkillModel.find({
        skillNumber: { $in: skillNumbers }
      }).lean();

      const validatedSkills = skills.map(skill =>
        RoadmapsSkillZodSchema.parse({
          ...skill,
          _id: skill._id.toString(),
        })
      );

      return {
        success: true,
        data: validatedSkills,
      };
    } catch (error) {
      return handleServerError(error, 'fetchRoadmapsSkillsByNumbers');
    }
  });
}
```

### Available CRUD Operations

```typescript
// Fetch with pagination, sorting, filtering
await fetchEntity({
  page: 1,
  limit: 50,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  search: 'query',
  filters: { status: 'active' }
});

// Fetch by ID
await fetchEntityById(id);

// Create new entity
await createEntity(inputData);

// Update existing entity
await updateEntity(id, updateData);

// Delete entity
await deleteEntity(id);
```

**`[RULE]`** Revalidation paths:
- Always specify pages that display this data
- Use `revalidatePath()` to update Next.js cache
- Example: Creating a skill should revalidate `/roadmaps/units` page

---

## Schema Architecture

**`[RULE]`** Every entity must have BOTH a Zod schema AND a Mongoose model. They must be kept in sync.

### Base Document Schema Pattern

All schemas extend `BaseDocumentSchema`:

```typescript
// From /src/lib/schema/zod-schema/base-schemas.ts

export const BaseDocumentSchema = z.object({
  _id: z.string().describe("Unique document identifier"),
  id: z.string().optional().describe("Client-side ID (mirrors _id)"),
  ownerIds: z.array(z.string()).default([]).describe("User IDs who own this document"),
  createdAt: z.string().optional().describe("When document was created"),
  updatedAt: z.string().optional().describe("When document was last updated"),
});

export type BaseDocument = z.infer<typeof BaseDocumentSchema>;

// Helper to create input schemas (removes system fields)
export function toInputSchema<T extends z.ZodObject<z.ZodRawShape>>(fullSchema: T) {
  return fullSchema.omit({
    _id: true,
    id: true,
    createdAt: true,
    updatedAt: true,
  });
}
```

### Complete Schema Example

**Zod Schema** (`/src/lib/schema/zod-schema/scm/roadmap-skill.ts`):

```typescript
import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';

// Sub-schemas for nested objects
export const SkillReferenceSchema = z.object({
  title: z.string(),
  skillNumber: z.string(),
});

export const UnitReferenceSchema = z.object({
  grade: z.string(),
  unitTitle: z.string(),
  unitNumber: z.number(),
});

// Main entity fields
export const RoadmapsSkillFieldsSchema = z.object({
  // Core identification
  skillNumber: z.string(),
  title: z.string(),
  url: z.string().url().optional(),

  // Nested objects
  essentialSkills: z.array(SkillReferenceSchema).default([]),
  helpfulSkills: z.array(SkillReferenceSchema).default([]),
  units: z.array(UnitReferenceSchema).default([]),

  // Optional fields
  section: z.string().optional(),
  lesson: z.number().optional(),

  // Fields with defaults
  description: z.string().default(''),
  vocabulary: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),

  // Metadata
  scrapedAt: z.string(),
  success: z.boolean().default(true),
  error: z.string().optional(),
});

// Full schema (merges with BaseDocumentSchema)
export const RoadmapsSkillZodSchema = BaseDocumentSchema.merge(RoadmapsSkillFieldsSchema);

// Input schema (for create/update - omits system fields)
export const RoadmapsSkillInputZodSchema = toInputSchema(RoadmapsSkillZodSchema);

// Type exports
export type RoadmapsSkill = z.infer<typeof RoadmapsSkillZodSchema>;
export type RoadmapsSkillInput = z.infer<typeof RoadmapsSkillInputZodSchema>;
export type SkillReference = z.infer<typeof SkillReferenceSchema>;
export type UnitReference = z.infer<typeof UnitReferenceSchema>;
```

**Mongoose Model** (`/src/lib/schema/mongoose-schema/313/roadmap-skill.model.ts`):

```typescript
import mongoose from 'mongoose';
import { standardSchemaOptions, standardDocumentFields } from '@mongoose-schema/shared-options';

// Sub-schemas (match Zod schemas)
const skillReferenceSchema = {
  title: { type: String, required: true },
  skillNumber: { type: String, required: true },
};

const unitReferenceSchema = {
  grade: { type: String, required: true },
  unitTitle: { type: String, required: true },
  unitNumber: { type: Number, required: true },
};

// Main fields (match Zod schema)
const roadmapsSkillFields = {
  // Core identification
  skillNumber: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true, index: true },
  url: { type: String, index: true },

  // Nested objects
  essentialSkills: { type: [skillReferenceSchema], default: [] },
  helpfulSkills: { type: [skillReferenceSchema], default: [] },
  units: { type: [unitReferenceSchema], default: [] },

  // Optional fields
  section: { type: String },
  lesson: { type: Number },

  // Fields with defaults
  description: { type: String, default: '' },
  vocabulary: { type: [String], default: [] },
  images: { type: [String], default: [] },

  // Metadata
  scrapedAt: { type: String, required: true, index: true },
  success: { type: Boolean, required: true, default: true, index: true },
  error: { type: String },

  // Include standard fields (_id, ownerIds, createdAt, updatedAt)
  ...standardDocumentFields
};

const RoadmapsSkillSchema = new mongoose.Schema(roadmapsSkillFields, {
  ...standardSchemaOptions,
  collection: 'roadmaps-skills'  // Collection name in MongoDB (kebab-case)
});

// Force recompilation (for hot reload in development)
if (mongoose.models.RoadmapsSkill) {
  delete mongoose.models.RoadmapsSkill;
}

export const RoadmapsSkillModel = mongoose.model('RoadmapsSkill', RoadmapsSkillSchema);
```

**`[RULE]`** Schema Conventions:
- Zod schemas live in `/src/lib/schema/zod-schema/scm/`
- Mongoose models live in `/src/lib/schema/mongoose-schema/313/`
- Always export both full schema and input schema from Zod
- Always export type definitions
- Collection names use kebab-case (e.g., `roadmaps-skills`)
- Model names use PascalCase (e.g., `RoadmapsSkill`)
- Add indexes for frequently queried fields

---

## Server Actions Pattern

**`[RULE]`** All server actions MUST use `"use server"` directive and follow this pattern.

### Complete Server Action File Structure

```typescript
"use server";  // MUST be first line

// 1. Imports
import { createCrudActions } from "@server/crud/crud-factory";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError, handleValidationError, handleCrudError } from "@error/handlers/server";
import { ModelName } from "@mongoose-schema/path/to/model";
import { SchemaName, InputSchemaName } from "@zod-schema/path/to/schema";

// 2. Create CRUD instance
const entityCrud = createCrudActions({
  model: ModelName,
  schema: SchemaName,
  inputSchema: InputSchemaName,
  name: 'EntityName',
  revalidationPaths: ['/path1', '/path2'],
  sortFields: ['field1', 'field2'],
  defaultSortField: 'field1',
  defaultSortOrder: 'asc'
});

// 3. Export standard CRUD operations
export const fetchEntities = entityCrud.fetch;
export const fetchEntityById = entityCrud.fetchById;
export const createEntity = entityCrud.create;
export const updateEntity = entityCrud.update;
export const deleteEntity = entityCrud.delete;

// 4. Custom server actions (when needed)
export async function customAction(
  params: ParamsType
): Promise<EntityResponse<ReturnType>> {
  return withDbConnection(async () => {
    try {
      // Validation
      const validated = SchemaName.parse(params);

      // Business logic
      const result = await ModelName.findOne({ field: validated.field });

      // Return success
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return handleServerError(error, 'customAction');
    }
  });
}
```

### Response Types

```typescript
// From /src/types/api.ts

// Single entity response
interface EntityResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Paginated response
interface PaginatedResponse<T> {
  success: boolean;
  data?: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

// Base response
interface BaseResponse {
  success: boolean;
  error?: string;
}
```

**`[RULE]`** Error Handling in Server Actions:
- Always wrap in `withDbConnection()`
- Always wrap logic in try/catch
- Use `handleServerError()` for general errors
- Use `handleValidationError()` for Zod validation errors
- Use `handleCrudError()` for CRUD operation errors
- Return `{ success: false, error: message }` on failure

---

## Component Patterns

**`[RULE]`** Use Tailwind Variants (tv) for all component styling. Follow intent-based design patterns.

### Tailwind Variants Pattern

```typescript
// From /src/components/core/feedback/Alert.tsx

import { tv, type VariantProps } from "tailwind-variants";
import {
  backgroundColors,
  borderColors,
  textColors,
  radii,
  borderWidths,
  textSize
} from "@/components/core/tokens";

// Define variants using tv()
const alertVariants = tv({
  slots: {
    root: `relative w-full ${radii.lg} ${borderWidths.sm} p-4`,
    title: `${textSize.base} font-bold leading-none tracking-tight`,
    description: `${textSize.sm} [&_p]:leading-relaxed`,
  },
  variants: {
    intent: {
      error: {
        root: `border-2 ${borderColors.danger} ${backgroundColors.light.danger}`,
        title: textColors.danger,
        description: textColors.danger,
      },
      warning: {
        root: `border-2 ${borderColors.warning} ${backgroundColors.light.warning}`,
        title: textColors.warning,
        description: textColors.warning,
      },
      success: {
        root: `border-2 ${borderColors.success} ${backgroundColors.light.success}`,
        title: textColors.success,
        description: textColors.success,
      },
      info: {
        root: `border-2 ${borderColors.info} ${backgroundColors.light.info}`,
        title: textColors.info,
        description: textColors.info,
      },
    },
  },
  defaultVariants: {
    intent: "info",
  },
});

type AlertVariants = VariantProps<typeof alertVariants>;
```

### Compound Component Pattern

```typescript
// Alert component with compound pattern
interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, AlertVariants {}

export function Alert({ intent, className, children, ...props }: AlertProps) {
  const { root } = alertVariants({ intent });

  return (
    <div className={root({ className })} {...props}>
      {children}
    </div>
  );
}

// Sub-components
Alert.Title = function AlertTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  const { title } = alertVariants();
  return (
    <h5 className={title({ className })} {...props}>
      {children}
    </h5>
  );
};

Alert.Description = function AlertDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { description } = alertVariants();
  return (
    <div className={description({ className })} {...props}>
      {children}
    </div>
  );
};
```

### Component Usage Examples

```typescript
// ✅ CORRECT - Using compound components with intent
<Alert intent="error">
  <Alert.Title>Error Loading Skills</Alert.Title>
  <Alert.Description>{error}</Alert.Description>
</Alert>

<Alert intent="warning">
  <Alert.Title>No Skills Found</Alert.Title>
  <Alert.Description>
    No skills found in the database.
  </Alert.Description>
</Alert>

// ✅ CORRECT - Using design tokens
import { textColors, spacing } from "@/components/core/tokens";

<div className={`${textColors.danger} ${spacing.p4}`}>
  Error message
</div>
```

**`[RULE]`** Component Conventions:
- Use `tv()` for variant definitions
- Use `slots` for multi-element components
- Use `intent` prop for semantic meaning (error, warning, success, info)
- Use `appearance` prop for visual style (solid, outline, ghost)
- Always reference design tokens from `@/components/core/tokens`
- Export variant types for props: `VariantProps<typeof componentVariants>`

---

## Error Handling System

**`[RULE]`** Use standardized error handlers. Never return raw error objects to the client.

### Server-Side Error Handlers

```typescript
// From /src/lib/error/handlers/server.ts

/**
 * Handle general server errors
 */
export function handleServerError(error: unknown, context?: string): BaseResponse {
  console.error(`[Server Error] ${context}:`, error);

  return {
    success: false,
    error: error instanceof Error ? error.message : 'An unexpected error occurred',
  };
}

/**
 * Handle Zod validation errors
 */
export function handleValidationError(error: z.ZodError, context?: string): BaseResponse {
  console.error(`[Validation Error] ${context}:`, error.errors);

  return {
    success: false,
    error: `Validation failed: ${error.errors.map(e => e.message).join(', ')}`,
  };
}

/**
 * Handle CRUD operation errors
 */
export function handleCrudError(operation: string, entityName: string, error: unknown): BaseResponse {
  console.error(`[CRUD Error] ${operation} ${entityName}:`, error);

  return {
    success: false,
    error: `Failed to ${operation} ${entityName}`,
  };
}
```

### Error Handler Usage in Server Actions

```typescript
"use server";

export async function createEntity(data: EntityInput): Promise<EntityResponse<Entity>> {
  return withDbConnection(async () => {
    try {
      // Validate input
      const validated = EntityInputSchema.parse(data);

      // Perform operation
      const result = await EntityModel.create(validated);

      return { success: true, data: result };
    } catch (error) {
      // Zod validation error
      if (error instanceof z.ZodError) {
        return handleValidationError(error, 'createEntity');
      }
      // General error
      return handleServerError(error, 'createEntity');
    }
  });
}
```

### Client-Side Error Display

```typescript
// ✅ CORRECT - Using Alert component for errors
"use client";

export function MyPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const result = await fetchEntities();
      if (!result.success) {
        setError(result.error || 'Failed to load data');
      }
    };
    loadData();
  }, []);

  if (error) {
    return (
      <Alert intent="error">
        <Alert.Title>Error Loading Data</Alert.Title>
        <Alert.Description>{error}</Alert.Description>
      </Alert>
    );
  }

  // ... rest of component
}
```

---

## File Organization

**`[RULE]`** Follow strict file organization conventions for consistency.

### Directory Structure

```
src/
├── app/
│   ├── actions/           # Server actions (grouped by feature)
│   │   └── 313/           # Feature-specific actions
│   │       └── roadmaps-skills.ts
│   ├── roadmaps/          # Feature pages
│   │   ├── skills/
│   │   │   └── page.tsx
│   │   └── units/
│   │       ├── page.tsx
│   │       └── components/
│   │           └── UnitDetailView.tsx
├── components/
│   ├── core/              # Atomic design system components
│   │   ├── buttons/
│   │   │   └── Button.tsx
│   │   ├── feedback/
│   │   │   └── Alert.tsx
│   │   └── tokens/
│   │       └── index.ts
│   └── ui/                # Feature-specific UI components
├── lib/
│   ├── schema/
│   │   ├── zod-schema/
│   │   │   ├── base-schemas.ts
│   │   │   └── 313/
│   │   │       └── roadmap-skill.ts
│   │   └── mongoose-schema/
│   │       ├── shared-options.ts
│   │       └── 313/
│   │           └── roadmap-skill.model.ts
│   ├── server/
│   │   ├── crud/
│   │   │   └── crud-factory.ts
│   │   └── db/
│   │       └── ensure-connection.ts
│   ├── error/
│   │   └── handlers/
│   │       └── server.ts
│   └── utils/
├── hooks/                 # React hooks
├── types/                 # TypeScript type definitions
│   └── api.ts
```

**`[RULE]`** File Naming Conventions:
- Server actions: `entity-name.ts` (kebab-case)
- Zod schemas: `entity-name.ts` (kebab-case)
- Mongoose models: `entity-name.model.ts` (kebab-case)
- React components: `ComponentName.tsx` (PascalCase)
- Pages: `page.tsx` (Next.js convention)
- Utilities: `utility-name.ts` (kebab-case)

**`[RULE]`** Feature Grouping:
- Group by feature number (e.g., `313/`) when applicable
- Keep related schemas, models, and actions together
- Component folders should include `components/` subdirectory for local components

---

## Naming Conventions

**`[RULE]`** Consistent naming across the codebase.

### Collection Names (MongoDB)
```typescript
// ✅ CORRECT - kebab-case
collection: 'roadmaps-skills'
collection: 'roadmap-units'
collection: 'user-profiles'

// ❌ WRONG
collection: 'RoadmapsSkills'
collection: 'roadmaps_skills'
```

### Model Names (Mongoose)
```typescript
// ✅ CORRECT - PascalCase, singular
export const RoadmapsSkillModel = mongoose.model('RoadmapsSkill', schema);
export const UserProfileModel = mongoose.model('UserProfile', schema);

// ❌ WRONG
export const roadmapsSkillModel = mongoose.model('roadmapsSkill', schema);
export const RoadmapsSkillsModel = mongoose.model('RoadmapsSkills', schema);
```

### Type Names (TypeScript)
```typescript
// ✅ CORRECT - PascalCase
export type RoadmapsSkill = z.infer<typeof RoadmapsSkillZodSchema>;
export type EntityResponse<T> = { success: boolean; data?: T; error?: string };

// ❌ WRONG
export type roadmapsSkill = z.infer<typeof RoadmapsSkillZodSchema>;
export type entity_response<T> = { success: boolean; data?: T };
```

### Function Names
```typescript
// ✅ CORRECT - camelCase
export const fetchRoadmapsSkills = entityCrud.fetch;
export async function createRoadmapsSkill(data: Input) {}

// ❌ WRONG
export const FetchRoadmapsSkills = entityCrud.fetch;
export async function CreateRoadmapsSkill(data: Input) {}
```

### Variable Names
```typescript
// ✅ CORRECT - camelCase
const roadmapsSkillCrud = createCrudActions({ ... });
const sortedSkills = skills.sort(...);

// ❌ WRONG
const RoadmapsSkillCrud = createCrudActions({ ... });
const sorted_skills = skills.sort(...);
```

### Schema Field Names
```typescript
// ✅ CORRECT - camelCase
skillNumber: z.string()
essentialSkills: z.array(...)
targetCount: z.number()

// ❌ WRONG
skill_number: z.string()
SkillNumber: z.string()
```

---

## Complete Full-Stack Example

### Scenario: Roadmaps Skills Feature

This example shows how all patterns work together from database to UI.

#### 1. Zod Schema (`/src/lib/schema/zod-schema/scm/roadmap-skill.ts`)

```typescript
import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';

export const SkillReferenceSchema = z.object({
  title: z.string(),
  skillNumber: z.string(),
});

export const RoadmapsSkillFieldsSchema = z.object({
  skillNumber: z.string(),
  title: z.string(),
  essentialSkills: z.array(SkillReferenceSchema).default([]),
  description: z.string().default(''),
  scrapedAt: z.string(),
  success: z.boolean().default(true),
});

export const RoadmapsSkillZodSchema = BaseDocumentSchema.merge(RoadmapsSkillFieldsSchema);
export const RoadmapsSkillInputZodSchema = toInputSchema(RoadmapsSkillZodSchema);

export type RoadmapsSkill = z.infer<typeof RoadmapsSkillZodSchema>;
export type RoadmapsSkillInput = z.infer<typeof RoadmapsSkillInputZodSchema>;
```

#### 2. Mongoose Model (`/src/lib/schema/mongoose-schema/313/roadmap-skill.model.ts`)

```typescript
import mongoose from 'mongoose';
import { standardSchemaOptions, standardDocumentFields } from '@mongoose-schema/shared-options';

const skillReferenceSchema = {
  title: { type: String, required: true },
  skillNumber: { type: String, required: true },
};

const roadmapsSkillFields = {
  skillNumber: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true, index: true },
  essentialSkills: { type: [skillReferenceSchema], default: [] },
  description: { type: String, default: '' },
  scrapedAt: { type: String, required: true },
  success: { type: Boolean, required: true, default: true },
  ...standardDocumentFields
};

const RoadmapsSkillSchema = new mongoose.Schema(roadmapsSkillFields, {
  ...standardSchemaOptions,
  collection: 'roadmaps-skills'
});

if (mongoose.models.RoadmapsSkill) {
  delete mongoose.models.RoadmapsSkill;
}

export const RoadmapsSkillModel = mongoose.model('RoadmapsSkill', RoadmapsSkillSchema);
```

#### 3. Server Actions (`/src/app/actions/313/roadmaps-skills.ts`)

```typescript
"use server";

import { createCrudActions } from "@server/crud/crud-factory";
import { RoadmapsSkillModel } from "@mongoose-schema/313/roadmap-skill.model";
import { RoadmapsSkillZodSchema, RoadmapsSkillInputZodSchema } from "@zod-schema/scm/roadmap-skill";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";

const roadmapsSkillCrud = createCrudActions({
  model: RoadmapsSkillModel,
  schema: RoadmapsSkillZodSchema,
  inputSchema: RoadmapsSkillInputZodSchema,
  name: 'RoadmapsSkill',
  revalidationPaths: ['/roadmaps/skills'],
  sortFields: ['skillNumber', 'title'],
  defaultSortField: 'skillNumber',
  defaultSortOrder: 'asc'
});

export const fetchRoadmapsSkills = roadmapsSkillCrud.fetch;
export const fetchRoadmapsSkillById = roadmapsSkillCrud.fetchById;
export const createRoadmapsSkill = roadmapsSkillCrud.create;
```

#### 4. Page Component (`/src/app/roadmaps/skills/page.tsx`)

```typescript
"use client";

import { useState, useEffect } from "react";
import { fetchRoadmapsSkills } from "@actions/scm/roadmaps-skills";
import { RoadmapsSkill } from "@zod-schema/scm/roadmap-skill";
import { Alert } from "@core-components/feedback/Alert";

export default function RoadmapsSkillsPage() {
  const [skills, setSkills] = useState<RoadmapsSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSkills = async () => {
      setLoading(true);
      const result = await fetchRoadmapsSkills();

      if (result.success && result.data) {
        // Client-side sorting
        const sorted = result.data.sort((a, b) => {
          const numA = parseInt(a.skillNumber) || 0;
          const numB = parseInt(b.skillNumber) || 0;
          return numA - numB;
        });
        setSkills(sorted);
      } else {
        setError(result.error || 'Failed to load skills');
      }

      setLoading(false);
    };

    loadSkills();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <Alert intent="error">
        <Alert.Title>Error Loading Skills</Alert.Title>
        <Alert.Description>{error}</Alert.Description>
      </Alert>
    );
  }

  if (skills.length === 0) {
    return (
      <Alert intent="warning">
        <Alert.Title>No Skills Found</Alert.Title>
        <Alert.Description>No skills in database yet.</Alert.Description>
      </Alert>
    );
  }

  return (
    <div>
      <h1>Roadmaps Skills ({skills.length})</h1>
      <div>
        {skills.map((skill) => (
          <div key={skill._id}>
            <h3>{skill.title} ({skill.skillNumber})</h3>
            <p>{skill.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### 5. Component with Data Fetching (`/src/app/roadmaps/units/components/UnitDetailView.tsx`)

```typescript
"use client";

import { useState, useEffect } from "react";
import { RoadmapUnit } from "@zod-schema/scm/roadmap-unit";
import { RoadmapsSkill } from "@zod-schema/scm/roadmap-skill";
import { fetchRoadmapsSkillsByNumbers } from "@actions/scm/roadmaps-skills";
import { Alert } from "@core-components/feedback/Alert";

interface UnitDetailViewProps {
  unit: RoadmapUnit | null;
}

export function UnitDetailView({ unit }: UnitDetailViewProps) {
  const [targetSkills, setTargetSkills] = useState<RoadmapsSkill[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(false);

  useEffect(() => {
    if (!unit || !unit.targetSkills || unit.targetSkills.length === 0) {
      setTargetSkills([]);
      return;
    }

    const fetchSkills = async () => {
      setLoadingSkills(true);
      try {
        const result = await fetchRoadmapsSkillsByNumbers(unit.targetSkills);
        if (result.success && result.data) {
          setTargetSkills(result.data);
        }
      } catch (error) {
        console.error('Error fetching skills:', error);
      } finally {
        setLoadingSkills(false);
      }
    };

    fetchSkills();
  }, [unit]);

  if (!unit) {
    return (
      <Alert intent="info">
        <Alert.Title>No Unit Selected</Alert.Title>
        <Alert.Description>Select a unit to view details</Alert.Description>
      </Alert>
    );
  }

  return (
    <div>
      <h2>{unit.unitTitle}</h2>
      {loadingSkills ? (
        <div>Loading skills...</div>
      ) : (
        <div>
          {targetSkills.map((skill) => (
            <div key={skill.skillNumber}>
              <h3>{skill.title} ({skill.skillNumber})</h3>
              {skill.essentialSkills?.length > 0 && (
                <div>
                  <strong>Essential:</strong>
                  {skill.essentialSkills.map((s) => (
                    <span key={s.skillNumber}>
                      {s.title} ({s.skillNumber})
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## React Query Patterns

**Note**: If using React Query (TanStack Query) for data fetching, follow these patterns:

### Query Setup

```typescript
// /src/lib/query/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});
```

### Query Hooks

```typescript
// /src/hooks/useRoadmapsSkills.ts
import { useQuery } from '@tanstack/react-query';
import { fetchRoadmapsSkills } from '@actions/scm/roadmaps-skills';

export function useRoadmapsSkills() {
  return useQuery({
    queryKey: ['roadmaps-skills'],
    queryFn: async () => {
      const result = await fetchRoadmapsSkills();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch skills');
      }
      return result.data || [];
    },
  });
}
```

### Mutation Hooks

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRoadmapsSkill } from '@actions/scm/roadmaps-skills';

export function useCreateRoadmapsSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRoadmapsSkill,
    onSuccess: () => {
      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: ['roadmaps-skills'] });
    },
  });
}
```

---

## Database Connection Patterns

**`[RULE]`** Always wrap server actions with `withDbConnection()`.

### withDbConnection Wrapper

```typescript
// From /src/lib/server/db/ensure-connection.ts

/**
 * Ensures database connection before executing operation
 * Automatically handles connection errors
 */
export async function withDbConnection<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    await ensureDbConnection();
    return await operation();
  } catch (error) {
    console.error('[Database Connection Error]:', error);
    throw error;
  }
}
```

### Usage in Server Actions

```typescript
"use server";

export async function fetchEntity(): Promise<PaginatedResponse<Entity>> {
  // ✅ CORRECT - Wrapped with withDbConnection
  return withDbConnection(async () => {
    try {
      const results = await EntityModel.find();
      return { success: true, data: results };
    } catch (error) {
      return handleServerError(error, 'fetchEntity');
    }
  });
}

// ❌ WRONG - Not wrapped
export async function fetchEntity(): Promise<PaginatedResponse<Entity>> {
  try {
    const results = await EntityModel.find(); // May fail if DB not connected
    return { success: true, data: results };
  } catch (error) {
    return handleServerError(error, 'fetchEntity');
  }
}
```

---

## Summary Checklist

When creating a new feature, ensure:

- [ ] **Zod Schema** created in `/src/lib/schema/zod-schema/[feature]/`
  - [ ] Extends `BaseDocumentSchema`
  - [ ] Has input schema via `toInputSchema()`
  - [ ] Exports all types

- [ ] **Mongoose Model** created in `/src/lib/schema/mongoose-schema/[feature]/`
  - [ ] Fields match Zod schema
  - [ ] Uses `standardDocumentFields`
  - [ ] Collection name is kebab-case
  - [ ] Has appropriate indexes

- [ ] **Server Actions** created in `/src/app/actions/[feature]/`
  - [ ] Starts with `"use server"`
  - [ ] Uses CRUD factory
  - [ ] Wraps operations with `withDbConnection()`
  - [ ] Uses error handlers
  - [ ] Specifies revalidation paths

- [ ] **Components** follow patterns
  - [ ] Use path aliases for imports
  - [ ] Use `tv()` for styling
  - [ ] Use design tokens
  - [ ] Use Alert component for errors
  - [ ] Follow compound component pattern where appropriate

- [ ] **Error Handling**
  - [ ] Server actions return `{ success, data, error }`
  - [ ] Use standardized error handlers
  - [ ] Display errors with Alert component

- [ ] **Naming Conventions**
  - [ ] Collections: kebab-case
  - [ ] Models: PascalCase
  - [ ] Types: PascalCase
  - [ ] Functions: camelCase
  - [ ] Fields: camelCase

---

**End of Exemplar Stack Documentation**

*Last Updated: 2025-10-24*
