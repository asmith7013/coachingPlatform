# Scheduling System Refactoring Strategy

## Executive Summary

After analyzing the scheduling system, I've identified significant architectural complexity that has grown organically without consistent patterns. The system currently uses **15+ hooks**, **6+ components**, and **multiple overlapping data flow patterns** that can be consolidated into a much cleaner, DRY architecture.

## Current Architecture Analysis

### Hook Complexity Analysis
**Current State**: 15+ hooks across 3 categories
- **Domain Hooks**: 5 hooks (`useScheduleDisplay`, `useVisitScheduleBuilder`, `useTeacherSchedules`, `usePlannedVisits`, `useSchoolDailyView`)
- **UI Hooks**: 6 hooks (`useAccountabilityTracking`, `useAssignmentManagement`, `useTeacherSelection`, `useDragAndDrop`, `useStatePersistence`, `useResponsiveHeight`)
- **Utility Hooks**: 4+ additional hooks

### Component Overlap Analysis
**Current State**: 6+ components with overlapping responsibilities
- `VisitScheduleBuilder` - Main interactive builder (330+ lines)
- `TeacherScheduleCalendar` - Display-only calendar (180+ lines)
- `MasterScheduleCard` - Container with statistics (280+ lines)
- `BellScheduleGrid` - Core grid component
- `AccountabilityTrackingPanel` - Tracking interface
- Multiple smaller components

### Data Flow Issues
1. **Dual Transform Patterns**: Both `useScheduleDisplay` and direct transformer calls
2. **State Duplication**: Multiple sources of truth for teacher selection, assignments
3. **Prop Drilling**: Complex prop chains between components
4. **Mixed Responsibilities**: Components handling both display and business logic

## Proposed Clean Architecture

### 1. Unified Hook Strategy
**Target**: Reduce from 15+ hooks to 5 core hooks

#### Core Scheduling Hook (`useScheduling`)
```typescript
// Single hook that replaces 8+ current hooks
export function useScheduling(config: SchedulingConfig) {
  // Combines: useScheduleDisplay, useTeacherSchedules, useVisitScheduleBuilder
  // useAccountabilityTracking, useAssignmentManagement, useTeacherSelection
}
```

#### Specialized Hooks (4 remaining)
- `useScheduleUI` - UI state only (responsive, theme, interactions)
- `useSchedulePersistence` - Save/load state management
- `useScheduleValidation` - Conflict detection and validation
- `useScheduleTransforms` - Data transformation utilities

### 2. Component Consolidation Strategy
**Target**: Reduce from 6+ components to 3 core components

#### Primary Components
1. **`ScheduleWorkspace`** - Replaces `VisitScheduleBuilder` + `MasterScheduleCard`
2. **`ScheduleGrid`** - Enhanced `BellScheduleGrid` with built-in interactivity
3. **`ScheduleDisplay`** - Pure display variant of `TeacherScheduleCalendar`

### 3. Unified Data Flow Architecture
```typescript
// Single data flow pattern
Zod Schemas → useScheduling → Workspace/Grid/Display
    ↑              ↓
Server Actions ← Cache Layer
```

## Context Strategy

**Primary Context Template:** Component System Guidelines
**Domain Reference:** Architecture/core-principles.md, data-flow/api-patterns.md

## Relevant Files

**Pattern References:**
- `src/hooks/domain/useScheduleDisplay.ts` - WHEN: Hook consolidation phase, WHY: Core scheduling data patterns
- `src/hooks/domain/useVisitScheduleBuilder.ts` - WHEN: Master hook creation, WHY: Builder state management patterns
- `src/components/features/scheduling/VisitScheduleBuilder.tsx` - WHEN: Component consolidation, WHY: Interactive builder patterns
- `src/components/composed/calendar/schedule/BellScheduleGrid.tsx` - WHEN: Grid enhancement, WHY: Layout and interaction patterns
- `src/hooks/ui/useAccountabilityTracking.ts` - WHEN: Hook consolidation, WHY: UI state management patterns

