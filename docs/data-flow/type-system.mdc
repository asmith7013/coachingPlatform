
```markdown
<doc id="type-system">

# Type System Organization

<section id="type-system-overview">

## Overview

Our application uses a structured approach to TypeScript types that ensures consistency, maintainability, and avoids duplication. This document outlines exactly where types should be defined and imported from.

[RULE] Follow these type organization patterns for all new development.

</section>

<section id="core-type-system">

## Core Type System

Our type system is built on foundational interfaces in the `src/lib/types/core/` directory that promote code reuse and consistency:

### Base Types

Rather than redefining common fields, we use a layered inheritance model:

```typescript
// Base identity for all document-like types
interface Identifiable {
  _id: string | Types.ObjectId;
  id?: string;
}

// Base document extending identifiable with timestamps
interface DocumentBase extends Identifiable {
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// MongoDB document with owners array
interface BaseDocument extends DocumentBase {
  owners?: string[];
}
```

These core types are extended rather than duplicated across the system.

### Response Types

Standardized response types ensure consistent API communication:

```typescript
// Base response interface
interface BaseResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Collection response for multiple resources
interface CollectionResponse<T> extends BaseResponse {
  items: T[];
  total: number;
}

// Entity response for single resources
interface EntityResponse<T> extends BaseResponse {
  data: T;
}
```

### Type Utilities

We employ utility types to avoid repetition:

```typescript
// Get document input type by removing system fields
type DocumentInput<T extends BaseDocument> = Omit<T, '_id' | 'id' | 'createdAt' | 'updatedAt'>;

// Convert string dates to Date objects
type WithDateObjects<T> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: Date;
  updatedAt?: Date;
};
```

[RULE] Always use and extend core types rather than creating duplicates.

</section>

<section id="type-composition">

## Type Composition Patterns

We use composition over inheritance for complex types:

### Token-Based Component Props

For UI components, we compose prop interfaces from shared token types:

```typescript
// Button component props
interface ButtonStyleProps extends 
  InteractiveComponentProps,   // Shared interactive behavior
  TextStyleProps,              // Text styling tokens
  SpacingProps,                // Spacing tokens
  ShapeProps {                 // Shape tokens
  intent?: 'primary' | 'secondary' | 'danger';
  appearance?: 'solid' | 'outline' | 'ghost';
}
```

### Query System Types

Our query system uses composable types:

```typescript
// Base pagination parameters
interface PaginationBase {
  page?: number;
  limit?: number;
}

// Extended query parameters build on pagination
interface QueryBase extends PaginationBase {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Full query params with filtering and search
interface QueryParams extends QueryBase {
  filters?: Record<string, unknown>;
  search?: string;
  // Additional fields...
}
```

[RULE] Build complex types through composition of smaller, focused interfaces.

</section>

<section id="type-utilities">

## Type Utility Functions

We provide utility functions alongside types to maintain consistency:

```typescript
// Convert MongoDB document to client-safe format
export const DocumentUtils = {
  toClient<T extends BaseDocument>(doc: T): T & { id: string } {
    const idStr = typeof doc._id === 'string' ? doc._id : doc._id.toString();
    return {
      ...doc,
      _id: idStr,
      id: idStr
    };
  },
  
  // Additional utility functions...
};

// Create reference objects consistently
export function createReferenceMapper<T, R extends BaseReference>(
  getLabelFn: (entity: T) => string,
  getAdditionalFields?: (entity: T) => Partial<Omit<R, '_id' | 'label' | 'value'>>
) {
  return (entity: T & { _id: string }): R => {
    // Implementation...
  };
}
```

These utilities ensure that type transformations are consistent across the application.

[RULE] Use the provided utility functions rather than implementing manual transformations.

</section>

<section id="backward-compatibility">

## Type Backward Compatibility

As we refine our type system, we maintain backward compatibility:

```typescript
// Modern naming
export interface QueryParams extends QueryBase {
  filters?: Record<string, unknown>;
}

// Legacy support
/** @deprecated Use QueryParams instead */
export type FetchParams = QueryParams;
/** @deprecated Use DEFAULT_QUERY_PARAMS instead */
export const DEFAULT_FETCH_PARAMS = DEFAULT_QUERY_PARAMS;
```

When renaming interfaces or changing patterns, we preserve backward compatibility through type aliases and re-exports.

[RULE] When refactoring types, always provide backward compatibility through proper deprecation patterns.

</section>

<section id="avoiding-duplicates">

## Avoiding Type Duplication

To prevent type duplication across the codebase:

1. **Single Source of Truth**: Define types once in the most appropriate location
2. **Re-export Strategy**: Export types through index files for convenient imports
3. **Type Inference**: Use `z.infer<typeof SchemaName>` to derive types from Zod schemas
4. **Type Extensions**: Extend base types rather than redefining common fields
5. **Mapper Functions**: Use type-safe mapper functions for transformations

Example of avoiding duplicates:

```typescript
// BAD: Duplicating types
interface SchoolResponse {
  success: boolean;
  data: School;
  error?: string;
}

// GOOD: Composing from existing types
type SchoolResponse = EntityResponse<School>;
```

[RULE] Check for existing types before creating new ones, and use composition when possible.

</section>

</doc>
```
