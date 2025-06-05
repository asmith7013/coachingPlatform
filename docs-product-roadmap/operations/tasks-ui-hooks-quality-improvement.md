# UI Hooks Quality Improvement - Task List

## Context Strategy

**Primary Context Template:** Data Layer Context (for server state integration) + UI Component Context (for UI state patterns)
**Domain Reference:** Visit and Schedule domain patterns

## Relevant Files

**Pattern References:**
- `src/hooks/domain/useSchools.ts` - WHEN: Refactoring server state hooks, WHY: Established React Query + transformation service pattern
- `src/hooks/domain/useUserStaff.ts` - WHEN: Error handling integration, WHY: Proper error handling with transformers
- `src/query/client/hooks/mutations/useErrorHandledMutation.ts` - WHEN: Replacing manual error handling, WHY: Standardized mutation error handling
- `src/lib/error/handlers/client.ts` - WHEN: Implementing consistent error handling, WHY: Unified error system
- `src/app/actions/visits/planned-visits.ts` - WHEN: Server action integration, WHY: Established server action patterns

**Files Modified in Task 1.1:**
- `src/hooks/ui/useAssignmentManagement.ts` - ✅ Replaced manual error handling with useErrorHandledMutation
- `src/hooks/ui/useStatePersistence.ts` - ✅ Replaced manual try/catch with standardized mutation pattern
- `src/hooks/domain/useVisitScheduleBuilder.ts` - ✅ Fixed type compatibility with updated assignment management

**Files Modified in Task 1.4:**
- `src/hooks/ui/useAssignmentManagement.ts` - ✅ Replaced manual date.toISOString().split('T')[0] with toDateString utility
- `src/hooks/ui/useTeacherSelection.ts` - ✅ Added documentation for appropriate Date object usage
- `src/hooks/ui/useAccountabilityTracking.ts` - ✅ Added documentation for appropriate Date object usage

**Files Modified in Task 2.1:**
- `src/hooks/ui/useAssignmentManagement.ts` - ✅ Integrated usePlannedVisits entity factory for server state operations
- `src/hooks/domain/useVisitScheduleBuilder.ts` - ✅ Updated to use enhanced assignment management with entity factory

**Files Modified in Task 2.3:**
- `src/hooks/ui/useStatePersistence.ts` - ✅ Enhanced with React Query optimistic updates for save operations
- `src/hooks/ui/useAccountabilityTracking.ts` - ✅ Added optimistic update patterns for immediate UI feedback
- `src/hooks/ui/useTeacherSelection.ts` - ✅ Implemented optimistic updates for selection state management

**Files Modified in Task 2.4:**
- `src/hooks/ui/useStatePersistence.ts` - ✅ Applied appropriate retry configuration for save/load operations based on criticality
- `src/hooks/ui/useAssignmentManagement.ts` - ✅ Enhanced conflict check retry configuration and documented entity factory cache patterns
- `src/hooks/domain/usePlannedVisits.ts` - ✅ VERIFIED: Already uses proper cache configuration (5min staleTime) following useSchools.ts pattern

**New Files to Create:**
- `src/hooks/ui/useScheduleBuilderState.ts` - PURPOSE: Simplified state management for schedule builder
- `src/hooks/ui/useOptimisticAssignments.ts` - PURPOSE: React Query-based assignment management
- `src/hooks/ui/useInteractionState.ts` - PURPOSE: Consolidated drag/selection state

## Tasks

- [ ] 1.0 Infrastructure Integration - Replace Manual Implementations with Established Patterns
  **Context Stack:** Error handling, server actions, React Query integration
  **Pattern Reference:** Domain hooks pattern from useSchools.ts
  **Quality Gate:** DRY compliance - no duplicate error handling or state management

  - [x] 1.1 Error Handling Standardization
    **Target:** Replace manual try/catch blocks with `useErrorHandledMutation`
    **Files:** All UI hooks with server state operations
    **Pattern:** `src/query/client/hooks/mutations/useErrorHandledMutation.ts`
    **Outcome:** Consistent error handling across all UI hooks

  - [x] 1.2 Server Action Integration
    **Target:** Replace direct fetch calls with server action integration
    **Files:** Any hooks calling APIs directly
    **Pattern:** `src/app/actions/visits/planned-visits.ts` server action pattern
    **Outcome:** Unified server communication layer

  - [x] 1.3 Invalidation Pattern Migration
    **Target:** Replace manual cache management with `useInvalidation` hook
    **Files:** All hooks managing React Query cache manually
    **Pattern:** `useInvalidation` from `src/query/cache/invalidation.ts`
    **Outcome:** Standardized cache invalidation patterns

  - [x] 1.4 Transformation Service Integration
    **Target:** Leverage existing transformation services for date handling
    **Files:** Hooks dealing with date objects or document transformation
    **Pattern:** `createTransformationService` pattern from domain hooks
    **Outcome:** Consistent data transformation pipeline

