# Schedule Grid Refactoring - Task List

## Overview
Systematic refactoring of schedule components to eliminate code duplication, improve maintainability, and establish scalable patterns while maintaining 100% backward compatibility.

## Phase 1: Create Shared Grid Cell Infrastructure
- [ ] **Step 1.1: Extract Grid Cell Factory**
  - [x] Create `src/lib/domain/schedule/grid-cell-factory.ts`
  - [x] Implement `GridCellOptions` interface
  - [x] Implement `GridCellConfig` interface  
  - [x] Create `createGridCellConfig` function
  - [x] Create `renderGridCells` utility function
  - [x] Add comprehensive TypeScript types
  - [ ] Add unit tests for factory functions

- [x] **Step 1.2: Create Base Grid Cell Component**
  - [x] Create `src/components/domain/schedule/BaseGridCell.tsx`
  - [x] Implement `BaseGridCellProps` interface
  - [x] Create reusable cell wrapper with positioning
  - [x] Add styling and CSS class management
  - [x] Ensure accessibility support
  - [x] Add component documentation

## Phase 2: Refactor Component Hierarchy  
- [x] **Step 2.1: Create ScheduleEventGrid Component**
  - [x] Create `src/components/domain/schedule/ScheduleEventGrid.tsx`
  - [x] Implement `ScheduleEventGridProps` interface
  - [x] Add basic event rendering logic
  - [x] Implement event click handling
  - [x] Add event selection state management
  - [x] Use shared grid cell factory
  - [ ] Add component tests

- [x] **Step 2.2: Simplify InteractiveScheduleGrid**
  - [x] Remove duplicated cell rendering logic from InteractiveScheduleGrid
  - [x] Update to use shared grid cell factory  
  - [x] Focus component on interactive-specific features only
  - [x] Remove props adaptation layers
  - [x] Update TypeScript interfaces
  - [x] Maintain backward compatibility
  - [x] **QUALITY FIX**: Implemented composition approach to eliminate DRY violations
  - [ ] Update component tests

- [ ] **Step 2.3: Simplify BellScheduleGrid**
  - [ ] Remove conditional rendering logic from BellScheduleGrid
  - [ ] Convert to pure composition component
  - [ ] Remove `interactive` boolean flag
  - [ ] Update prop interfaces for simplicity
  - [ ] Remove duplicated rendering logic
  - [ ] Update component documentation

## Phase 3: Integration and Testing
- [ ] **Step 3.1: Component Integration**
  - [ ] Verify all components work with shared infrastructure
  - [ ] Test component composition patterns
  - [ ] Ensure no breaking changes to existing APIs
  - [ ] Update import statements across codebase
  - [ ] Run comprehensive TypeScript checks

- [ ] **Step 3.2: Testing and Validation**
  - [ ] Test each grid type independently
  - [ ] Verify shared logic works across all grids
  - [ ] Test with real schedule data
  - [ ] Verify interactive features work correctly
  - [ ] Test responsive behavior across screen sizes
  - [ ] Performance testing and optimization

## Phase 4: Documentation and Cleanup
- [ ] **Step 4.1: Update Type Definitions**
  - [ ] Align interfaces to remove adaptation needs
  - [ ] Ensure type safety across all components
  - [ ] Update domain types if needed
  - [ ] Remove deprecated interfaces
  - [ ] Add comprehensive JSDoc comments

- [ ] **Step 4.2: Documentation and Migration Guide**
  - [ ] Update component system documentation
  - [ ] Create migration guide for future developers
  - [ ] Update architecture documentation
  - [ ] Document new patterns and best practices
  - [ ] Update README files

## Success Criteria
- [ ] 50% reduction in code duplication
- [ ] Single source of truth for grid cell logic
- [ ] Clear component hierarchy and responsibilities
- [ ] No props adaptation layers needed
- [ ] 100% backward compatibility maintained
- [ ] All tests passing
- [ ] TypeScript compilation without errors

## Relevant Files

### Core Infrastructure
- [x] `src/lib/domain/schedule/grid-cell-factory.ts` - Shared grid cell factory and utilities
- [x] `src/components/domain/schedule/BaseGridCell.tsx` - Reusable grid cell wrapper component

### Component Updates
- [x] `src/components/domain/schedule/ScheduleEventGrid.tsx` - New basic event grid component
- [x] `src/components/composed/calendar/schedule/InteractiveScheduleGrid.tsx` - Simplified interactive grid
- [x] `src/components/domain/schools/singleSchool/cards/MasterScheduleCard.tsx` - **DATA LAYER FIX**: Added planned column support
- [ ] `src/components/composed/calendar/schedule/BellScheduleGrid.tsx` - Simplified composition component

### Supporting Files
- [ ] `src/lib/types/domain/schedule.ts` - Updated type definitions
- [ ] `docs/components/domain-components.md` - Updated component documentation
- [ ] `docs/architecture/design-patterns.md` - Updated design patterns documentation

## Anti-Patterns to Avoid
- ❌ Breaking existing component APIs
- ❌ Creating circular dependencies between components
- ❌ Mixing UI logic with data transformation
- ❌ Over-abstracting simple operations
- ❌ Creating components with unclear responsibilities

## Patterns to Follow
- ✅ Single Responsibility Principle for each component
- ✅ Composition over inheritance patterns
- ✅ Centralized utility functions for shared logic
- ✅ Clear separation between layout and interaction concerns
- ✅ Type-safe interfaces with discriminated unions
- ✅ Progressive enhancement approach 