```markdown
<doc id="schema-system">

# Data Flow & Schema System

<section id="data-overview">
Overview
Our platform uses a schema-driven architecture where Zod schemas serve as the definitive source of truth for all data structures. This approach ensures consistency across the frontend, backend, and database layers.
[RULE] Always use Zod schemas as the canonical source of truth for data structures.
</section>

<section id="data-schemas">
Zod Schema Architecture
Schemas are organized in src/lib/data-schema/zod-schema/ by domain:

core/: Base schemas for common entities (School, Staff, Cycle)
shared/: Reusable schema parts (notes, enums, date helpers)
Domain-specific directories: visits/, look-fors/, etc.

```typescript
// Example: School schema
export const SchoolZodSchema = z.object({
  _id: z.string(),
  schoolNumber: z.string(),
  district: z.string(),
  schoolName: z.string(),
  address: z.string().optional(),
  gradeLevelsSupported: z.array(GradeLevelsSupportedZod),
  staffList: z.array(z.string()),
  owners: z.array(z.string()),
  createdAt: zDateField.optional(),
  updatedAt: zDateField.optional(),
});
```
[RULE] When adding new fields, always start by updating the Zod schema first.
</section>

<section id="schema-patterns">
Zod Schema Patterns
Input vs. Full Schema Pattern
All data structures in our system follow a consistent pattern:

Input schemas define fields for user-provided data without system fields
Full schemas extend input schemas with system fields (_id, createdAt, updatedAt)

Example:

```typescript
// Input schema (for validation of user-provided data)
export const EntityInputZodSchema = z.object({
  name: z.string(),
  description: z.string(),
  // No system fields
});

// Full schema (for validation of retrieved database documents)
export const EntityZodSchema = EntityInputZodSchema.extend({
  _id: z.string(),
  createdAt: zDateField.optional(),
  updatedAt: zDateField.optional(),
});
```
Nested Document Schemas
Nested documents do not include system fields like _id:

```typescript
// Nested document schema
export const NestedItemZodSchema = z.object({
  title: z.string(),
  description: z.string(),
  // No _id or timestamps
});
```
Type Generation
Always generate TypeScript types from your schemas:

```typescript
// Auto-generate TypeScript types
export type EntityInput = z.infer<typeof EntityInputZodSchema>;
export type Entity = z.infer<typeof EntityZodSchema>;
```

MongoDB Schema Alignment
MongoDB schemas must align with Zod schemas:

Set timestamps: true in schema options
Set _id: false for nested document schemas

</section>

<section id="type-modification-strategies">

## Type Modification Strategies

When encountering type compatibility issues between different parts of the application, prefer direct modification of base types over creating transformation utilities or adapters.

### Prioritize Type Definitions

Our system follows this precedence for resolving type conflicts:

1. **Modify Base Types**: Always update the core type definitions first (`/src/lib/types/core/` and `/src/lib/types/domain/`)
2. **Align Zod Schemas**: Update Zod schema definitions to match the core types
3. **Adjust API Interfaces**: Ensure server action and API response types align with core types
4. **Update Consuming Code**: Only after core types are finalized, update components and hooks

### Avoid Transformation Layers

While it may seem expedient to create transformation utilities that convert between incompatible types, this approach leads to:

- Additional complexity and maintenance burden
- Hidden type inconsistencies
- Potential runtime errors
- Difficulty tracing data flow

```typescript
// ❌ Avoid transformation utilities like this:
const transformedResponse = transformResponseTypes(originalResponse);

// ✅ Instead, fix the base type definitions:
// In /src/lib/types/core/response.ts
export interface BaseResponse {
  success: boolean;
  // Updated properties...
}
```

### When to Use Transformers

Use transformers only for legitimate data transformations, not type coercion:

- **Valid Use**: Converting string dates to Date objects
- **Valid Use**: Formatting display values from raw data
- **Invalid Use**: Converting between incompatible API response formats
- **Invalid Use**: Working around TypeScript errors with type assertions

```typescript
// ✅ Valid transformation
const dateTransformer = (item: ItemWithStringDates): ItemWithDateObjects => ({
  ...item,
  createdAt: new Date(item.createdAt),
  updatedAt: new Date(item.updatedAt)
});

