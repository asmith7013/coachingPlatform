# Consolidated Reference Selectors Implementation

## Overview

This document describes the implementation of consolidated reference logic in the AI Coaching Platform's selector system. All reference transformation logic has been moved to `reference-selectors.ts` as the single source of truth, eliminating duplication from `selector-factory.ts` and `standard-selectors.ts`.

## Architecture

### Before: Duplicated Reference Logic

Previously, reference transformation logic was scattered across multiple files:

```typescript
// In selector-factory.ts
const reference = (data) => {
  const referenceTransformer = createReferenceTransformer(getEntityLabel);
  const items = normalizeToArray(data);
  const transformedItems = baseTransformer.transform(items);
  return transformedItems.map(item => ({
    value: item._id,
    label: referenceTransformer(item).label
  }));
};

// In standard-selectors.ts  
const referenceTransformer = createReferenceTransformer(getEntityLabel);
reference: (data) => {
  const items = baseSelector.basic(data);
  return items.map(item => ({
    value: item._id,
    label: referenceTransformer(item).label
  }));
}
```

### After: Consolidated Reference Logic

Now all reference logic is centralized in `reference-selectors.ts`:

```typescript
// Single source of truth for reference transformations
export function createReferenceSelector<T extends BaseDocument>(
  entityType: string,
  getLabelFn: (entity: T) => string = getEntityLabel
): SelectorFunction<T, Array<{ value: string; label: string }>> {
  return (data: unknown) => {
    try {
      const selector = getSelector<T>(entityType);
      const items = selector.basic(data);
      
      return items.map(item => ({
        value: item._id,
        label: getLabelFn(item)
      }));
    } catch (error) {
      handleClientError(error, `referenceSelector:${entityType}`);
      return [];
    }
  };
}
```

## Key Functions

### 1. `createReferenceSelector<T>`

The primary function for creating reference selectors:

```typescript
// Basic usage
const schoolReferenceSelector = createReferenceSelector<School>('schools');

// With custom label function
const customReferenceSelector = createReferenceSelector<School>(
  'schools',
  (school) => `${school.district} - ${school.schoolName}`
);
```

### 2. `createReferenceObjectTransformer<T, R>`

For complex reference objects with additional fields:

```typescript
const schoolReferenceTransformer = createReferenceObjectTransformer<School, SchoolReference>(
  (school) => school.schoolName,
  (school) => ({
    schoolNumber: school.schoolNumber,
    district: school.district
  })
);
```

### 3. `getReferenceOptions<T>`

Simple utility for getting reference options:

```typescript
// Get reference options for any entity type
const options = getReferenceOptions<School>('schools', schoolData);
// Returns: [{ value: "id1", label: "School Name" }, ...]
```

### 4. `enhanceWithReferenceSelector<T, R>`

Extends existing selectors with reference capabilities:

```typescript
const enhancedSelector = enhanceWithReferenceSelector(
  baseSelector,
  (entity) => entity.name,
  (entity) => ({ additionalField: entity.value })
);
```

## Updated File Implementations

### selector-factory.ts

```typescript
// Before: Complex reference implementation
const reference: SelectorFunction<T, Array<{ value: string; label: string }>> = (data) => {
  try {
    const referenceTransformer = createReferenceTransformer<T, { _id: string; value: string; label: string }>(
      getEntityLabel
    );
    const items = normalizeToArray<unknown>(data);
    const transformedItems = baseTransformer.transform(items);
    return transformedItems.map(item => ({
      value: item._id,
      label: referenceTransformer(item).label
    }));
  } catch (error) {
    handleClientError(error, `${entityType}.reference`);
    return [];
  }
};

// After: Simple delegation to consolidated function
const reference: SelectorFunction<T, Array<{ value: string; label: string }>> = 
  createReferenceSelector<T>(entityType);
```

### standard-selectors.ts

```typescript
// Before: Duplicated reference logic
function createSpecializedSelectors<T extends BaseDocument>(
  baseSelector: EntitySelector<T>,
  entityType: string
) {
  const referenceTransformer = createReferenceTransformer<T, { value: string; label: string; _id: string }>(
    getEntityLabel
  );
  
  return {
    base: baseSelector,
    reference: (data: unknown) => {
      try {
        const items = baseSelector.basic(data);
        return items.map(item => ({
          value: item._id,
          label: referenceTransformer(item).label
        }));
      } catch (error) {
        handleClientError(error, `${entityType}.reference`);
        return [];
      }
    },
    // ... other selectors
  };
}

// After: Clean delegation to consolidated function
function createSpecializedSelectors<T extends BaseDocument>(
  baseSelector: EntitySelector<T>,
  entityType: string
) {
  return {
    base: baseSelector,
    reference: createReferenceSelector<T>(entityType),
    // ... other selectors
  };
}
```