**New Files to Create:**
- `src/hooks/domain/useScheduling.ts` - PURPOSE: Master scheduling hook combining all functionality
- `src/components/features/scheduling/core/ScheduleWorkspace.tsx` - PURPOSE: Unified interactive workspace
- `src/components/features/scheduling/core/ScheduleGrid.tsx` - PURPOSE: Enhanced grid with built-in interactivity
- `src/components/features/scheduling/display/ScheduleDisplay.tsx` - PURPOSE: Pure display variant
- `src/lib/transformers/domain/unified-schedule-transforms.ts` - PURPOSE: Consolidated transformation logic
- `src/types/scheduling/unified-types.ts` - PURPOSE: Consolidated type definitions

## Tasks

- [ ] **1.0 Core Hook Consolidation**
  **Context Stack:** `useScheduleDisplay.ts`, `useVisitScheduleBuilder.ts`, `useAccountabilityTracking.ts`
  **Pattern Reference:** Existing domain hook patterns from project architecture
  **Quality Gate:** Single import for 90% of scheduling functionality

  - [ ] 1.1 Analyze existing hook dependencies and interfaces
    **Reference Files:**
    - `src/hooks/domain/useScheduleDisplay.ts` - WHEN: Interface analysis, WHY: Core data transformation patterns
    - `src/hooks/domain/useVisitScheduleBuilder.ts` - WHEN: State management analysis, WHY: Builder state patterns
    - `src/hooks/ui/useAccountabilityTracking.ts` - WHEN: UI state analysis, WHY: Component interaction patterns
    **Implementation Notes:**
    - Map all current hook inputs/outputs to identify overlaps
    - Document state dependencies between hooks
    - Identify shared data transformations
    **Anti-Patterns:**
    - Don't merge hooks without understanding dependencies - analyze data flow first
    - Avoid breaking existing APIs - plan migration strategy
    **Quality Checklist:**
    - [ ] All hook inputs/outputs documented
    - [ ] Dependency graph created
    - [ ] Migration strategy planned

  - [ ] 1.2 Create useScheduling master hook interface
    **Reference Files:**
    - `src/hooks/domain/useScheduleDisplay.ts` - WHEN: Designing unified interface, WHY: Data transformation patterns
    - `docs/architecture/core-principles.md` - WHEN: Interface design, WHY: Consistency with project patterns
    **Implementation Notes:**
    - Single config object input following project patterns
    - Return object with logical groupings (data, actions, state)
    - Include all current functionality with cleaner API
    **PRD Requirements:**
    - Replace 8+ hooks with single master hook
    - Maintain backward compatibility during transition
    - Follow established project hook patterns

  - [ ] 1.3 Implement core data transformation consolidation
    **Reference Files:**
    - `src/lib/transformers/domain/schedule-transforms.ts` - WHEN: Building transform pipeline, WHY: Existing transformation patterns
    - `src/hooks/domain/useScheduleDisplay.ts` - WHEN: Consolidating transforms, WHY: Current transform usage patterns
    **Implementation Notes:**
    - Single transformation pipeline for all schedule data
    - Eliminate duplicate transform calls across hooks
    - Cache transformed data appropriately
    **Quality Checklist:**
    - [ ] Single source of truth for transformations
    - [ ] Proper caching strategy implemented
    - [ ] No duplicate transform logic

  - [ ] 1.4 Implement unified state management
    **Reference Files:**
    - `src/hooks/domain/useVisitScheduleBuilder.ts` - WHEN: State consolidation, WHY: Assignment management patterns
    - `src/hooks/ui/useAccountabilityTracking.ts` - WHEN: UI state integration, WHY: Component state patterns
    **Implementation Notes:**
    - Combine assignment state, selection state, and UI state
    - Implement proper state synchronization
    - Maintain performance with optimized re-renders
    **Anti-Patterns:**
    - Don't duplicate state management - consolidate into single source
    - Avoid prop drilling - provide direct state access
    **Quality Checklist:**
    - [ ] Single state management pattern
    - [ ] No state duplication
    - [ ] Optimized re-render strategy

  - [ ] 1.5 Create specialized utility hooks
    **Reference Files:**
    - `src/hooks/ui/useStatePersistence.ts` - WHEN: Persistence patterns, WHY: Save/load state patterns
    - `src/hooks/ui/useResponsiveHeight.ts` - WHEN: UI utilities, WHY: Responsive behavior patterns
    **Implementation Notes:**
    - Extract non-core functionality to specialized hooks
    - Maintain clean separation of concerns
    - Ensure hooks are composable with master hook
    **PRD Requirements:**
    - Create 4 specialized hooks for specific concerns
    - Maintain clean interfaces and dependencies
    - Support composition with master hook

