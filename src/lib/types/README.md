# Centralized Type System

This directory contains a centralized type system for the AI Coaching Platform. It provides standardized, reusable type definitions that help ensure consistency and type safety across the codebase.

## Directory Structure

The type system is organized into subdirectories:

- **`core/`** - Fundamental types used across the codebase
  - `api.ts` - API-related types like fetch parameters and error structures
  - `document.ts` - Base document types for database models
  - `pagination.ts` - Types for pagination
  - `response.ts` - Standardized API response types
  - `utils.ts` - General utility types
  
- **`domain/`** - Domain-specific types modeling business entities
  - `staff.ts` - Staff member types
  - `school.ts` - School-related types
  - `look-for.ts` - Look-for types
  - `visit.ts` - Visit types
  
- **`ui/`** - Types for UI components and user interfaces
  - `form.ts` - Form field and configuration types
  - `table.ts` - Table component types

## Usage Guidelines

### Importing Types

Import types directly from the appropriate module:

```typescript
// Import specific types from their modules
import { BaseDocument } from '@/lib/types/core/document';
import { PaginatedResponse } from '@/lib/types/core/response';

// Or use the barrel files for convenience
import { BaseDocument, PaginatedResponse } from '@/lib/types/core';
```

### Adding New Types

1. Place new types in the appropriate subdirectory based on their purpose
2. Update the corresponding barrel file (`index.ts`) if needed
3. Document types with JSDoc comments

### Domain-Specific Types

When moving or creating domain-specific types:

1. Group related types in the appropriate domain file
2. Ensure the types extend the base types where applicable
3. Remove duplicate or redundant type definitions
4. Update imports across the codebase to use the new type locations

## Migration Plan

The type system is being implemented in phases:

1. **Phase 1**: Create the directory structure and core types (current)
2. **Phase 2**: Manually migrate domain-specific types from existing locations
3. **Phase 3**: Update imports throughout the codebase
4. **Phase 4**: Remove deprecated type files once all references are updated

## Best Practices

- Use JSDoc comments to document types
- Extend base types rather than duplicating them
- Use generic types where appropriate for reusability
- Keep interfaces focused and single-purpose
- Use type guards to ensure type safety 