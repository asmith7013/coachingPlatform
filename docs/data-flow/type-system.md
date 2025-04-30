<doc id="typescript-patterns">

# TypeScript Patterns

<section id="type-system-overview">

## Overview

Our application uses TypeScript to provide strong type safety across all layers. This document outlines the standardized patterns for working with types in our codebase.

[RULE] Follow these patterns consistently to maintain type safety and code clarity.

</section>

<section id="type-organization">

## Type Organization

Types are organized in a central location under `src/lib/types/`:
src/lib/types/
├── core/           # Core type definitions
├── response/       # API response types
└── utilities/      # Type utilities

[RULE] Always import types from this central location rather than creating duplicate definitions.

</section>

<section id="type-imports">

## Type Import Patterns

Import types from the central location using consistent patterns:

```typescript
// Recommended import pattern
import { PaginatedResponse, ResourceResponse } from "@/lib/types/core/response";

// Or using barrel files
import { PaginatedResponse } from "@/lib/types";
```
[RULE] Use the path alias @/lib/types for all type imports to maintain consistency.
</section>

<section id="type-extension">
Type Extension
Use interface extension instead of duplicating properties:

```typescript
// Good: Using extension
interface MyCustomResponse extends BaseResponse {
  // Only add the new properties
  customField: string;
}

// Bad: Duplicating properties
interface MyCustomResponse {
  success: boolean;  // Duplicated from BaseResponse
  message?: string;  // Duplicated from BaseResponse
  customField: string;
}
```
[RULE] Extend existing interfaces instead of duplicating their properties.
</section>

<section id="zod-inference">
Zod Inference
Use Zod inference consistently for all schema-derived types:

```typescript
// Create a utility for this
import { ZodInfer } from "@/lib/types/utilities";

// Use the utility consistently
type School = ZodInfer<typeof SchoolZodSchema>;
type Visit = ZodInfer<typeof VisitZodSchema>;
```
[RULE] Use the ZodInfer utility for all schema-derived types to maintain consistency.
</section>

<section id="type-documentation">
Type Documentation
Document relationships between types with JSDoc comments:

```typescript
/**
 * Visit represents a coaching visit to a school
 * @see School - The school where this visit occurred
 * @see Staff - The staff members involved in this visit
 * @see CoachingLog - Associated coaching log entries
 */
export type Visit = ZodInfer<typeof VisitZodSchema>;
```
[RULE] Add JSDoc comments to document relationships between complex types.
</section>

<section id="utility-types">
Utility Types
Create reusable utility types for common patterns:

```typescript
// Example utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncResult<T> = Promise<Result<T>>;

// Result type for operations
export type Result<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
```
[RULE] Use utility types to avoid repetitive type patterns.
</section>

</doc>
