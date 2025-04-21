# Component Import Path Update Summary

## Updates Completed
We've successfully updated the following component import paths across the codebase:

1. **Button**:
   - From: `@/components/ui/button`
   - To: `@/components/core/Button`

2. **Card**:
   - From: `@/components/ui/card`
   - To: `@/components/composed/cards/Card`

3. **Typography Components**:
   - From: `@/components/ui/typography/Text`
   - To: `@/components/core/typography/Text`
   
   - From: `@/components/ui/typography/Heading`
   - To: `@/components/core/typography/Heading`

4. **Form Field Components**:
   - From: `@/components/ui/fields/Input`
   - To: `@/components/core/fields/Input`
   
   - From: `@/components/ui/fields/Select`
   - To: `@/components/core/fields/Select`
   
   - From: `@/components/ui/fields/Switch`
   - To: `@/components/core/fields/Switch`
   
   - From: `@/components/ui/fields/Checkbox`
   - To: `@/components/core/fields/Checkbox`
   
   - From: `@/components/ui/fields/Textarea`
   - To: `@/components/core/fields/Textarea`
   
   - From: `@/components/ui/fields/ReferenceSelect`
   - To: `@/components/core/fields/ReferenceSelect`

5. **Badge Component**:
   - From: `@/components/ui/badge`
   - To: `@/components/core/feedback/Badge`

6. **Form Component**:
   - From: `@/components/ui/form`
   - To: `@/components/core/fields/FieldWrapper` (with FieldConfig type adjustment)

7. **EmptyListWrapper**:
   - From: `@/components/ui/empty-list-wrapper`
   - To: `@/components/shared/EmptyListWrapper`

8. **Dialog Component**:
   - From: `@/components/ui/dialog`
   - To: `@/components/composed/dialogs/Dialog`

## Remaining TypeScript Errors

The TypeScript check identified several issues that still need to be resolved:

1. **Table-related components** need their paths fixed:
   - `./core/header`
   - `./core/row`
   - `./utils/empty`
   - `../utils/pagination`
   - Case sensitivity issues with table imports

2. **Form-related components** need their paths fixed:
   - `./form-section`

3. **Shared components** need their paths fixed:
   - `./empty-state`
   - `./SentryErrorBoundary`

4. **Other issues**:
   - Naming conflicts in some exports
   - Type definition issues in `RoutineFilter` component

## Next Steps

1. Fix the remaining import paths for table components
2. Fix form-section and other form-related imports
3. Fix shared component imports
4. Address naming conflicts in exports
5. Fix type definition issues in the RoutineFilter component 