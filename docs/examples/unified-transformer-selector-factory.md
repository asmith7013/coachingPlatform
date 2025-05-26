# Selector Factory with Unified Transformer Implementation

## Overview

This document describes the updated `selector-factory.ts` that fully leverages the unified transformer system. The implementation eliminates duplicate transformation logic by having each selector function directly use the unified transformer functions (`transformData` and `transformSingleItem`) instead of creating intermediate transformer instances.

## Architecture

### Before: Base Transformer Approach

Previously, the selector factory created a base transformer instance and used its methods:

```typescript
// Old approach - creating transformer instance
const baseTransformer = createTransformer<T>({
  schema,
  errorContext: `${entityType}Selector`
});

const basic: SelectorFunction<T, T[]> = (data) => {
  const items = normalizeToArray<unknown>(data);
  return baseTransformer.transform(items);
};
```

### After: Direct Unified Transformer Usage

Now each selector function directly uses the unified transformer functions:

```typescript
// New approach - direct unified transformer usage
const basic: SelectorFunction<T, T[]> = (data) => {
  const items = normalizeToArray<unknown>(data);
  return transformData<T>(items, {
    schema,
    errorContext: `${entityType}.basic`
  });
};
```

## Key Components

### 1. Updated Selector Functions

#### Basic Selector
```typescript
const basic: SelectorFunction<T, T[]> = (data) => {
  try {
    // Use normalizeToArray utility to handle response formats
    const items = normalizeToArray<unknown>(data);
    return transformData<T>(items, {
      schema,
      errorContext: `${entityType}.basic`
    });
  } catch (error) {
    handleClientError(error, `${entityType}.basic`);
    return [];
  }
};
```

#### Detail Selector
```typescript
const detail: SelectorFunction<T, T | null> = (data) => {
  try {
    if (!data) return null;
    
    // Use normalizeToArray utility and get first item if available
    const items = normalizeToArray<unknown>(data);
    if (items.length === 0) return null;
    
    return transformSingleItem<T>(items[0], {
      schema,
      errorContext: `${entityType}.detail`
    });
  } catch (error) {
    handleClientError(error, `${entityType}.detail`);
    return null;
  }
};
```

#### With Dates Selector
```typescript
const withDates: SelectorFunction<T, WithDateObjects<T>[]> = (data) => {
  try {
    // Use normalizeToArray utility to handle response formats
    const items = normalizeToArray<unknown>(data);
    return transformData<T, WithDateObjects<T>>(items, {
      schema,
      handleDates: true, // Enable date handling
      errorContext: `${entityType}.withDates`
    });
  } catch (error) {
    handleClientError(error, `${entityType}.withDates`);
    return [];
  }
};
```

#### Reference Selector
```typescript
const reference: SelectorFunction<T, Array<{ value: string; label: string }>> = (data) => {
  try {
    // Use normalizeToArray utility to handle response formats
    const items = normalizeToArray<unknown>(data);
    
    // Transform the data with the unified transformer
    const transformedItems = transformData<T>(items, {
      schema,
      errorContext: `${entityType}.reference`
    });
    
    // Map to reference format
    return transformedItems.map(item => ({
      value: item._id,
      label: getEntityLabel(item)
    }));
  } catch (error) {
    handleClientError(error, `${entityType}.reference`);
    return [];
  }
};
```

#### Transform Selector with Domain Transform
```typescript
const transform = <R extends Record<string, unknown>>(
  transformFn: (item: T) => R
): SelectorFunction<T, R[]> => {
  return (data) => {
    try {
      // Use normalizeToArray utility to handle response formats
      const items = normalizeToArray<unknown>(data);
      
      // Use the unified transformer with custom domain transform
      return transformData<T, R>(items, {
        schema,
        domainTransform: transformFn,
        errorContext: `${entityType}.transform`
      });
    } catch (error) {
      handleClientError(error, `${entityType}.transform`);
      return [];
    }
  };
};
```

#### Options Selector
```typescript
const withOptions = (options: Partial<TransformOptions<T>>): SelectorFunction<T, T[]> => {
  return (data) => {
    try {
      // Use normalizeToArray utility to handle response formats
      const items = normalizeToArray<unknown>(data);
      
      // Use the unified transformer with provided options
      return transformData<T>(items, {
        schema,
        ...options,
        errorContext: options.errorContext || `${entityType}.withOptions`
      });
    } catch (error) {
      handleClientError(error, `${entityType}.withOptions`);
      return [];
    }
  };
};
```

### 2. Integrated Selector Registry

The selector registry is now integrated into the selector factory for better cohesion:

```typescript
/**
 * Registry for entity selectors
 */
class SelectorRegistry {
  private selectors = new Map<string, EntitySelector<BaseDocument>>();
  
  /**
   * Register a selector for an entity type
   */
  register<T extends BaseDocument>(
    entityType: string,
    schema: ZodSchema<T>
  ): EntitySelector<T> {
    const selector = createEntitySelector<T>(entityType, schema);
    this.selectors.set(entityType, selector as EntitySelector<BaseDocument>);
    return selector;
  }
  
  /**
   * Get a selector for an entity type
   */
  get<T extends BaseDocument>(
    entityType: string,
    schema?: ZodSchema<T>
  ): EntitySelector<T> {
    if (this.selectors.has(entityType)) {
      return this.selectors.get(entityType) as EntitySelector<T>;
    }
    
    if (!schema) {
      throw new Error(`No selector registered for "${entityType}" and no schema provided`);
    }
    
    return this.register(entityType, schema);
  }
}

// Export a singleton instance
export const selectorRegistry = new SelectorRegistry();
```

## Usage Examples

### Basic Entity Selection