## Usage Examples

### Basic Reference Selector

```typescript
import { createReferenceSelector } from '@query/client/selectors/reference-selectors';

// Create a reference selector for schools
const schoolReferenceSelector = createReferenceSelector<School>('schools');

// Use in a component
const schoolOptions = schoolReferenceSelector(schoolData);
// Returns: [{ value: "school1", label: "Lincoln Elementary" }, ...]
```

### Custom Label Function

```typescript
// Create reference selector with custom labeling
const customSchoolSelector = createReferenceSelector<School>(
  'schools',
  (school) => `${school.district} - ${school.schoolName} (${school.schoolNumber})`
);

const options = customSchoolSelector(schoolData);
// Returns: [{ value: "school1", label: "District A - Lincoln Elementary (001)" }, ...]
```

### Enhanced Reference Objects

```typescript
import { referenceSelectors } from '@query/client/selectors/reference-selectors';

// Use pre-configured reference selectors
const schoolReferences = referenceSelectors.school(schoolData);
// Returns: SchoolReference[] with additional fields like schoolNumber, district

const staffReferences = referenceSelectors.staff(staffData);
// Returns: StaffReference[] with additional fields like email, role
```

### Simple Reference Options

```typescript
import { getReferenceOptions } from '@query/client/selectors/reference-selectors';

// Get simple value/label pairs for any entity
const visitOptions = getReferenceOptions<Visit>('visits', visitData);
const lookForOptions = getReferenceOptions<LookFor>('look-fors', lookForData);
```

## Error Handling

All reference functions use consistent error handling with `handleClientError`:

```typescript
export function createReferenceSelector<T extends BaseDocument>(
  entityType: string,
  getLabelFn: (entity: T) => string = getEntityLabel
): SelectorFunction<T, Array<{ value: string; label: string }>> {
  return (data: unknown) => {
    try {
      // ... transformation logic
    } catch (error) {
      handleClientError(error, `referenceSelector:${entityType}`);
      return []; // Safe fallback
    }
  };
}
```

## Type Safety

The consolidated system maintains strong type safety:

```typescript
// Generic type constraints ensure proper typing
export function createReferenceSelector<T extends BaseDocument>(
  entityType: string,
  getLabelFn: (entity: T) => string = getEntityLabel
): SelectorFunction<T, Array<{ value: string; label: string }>>

// Reference object transformers support custom types
export function createReferenceObjectTransformer<
  T extends BaseDocument,
  R extends BaseReference = BaseReference
>(
  getLabelFn: (entity: T) => string = getEntityLabel,
  getAdditionalFields?: (entity: T) => Partial<Omit<R, '_id' | 'label' | 'value'>>
)
```

## Benefits

### 1. **Single Source of Truth**
- All reference transformation logic is in `reference-selectors.ts`
- No duplication across multiple files
- Easier to maintain and update

### 2. **Consistent Error Handling**
- All reference functions use `handleClientError`
- Standardized error context naming
- Safe fallbacks prevent breaking UI components

### 3. **Improved Type Safety**
- Strong generic constraints
- Proper TypeScript inference
- Clear function signatures

### 4. **Better Developer Experience**
- Simple, intuitive API
- Clear function names and purposes
- Comprehensive documentation

### 5. **Reduced Code Complexity**
- Eliminated ~50 lines of duplicated code
- Simplified selector factory implementation
- Cleaner standard selectors

### 6. **Enhanced Maintainability**
- Changes to reference logic only need to be made in one place
- Easier to add new reference transformation features
- Clear separation of concerns

## Migration Impact

### Backward Compatibility
- All existing selector APIs remain unchanged
- No breaking changes to consumer code
- Existing selector registrations continue to work

### Performance
- No performance impact
- Same underlying transformation logic
- Reduced bundle size due to eliminated duplication

### Testing
- Existing tests continue to pass
- Reference logic is now easier to test in isolation
- Better test coverage through centralized functions

## Future Enhancements

The consolidated system provides a foundation for future improvements:

1. **Caching**: Add memoization for frequently used reference transformations
2. **Internationalization**: Support for localized labels
3. **Custom Sorting**: Add sorting options for reference lists
4. **Filtering**: Built-in filtering capabilities for reference options
5. **Validation**: Enhanced validation for reference objects

## Conclusion

The consolidation of reference logic into `reference-selectors.ts` significantly improves the maintainability, consistency, and developer experience of the selector system while maintaining full backward compatibility and type safety. 