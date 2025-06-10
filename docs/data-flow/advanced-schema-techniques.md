# Advanced Schema Techniques

## Overview

This document covers advanced schema patterns and compatibility utilities for complex scenarios that go beyond basic schema definitions. These techniques should be used when core schema patterns are insufficient for specific use cases.

**[RULE]** Before using advanced techniques, always ask: "Could I fix the base schema instead?"

## Schema Composition and Extension

### Complex Schema Composition

For entities with multiple inheritance or shared behaviors:

```typescript
// Base behavior schemas
const TimestampedSchema = z.object({
  createdAt: zDateField.optional(),
  updatedAt: zDateField.optional(),
});

const OwnedSchema = z.object({
  owners: z.array(z.string()).default([]),
  createdBy: z.string().optional(),
});

// Compose complex schemas
export const ComplexEntityZodSchema = z.object({
  _id: z.string(),
  name: z.string(),
}).merge(TimestampedSchema).merge(OwnedSchema);
```

### Schema Extension Patterns

Extend existing schemas while maintaining type safety:

```typescript
// Base entity
export const BaseEntityZodSchema = z.object({
  _id: z.string(),
  name: z.string(),
  description: z.string().optional(),
});

// Extended entity with additional fields
export const ExtendedEntityZodSchema = BaseEntityZodSchema.extend({
  category: z.string(),
  metadata: z.record(z.string(), z.any()).optional(),
  settings: z.object({
    enabled: z.boolean().default(true),
    priority: z.number().default(1),
  }).optional(),
});
```

## Schema Compatibility Utilities

### ensureBaseDocumentCompatibility Function

The `ensureBaseDocumentCompatibility` function bridges the gap between complex Zod schemas and TypeScript's type system when working with CRUD factories:

```typescript
import { ensureBaseDocumentCompatibility } from "@zod-schema/shared/base-schemas";

// Complex Zod schema with defaults, optionals, and transformations
const SchoolZodSchema = BaseDocumentSchema.merge(z.object({
  schoolName: z.string(),
  district: z.string(),
  owners: z.array(z.string()).default([]), // Has default
  address: z.string().optional(), // Optional field
  gradeLevelsSupported: z.array(GradeLevelsSupportedZod).transform(...) // Has transform
}));

// Use compatibility function when type constraints are too strict
const compatibleSchema = ensureBaseDocumentCompatibility<School>(SchoolZodSchema);
```

### When to Use ensureBaseDocumentCompatibility

Use this function in these specific scenarios:

1. **CRUD Factory Integration**: When passing schemas to the CRUD factory that expects exact BaseDocument types
2. **Transformer Utilities**: When working with transformer functions that have strict type constraints
3. **Generic Function Parameters**: When passing schemas to generic functions that expect BaseDocument-compatible types

```typescript
export const schoolActions = createCrudActions({
  model: SchoolModel,
  schema: ensureBaseDocumentCompatibility<School>(SchoolZodSchema),
  inputSchema: ensureBaseDocumentCompatibility<SchoolInput>(SchoolInputZodSchema),
  // other config...
});
```

### What This Function Does

The compatibility function performs a **type assertion only** - it doesn't modify the schema at runtime:

- **Runtime**: The original schema validation logic remains unchanged
- **Compile-time**: TypeScript treats the schema as compatible with BaseDocument constraints
- **Safety**: Maintains type safety while allowing complex schemas to work with strict interfaces

**[RULE]** Use `ensureBaseDocumentCompatibility` only when working with utilities that have strict BaseDocument type constraints, not for general schema validation.

## Complex Validation Scenarios

### Conditional Schema Validation

For schemas that change based on runtime conditions:

```typescript
const ConditionalSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('basic'),
    name: z.string(),
  }),
  z.object({
    type: z.literal('advanced'),
    name: z.string(),
    advancedOptions: z.object({
      features: z.array(z.string()),
      settings: z.record(z.string(), z.any()),
    }),
  }),
]);
```