```typescript
import { getSelector } from '@query/client/selectors/selector-factory';
import { SchoolZodSchema } from '@zod-schema/core/school';

// Get or create a selector for schools
const schoolSelector = getSelector('schools', SchoolZodSchema);

// Use basic transformation
const schools = schoolSelector.basic(schoolData);

// Use detail transformation for single item
const school = schoolSelector.detail(singleSchoolData);
```

### Date Handling

```typescript
// Transform with date handling enabled
const schoolsWithDates = schoolSelector.withDates(schoolData);
// Result: School objects with Date objects instead of strings
```

### Reference Format

```typescript
// Transform for dropdown/select components
const schoolOptions = schoolSelector.reference(schoolData);
// Result: [{ value: "id1", label: "School Name 1" }, ...]
```

### Custom Transformations

```typescript
// Custom transformation with domain transform
const customTransform = schoolSelector.transform((school) => ({
  id: school._id,
  name: school.schoolName,
  district: school.district,
  studentCount: school.staffList?.length || 0
}));

const customSchools = customTransform(schoolData);
```

### Advanced Options

```typescript
// Use with custom options
const advancedSelector = schoolSelector.withOptions({
  handleDates: true,
  strictValidation: true,
  errorContext: 'SchoolAdvancedTransform'
});

const schools = advancedSelector(schoolData);
```

### Paginated Data

```typescript
// Handle paginated responses
const paginatedResult = schoolSelector.paginated(paginatedResponse);
// Result: { items: School[], pagination: { total, page, limit, totalPages } }
```

## Benefits

### 1. **Direct Unified Transformer Integration**
- Each selector function directly uses `transformData` or `transformSingleItem`
- Eliminates intermediate transformer instance creation
- Consistent transformation behavior across all selectors

### 2. **Simplified Implementation**
- Removed the `baseTransformer` creation at the top level
- Each function creates its own transformation options
- Cleaner, more focused code

### 3. **Enhanced Error Context**
- Each selector function provides specific error context
- Better debugging and error tracking
- Consistent error handling patterns

### 4. **Flexible Options Handling**
- Direct access to all unified transformer options
- Custom domain transforms through the `transform` function
- Advanced options through the `withOptions` function

### 5. **Registry Integration**
- Selector registry integrated into the factory for better cohesion
- Efficient caching of selectors by entity type
- Consistent API for selector management

### 6. **Type Safety**
- Strong TypeScript typing throughout
- Proper generic constraints
- Clear type boundaries between input and output

## Architecture Benefits

### Single Source of Truth
All transformations now go through the unified transformer system:
- Consistent validation logic
- Unified error handling
- Shared caching mechanisms
- Common date handling

### Elimination of Duplication
- No more duplicate transformation logic across selector functions
- Single implementation of response format handling
- Consistent options processing

### Performance Improvements
- Direct function calls instead of method calls on transformer instances
- Reduced object creation overhead
- Better memory usage patterns

## Migration Benefits

### From Previous Implementation

**Before:**
```typescript
// Multiple transformer instances and method calls
const baseTransformer = createTransformer<T>({ schema, errorContext: `${entityType}Selector` });
return baseTransformer.transform(items);
```

**After:**
```typescript
// Direct unified transformer usage
return transformData<T>(items, {
  schema,
  errorContext: `${entityType}.basic`
});
```

### Key Improvements

1. **Simplified Logic**: Direct function calls instead of transformer instances
2. **Better Error Context**: Function-specific error contexts for better debugging
3. **Enhanced Features**: Full access to unified transformer capabilities
4. **Consistent Behavior**: All selectors use the same transformation pipeline
5. **Maintainability**: Easier to understand and modify

## Error Handling

Each selector function includes comprehensive error handling:

```typescript
try {
  // Transformation logic
  return transformData<T>(items, options);
} catch (error) {
  handleClientError(error, `${entityType}.functionName`);
  return []; // or appropriate fallback
}
```

### Error Context Hierarchy
- `${entityType}.basic` - Basic collection transformation
- `${entityType}.detail` - Single entity transformation
- `${entityType}.withDates` - Date-enabled transformation
- `${entityType}.reference` - Reference format transformation
- `${entityType}.paginated` - Paginated response transformation
- `${entityType}.transform` - Custom transformation
- `${entityType}.withOptions` - Options-based transformation

## Integration with Existing Systems

### Hook Helpers Integration
The selector system integrates seamlessly with the updated hook helpers:

```typescript
// Hook helpers can use selectors through the unified transformer
const transformedData = transformItems(data, schema, {
  useSelector: true,
  entityType: 'schools',
  errorContext: 'SchoolHook'
});
```

### Response Format Support
All existing response formats are supported:
- **Collection Responses**: `{ items: [...], total: 100 }`
- **Paginated Responses**: `{ items: [...], page: 1, limit: 10, total: 100 }`
- **Entity Responses**: `{ data: {...} }`
- **Arrays**: `[...]`
- **Single Items**: `{...}`

## Future Enhancements

The unified transformer integration enables:

1. **Advanced Caching**: Selector-level caching strategies
2. **Batch Processing**: Optimized batch selector operations
3. **Custom Pipelines**: User-defined selector pipelines
4. **Performance Monitoring**: Built-in performance tracking for selectors
5. **Validation Enhancements**: Advanced validation options per selector

## Conclusion

The updated selector factory successfully eliminates duplicate transformation logic while maintaining all specialized selector functionality. By directly using the unified transformer functions, the implementation is simpler, more maintainable, and provides consistent behavior across all selector operations. The integrated registry ensures efficient caching while the specialized selector functions provide the domain-specific operations that make the selector system valuable. 