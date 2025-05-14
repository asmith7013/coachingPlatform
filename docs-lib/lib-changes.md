## Current `/lib` Directory Analysis Status

### ✅ Analyzed

- **`/lib/api/`**
  - [ ] Create missing client-side API functions:
    - `/lib/api/client/visit.ts`
    - `/lib/api/client/look-for.ts`
    - `/lib/api/client/school.ts`
  - [ ] Create `/lib/api/validation/request-validator.ts` to centralize validation from API routes
  - [ ] Extend `createReferenceEndpoint` with additional factory patterns for bulk uploads
  - [ ] Ensure consistent use of `standardizeResponse` utility across API routes

- **`/lib/domain/`**
  - [ ] Add `/lib/domain/classroom-notes/` directory for business logic from classroom notes components
  - [ ] Add specific utility files for curriculum data management, time tracking, and form validation
  - [ ] Extract logic from IM tools pages for routine visualization
  - [ ] Consolidate duplicate URL utility functions

- **`/lib/ui/`**
  - [ ] Add common field styling utilities based on patterns seen in dashboard components
  - [ ] Create reusable form field wrappers with token system integration
  - [ ] Extract common table patterns from components to the table system
  - [ ] Create standard layout components for dashboard interfaces

- **`/lib/context/`**
  - [ ] Create context providers for curriculum version, Monday import/integration
  - [ ] Move SWR provider from src/providers
  - [ ] Extract state management from component files using useReducer/useState into context providers
  
  ## API Layer Analysis Status

### ✅ Analyzed API Routes

- **`/src/app/api/integrations/monday/route.ts`**
  - [x] Uses `createReferenceEndpoint` pattern effectively
  - [ ] Should use standardized import paths (`@api-monday/services/import-service` vs `@/lib/integrations/monday/services/import-service`)

- **`/src/app/api/integrations/monday/user/route.ts`**
  - [x] Uses proper error handling with `handleServerError` and `handleValidationError`
  - [ ] Should use `standardizeResponse` utility for consistent response format

- **`/src/app/api/integrations/monday/visits/import/complete/route.ts`**
  - [x] Uses proper validation with Zod schema
  - [ ] Should use `standardizeResponse` utility for consistent response format
  - [ ] Contains logic that overlaps with other import routes and should be consolidated

- **`/src/app/api/integrations/monday/visits/import/route.ts`**
  - [x] Uses proper validation with Zod schema
  - [ ] Should use `standardizeResponse` utility for consistent response format
  - [ ] Contains logic that overlaps with other import routes and should be consolidated

- **`/src/app/api/integrations/monday/visits/route.ts`**
  - [x] Uses proper error handling
  - [ ] Path aliases are inconsistent (`@api-monday/services/import-service` vs full paths in other files)
  - [ ] Should use `standardizeResponse` utility for consistent response format

- **`/src/app/api/look-fors/bulk-upload/route.ts`**
  - [x] Uses appropriate database utilities with `bulkUploadToDB`
  - [ ] Should use `standardizeResponse` utility for consistent response format
  - [ ] File validation logic should be moved to `/lib/api/validation/request-validator.ts`

- **`/src/app/api/schedule/route.ts`**
  - [x] Uses `createReferenceEndpoint` pattern effectively
  - [x] Good example of the recommended API pattern to follow

- **`/src/app/api/school/route.ts` and `/src/app/api/schools/route.ts`**
  - [x] Use `createReferenceEndpoint` pattern effectively
  - [x] Good examples of the recommended API pattern to follow
  - [ ] Duplicate functionality that should be consolidated

- **`/src/app/api/staff/[id]/route.ts`**
  - [x] Uses `standardizeResponse` utility for consistent response format
  - [x] Uses proper error handling
  - [ ] Could benefit from a factory pattern similar to `createReferenceEndpoint`

- **`/src/app/api/staff/bulk-upload/route.ts`**
  - [x] Uses appropriate database utilities with `bulkUploadToDB`
  - [ ] Should use `standardizeResponse` utility for consistent response format
  - [ ] File validation logic should be moved to `/lib/api/validation/request-validator.ts`

- **`/src/app/api/staff/exists/route.ts`**
  - [x] Uses `withDbConnection` consistently
  - [ ] Should use `standardizeResponse` utility for consistent response format

- **`/src/app/api/teacher/route.ts`**
  - [x] Uses `createReferenceEndpoint` pattern effectively
  - [x] Good example of the recommended API pattern to follow

### ❌ Not Yet Analyzed API Routes

