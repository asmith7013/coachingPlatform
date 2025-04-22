# API Response Standardization

This module provides utilities for standardizing API responses across the application to ensure consistent data structures, better error handling, and improved client-side integration.

## Key Features

- Standardize response formats from various sources
- Unified error handling across API routes
- Consistent data structure for SWR hooks
- Support for different response formats (arrays, objects, paginated results)

## Usage

### Standardizing API Responses

```typescript
import { standardizeResponse } from '@/lib/server-utils/standardizeResponse';

// Standardize an array of items
const data = [{ id: '1', name: 'Item 1' }, { id: '2', name: 'Item 2' }];
const standardized = standardizeResponse(data);
// Result: { items: [{ id: '1', name: 'Item 1' }, { id: '2', name: 'Item 2' }], total: 2, success: true }

// Standardize an object with items property
const objectData = { items: [{ id: '1', name: 'Item 1' }], total: 10 };
const standardized = standardizeResponse(objectData);
// Result: { items: [{ id: '1', name: 'Item 1' }], total: 10, success: true }
```

### Using withStandardResponse in API Routes

```typescript
import { withStandardResponse } from '@/lib/server-utils/standardizeResponse';
import { NextRequest } from 'next/server';

export const GET = withStandardResponse(async (request: NextRequest) => {
  // Get data from database or external API
  const items = await fetchItems();
  
  // Return data directly - withStandardResponse will format it
  return {
    items,
    total: items.length,
    // Other optional properties: page, limit, message
  };
});
```

## Standard Response Format

All API responses follow this structure:

```typescript
interface StandardResponse<T> {
  items: T[];           // Array of data items
  total?: number;       // Total count (for pagination)
  page?: number;        // Current page (for pagination)
  limit?: number;       // Items per page (for pagination)
  message?: string;     // Optional message
  success: boolean;     // Success status
}
```

## Error Handling

When an error occurs in a `withStandardResponse` wrapped route:

```json
{
  "items": [],
  "success": false,
  "message": "Error message details"
}
```

## Client-Side Integration

Use the `useReferenceOptions` hook for working with these standardized responses:

```typescript
import { useReferenceOptions } from '@/hooks/useReferenceOptions';

function MyComponent() {
  const { options, error, isLoading } = useReferenceOptions('/api/items');
  
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  
  return (
    <select>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
```

## Why Use This Approach?

1. **Consistency**: All API responses follow the same structure, making client-side development more predictable
2. **Error Handling**: Standardized error format makes error handling simpler
3. **Type Safety**: TypeScript types ensure correct data structures
4. **Performance**: Optimized for use with SWR and other data fetching libraries 