### Dynamic Schema Validation

For schemas that adapt to different contexts:

```typescript
function createDynamicSchema<T>(baseSchema: ZodSchema<T>, extensions: Record<string, ZodTypeAny>) {
  return baseSchema.merge(z.object(extensions));
}

// Usage
const dynamicEntitySchema = createDynamicSchema(BaseEntityZodSchema, {
  customField: z.string().optional(),
  dynamicData: z.any().optional(),
});
```

## Schema Transformations

### Data Transformation Patterns

When legitimate data transformation is needed (not type coercion):

```typescript
// Valid transformation: string dates to Date objects
const DateTransformSchema = z.object({
  createdAt: z.string().transform(str => new Date(str)),
  updatedAt: z.string().transform(str => new Date(str)),
});

// Valid transformation: formatting display values
const DisplayTransformSchema = z.object({
  name: z.string().transform(str => str.trim().toLowerCase()),
  tags: z.array(z.string()).transform(tags => tags.filter(Boolean)),
});
```

### When NOT to Use Transformations

Avoid transformations for these scenarios:

```typescript
// ❌ Invalid: Type coercion to work around incompatible APIs
const responseTransformer = (response: EntityResponse): CollectionResponse => ({
  items: [response.data],
  total: 1,
  success: response.success
});

// ✅ Valid: Fix the API response format instead
// Update the API to return proper CollectionResponse
```

## Legacy Schema Integration

### Migrating Existing Schemas

When working with legacy data structures:

```typescript
// Legacy data format
interface LegacyEntity {
  id: string; // Different field name
  title: string; // Different field name
  created: string; // Different format
}

// Migration schema
const LegacyEntityMigrationSchema = z.object({
  id: z.string(),
  title: z.string(),
  created: z.string(),
}).transform((legacy): Entity => ({
  _id: legacy.id,
  name: legacy.title,
  createdAt: new Date(legacy.created),
  updatedAt: new Date(),
}));
```

### Backward Compatibility Patterns

For maintaining compatibility during schema evolution:

```typescript
// Support both old and new formats
const CompatibleEntitySchema = z.union([
  // New format
  EntityZodSchema,
  // Old format with transformation
  LegacyEntitySchema.transform(transformToNewFormat)
]);
```

## Performance Optimization

### Schema Memoization

For expensive schema operations:

```typescript
const memoizedSchema = useMemo(() => 
  createComplexSchema(baseConfig, dynamicOptions), 
  [baseConfig, dynamicOptions]
);
```

### Lazy Schema Evaluation

For conditional schema loading:

```typescript
const getLazySchema = (type: EntityType) => {
  return type === 'complex' 
    ? ComplexEntitySchema 
    : SimpleEntitySchema;
};
```

## Error Handling Patterns

### Custom Error Messages

For better user experience:

```typescript
const UserFriendlySchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  age: z.number().min(18, "Must be at least 18 years old"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
```

### Schema Error Recovery

For graceful degradation:

```typescript
function safeSchemaValidation<T>(schema: ZodSchema<T>, data: unknown): T | null {
  try {
    return schema.parse(data);
  } catch (error) {
    console.warn('Schema validation failed:', error);
    return null;
  }
}
```

## Advanced Implementation Strategy

When implementing advanced schema techniques:

1. **Identify the Core Issue**: Determine if the problem requires advanced techniques or can be solved by updating base schemas
2. **Choose the Right Pattern**: Select the most appropriate advanced technique for the specific use case
3. **Maintain Type Safety**: Ensure all advanced patterns preserve TypeScript type safety
4. **Document the Rationale**: Clearly document why advanced techniques were necessary
5. **Test Thoroughly**: Advanced patterns require more comprehensive testing

**[RULE]** Modify base types rather than creating transformers - ask "Could I fix the schema instead?" before implementing advanced techniques. 