- Any other API routes in the `/src/app/api/` directory not listed above# Coaching Platform `/lib` Reorganization Checklist

This checklist tracks which parts of the codebase have been analyzed against the `/lib` directory catalog structure and what actions are required.

## Server Actions Analysis Status

The following server actions have been analyzed and need to be reorganized according to the `/lib` directory structure:

### ✅ Analyzed Actions

- **`/src/app/actions/cycles/cycles.ts`**
  - [ ] Should use `withDbConnection` from `/lib/data-server/db/ensure-connection.ts` instead of direct `connectToDB()`
  - [ ] Error handling should be standardized (throws `handleServerError` instead of returning error object)

- **`/src/app/actions/integrations/monday.ts`**
  - [ ] Extract validation logic to `/lib/api/validation/request-validator.ts`
  - [ ] Standardize response patterns to use format from `/lib/api/responses/standardize.ts`

- **`/src/app/actions/lookFors/lookFors.ts`**
  - [ ] Should use `withDbConnection` consistently
  - [ ] Error handling should be standardized

- **`/src/app/actions/nextSteps/nextSteps.ts`**
  - [x] Already uses `withDbConnection` consistently
  - [x] Uses `createCrudActions` effectively
  - [ ] Move domain-specific logic to `/lib/domain/look-fors/`

- **`/src/app/actions/notes/notes.ts`**
  - [x] Already uses `withDbConnection` consistently
  - [x] Uses `createCrudActions` effectively

- **`/src/app/actions/rubrics/rubrics.ts`**
  - [x] Already uses `withDbConnection` consistently
  - [x] Uses `createCrudActions` effectively
  - [ ] Move domain-specific logic to `/lib/domain/look-fors/`

- **`/src/app/actions/schedule/schedule.ts`**
  - [ ] Should use `withDbConnection` consistently (uses direct `connectToDB()` in some places)
  - [ ] Specialized schedule logic should be moved to `/lib/domain/schedule/`

- **`/src/app/actions/schools/schools.ts`**
  - [x] Already uses `withDbConnection` consistently
  - [x] Uses `createCrudActions` effectively

- **`/src/app/actions/staff/factories.ts` and `/src/app/actions/staff/operations.ts`**
  - [x] Uses `createCrudActions` effectively
  - [x] Uses `withDbConnection` consistently
  - [ ] Move `determineStaffType` function to `/lib/data-utilities/transformers/staff-utils.ts`

- **`/src/app/actions/visits/coachingLogs.ts`, `/src/app/actions/visits/cycles.ts`, and `/src/app/actions/visits/visits.ts`**
  - [ ] Should use `withDbConnection` instead of direct `connectToDB()`
  - [ ] Move domain-specific logic to `/lib/domain/visits/`

### ❌ Not Yet Analyzed Actions

- Any other server actions in the `/src/app/actions/` directory not listed above

## Client Hooks Analysis Status

### ✅ Analyzed Hooks

- **`/src/hooks/data/`**
  - [ ] Move all hooks to `/lib/hooks/data/`
  - [ ] Standardize error handling
  - [ ] Improve type definitions

- **`/src/hooks/debugging/`**
  - [ ] Move debugging hooks to `/lib/dev/debugging/`
  - [ ] Update to use enhanced monitoring from `/lib/dev/debugging/monitor.ts`

- **`/src/hooks/domain/`**
  - [ ] Move hooks to `/lib/hooks/domain/` or consider relocating to respective domain directories
  - [ ] Add comprehensive type definitions

- **`/src/hooks/error/`**
  - [ ] Move to `/lib/hooks/error/`
  - [ ] Integrate with centralized error handling system

- **`/src/hooks/integrations/monday/`**
  - [ ] Move to `/lib/integrations/monday/hooks/` (new directory to be created)
  - [ ] Standardize integration patterns

- **`/src/hooks/ui/`**
  - [ ] Move to `/lib/hooks/ui/`
  - [ ] Create additional hooks mentioned in catalog (`useForm.ts`, `useModal.ts`)

- **`/src/hooks/visits/`**
  - [ ] Consider moving to `/lib/domain/visits/hooks/`
  - [ ] Standardize with other domain-specific hook patterns

### ❌ Not Yet Analyzed Hooks

- Any other hooks in the `/src/hooks/` directory not categorized above

## Components Analysis Status

### ✅ Partially Analyzed Components

- **`/src/components/domain/things3/`**
  - [ ] Move to `/lib/integrations/things3/`
  - [ ] Split into appropriate client/utils/types pattern

### ❌ Not Yet Analyzed Components