- [ ] **2.0 Component Architecture Redesign**
  **Context Stack:** `VisitScheduleBuilder.tsx`, `BellScheduleGrid.tsx`, component system guidelines
  **Pattern Reference:** Established component composition patterns
  **Quality Gate:** 80% reduction in component prop complexity

  - [ ] 2.1 Design ScheduleWorkspace unified component
    **Reference Files:**
    - `src/components/features/scheduling/VisitScheduleBuilder.tsx` - WHEN: Workspace design, WHY: Interactive functionality patterns
    - `src/components/domain/scheduling/MasterScheduleCard.tsx` - WHEN: Container patterns, WHY: Statistics and layout patterns
    - `docs/components/component-system.md` - WHEN: Component structure, WHY: Project component architecture
    **Implementation Notes:**
    - Combine VisitScheduleBuilder + MasterScheduleCard functionality
    - Use compound component pattern for flexibility
    - Integrate statistics and interactive builder seamlessly
    **Anti-Patterns:**
    - Don't create monolithic component - use composition pattern
    - Avoid duplicating existing functionality - reuse established patterns
    **Quality Checklist:**
    - [ ] Follows compound component pattern
    - [ ] Integrates existing functionality seamlessly
    - [ ] Reduces prop complexity by 80%

  - [ ] 2.2 Enhance ScheduleGrid with built-in interactivity
    **Reference Files:**
    - `src/components/composed/calendar/schedule/BellScheduleGrid.tsx` - WHEN: Grid enhancement, WHY: Layout and interaction patterns
    - `src/components/composed/calendar/schedule/PlannedScheduleColumn.tsx` - WHEN: Interactive features, WHY: Drop zone and interaction patterns
    **Implementation Notes:**
    - Move interaction logic directly into grid component
    - Eliminate external interaction management complexity
    - Maintain responsive grid behavior
    **Implementation Notes:**
    - Follow existing grid layout patterns
    - Integrate click-to-assign workflow seamlessly
    - Maintain performance with large datasets

  - [ ] 2.3 Create pure ScheduleDisplay component
    **Reference Files:**
    - `src/components/features/scheduling/TeacherScheduleCalendar.tsx` - WHEN: Display patterns, WHY: Read-only component patterns
    - `docs/components/core-components.md` - WHEN: Component structure, WHY: Pure component guidelines
    **Implementation Notes:**
    - Extract display-only functionality
    - Remove all interactive code and dependencies
    - Optimize for pure display scenarios
    **PRD Requirements:**
    - Create read-only variant for display scenarios
    - Remove interactive dependencies
    - Optimize for performance

  - [ ] 2.4 Implement component prop consolidation
    **Reference Files:**
    - `src/components/features/scheduling/VisitScheduleBuilder.tsx` - WHEN: Prop analysis, WHY: Current prop patterns
    - `docs/components/component-system.md` - WHEN: Prop design, WHY: Consistent prop patterns
    **Implementation Notes:**
    - Reduce prop count by 80% through config objects
    - Use compound component pattern to eliminate prop drilling
    - Maintain type safety with proper TypeScript interfaces
    **Quality Checklist:**
    - [ ] Props reduced by 80%
    - [ ] No prop drilling chains
    - [ ] Type safety maintained

  - [ ] 2.5 Integrate components with unified hook system
    **Reference Files:**
    - `src/hooks/domain/useScheduling.ts` - WHEN: Hook integration, WHY: New master hook patterns
    - `docs/workflows/hook-development.md` - WHEN: Integration patterns, WHY: Hook-component integration guidelines
    **Implementation Notes:**
    - Connect all components to new useScheduling hook
    - Eliminate direct hook dependencies
    - Ensure clean data flow architecture
    **Anti-Patterns:**
    - Don't bypass master hook - use unified data flow
    - Avoid mixing old and new patterns during transition

