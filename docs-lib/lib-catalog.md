# Coaching Platform: `/lib` Directory Catalog

*Version 3.0 - Comprehensive Analysis with Modification Plan*

This document serves as a comprehensive catalog of all components, utilities, and modules that should be included in the `/lib` directory of the Coaching Platform project. It is organized by domain to ensure proper architecture, maintainability, and consistency.

## Table of Contents

1. [Schema System](#schema-system)
2. [Data Server](#data-server)
3. [Data Utilities](#data-utilities)
4. [API Layer](#api-layer) 
5. [Error Handling](#error-handling)
6. [Hooks](#hooks)
7. [UI System](#ui-system)
8. [Context Providers](#context-providers)
9. [Domain Logic](#domain-logic)
10. [Integration Services](#integration-services)
11. [Dev Tools](#dev-tools)
12. [Type System](#type-system)
13. [Query System](#query-system)
14. [JSON Data](#json-data)
15. [Design Tokens](#design-tokens)

---

## Schema System

The schema system serves as the canonical source of truth for all data structures in the application.

### Location: `/lib/data-schema/`

#### Enum System
- `/lib/data-schema/enum/`
  - `index.ts` - Re-exports all enums
  - `shared-enums.ts` - Core enum definitions with Zod schemas

#### Zod Schema Definitions
- `/lib/data-schema/zod-schema/`
  - **Core Schemas**
    - `core/school.ts` - School entity schema
    - `core/staff.ts` - Staff entity schemas (StaffMember, NYCPSStaff, TeachingLabStaff)
    - `core/cycle.ts` - Cycle entity schema
    - `core/index.ts` - Re-exports all core schemas
  - **Visit Schemas**
    - `visits/visit.ts` - Visit entity schema
    - `visits/coaching-log.ts` - Coaching log schema
    - `visits/index.ts` - Re-exports all visit schemas
  - **Look-For Schemas**
    - `look-fors/look-for.ts` - LookFor entity schema
    - `look-fors/rubric.ts` - Rubric schema
    - `look-fors/rubric-fields.ts` - Shared rubric fields to avoid circular dependencies
    - `look-fors/next-step.ts` - NextStep schema
    - `look-fors/index.ts` - Re-exports all look-for schemas
  - **Scheduling Schemas**
    - `schedule/schedule.ts` - Schedule schemas
    - `schedule/index.ts` - Re-exports all schedule schemas
  - **Integration Schemas**
    - `integrations/monday.ts` - Monday.com data schemas
    - `integrations/index.ts` - Re-exports all integration schemas
  - **Shared Schemas**
    - `shared/notes.ts` - Notes schema
    - `shared/date-helpers.ts` - Date field processing helpers (renamed from dateHelpers.ts)
    - `shared/index.ts` - Re-exports from shared schemas
  - **Validation**
    - `validation/response.ts` - Response schema definitions
    - `validation/index.ts` - Re-exports all validation schemas
  - **Utilities**
    - `validate.ts` - Generic schema validation utility
    - `index.ts` - Central export file for all schemas

#### Mongoose Schema Definitions
- `/lib/data-schema/mongoose-schema/`
  - **Core Models**
    - `core/school.model.ts` - School Mongoose model
    - `core/staff.model.ts` - Staff Mongoose models
    - `core/cycle.model.ts` - Cycle Mongoose model
    - `core/index.ts` - Re-exports all core models
  - **Visit Models**
    - `visits/visit.model.ts` - Visit Mongoose model
    - `visits/coaching-log.model.ts` - CoachingLog Mongoose model
    - `visits/index.ts` - Re-exports all visit models
  - **Look-For Models**
    - `look-fors/look-for.model.ts` - LookFor Mongoose model
    - `look-fors/rubric.model.ts` - Rubric Mongoose model
    - `look-fors/next-step.model.ts` - NextStep Mongoose model
    - `look-fors/index.ts` - Re-exports all look-for models
  - **Scheduling Models**
    - `schedule/schedule.model.ts` - Schedule Mongoose models
    - `schedule/index.ts` - Re-exports all schedule models
  - **Shared Models**
    - `shared/notes.model.ts` - Notes Mongoose model
    - `shared/index.ts` - Re-exports all shared models
  - **Utilities**
    - `types.ts` - Common types for Mongoose models
    - `helpers.ts` - Helper functions for Mongoose models

#### Index Exports
- `/lib/data-schema/index.ts` - Main export point for all schema-related code

### Issues to Address:
- Evaluate current mixed naming conventions and consider standardization
- Create a schema registry to map between Zod schemas and Mongoose models
- Ensure all index files consistently re-export components
- Establish clear dependency paths between schemas
- Eliminate duplicate functionality where present

### Modifications Needed:
1. **Rename inconsistent files**:
   - Rename `dateHelpers.ts` to `date-helpers.ts` in `/lib/data-schema/zod-schema/shared/`
   - Standardize all file names to kebab-case across schema definitions

2. **Create Schema Registry**:
   - Create `/lib/data-schema/registry.ts` to map between Zod schemas and Mongoose models
   - This will simplify lookups and provide consistent validation

3. **Fix index exports**:
   - Ensure `/lib/data-schema/index.ts` properly re-exports all schemas
   - Add missing index files in subdirectories that lack them

4. **Eliminate duplications**:
   - Several schema files have overlapping functionality that should be combined
   - Consolidate any duplicate validation methods

---

## Data Server

The data server layer handles database operations and provides a consistent interface for database access.

### Location: `/lib/data-server/`

#### CRUD Operations
- `/lib/data-server/crud/`
  - `crud-action-factory.ts` - Factory for creating standard CRUD operations
  - `crud-operations.ts` - Core CRUD operation functions
  - `bulk-operations.ts` - Utilities for bulk data operations
  - `index.ts` - Re-exports CRUD operations
  - `README.md` - Documentation for CRUD operations

#### Database Connectivity
- `/lib/data-server/db/`
  - `connection.ts` - MongoDB connection management
  - `ensure-connection.ts` - Wrapper to ensure DB connection
  - `model-registry.ts` - Registry for model initialization
  - `index.ts` - Re-exports DB utilities

#### File Handling
- `/lib/data-server/file-handling/`
  - `csv-parser.ts` - CSV file parsing utilities
  - `file-upload.ts` - File upload utilities
  - `index.ts` - Re-exports file handling utilities

#### Main Export
- `/lib/data-server/index.ts` - Main export point for data server layer

### Issues to Address:
- Improve type safety of CRUD operations
- Add comprehensive JSDoc documentation
- Create standardized error handling for database operations
- Unify connection management patterns

### Modifications Needed:
1. **Move connection patterns**:
   - The `withDbConnection` function in `/lib/data-server/db/ensure-connection.ts` is used inconsistently
   - All server actions (like in `/src/app/actions/`) should use consistent connection handling
   - Example: `src/app/actions/cycles/cycles.ts` uses direct `connectToDB()` but should use `withDbConnection`

2. **Standardize CRUD operations**:
   - The `createCrudActions` factory in `/lib/data-server/crud/crud-action-factory.ts` is used well in some files but not others
   - Move specialized CRUD operations in various server actions into the data-server layer

3. **Improve error handling**:
   - Standardize the error handling pattern in CRUD operations
   - Create proper error typing for database operations

---

## Data Utilities

The data utilities provide functions for working with data, including pagination, transformations, and more.

### Location: `/lib/data-utilities/`

#### Pagination
- `/lib/data-utilities/pagination/`
  - `pagination.ts` - Core pagination functions
  - `paginated-query.ts` - Utilities for paginated queries
  - `sort-utils.ts` - Sorting utilities for pagination
  - `index.ts` - Re-exports pagination utilities

#### Data Transformers
- `/lib/data-utilities/transformers/`
  - `sanitize.ts` - Data sanitization utilities
  - `parse.ts` - Data parsing utilities
  - `fetch-by-id.ts` - Utility for fetching by ID
  - `reference-mappers.ts` - Mappers for reference data
  - `staff-utils.ts` - Staff-specific utilities
  - `type-helper.ts` - Type conversion utilities
  - `zod-validation.ts` - Zod validation utilities
  - `index.ts` - Re-exports transformer utilities

#### Formatting Utilities
- `/lib/data-utilities/formatters/` (New)
  - `date-formatters.ts` - Date formatting utilities
  - `string-formatters.ts` - String formatting utilities
  - `number-formatters.ts` - Number formatting utilities
  - `index.ts` - Re-exports formatter utilities

#### Main Export
- `/lib/data-utilities/index.ts` - Main export point for data utilities

### Issues to Address:
- Create consistent transformer function signatures
- Improve type safety of utility functions
- Consolidate duplicate formatting functions
- Add unit tests for all utility functions

### Modifications Needed:
1. **Consolidate formatting utilities**:
   - Create the new `/lib/data-utilities/formatters/` directory
   - Move formatting logic from `/lib/ui/utils/formatters.ts` to `/lib/data-utilities/formatters/`
   - Split into specialized formatter files (date, string, number)

2. **Standardize transformer functions**:
   - Review and refactor transformer functions to follow consistent patterns
   - Create proper TypeScript interfaces for transformer input/output

3. **Move utility functions from server actions**:
   - Many server actions contain utility functions that should be in data-utilities
   - Example: The determineStaffType function in `/src/app/actions/staff/operations.ts` should be moved to data-utilities

---

## API Layer

The API layer provides utilities for API routes, handlers, and responses.

### Location: `/lib/api/`

#### API Client
- `/lib/api/client/`
  - `staff.ts` - Client-side staff API functions
  - `visit.ts` - Client-side visit API functions (new)
  - `look-for.ts` - Client-side look-for API functions (new)
  - `school.ts` - Client-side school API functions (new)
  - `index.ts` - Re-exports all client functions

#### API Fetchers
- `/lib/api/fetchers/`
  - `coaching-log.ts` - Coaching log API fetchers
  - `look-fors.ts` - LookFor API fetchers
  - `schedule.ts` - Schedule API fetchers
  - `school.ts` - School API fetchers
  - `staff.ts` - Staff API fetchers
  - `index.ts` - Re-exports all fetchers

#### API Handlers
- `/lib/api/handlers/`
  - `api-adapter.ts` - API adapter for converting server actions to API-safe fetchers
  - `reference-endpoint.ts` - Factory for creating reference data endpoints
  - `index.ts` - Re-exports API handlers

#### API Responses
- `/lib/api/responses/`
  - `standardize.ts` - Standardize API responses
  - `index.ts` - Re-exports response utilities

#### API Validation
- `/lib/api/validation/`
  - `request-validator.ts` - Request validation utilities (new)
  - `index.ts` - Re-exports validation utilities

#### Main Export
- `/lib/api/index.ts` - Main export point for API layer

### Issues to Address:
- Create consistent patterns for client-side API functions
- Ensure proper error handling in all API functions
- Improve typing of API responses
- Add more comprehensive documentation

### Modifications Needed:
1. **Create missing client-side API functions**:
   - Create `/lib/api/client/visit.ts` as mentioned in catalog
   - Create `/lib/api/client/look-for.ts` as mentioned in catalog
   - Create `/lib/api/client/school.ts` as mentioned in catalog
   - Use consistent patterns based on existing `/lib/api/client/staff.ts`

2. **Add request validation utilities**:
   - Create `/lib/api/validation/request-validator.ts` to centralize validation logic
   - Extract common validation patterns from routes like:
     - `src/app/api/staff/exists/route.ts` (email validation)
     - `src/app/api/staff/bulk-upload/route.ts` (file upload validation)
     - `src/app/api/integrations/monday/visits/route.ts` (board ID validation)

3. **Standardize response patterns**:
   - Apply the `standardizeResponse` utility from `/lib/api/responses/standardize.ts` consistently
   - Refactor API routes like `src/app/api/look-fors/bulk-upload/route.ts` to use standardized response format
   - Update Monday.com integration API routes to follow the same response structure

4. **Create API route factories**:
   - Extend the `createReferenceEndpoint` pattern used in:
     - `src/app/api/school/route.ts`
     - `src/app/api/schedule/route.ts`
     - `src/app/api/teacher/route.ts`
   - Create factories for other common API patterns like bulk uploads

5. **Consolidate duplicate code**:
   - Several API routes (`src/app/api/integrations/monday/visits/import/route.ts` and `src/app/api/integrations/monday/visits/import/complete/route.ts`) have overlapping functionality
   - Move common logic to shared utilities in `/lib/api/handlers/`

---

## Error Handling

Centralized error handling system for consistent error processing.

### Location: `/lib/error/`

- `handle-client-error.ts` - Client-side error handling
- `handle-server-error.ts` - Server-side error handling
- `handle-validation-error.ts` - Validation error handling
- `crud-error-handling.ts` - CRUD operation error handling
- `error-monitor.ts` - Error monitoring and reporting
- `error-types.ts` - Type definitions for errors (new)
- `error-utils.ts` - Utility functions for error handling (new)
- `index.ts` - Re-exports error handling utilities

### Issues to Address:
- Standardize error response formats
- Create a comprehensive error monitoring system
- Improve error tracking and reporting
- Ensure consistent error handling across all application layers

### Modifications Needed:
1. **Create new error utilities**:
   - Create `/lib/error/error-types.ts` as specified in catalog
   - Create `/lib/error/error-utils.ts` as specified in catalog

2. **Standardize error handling in server actions**:
   - Server actions in `/src/app/actions/` use inconsistent error handling patterns
   - Some use `handleServerError` directly, others throw a `new Error(handleServerError(error))`
   - Example: `/src/app/actions/cycles/cycles.ts` throws the error, while `/src/app/actions/schedule/schedule.ts` returns an error object

3. **Implement monitoring integration**:
   - Update `/lib/error/error-monitor.ts` to connect with monitoring services

---

## Hooks

Custom React hooks for data fetching, state management, and UI interactions.

### Location: `/lib/hooks/`

#### Data Hooks
- `/lib/hooks/data/`
  - `useCrudOperations.ts` - Hook for CRUD operations
  - `useOptimisticResource.ts` - Hook for optimistic updates
  - `useReferenceData.ts` - Hook for reference data
  - `useResourceManager.ts` - Hook for resource management
  - `useSafeSWR.ts` - Safe SWR hook
  - `index.ts` - Re-exports data hooks

#### UI Hooks
- `/lib/hooks/ui/`
  - `useFiltersAndSorting.ts` - Hook for filters and sorting
  - `usePagination.ts` - Hook for pagination
  - `useForm.ts` - Hook for form handling (new)
  - `useModal.ts` - Hook for modal management (new)
  - `index.ts` - Re-exports UI hooks

#### Domain Hooks
- `/lib/hooks/domain/`
  - `useLookFors.ts` - Hook for look-fors
  - `useNYCPSStaff.ts` - Hook for NYCPS staff
  - `useSchools.ts` - Hook for schools
  - `useTeacherSchedules.ts` - Hook for teacher schedules
  - `useTeachingLabStaff.ts` - Hook for Teaching Lab staff
  - `index.ts` - Re-exports domain hooks

#### Error Hooks
- `/lib/hooks/error/`
  - `useErrorBoundary.ts` - Hook for error boundary
  - `useErrorHandledMutation.ts` - Hook for error-handled mutation
  - `index.ts` - Re-exports error hooks

#### Utility Hooks
- `/lib/hooks/`
  - `use-item-to-group-map.ts` - Hook for mapping items to groups
  - `use-persisted-curriculum-version.ts` - Hook for persisted curriculum versions
  - `index.ts` - Re-exports utility hooks

#### Main Export
- `/lib/hooks/index.ts` - Main export point for hooks

### Issues to Address:
- Use consistent naming pattern (currently uses camelCase which is appropriate for hooks)
- Add comprehensive type definitions for hook parameters and return values
- Improve error handling within hooks
- Consider moving domain-specific hooks into domain directories for better organization

### Modifications Needed:
1. **Move hooks from src/hooks to lib/hooks**:
   - Move data hooks from `/src/hooks/data/` to `/lib/hooks/data/`
   - Move UI hooks from `/src/hooks/ui/` to `/lib/hooks/ui/`
   - Move domain hooks from `/src/hooks/domain/` to `/lib/hooks/domain/`
   - Move error hooks from `/src/hooks/error/` to `/lib/hooks/error/`

2. **Reorganize domain-specific hooks**:
   - Consider moving domain-specific hooks to their respective domain directories
   - Example: `/src/hooks/visits` hooks should move to `/lib/domain/visits/hooks/`

3. **Improve hook typing**:
   - Add comprehensive type definitions for hook parameters and return values
   - Use consistent patterns for handling loading states and errors

---

## UI System

UI components and styling patterns following the atomic design pattern.

### Location: `/lib/ui/`

#### Constants
- `/lib/ui/constants/`
  - `coaching-log.ts` - Constants for coaching logs
  - `district-list.ts` - List of districts
  - `index.ts` - Re-exports constants

#### Forms System
- `/lib/ui/forms/`
  - **Field Configurations**
    - `fieldConfig/core/` - Core entity field configurations
    - `fieldConfig/look-fors/` - Look-for field configurations
    - `fieldConfig/scheduling/` - Schedule field configurations
    - `fieldConfig/shared/` - Shared field configurations
    - `fieldConfig/visits/` - Visit field configurations
    - `fieldConfig/index.ts` - Re-exports field configurations
  - **Form Overrides**
    - `formOverrides/core/` - Core entity form overrides
    - `formOverrides/look-fors/` - Look-for form overrides
    - `formOverrides/schedule/` - Schedule form overrides
    - `formOverrides/shared/` - Shared form overrides
    - `formOverrides/index.ts` - Re-exports form overrides
    - `formOverrides/staff.ts` - Staff-specific form overrides
  - `field-labels.ts` - Field label definitions
  - `field-renderer.tsx` - Form field rendering component
  - `field-values.ts` - Field value definitions
  - `form-helpers.ts` - Form helper utilities (renamed from helpers.ts)
  - `form-registry.ts` - Form registry (renamed from registry.ts)
  - `index.ts` - Re-exports form system

#### UI Utilities
- `/lib/ui/utils/`
  - `form-utils.ts` - Form utility functions
  - `formatters.ts` - Formatting utilities
  - `token-utils.ts` - Design token utilities
  - `variant-utils.ts` - Component variant utilities
  - `index.ts` - Re-exports UI utilities

#### UI Variants
- `/lib/ui/variants/`
  - `layout.ts` - Layout variants
  - `shared-variants.ts` - Shared component variants
  - `typography.ts` - Typography variants
  - `types.ts` - Variant type definitions
  - `index.ts` - Re-exports variants

#### Table System
- `/lib/ui/tables/` (New)
  - `table-schema.ts` - Table schema definitions
  - `table-utils.ts` - Table utility functions (new)
  - `index.ts` - Re-exports table system

#### Main Export
- `/lib/ui/index.ts` - Main export point for UI system

### Issues to Address:
- Standardize naming conventions to kebab-case
- Ensure all sub-directories have index.ts exports
- Create a more robust table schema system
- Improve form field rendering with better typing

### Modifications Needed:
1. **Rename inconsistent files**:
   - Rename `/lib/ui/forms/helpers.ts` to `/lib/ui/forms/form-helpers.ts`
   - Rename `/lib/ui/forms/registry.ts` to `/lib/ui/forms/form-registry.ts`

2. **Create table system**:
   - Create new `/lib/ui/tables/` directory as specified in catalog
   - Move `/lib/ui/table-schema.ts` to `/lib/ui/tables/table-schema.ts`
   - Create `/lib/ui/tables/table-utils.ts` with pagination, sorting, and filtering utilities currently duplicated in components

3. **Fix index exports**:
   - Create missing index files for subdirectories
   - Ensure consistent export patterns across UI system

4. **Improve component integration**:
   - Add support for core form components that are currently used in components like `BasicInfo.tsx` and `CurriculumSelector.tsx`
   - Create field wrappers that leverage the token system instead of directly using utility classes like seen in `fieldLabel = tv({...})`
   - Create reusable layout components for common patterns found in the dashboard components

---

## Context Providers

React context providers for state management.

### Location: `/lib/context/`

- `QueryProvider.tsx` - Provider for query context
- `auth-provider.tsx` - Provider for authentication context (new)
- `theme-provider.tsx` - Provider for theme context (new)
- `notification-provider.tsx` - Provider for notifications (new)
- `monday-import-provider.tsx` - Provider for Monday.com import context (new)
- `curriculum-version-provider.tsx` - Provider for curriculum version selection (new)
- `index.ts` - Re-exports context providers

### Issues to Address:
- Create a consistent pattern for context providers
- Ensure providers have proper typing
- Add selectors for optimized rendering
- Improve context documentation

### Modifications Needed:
1. **Add missing context providers**:
   - Create `/lib/context/auth-provider.tsx` as specified in catalog
   - Create `/lib/context/theme-provider.tsx` as specified in catalog
   - Create `/lib/context/notification-provider.tsx` as specified in catalog
   - Create `/lib/context/monday-import-provider.tsx` by moving from `/src/hooks/integrations/monday/MondayImportContext.tsx`
   - Create `/lib/context/curriculum-version-provider.tsx` to extract from IM Routines tools page

2. **Move providers from src**:
   - Move `/src/providers/SWRProvider.tsx` to `/lib/context/`
   - Move `/src/hooks/integrations/monday/MondayIntegrationContext.tsx` to `/lib/context/monday-integration-provider.tsx`

3. **Create index exports**:
   - Create `/lib/context/index.ts` to re-export all providers

---

## Domain Logic

Domain-specific business logic.

### Location: `/lib/domain/`

#### IM Routine Logic
- `/lib/domain/imRoutine/`
  - `get-unit-URL.ts` - Get unit URL function (duplicate of getUnitURL.ts)
  - `getUnitURL.ts` - Get unit URL function (duplicate of get-unit-URL.ts)
  - `render-ILC-esson.tsx` - Rendering for ILC lesson
  - `render-KH-lesson.tsx` - Rendering for KH lesson
  - `routine-utils.ts` - Routine utilities
  - `index.ts` - Re-exports IM routine logic

#### Look-For Logic
- `/lib/domain/look-fors/` (New)
  - `look-for-utils.ts` - Utilities for look-fors
  - `rubric-utils.ts` - Utilities for rubrics
  - `index.ts` - Re-exports look-for logic

#### Schedule Logic
- `/lib/domain/schedule/` (New)
  - `schedule-utils.ts` - Utilities for schedules
  - `index.ts` - Re-exports schedule logic

#### Visit Logic
- `/lib/domain/visits/` (New)
  - `visit-utils.ts` - Utilities for visits
  - `coaching-log-utils.ts` - Utilities for coaching logs
  - `index.ts` - Re-exports visit logic

#### Classroom Notes Logic
- `/lib/domain/classroom-notes/` (New)
  - `data-utils.ts` - Data utilities for classroom notes
  - `time-tracking.ts` - Time tracking utilities
  - `index.ts` - Re-exports classroom notes logic

#### Main Export
- `/lib/domain/index.ts` - Main export point for domain logic

### Issues to Address:
- Consolidate duplicate functions (e.g., `get-unit-URL.ts` and `getUnitURL.ts`)
- Standardize naming conventions to kebab-case
- Move domain-specific utilities from hooks to domain logic
- Create consistent patterns for domain logic exports

### Modifications Needed:
1. **Fix duplicate functions**:
   - Consolidate `/lib/domain/imRoutine/get-unit-URL.ts` and `/lib/domain/imRoutine/getUnitURL.ts` into a single file

2. **Add domain logic directories**:
   - Create `/lib/domain/look-fors/` as specified in catalog
   - Create `/lib/domain/schedule/` as specified in catalog
   - Create `/lib/domain/visits/` as specified in catalog
   - Create `/lib/domain/classroom-notes/` for classroom notes functionality currently in page components

3. **Move domain logic from other locations**:
   - Move domain-specific logic from `/src/app/dashboard/classroomNotes/data.ts` to `/lib/domain/classroom-notes/data-utils.ts`
   - Move time tracking logic from `TimeTracking` component to `/lib/domain/classroom-notes/time-tracking.ts`
   - Extract business logic from domain components in `/src/components/domain/` to respective domain logic directories
   - Move curriculum utility logic from IM tools to IM routine domain logic

---

## Integration Services

Integrations with external services.

### Location: `/lib/integrations/`

#### Monday.com Integration
- `/lib/integrations/monday/`
  - **Client**
    - `client/client.ts` - Monday.com API client
    - `client/queries.ts` - GraphQL queries for Monday.com
    - `client/index.ts` - Re-exports client
  - **Configuration**
    - `config/field-mapping.ts` - Field mappings for Monday.com
    - `config/index.ts` - Re-exports configuration
  - **Mappers**
    - `mappers/board-types/` - Board type mappings
    - `mappers/entities/` - Entity mappings
    - `mappers/transformers/` - Transformer functions
    - `mappers/index.ts` - Re-exports mappers
  - **Services**
    - `services/import-service.ts` - Import service
    - `services/sync-service.ts` - Sync service
    - `services/transform-service.ts` - Transform service
    - `services/index.ts` - Re-exports services
  - **Types**
    - `types/api.ts` - API types
    - `types/board.ts` - Board types
    - `types/import.ts` - Import types
    - `types/mapping.ts` - Mapping types
    - `types/transform.ts` - Transform types
    - `types/index.ts` - Re-exports types
  - **Utilities**
    - `utils/monday-utils.ts` - Monday.com utility functions
    - `utils/index.ts` - Re-exports utilities
  - `index.ts` - Main export point for Monday.com integration

#### New Integrations
- `/lib/integrations/things3/` (New)
  - `client.ts` - Things3 client
  - `utils.ts` - Things3 utilities
  - `types.ts` - Things3 types
  - `index.ts` - Re-exports Things3 integration

#### Main Export
- `/lib/integrations/index.ts` - Main export point for integrations

### Issues to Address:
- Remove legacy code
- Simplify the Monday.com integration structure
- Create a consistent pattern for all integrations
- Improve error handling and logging

### Modifications Needed:
1. **Clean up Monday.com integration**:
   - Remove `/lib/integrations/monday/config/field-mappings-legacy.ts`
   - Clean up `/lib/integrations/monday/services/legacy/` directory

2. **Create Things3 integration**:
   - Create `/lib/integrations/things3/` directory as specified in catalog
   - Move related code from `/src/components/domain/things3/` to this directory

3. **Standardize integration patterns**:
   - Each integration should follow the same structure (client, services, types, utils)
   - Create consistent error handling across integrations

---

## Dev Tools

Development tools and utilities.

### Location: `/lib/dev/`

#### Debugging Tools
- `/lib/dev/debugging/`
  - `monitor.ts` - Monitoring utilities
  - `use-performance-monitoring.tsx` - Performance monitoring hook
  - `index.ts` - Re-exports debugging tools
  - `README.md` - Documentation for debugging tools

#### Mock Data
- `/lib/dev/mocks/`
  - `mockData.ts` - Mock data for development
  - `mockVisitData.ts` - Mock visit data
  - `scheduleMockGenerator.ts` - Generate mock schedules
  - `index.ts` - Re-exports mock data

#### Testing Utilities
- `/lib/dev/testing/`
  - `schema-config-check.ts` - Schema-config alignment checking
  - `test-utils.ts` - General testing utilities (new)
  - `index.ts` - Re-exports testing utilities

#### Main Export
- `/lib/dev/index.ts` - Main export point for dev tools

### Issues to Address:
- Maintain consistent camelCase naming for mock data functions
- Create factory functions for generating test data in various states
- Add better documentation for testing utilities
- Improve performance monitoring with more robust metrics collection

### Modifications Needed:
1. **Standardize naming conventions**:
   - Rename mock data functions to use consistent camelCase
   - Example: `scheduleMockGenerator.ts` uses camelCase function names

2. **Add testing utilities**:
   - Create `/lib/dev/testing/test-utils.ts` as specified in catalog
   - Move testing utilities from various locations into this file

3. **Improve performance monitoring**:
   - Enhance `/lib/dev/debugging/monitor.ts` with more robust metrics collection
   - Update `/lib/dev/debugging/usePerformanceMonitoring.tsx` to use these metrics

---

## Type System

Type definitions for the application.

### Location: `/lib/types/`

#### Core Types
- `/lib/types/core/`
  - `api.ts` - API-related types
  - `crud.ts` - CRUD operation types
  - `document.ts` - Document types
  - `error.ts` - Error types
  - `pagination.ts` - Pagination types
  - `reference.ts` - Reference data types
  - `resource-manager.ts` - Resource manager types
  - `response.ts` - Response types
  - `token.ts` - Token types
  - `utils.ts` - Utility types
  - `index.ts` - Re-exports core types

#### Domain Types
- `/lib/types/domain/`
  - `cycle.ts` - Cycle types
  - `look-fors.ts` - Look-for types
  - `schedule.ts` - Schedule types
  - `school.ts` - School types
  - `shared.ts` - Shared domain types
  - `staff.ts` - Staff types
  - `things3-types.ts` - Things3 integration types
  - `visit.ts` - Visit types
  - `index.ts` - Re-exports domain types

#### UI Types
- `/lib/types/ui/`
  - `form.ts` - Form types
  - `table.ts` - Table types
  - `index.ts` - Re-exports UI types

#### Main Export & Utilities
- `/lib/types/index.ts` - Main export point for types
- `/lib/types/utilities.ts` - Utility types
- `/lib/types/README.md` - Documentation for type system

### Issues to Address:
- Remove duplicate form type definitions (`form.ts` and `forms.ts`)
- Ensure consistent use of type exports
- Add better documentation for complex types
- Create type validation utilities

### Modifications Needed:
1. **Fix duplicate types**:
   - Consolidate `/lib/types/ui/form.ts` and `/lib/types/ui/forms.ts` into a single file
   - Ensure all dependencies are updated to use the consolidated type

2. **Improve type documentation**:
   - Add JSDoc comments to complex type definitions
   - Create examples of how to use complex types

3. **Create type validation utilities**:
   - Add runtime type validation utilities for complex types

---

## JSON Data

Static JSON data files.

### Location: `/lib/json/`

- `alg1-links.json` - Algebra 1 links
- `ILC_HS.json` - ILC high school data
- `ILC_routines.json` - ILC routines
- `IMplementation.json` - Implementation data
- `indicator.tsx` - Indicator component/data
- `KH_Routines.json` - KH routines
- `primaryStrategy.tsx` - Primary strategy component/data
- `school.tsx` - School component/data
- `index.ts` - Re-exports JSON data (new)

### Issues to Address:
- Standardize file naming conventions to kebab-case
- Move component definitions out of JSON directory
- Create a JSON loader utility
- Add type definitions for JSON data

### Modifications Needed:
1. **Rename JSON files**:
   - Rename `ILC_HS.json` to `ilc-hs.json`
   - Rename `ILC_routines.json` to `ilc-routines.json`
   - Rename `IMplementation.json` to `implementation.json`
   - Rename `KH_Routines.json` to `kh-routines.json`

2. **Move component definitions**:
   - Move `/lib/json/indicator.tsx` to an appropriate component directory
   - Move `/lib/json/primaryStrategy.tsx` to an appropriate component directory
   - Move `/lib/json/school.tsx` to an appropriate component directory

3. **Create index export**:
   - Create `/lib/json/index.ts` to re-export all JSON data

---

## Design Tokens

Design system tokens for the application.

### Location: `/lib/tokens/`

- `colors.ts` - Color tokens for text, backgrounds, borders, rings and hover states
  - Provides semantic color tokens with light/dark variants
  - Includes combined tokens for common use cases
- `layout.ts` - Layout tokens for grid, flex, and spacing patterns
- `semantic-colors.ts` - Semantic color mapping to Tailwind color system
  - Maps semantic names like 'primary' to color values
  - Defines complete Tailwind color palette with shade variations
- `shape.ts` - Shape tokens for borders, shadows, and radii
- `spacing.ts` - Spacing tokens for padding, margin, and gaps
  - Defines component sizing variants that combine text size and padding
  - Provides directional spacing tokens (paddingX, paddingY)
- `text.ts` - Text alignment and styling tokens
- `tokens.ts` - Combined tokens reference
- `typography.ts` - Typography tokens for text sizes, headings, weights and colors
- `types.ts` - Token type definitions with comprehensive type system
  - Provides TypeScript types for all token categories
  - Includes validator functions for runtime token validation
- `index.ts` - Re-exports tokens

### Issues to Address:
- Implement a more robust semantic token system
- Create consistent token naming patterns
- Ensure tokens are used consistently throughout components
- Add documentation for token usage patterns
- Consider implementing design token transformation for different platforms

### Modifications Needed:
1. **Improve semantic token system**:
   - Enhance `/lib/tokens/semantic-colors.ts` with more consistent mapping
   - Create consistent pattern for token naming across all token files

2. **Add token documentation**:
   - Add detailed JSDoc comments to all token files
   - Create examples of how to use tokens correctly

3. **Implement token consistency**:
   - Review component usage of tokens and ensure consistent application
   - Create utility functions for token transformation if needed

---

## Query System

React Query integration.

### Location: `/lib/query/`

#### Hooks
- `/lib/query/hooks/`
  - `useEntityQuery.ts` - Entity query hook for fetching single entities or lists with type safety, error handling, and caching
  - `useOptimisticMutation.ts` - Optimistic mutation hook for CRUD operations with automatic rollback on errors
  - `usePaginatedQuery.ts` - Paginated query hook
  - `index.ts` - Re-exports query hooks

#### Utilities
- `/lib/query/utilities/`
  - `errorHandling.ts` - Error handling for queries with standardized error formatting and monitoring integration
  - `optimisticUpdates.ts` - Optimistic update utilities with CRUD factory pattern
  - `index.ts` - Re-exports query utilities

#### Core Files
- `provider.tsx` - Query provider that sets up QueryClient with default options
  - Configures caching and stale time
  - Integrates React Query DevTools in development mode
- `queryClient.ts` - Query client configuration
- `queryKeys.ts` - Query key definitions for consistent cache management
  - Provides structured hierarchy of query keys for entities, references, and UI state
  - Supports granular cache invalidation
- `index.ts` - Re-exports all query system components

### Issues to Address:
- Develop consistent patterns for using React Query across the app
- Better integrate with error handling system
- Create automatic cache invalidation patterns
- Improve typing of query results

### Modifications Needed:
1. **Integrate with error handling**:
   - Enhance error handling in query system to use the central error handling system
   - Update query error handling in `/lib/query/utilities/errorHandling.ts`

2. **Improve cache invalidation**:
   - Update `/lib/query/queryKeys.ts` to support more granular cache invalidation
   - Create utilities for automatic cache invalidation

3. **Standardize query patterns**:
   - Review application code and ensure consistent use of React Query
   - Move any inconsistent query code into the query system

---

*Note: This document has been updated to include specific modifications needed for each section, providing a clear roadmap for reorganizing the codebase. It now reflects a comprehensive analysis of the project's code structure with actionable steps.*