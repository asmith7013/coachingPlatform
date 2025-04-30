<doc id="sanitization-system">

# Data Sanitization System

<section id="sanitization-overview">

## Overview

Our application implements a robust sanitization system to ensure data safety, consistency, and security across the platform. This system handles the transformation of data between MongoDB and client-side code, with particular attention to document IDs, timestamps, and user input.

[RULE] Always sanitize data when moving between MongoDB and client-side code.

</section>

<section id="sanitization-functions">

## Sanitization Functions

### Document Sanitization

```typescript
import { sanitizeDocument, sanitizeDocuments } from "@/lib/utils/server/sanitize";

// Sanitize a single document
const safeDoc = sanitizeDocument(mongooseDoc, MyZodSchema);

// Sanitize an array of documents
const safeDocs = sanitizeDocuments(mongooseDocs);
```

The sanitization process:

Converts MongoDB ObjectIds to strings
Ensures timestamps are in proper Date format
Adds an id field that mirrors the _id field
Validates the output against the provided Zod schema

Filter Sanitization

```typescript
import { sanitizeFilters } from "@/lib/utils/server/sanitizeFilters";

// Clean up user-provided filter values before using in MongoDB queries
const safeFilters = sanitizeFilters({
  name: userProvidedName,
  tags: userProvidedTags,
  // Empty strings and arrays will be removed
  emptyValue: ""
});
```

The filter sanitization removes:

Empty strings
Whitespace-only strings
Empty arrays
null and undefined values

Other Sanitization Utilities

sanitizeString: Trims whitespace and removes empty strings
sanitizeStringArray: Trims whitespace and converts to lowercase
sanitizeSortBy: Ensures sort field is valid and not a direction term

[RULE] Always validate and sanitize user-provided query parameters before using them in database operations.
</section>

<section id="deep-sanitize">
Deep Sanitization
For complex nested objects, the deepSanitize function recursively processes the entire object tree:

```typescript
function deepSanitize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(deepSanitize);
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = k === '_id'
        ? (typeof v === 'string' ? v : (v as object)?.toString?.() ?? v)
        : deepSanitize(v);
    }
    return out;
  }
  return value;
}
```
This function handles:

Arrays of objects
Deeply nested objects
ObjectIds at any level of nesting
Mixed data types

[RULE] Use deep sanitization for complex data structures with unpredictable nesting.
</section>

<section id="safe-parsing">
Safe Parsing
In addition to sanitization, our system includes safe parsing utilities that combine validation and error handling:

```typescript
import { 
  safeParseAndLog,
  parseOrThrow,
  parsePartialOrThrow
} from "@/lib/utils/server/safeParse";

// Parse data without throwing (returns null on error)
const result = safeParseAndLog(MyZodSchema, data);

// Parse data and throw a formatted error if validation fails
const result = parseOrThrow(MyZodSchema, data);

// Parse partial data (for updates) and throw if validation fails
const result = parsePartialOrThrow(MyZodSchema, partialData);
```

[RULE] Use the appropriate parsing function based on the error handling requirements of your context.
</section>

</doc>