- [ ] **3.0 State Management Cleanup**
  **Context Stack:** Unified state patterns, React Query configurations
  **Pattern Reference:** Existing React Query patterns from project
  **Quality Gate:** Single state shape for all scheduling operations

  - [ ] 3.1 Design unified state shape
    **Reference Files:**
    - `src/types/scheduling/` - WHEN: State design, WHY: Existing type patterns
    - `docs/data-flow/schema-system.md` - WHEN: State structure, WHY: Consistent state patterns
    **Implementation Notes:**
    - Create single state interface for all scheduling operations
    - Eliminate redundant state tracking patterns
    - Use Zod schemas for validation
    **PRD Requirements:**
    - Single state shape for consistency
    - Eliminate state duplication
    - Maintain type safety

  - [ ] 3.2 Implement cache strategy alignment
    **Reference Files:**
    - `src/hooks/ui/useStatePersistence.ts` - WHEN: Cache patterns, WHY: Existing persistence patterns
    - `docs/data-flow/react-query-patterns.md` - WHEN: Cache configuration, WHY: Project cache strategies
    **Implementation Notes:**
    - Align with existing React Query patterns
    - Optimize stale times and invalidation strategies
    - Standardize error handling and loading states
    **Quality Checklist:**
    - [ ] Follows project React Query patterns
    - [ ] Optimized cache invalidation
    - [ ] Standardized error handling

  - [ ] 3.3 Migrate existing state patterns
    **Reference Files:**
    - `src/hooks/domain/useVisitScheduleBuilder.ts` - WHEN: Migration planning, WHY: Current state patterns
    - `src/hooks/ui/useAccountabilityTracking.ts` - WHEN: State migration, WHY: UI state patterns
    **Implementation Notes:**
    - Migrate multiple state patterns to unified approach
    - Maintain functionality during transition
    - Remove legacy state management code
    **Anti-Patterns:**
    - Don't break existing functionality - migrate incrementally
    - Avoid mixing old and new state patterns

- [ ] **4.0 Integration and Testing**
  **Context Stack:** End-to-end workflow testing
  **Pattern Reference:** Existing testing patterns
  **Quality Gate:** All use cases validated with improved performance

  - [ ] 4.1 Validate schedule builder page functionality
    **Reference Files:**
    - `src/app/visit-schedule-builder/page.tsx` - WHEN: Integration testing, WHY: Primary use case validation
    - `src/components/features/scheduling/VisitScheduleBuilder.tsx` - WHEN: Functionality testing, WHY: Interactive workflow validation
    **Implementation Notes:**
    - Test complete click-to-assign workflow
    - Validate assignment creation and management
    - Ensure accountability tracking integration
    **Quality Checklist:**
    - [ ] Click-to-assign workflow functional
    - [ ] Assignment management working
    - [ ] Accountability tracking integrated

  - [ ] 4.2 Test future schedules display integration
    **Reference Files:**
    - `src/components/features/scheduling/TeacherScheduleCalendar.tsx` - WHEN: Display testing, WHY: Read-only use case validation
    - New ScheduleDisplay component - WHEN: Pure display testing, WHY: Display-only functionality
    **Implementation Notes:**
    - Validate read-only schedule display
    - Test data transformation accuracy
    - Ensure performance with large datasets
    **PRD Requirements:**
    - Validate display-only functionality
    - Test performance improvements
    - Ensure data accuracy

  - [ ] 4.3 Validate visit preview integration
    **Reference Files:**
    - `src/components/domain/visits/` - WHEN: Integration testing, WHY: Visit system integration patterns
    - New ScheduleWorkspace component - WHEN: Integration validation, WHY: Workspace integration patterns
    **Implementation Notes:**
    - Test visit creation from schedule assignments
    - Validate data flow between scheduling and visit systems
    - Ensure proper error handling
    **Quality Checklist:**
    - [ ] Visit creation functional
    - [ ] Data flow validated
    - [ ] Error handling working

  - [ ] 4.4 Performance optimization and bundle analysis
    **Reference Files:**
    - `docs/workflows/development-workflow.md` - WHEN: Performance testing, WHY: Optimization guidelines
    - Bundle analyzer configuration - WHEN: Bundle analysis, WHY: Size optimization patterns
    **Implementation Notes:**
    - Analyze bundle size impact of refactoring
    - Optimize re-render patterns with React DevTools
    - Measure and improve user experience metrics
    **PRD Requirements:**
    - Achieve 25% bundle size improvement
    - Optimize re-render patterns
    - Improve user experience metrics