// ❌ Invalid type coercion
const responseTransformer = (response: EntityResponse): CollectionResponse => ({
  items: [response.data],
  total: 1,
  success: response.success
});
```

### Implementation Strategy

When refactoring to fix type issues:

1. Identify the root cause of the type incompatibility
2. Update the source type definitions
3. Make necessary changes to Zod schemas
4. Update any dependent code
5. Use TypeScript to verify that all parts of the system are type-compatible

[RULE] Always update core type definitions rather than creating transformation layers to work around type issues.

</section>

<section id="input-vs-full-schema-pattern">

## Input vs. Full Schema Pattern

All data structures in our system follow a consistent pattern that distinguishes between input schemas (for creating/updating records) and full schemas (for validating complete database documents):

### When to Use Input Schemas

- **Creating New Records**: Always use input schemas when validating data for new record creation
- **Updating Existing Records**: Use input schemas (or partial versions) when validating user-provided updates
- **Form Submissions**: Form data should be validated against input schemas
- **API Request Bodies**: Incoming API payload validation
- **Server Actions**: Creation and update operations should use input schemas

Input schemas intentionally omit system-managed fields like `_id`, `createdAt`, and `updatedAt` that get generated by MongoDB:

```typescript
// Input schema for validating user-provided data
export const EntityInputZodSchema = z.object({
  name: z.string(),
  description: z.string(),
  // No system fields
});
```
When to Use Full Schemas

Fetching Records: When validating data fetched from the database
Response Validation: Before sending data to the client
Search Results: Validating search or query results
Data Transformation: When processing complete database documents
Server-Side Validation: When validating complete model instances

Full schemas extend input schemas with system fields:

```typescript
// Full schema for validating complete database documents
export const EntityZodSchema = EntityInputZodSchema.extend({
  _id: z.string(),
  createdAt: zDateField.optional(),
  updatedAt: zDateField.optional(),
});
```
Implementation in CRUD Operations
In our CRUD utilities, the pattern should be consistently applied:

```typescript
// In server actions:
export async function createEntity(data: unknown) {
  return createItem(
    EntityModel,
    EntityInputZodSchema, // Use INPUT schema for creation
    data,
    ["/dashboard/entities"]
  );
}

export async function fetchEntity(id: string) {
  const entity = await EntityModel.findById(id);
  return EntityZodSchema.parse(entity); // Use FULL schema for validation
}
```

Common Pitfalls

Using full schemas for creation operations will result in validation errors because _id is required but not provided
Using input schemas for fetch operations won't validate system fields that should be present
Not importing both schema variants can lead to using the wrong schema
Forgetting to update both schemas when adding new fields

By following this pattern consistently, we maintain clear boundaries between client and server data requirements and avoid validation errors during database operations.
[RULE] Always use input schemas for creation and update operations, and full schemas for reading operations.
</section>

<section id="data-model-integration">
MongoDB Model Integration
MongoDB models are defined using the Zod schemas and stored in src/lib/data-schema/mongoose-schema/:

```typescript
import { SchoolZodSchema } from "@/lib/data-schema/zod-schema/core/school";
import mongoose from "mongoose";

const schemaFields = {
  schoolNumber: { type: String, required: true },
  district: { type: String, required: true },
  schoolName: { type: String, required: true },
  // Additional fields...
};

const SchoolSchema = new mongoose.Schema(schemaFields, { timestamps: true });

export const SchoolModel = mongoose.models.School || 
  mongoose.model("School", SchoolSchema);
```
[RULE] MongoDB models should reflect the structure defined in Zod schemas.
</section>
<section id="data-form-config">
Field Configuration System
Field configurations in src/lib/ui/forms/fieldConfig/ define how form fields should be rendered and validated:

```typescript
export const SchoolFieldConfig: Field<SchoolInput>[] = [
  {
    name: 'schoolNumber',
    label: 'School Number',
    type: 'text',
    required: true,
  },
  {
    name: 'district',
    label: 'District',
    type: 'text',
    required: true,
  },
  // Additional fields...
];
```
[RULE] Field configs should reference schema properties rather than redefining them.
</section>

<section id="data-form-overrides">
Form Overrides
Form overrides (src/lib/ui/forms/formOverrides/) allow customization of form behavior for specific contexts:

```typescript
export const SchoolOverrides: FieldOverrideMap<SchoolInput> = {
  district: {
    type: 'reference',
    label: 'District',
    url: '/api/districts',
    multiple: false,
  },
  // Additional overrides...
};
```
[RULE] Use form overrides to customize field behavior without modifying the base schema.
</section>
<section id="data-hooks">

## Data Flow: Custom Hooks

Our application uses a structured approach to hooks that follows our separation of concerns:

1. **Data Hooks**: Located in `src/hooks/data/`, these hooks manage data fetching, CRUD operations, and resource state. They serve as the primary interface between React components and server data.

2. **Domain Hooks**: Located in `src/hooks/domain/`, these hooks implement domain-specific logic and provide a centralized API for interacting with specific entity types.

3. **UI Hooks**: Located in `src/hooks/ui/`, these manage UI-specific state like pagination, filtering, and sorting.

4. **Error Hooks**: Located in `src/hooks/error/`, these provide standardized error handling for various operations.

5. **Debugging Hooks**: Located in `src/hooks/debugging/`, these provide development-time utilities for debugging and testing.

When using hooks:
- Prefer domain hooks in feature components
- Use data hooks when building new domain hooks
- Use UI hooks for managing UI-specific state
- Use error hooks to handle network and operation errors consistently

</section>

<section id="navigation-hooks">

## Navigation and Authorization Hooks

Our application provides specialized hooks for navigation and authorization management:

### useNavigation

Manages navigation state based on current route:

```typescript
import { useNavigation } from '@/hooks/ui/useNavigation'

