# Hook Helpers with Unified Transformer Implementation

## Overview

This document describes the implementation of updated `hook-helpers.ts` that leverages the unified transformer system while maintaining backward compatibility and the existing API. The implementation provides a bridge between the existing hook helper interface and the new unified transformer architecture.

## Architecture

### Before: Direct Schema Validation and Selector Usage

Previously, `hook-helpers.ts` used different transformation strategies:

```typescript
// Old approach - conditional logic for different strategies
if (options?.useSelector && options.entityType) {
  const selector = getSelector<T>(options.entityType, schema);
  return selector.basic(items) as unknown as R[];
} else {
  return transformItemsWithSchema<T>(items as unknown[], schema) as unknown as R[];
}
```

### After: Unified Transformer Integration

Now all transformations go through the unified transformer:

```typescript
// New approach - unified transformation pipeline
const unifiedOptions = convertToUnifiedOptions<T, R>(schema, options);
return transformData<T, R>(items, unifiedOptions);
```

## Key Components

### 1. Options Adapter Function

The `convertToUnifiedOptions` function bridges between the existing `TransformationOptions` and the new `TransformOptions`:

```typescript
function convertToUnifiedOptions<T extends BaseDocument, R extends Record<string, unknown> = T>(
  schema: ZodSchema<T>,
  options?: TransformationOptions<T>
): TransformOptions<T, R> {
  const unifiedOptions: TransformOptions<T, R> = {
    schema,
    handleDates: true, // Always handle dates by default
    errorContext: options?.errorContext || 'transform',
    strictValidation: false // Use safe validation by default
  };
  
  // Handle selector-based transformations
  if (options?.useSelector && (options.entityType || options.selector)) {
    try {
      const selector = options.selector || 
        (options.entityType ? getSelector<T>(options.entityType, schema) : undefined);
      
      if (selector) {
        // Use the selector's transform function as the domain transform
        unifiedOptions.domainTransform = (item: T) => {
          const transformed = selector.transform(item => item)([item])[0];
          return transformed as unknown as R;
        };
      }
    } catch (error) {
      console.error(`Error setting up selector-based transform: ${options.errorContext || ''}`, error);
      // Continue without domain transform if selector setup fails
    }
  }
  
  return unifiedOptions;
}
```

### 2. Updated Core Functions

#### `transformItems<T, R>`

```typescript
export function transformItems<T extends BaseDocument, R extends Record<string, unknown> = T>(
  data: unknown,
  schema: ZodSchema<T>,
  options?: TransformationOptions<T>
): R[] {
  try {
    // Extract items from the data
    const items = extractNormalizedItems<T>(data);
    
    // Convert to unified transformer options
    const unifiedOptions = convertToUnifiedOptions<T, R>(schema, options);
    
    // Use the unified transformer
    return transformData<T, R>(items, unifiedOptions);
  } catch (error) {
    console.error(`Error in transformItems: ${options?.errorContext || ''}`, error);
    return [] as unknown as R[];
  }
}
```

#### `transformSingleItem<T, R>`

```typescript
export function transformSingleItem<T extends BaseDocument, R extends Record<string, unknown> = T>(
  data: unknown,
  schema: ZodSchema<T>,
  options?: TransformationOptions<T>
): R | null {
  try {
    // Extract single item from the data
    const item = extractSingleItem<T>(data);
    
    if (!item) return null;
    
    // Convert to unified transformer options
    const unifiedOptions = convertToUnifiedOptions<T, R>(schema, options);
    
    // Use the unified transformer
    return transformSingleItemUnified<T, R>(item, unifiedOptions);
  } catch (error) {
    console.error(`Error in transformSingleItem: ${options?.errorContext || ''}`, error);
    return null;
  }
}
```

### 3. Response Transformation Functions

All response transformation functions now use the unified transformer's specialized response functions:

```typescript
// Collection responses
return transformResponseData<T, R>(
  response as CollectionResponse<unknown>,
  unifiedOptions
);

// Entity responses
return transformEntityData<T, R>(
  response as EntityResponse<unknown>,
  unifiedOptions
);
```

## Usage Examples

### Basic Item Transformation

```typescript
import { transformItems } from '@query/client/utilities/hook-helpers';
import { SchoolZodSchema } from '@zod-schema/core/school';

// Transform array of school data
const schools = transformItems(
  schoolData,
  SchoolZodSchema,
  { errorContext: 'SchoolTransformation' }
);
```

### Selector-Based Transformation

```typescript
// Use selector system for transformation
const transformedSchools = transformItems(
  schoolData,
  SchoolZodSchema,
  {
    useSelector: true,
    entityType: 'schools',
    errorContext: 'SchoolSelectorTransform'
  }
);
```

### Custom Selector Transformation

```typescript
import { getSelector } from '@query/client/selectors/selector-registry';

const customSelector = getSelector('schools', SchoolZodSchema);
const schools = transformItems(
  schoolData,
  SchoolZodSchema,
  {
    useSelector: true,
    selector: customSelector,
    errorContext: 'CustomSchoolTransform'
  }
);
```