## Breaking Changes Strategy

Since backward compatibility isn't required, we can make these beneficial changes:

### API Simplification
```typescript
// BEFORE (complex)
const { schedules, staff, bellSchedule } = useMultipleHooks()
const { events } = useScheduleDisplay(schedules, staff, date, bellSchedule)
const builder = useVisitScheduleBuilder(date, schoolId, coachId)

// AFTER (simple)
const scheduling = useScheduling({ 
  schoolId, 
  coachId, 
  date 
})
```

### Component Interface Cleanup
```typescript
// BEFORE (15+ props)
<VisitScheduleBuilder 
  date={date}
  schoolId={schoolId}
  coachId={coachId}
  bellSchedule={bellSchedule}
  teacherSchedule={teacherSchedule}
  existingPlannedVisits={existingPlannedVisits}
  schedules={schedules}
  staff={staff}
  bellScheduleData={bellScheduleData}
  // ... 6+ more props
/>

// AFTER (3 props)
<ScheduleWorkspace 
  config={{ schoolId, coachId, date }}
  mode="interactive"
  variant="default"
/>
```

### File Structure Reorganization
```
Current: 15+ files across multiple directories
Target: 8 files in logical groupings

src/components/features/scheduling/
├── core/
│   ├── useScheduling.ts          # Master hook
│   ├── ScheduleWorkspace.tsx     # Main component
│   └── ScheduleGrid.tsx          # Grid component
├── display/
│   ├── ScheduleDisplay.tsx       # Read-only variant
│   └── ScheduleCard.tsx          # Card wrapper
├── utils/
│   ├── schedule-transforms.ts    # Unified transforms
│   └── schedule-types.ts         # Consolidated types
└── index.ts                      # Clean exports
```

## Benefits Analysis

### Developer Experience Improvements
- **90% reduction** in hooks to learn/maintain (15+ → 5)
- **80% reduction** in component prop complexity
- **Single import** for most scheduling functionality
- **Consistent patterns** aligned with project standards

### Code Quality Improvements
- **Eliminates** duplicate state management
- **Removes** prop drilling chains
- **Consolidates** data transformation logic
- **Standardizes** error handling and loading states

### Performance Improvements
- **Reduces** unnecessary re-renders from multiple state sources
- **Optimizes** cache invalidation patterns
- **Minimizes** bundle size impact
- **Improves** component composition efficiency

## Risk Mitigation

### Development Risks
- **Risk**: Temporary functionality loss during refactor
- **Mitigation**: Phase-by-phase implementation with feature flags

### Integration Risks  
- **Risk**: Breaking existing page integrations
- **Mitigation**: Maintain wrapper components during transition

### Timeline Risks
- **Risk**: Underestimating complexity of consolidation
- **Mitigation**: Start with hook consolidation (highest impact, lowest risk)

## Success Metrics

### Quantitative Goals
- Reduce hook count from 15+ to 5
- Reduce component props by 80%
- Improve bundle size by 25%
- Reduce LOC by 40%

### Qualitative Goals
- Developer can understand system in <30 minutes
- New features require touching <3 files
- Consistent patterns with rest of project
- Clear separation of concerns

## Next Steps

1. **Approve Strategy** - Confirm approach and priorities
2. **Detailed Design** - Create specific interfaces for new hooks/components  
3. **Implementation Plan** - Break down into specific code changes
4. **Migration Strategy** - Plan for transitioning existing usage

This refactoring will transform the scheduling system from a complex, organically-grown codebase into a clean, maintainable architecture that follows your project's established patterns and significantly improves the developer experience.