export function NavigationComponent() {
  const { navigation, currentPage, pageInfo, breadcrumbs } = useNavigation()
  
  // Navigation items with current state
  // Page title and description
  // Breadcrumb trail
}
```
useAuthorizedNavigation
Extends navigation with permission-based filtering:

```typescript
import { useAuthorizedNavigation } from '@/hooks/ui/useAuthorizedNavigation'

export function SecureNavigation() {
  const { navigation, pageInfo } = useAuthorizedNavigation()
  
  // Only shows navigation items user has permission to access
}
```
These hooks integrate with:

Clerk authentication for user permissions
Dynamic route matching for current states
Centralized navigation configuration
Automatic breadcrumb generation

[RULE] Use authorization hooks in layouts to ensure navigation respects user permissions.
</section>

<section id="data-reference-hook">
Reference Data Hook
The useReferenceOptions hook handles fetching options for select components:

```typescript
function useReferenceOptions(url: string, searchQuery: string = "") {
  // Using SWR with proper error handling
  const { data, error, isLoading } = useSWR(
    searchQuery ? `${url}?search=${searchQuery}` : url,
    fetcher
  );
  
  // Safely transform data to options format using memoization
  const options = useMemo(() => {
    if (!data?.items) return [];
    
    return data.items.map(item => ({
      value: item._id,
      label: item.name || item.title || item.label || item.staffName || item.schoolName || String(item._id)
    }));
  }, [data]);
  
  return { options, error, isLoading };
}
```
[RULE] Use useReferenceOptions for all dropdown and multi-select inputs that fetch data.
[RULE] All API endpoints that serve reference data must return a standardized format with { items: [], total, success }.
</section>

<section id="data-server-actions">
Server Actions
Server actions in src/app/actions/ provide a way to perform server-side operations directly from client components:

```typescript
export async function createSchool(data: SchoolInput) {
  try {
    // Validate against schema
    const validated = SchoolInputZodSchema.parse(data);
    
    // Create in database
    const school = await SchoolModel.create(validated);
    
    // Return success response
    return { success: true, data: school };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error);
    }
    return handleServerError(error, "Failed to create school");
  }
}
```
[RULE] Always validate data with Zod schemas before database operations.
</section>

<section id="data-flow-diagram">
Data Flow Diagram
The data flows through our system in this sequence:

Zod Schema Definition: Define data structure and validation (/lib/data-schema/zod-schema/)
MongoDB Model Creation: Create database models based on schema (/lib/data-schema/mongoose-schema/)
Field Configuration: Define UI representation of data (/lib/ui/forms/fieldConfig/)
Server Actions/API Routes: Implement data operations (/app/actions/ or /app/api/)
React Hooks: Create data fetching and management hooks (/hooks/)
UI Components: Render data and handle user interactions (/components/)

[RULE] Follow this data flow sequence when implementing new features.
</section>

<section id="data-transformers">
Data Transformers
Data transformation utilities in src/lib/data-utilities/transformers/ help sanitize and validate data:

```typescript
// Sanitize a MongoDB document for client-side use
const safeDoc = sanitizeDocument(mongooseDoc, MyZodSchema);

// Validate against a schema and return null on error
const result = safeParseAndLog(MyZodSchema, data);

// Parse data and throw a formatted error if validation fails
const result = parseOrThrow(MyZodSchema, data);
```
[RULE] Use appropriate transformers when moving data between server and client.
</section>

<section id="data-consistency">
Maintaining Data Consistency
To ensure data consistency across the application:

Start with the Zod schema as the single source of truth
Generate TypeScript types from schemas using z.infer<typeof SchemaName>
Define MongoDB models that mirror the schema structure
Create field configurations and overrides based on the schema
Use transformers to sanitize data when crossing boundaries
Validate inputs against schemas at every entry point

[RULE] Apply these consistency practices at every layer of the application.
</section>

</doc>
```