### Response Transformation

```typescript
// Transform paginated response
const paginatedSchools = transformPaginatedResponse(
  paginatedResponse,
  SchoolZodSchema,
  { errorContext: 'PaginatedSchools' }
);

// Transform collection response
const collectionSchools = transformCollectionResponse(
  collectionResponse,
  SchoolZodSchema,
  { errorContext: 'CollectionSchools' }
);

// Transform entity response
const singleSchool = transformEntityResponse(
  entityResponse,
  SchoolZodSchema,
  { errorContext: 'SingleSchool' }
);
```

## Benefits

### 1. **Unified Architecture**
- All transformations now go through the same pipeline
- Consistent behavior across different transformation types
- Leverages the full power of the unified transformer

### 2. **Enhanced Features**
- **Date Handling**: Automatic date field processing
- **Caching**: Built-in memoization for performance
- **Domain Transforms**: Support for custom transformations
- **Error Handling**: Comprehensive error management

### 3. **Backward Compatibility**
- Existing API remains unchanged
- All existing function signatures preserved
- Legacy function aliases maintained
- No breaking changes for consumers

### 4. **Type Safety**
- Strong TypeScript constraints
- Proper generic type inference
- Clear type boundaries between input and output

### 5. **Performance Improvements**
- Built-in caching reduces redundant transformations
- Optimized transformation pipeline
- Reduced memory allocations

## Migration Benefits

### From Old Implementation

**Before:**
```typescript
// Multiple transformation strategies
if (options?.useSelector && options.entityType) {
  const selector = getSelector<T>(options.entityType, schema);
  return selector.basic(items) as unknown as R[];
} else if (options?.useSelector && options.selector) {
  return options.selector.basic(items) as unknown as R[];
} else {
  return transformItemsWithSchema<T>(items as unknown[], schema) as unknown as R[];
}
```

**After:**
```typescript
// Single unified approach
const unifiedOptions = convertToUnifiedOptions<T, R>(schema, options);
return transformData<T, R>(items, unifiedOptions);
```

### Key Improvements

1. **Simplified Logic**: Single transformation path instead of multiple conditional branches
2. **Enhanced Features**: Access to date handling, caching, and domain transforms
3. **Better Error Handling**: Consistent error management across all transformation types
4. **Performance**: Built-in optimizations and caching
5. **Maintainability**: Easier to understand and modify

## Error Handling

The implementation maintains robust error handling:

```typescript
try {
  // Transformation logic
  return transformData<T, R>(items, unifiedOptions);
} catch (error) {
  // Log error with context for debugging
  console.error(`Error in transformItems: ${options?.errorContext || ''}`, error);
  return [] as unknown as R[];
}
```

### Error Context

All functions support error context for better debugging:

```typescript
const schools = transformItems(
  schoolData,
  SchoolZodSchema,
  { errorContext: 'SchoolListComponent' }
);
```

## Type Safety

### Generic Constraints

All functions now use proper TypeScript constraints:

```typescript
export function transformItems<
  T extends BaseDocument, 
  R extends Record<string, unknown> = T
>(
  data: unknown,
  schema: ZodSchema<T>,
  options?: TransformationOptions<T>
): R[]
```

### Entity Response Handling

Entity responses properly handle nullable data:

```typescript
export function transformEntityResponse<
  T extends BaseDocument, 
  R extends Record<string, unknown> = T
>(
  response: EntityResponse<T> | unknown,
  schema: ZodSchema<T>,
  options?: TransformationOptions<T>
): EntityResponse<R | null>
```

## Integration with Existing Systems

### Selector System Integration

The implementation seamlessly integrates with the existing selector system:

```typescript
// Selector-based transformation is handled through domain transforms
if (options?.useSelector && (options.entityType || options.selector)) {
  const selector = options.selector || getSelector<T>(options.entityType, schema);
  
  unifiedOptions.domainTransform = (item: T) => {
    const transformed = selector.transform(item => item)([item])[0];
    return transformed as unknown as R;
  };
}
```

### Response Format Support

All existing response formats are supported:

- **Collection Responses**: `{ items: [...], total: 100 }`
- **Paginated Responses**: `{ items: [...], page: 1, limit: 10, total: 100 }`
- **Entity Responses**: `{ data: {...} }`
- **Arrays**: `[...]`
- **Single Items**: `{...}`

## Future Enhancements

The unified transformer integration enables future improvements:

1. **Advanced Caching**: More sophisticated caching strategies
2. **Batch Processing**: Optimized batch transformation operations
3. **Custom Pipelines**: User-defined transformation pipelines
4. **Performance Monitoring**: Built-in performance tracking
5. **Validation Enhancements**: Advanced validation options

## Conclusion

The updated `hook-helpers.ts` successfully integrates with the unified transformer system while maintaining full backward compatibility. This implementation provides enhanced features, better performance, and a foundation for future improvements while preserving the existing API that consumers depend on. 