- [ ] 2.0 Server State Migration - Convert Manual Fetch to React Query
  **Context Stack:** Transformation services, server actions, query factories
  **Pattern Reference:** useSchools.ts transformation service pattern
  **Quality Gate:** Type safety - leverage existing transformation utilities

  - [x] 2.1 Entity Factory Pattern Adoption
    **Target:** Replace custom React Query implementations with entity factory
    **Files:** UI hooks with server state that don't use entity factories
    **Pattern:** `createEntityHooks` from `src/query/client/factories/entity-factory`
    **Outcome:** Standardized CRUD operations with built-in optimizations

  - [x] 2.2 Query Key Standardization
    **Target:** Eliminate manual query key management in favor of entity factory patterns
    **Files:** All hooks that manually define `mutationKey` or `queryKey`
    **Pattern:** Entity factory internal query key generation
    **Outcome:** Centralized query key management through entity factory system

  - [x] 2.3 Optimistic Update Integration
    **Target:** Replace manual state updates with React Query optimistic updates
    **Files:** UI hooks managing local state that mirrors server state
    **Pattern:** React Query optimistic update patterns from domain hooks
    **Outcome:** Better UX with instant feedback and automatic rollback

  - [x] 2.4 Stale Time and Cache Configuration
    **Target:** Apply appropriate caching strategies based on data volatility
    **Files:** All React Query configurations in UI hooks
    **Pattern:** Cache configuration patterns from `useSchools.ts`
    **Outcome:** Optimal performance with appropriate cache lifetime

- [ ] 3.0 Hook Consolidation - Simplify and Combine Related Functionality
  **Context Stack:** UI state patterns, composition strategies
  **Pattern Reference:** Composition pattern from useVisitScheduleBuilder.ts
  **Quality Gate:** Single responsibility - each hook has clear, focused purpose

  - [ ] 3.1 State Machine Pattern Implementation
    **Target:** Replace complex useState combinations with state machines
    **Files:** Hooks with multiple related boolean states
    **Pattern:** State machine patterns for UI state management
    **Outcome:** Predictable state transitions and reduced state complexity

  - [ ] 3.2 Custom Hook Composition
    **Target:** Break down monolithic hooks into composable smaller hooks
    **Files:** Large hooks with multiple responsibilities
    **Pattern:** Hook composition patterns from existing UI hooks
    **Outcome:** Reusable hook logic and improved testability

  - [ ] 3.3 Event Handler Consolidation
    **Target:** Merge related event handlers into unified interfaces
    **Files:** Hooks with many similar event handlers
    **Pattern:** Event handler patterns from schedule builder hooks
    **Outcome:** Simplified component APIs and reduced prop drilling

  - [ ] 3.4 Unified Interface Creation
    **Target:** Create unified hook interfaces following domain hook patterns
    **Files:** Related hooks that should be accessed through single interface
    **Pattern:** Unified interface pattern from `useCoachingActionPlans`
    **Outcome:** Consistent developer experience and easier discoverability

- [ ] 4.0 Type System Alignment - Leverage Existing Type Infrastructure
  **Context Stack:** Base document types, type utilities, transformation types
  **Pattern Reference:** Type patterns from domain hooks
  **Quality Gate:** Type consistency - extend existing types, avoid custom implementations

  - [ ] 4.1 Base Document Type Extension
    **Target:** Replace custom document types with extensions of base document types
    **Files:** Hooks with custom document type definitions
    **Pattern:** `BaseDocument` and `WithDateObjects` types from core types
    **Outcome:** Consistent document structure and automatic date transformation

  - [ ] 4.2 Type Utility Adoption
    **Target:** Replace manual type definitions with existing type utilities
    **Files:** Hooks with custom utility types
    **Pattern:** Type utilities from `@core-types` and transformation utilities
    **Outcome:** Reduced type duplication and improved type safety

  - [ ] 4.3 Transformation Type Integration
    **Target:** Leverage transformation service types for consistent typing
    **Files:** Hooks handling server/client data transformation
    **Pattern:** Transformation service type patterns from domain hooks
    **Outcome:** Type-safe data transformation with automatic inference

  - [ ] 4.4 Generic Type Parameter Optimization
    **Target:** Add appropriate generic constraints and defaults
    **Files:** Hooks with generic type parameters
    **Pattern:** Generic type patterns from entity factory and domain hooks
    **Outcome:** Better type inference and development experience

- [ ] 5.0 Performance and Simplification - Remove Over-Engineering
  **Context Stack:** YAGNI principles, established patterns
  **Pattern Reference:** Simplified hook patterns from existing codebase
  **Quality Gate:** Simplicity - remove hypothetical future features, focus on current needs

  - [ ] 5.1 Over-Abstraction Removal
    **Target:** Remove unnecessary abstractions that don't provide current value
    **Files:** Hooks with complex abstractions for simple use cases
    **Pattern:** Direct implementation patterns where appropriate
    **Outcome:** Simplified codebase focused on actual requirements

  - [ ] 5.2 Premature Optimization Cleanup
    **Target:** Remove performance optimizations that don't provide measurable benefit
    **Files:** Hooks with complex memoization or caching for simple operations
    **Pattern:** Simple implementation patterns from core hooks
    **Outcome:** Cleaner code focused on readability and maintainability

  - [ ] 5.3 Future Feature Removal
    **Target:** Remove code designed for hypothetical future requirements
    **Files:** Hooks with unused configuration options or extensibility points
    **Pattern:** Minimal viable implementation patterns
    **Outcome:** Codebase focused on current, validated requirements

  - [ ] 5.4 Dependency Minimization
    **Target:** Reduce unnecessary dependencies and external library usage
    **Files:** Hooks with heavy dependencies for simple operations
    **Pattern:** Native implementation patterns where appropriate
    **Outcome:** Reduced bundle size and improved maintainability

  - [ ] 5.5 Code Complexity Reduction
    **Target:** Simplify complex logic that doesn't provide proportional value
    **Files:** Hooks with high cyclomatic complexity
    **Pattern:** Simplified logic patterns from optimized hooks
    **Outcome:** More maintainable code with clear business logic flow