- `/src/components/composed/`
- `/src/components/core/`
- `/src/components/debug/`
- `/src/components/domain/` (except things3)
- `/src/components/error/`
- `/src/components/integrations/`

## Context Providers Analysis Status

### ✅ Analyzed Providers

- **`/src/providers/SWRProvider.tsx`**
  - [ ] Move to `/lib/context/`

### ❌ Not Yet Analyzed Providers

- Any other context providers not identified above

## Current `/lib` Directory Analysis Status

### ✅ Analyzed

- **`/lib/data-schema/`**
  - [ ] Rename `dateHelpers.ts` to `date-helpers.ts` in `/lib/data-schema/zod-schema/shared/`
  - [ ] Create schema registry to map between Zod schemas and Mongoose models
  - [ ] Ensure all index files consistently re-export components

- **`/lib/data-server/`**
  - [ ] Standardize connection patterns across server actions
  - [ ] Improve error handling in CRUD operations

- **`/lib/data-utilities/`**
  - [ ] Create new `/lib/data-utilities/formatters/` directory
  - [ ] Move formatting logic from `/lib/ui/utils/formatters.ts`
  - [ ] Standardize transformer function patterns

- **`/lib/api/`**
  - [ ] Create missing client-side API functions
  - [ ] Add request validation utilities
  - [ ] Standardize response patterns

- **`/lib/error/`**
  - [ ] Create new error utilities
  - [ ] Standardize error handling across application
  - [ ] Implement monitoring integration

- **`/lib/hooks/`**
  - [ ] Move hooks from `/src/hooks/`
  - [ ] Consider reorganizing domain-specific hooks
  - [ ] Improve hook typing

- **`/lib/ui/`**
  - [ ] Rename inconsistent files
  - [ ] Create table system
  - [ ] Fix index exports

- **`/lib/context/`**
  - [ ] Add missing context providers
  - [ ] Move providers from `/src/providers/`
  - [ ] Create index exports

- **`/lib/domain/`**
  - [ ] Fix duplicate functions
  - [ ] Add domain logic directories
  - [ ] Move domain logic from other locations

- **`/lib/integrations/`**
  - [ ] Clean up Monday.com integration
  - [ ] Create Things3 integration
  - [ ] Standardize integration patterns

- **`/lib/dev/`**
  - [ ] Standardize naming conventions
  - [ ] Add testing utilities
  - [ ] Improve performance monitoring

- **`/lib/types/`**
  - [ ] Fix duplicate types
  - [ ] Improve type documentation
  - [ ] Create type validation utilities

- **`/lib/json/`**
  - [ ] Rename JSON files to kebab-case
  - [ ] Move component definitions out of JSON directory
  - [ ] Create index export

- **`/lib/tokens/`**
  - [ ] Improve semantic token system
  - [ ] Add token documentation
  - [ ] Implement token consistency

- **`/lib/query/`**
  - [ ] Integrate with error handling system
  - [ ] Improve cache invalidation
  - [ ] Standardize query patterns

### ❌ Not Yet Analyzed Parts of `/lib`

- Any other parts of the `/lib` directory not specifically identified above

## Summary of Next Steps

1. Begin with standardizing error handling patterns across all server actions
2. Implement consistent use of standardized responses in API routes
3. Create `/lib/api/validation/request-validator.ts` to centralize validation logic
4. Move hooks from `/src/hooks/` to `/lib/hooks/`
5. Consolidate duplicate functions in domain logic and API routes
6. Create new directories and files specified in the catalog
7. Rename existing files to follow consistent naming conventions
8. Move domain-specific logic to appropriate locations
9. Standardize API client functions and response patterns
10. Implement consistent connection handling for database operations

### Priority Items Based on Dashboard Components Analysis:

1. **Create Domain Logic for Classroom Notes**:
   - Create `/lib/domain/classroom-notes/` directory
   - Extract business logic from dashboard components
   - Move time tracking utilities and form validation logic

2. **Standardize UI Component Patterns**:
   - Create reusable field label/wrapper components based on repeated TV patterns
   - Extract common table and card patterns from dashboard pages
   - Centralize form styling utilities

3. **Add Context Providers for Dashboard Features**:
   - Create curriculum version provider for IM tools
   - Extract state management from classroomNotes components
   - Move Monday.com integration contexts to lib directory

4. **Consolidate Duplicate Code Across Pages**:
   - Standardize error handling in dashboard pages
   - Extract common search/filter/pagination patterns
   - Create shared card and list item components for entities

---

*This checklist will be updated as the reorganization progresses.*