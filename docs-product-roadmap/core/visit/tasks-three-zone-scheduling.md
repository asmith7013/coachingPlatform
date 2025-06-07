# Three-Zone Visit Scheduling Implementation Tasks (Updated with Feature Organization)

**Context:** Implement flexible visit scheduling with three time zones (first half, second half, full period) within existing school periods
**PRD Reference:** @file:docs-product-roadmap/core/visit/prd-three-zone.md
**Architecture Foundation:** Feature-based organization following domain-alike structure
**Success Criteria:** 75% reduction in scheduling time, 90% user adoption, 99.5% system reliability

**Data Approach:** Simple period-portion model (Option 1 + Smart Utilities)
- **Core Data:** `{ periodNumber: 2, portion: 'first_half' }` 
- **Display Logic:** Calculate times only when needed for UI
- **Human Readable:** "First half of Period 2" matches user mental model

**Feature Organization:** All unique functionality contained in `src/components/features/scheduleBuilder/`

## Quality Requirements
- **DRY (Don't Repeat Yourself)**: Ensure logic isn't duplicated within this module or elsewhere in the codebase
- **Clear Separation of Concerns**: Each file/function should have a single, well-defined responsibility
- **Proper Abstraction**: Create appropriate layers of abstraction without over-engineering
- **Consistent Patterns**: Follow established patterns used elsewhere in the codebase
- **YAGNI Principle**: You Aren't Gonna Need It - don't build complexity for hypothetical future use cases
- **Follow Established Type Patterns**: Leverage existing type definitions. Avoid creating unnecessary type transformations or complex generic constraints.

---

## Task List

- [x] **1.0 Phase 1 (MVP): Core Three-Zone Scheduling** ✅ **COMPLETED**
  **Context Stack:** PRD requirements, feature-based organization, existing visit management
  **Pattern Reference:** Period-portion selection, autosave, conflict prevention
  **Quality Gate:** Core scheduling functionality with immediate visual feedback

  - [x] **1.1 Three-Zone Time Slot Component** ✅
    **File:** `src/components/features/scheduleBuilder/ThreeZoneTimeSlot.tsx` (ENHANCE)
    **Context:** Enhance existing component with simplified period-portion approach
    **Requirements:** 
    - Three clickable zones: first_half, second_half, full_period
    - Simple labels: "First Half", "Second Half", "Full Period"
    - Color coding: blue (first half), purple (second half), green (full period)
    - Display times calculated on-demand from bell schedule
    - Human-readable period labels ("Period 2")
    **Dependencies:**
    - `./types.ts` for feature-specific types
    - `@zod-schema/visits/planned-visit` for portion types
    - `@lib/types/domain/schedule` for `BellSchedule`
    **Quality Checklist:**
    - [ ] Simple component interface: `onSelect(periodNumber, portion)`
    - [ ] No complex time calculations in component
    - [ ] Single responsibility: period-portion selection only
    - [ ] Consistent with established interaction patterns
    **Implementation Notes:**
    - Use `tailwind-variants` for styling consistency
    - Store period number + portion, calculate times for display only
    - Support both controlled and uncontrolled modes
    - Include proper ARIA labels for accessibility

  - [x] **1.2 Period-Portion Utilities** ✅
    **File:** `src/components/features/scheduleBuilder/utils/visit-time-calculator.ts` (CREATE)
    **Context:** Simple period-based visit scheduling with on-demand time calculation
    **Requirements:**
    - Core data structure: `{ periodNumber, portion }` where portion is `'first_half' | 'second_half' | 'full_period'`
    - Calculate display times only when needed from bell schedule
    - Simple conflict detection based on period overlap
    - Human-readable labels ("First half of Period 2")
    **Functions to implement:**
    ```typescript
    interface VisitSchedule {
      teacherId: string;
      periodNumber: number;
      portion: 'first_half' | 'second_half' | 'full_period';
      purpose?: string;
      date: string;
    }
    
    export class VisitTimeCalculator {
      static getTimeRange(visit: VisitSchedule, bellSchedule: BellSchedule): TimeRange;
      static getDisplayLabel(visit: VisitSchedule): string;
      static detectConflict(visit1: VisitSchedule, visit2: VisitSchedule): boolean;
      static getMidpoint(periodStart: string, periodEnd: string): string;
    }
    ```
    **Quality Checklist:**
    - [ ] No complex time math in storage layer
    - [ ] Simple, intuitive data structure
    - [ ] Times calculated only for display
    - [ ] Bell schedule changes don't break existing data
    **Dependencies:**
    - Existing bell schedule utilities
    - `@lib/types/domain/schedule` for `BellSchedule` type

  - [x] **1.3 Enhanced Schedule Grid Integration** ✅
    **File:** `src/components/features/scheduleBuilder/ScheduleGrid.tsx` (ENHANCE)
    **Context:** Extend existing ScheduleGrid to support period-portion selection
    **Requirements:**
    - Click handler for teacher-period intersections
    - Integration with ThreeZoneTimeSlot component
    - Visual feedback for selected portions
    - Support for multi-teacher selection (up to 2)
    - Simple conflict prevention logic
    **Enhancement Strategy:**
    - Add `onPeriodPortionSelect` prop for period-portion selection
    - Add `threeZoneMode` prop to enable/disable feature
    - Integrate with existing `PlannedColumn` for visit display
    - Maintain backward compatibility with existing usage
    **Quality Checklist:**
    - [ ] No breaking changes to existing ScheduleGrid usage
    - [ ] Single responsibility: grid display and basic interaction
    - [ ] Reuses existing cell rendering logic
    - [ ] Simple data flow: period number + portion
    **Implementation Notes:**
    - Extend existing props interface in `./types.ts`
    - Use render props pattern for portion selection UI
    - Leverage existing `ScheduleCell` component

  - [x] **1.4 Visit Scheduling State Management** ✅
    **File:** `src/components/features/scheduleBuilder/hooks/useThreeZoneScheduling.ts` (CREATE)
    **Context:** Manage period-portion visit scheduling state and operations
    **Requirements:**
    - Track selected teachers and portions
    - Handle multi-teacher selection (max 2)
    - Simple conflict detection 
    - Auto-save functionality
    - Real-time state updates
    **Hook Interface:**
    ```typescript
    interface UseThreeZoneSchedulingReturn {
      // Selection state
      selectedTeachers: string[];
      selectedPortion: 'first_half' | 'second_half' | 'full_period' | null;
      selectedPeriodNumber: number | null;
      
      // Actions
      selectTeacher: (teacherId: string) => void;
      selectPeriodPortion: (periodNumber: number, portion: 'first_half' | 'second_half' | 'full_period') => void;
      scheduleVisit: (purpose?: string) => Promise<SchedulingResult>;
      clearSelection: () => void;
      
      // Status
      isScheduling: boolean;
      canSchedule: boolean;
      conflicts: ConflictWarning[];
      
      // Display helpers
      getSelectionLabel: () => string; // "First half of Period 2"
    }
    ```
    **Quality Checklist:**
    - [ ] Leverages existing state patterns from `./hooks/useScheduleSelection.ts`
    - [ ] Simple conflict detection: same period + overlapping portions
    - [ ] Clear separation between UI state and business logic
    - [ ] Follows established hook patterns
    **Dependencies:**
    - `@hooks/domain/usePlannedVisits` for persistence
    - `@actions/visits/planned-visits` for server actions
    - `../utils/visit-time-calculator` for conflict detection

  - [x] **1.5 Database Schema Updates** ✅
    **File:** `src/lib/mongodb/schemas/planned-visits.ts` (ENHANCE)
    **Context:** Extend planned visit schema with simple period-portion approach
    **Requirements:**
    - Add `periodNumber` field (integer: 1, 2, 3, etc.)
    - Add `portion` field: 'first_half' | 'second_half' | 'full_period'
    - Remove complex time calculations from schema
    - Maintain backward compatibility with existing data
    **Schema Updates:**
    ```typescript
    // Add to existing PlannedVisit schema
    periodNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 10  // Reasonable period limit
    },
    portion: {
      type: String,
      enum: ['first_half', 'second_half', 'full_period'],
      default: 'full_period'
    },
    // Remove preciseStartTime/preciseEndTime - calculated on demand
    conflictingVisits: [{ type: ObjectId, ref: 'PlannedVisit' }]
    ```
    **Quality Checklist:**
    - [ ] Simple, intuitive data structure
    - [ ] No complex time storage
    - [ ] Easy queries by period number
    - [ ] Human-readable database records
    **Migration Strategy:**
    - Extract period numbers from existing timeSlot data
    - Default portion to 'full_period' for existing visits
    - Remove time-specific fields that can be calculated

  - [x] **1.6 Auto-Save Implementation** ✅
    **File:** `src/components/features/scheduleBuilder/hooks/useAutoSave.ts` (CREATE)
    **Context:** Google Docs-style auto-save for visit scheduling
    **Requirements:**
    - Debounced auto-save (500ms delay)
    - Optimistic UI updates
    - Error handling with retry logic
    - Visual save status indicators
    - Offline capability with queue
    **Hook Interface:**
    ```typescript
    interface UseAutoSaveReturn {
      saveStatus: 'idle' | 'saving' | 'saved' | 'error';
      lastSaved: Date | null;
      hasUnsavedChanges: boolean;
      forceSave: () => Promise<void>;
      retryFailedSaves: () => Promise<void>;
    }
    ```
    **Quality Checklist:**
    - [ ] Reuses existing debounce utilities
    - [ ] No duplicate persistence logic
    - [ ] Clear separation of concerns (save logic vs UI state)
    - [ ] Follows established error handling patterns
    **Dependencies:**
    - `@lib/utils/debounce` for save timing
    - `@error/handlers/client` for error handling
    - `@actions/visits/planned-visits` for server operations

  - [ ] **1.7 Feature Types Definition**
    **File:** `src/components/features/scheduleBuilder/types.ts` (ENHANCE)
    **Context:** Extend existing types with three-zone specific interfaces
    **Requirements:**
    - Add period-portion specific types
    - Extend existing component props for three-zone support
    - Maintain compatibility with existing types
    - Export feature-specific type definitions
    **Types to add:**
    ```typescript
    // Three-zone specific types
    export type VisitPortion = 'first_half' | 'second_half' | 'full_period';
    
    export interface PeriodPortionSelection {
      periodNumber: number;
      portion: VisitPortion;
    }
    
    export interface ThreeZoneScheduleGridProps extends ScheduleGridProps {
      threeZoneMode?: boolean;
      onPeriodPortionSelect?: (selection: PeriodPortionSelection) => void;
      selectedPortions?: Map<string, VisitPortion>; // "teacherId-periodNumber" -> portion
    }
    
    // Extend existing interfaces
    export interface ConflictWarning {
      type: 'period_overlap' | 'teacher_conflict' | 'capacity_exceeded';
      message: string;
      suggestions?: string[];
    }
    ```
    **Quality Checklist:**
    - [ ] Extends rather than replaces existing types
    - [ ] Simple, intuitive type definitions
    - [ ] No complex generic constraints
    - [ ] Follows established naming patterns


---

## Updated Feature Structure

```
src/components/features/scheduleBuilder/
├── hooks/
│   ├── useScheduleSelection.ts (existing)
│   ├── useThreeZoneScheduling.ts (new)
│   └── useAutoSave.ts (new)
├── utils/
│   ├── visit-time-calculator.ts (new)
│   ├── period-conflict-detector.ts (new)
│   └── visit-notifications.ts (new)
├── AccountabilityTrackingPanel.tsx (existing)
├── AssignedTeacherCard.tsx (existing)
├── ConflictDetectionProvider.tsx (existing)
├── PlannedColumn.tsx (existing)
├── ScheduleCell.tsx (existing)
├── ScheduleGrid.tsx (existing - enhance)
├── ScheduleExporter.tsx (new)
├── TeacherDailySchedule.tsx (existing)
├── TeacherScheduleCalendar.tsx (existing)
├── TeacherSelectionPanel.tsx (existing)
├── ThreeZoneTimeSlot.tsx (existing - enhance)
├── types.ts (existing - enhance)
└── index.ts (existing - enhance)
```

## Implementation Order & Dependencies

**Week 1-2:** Tasks 1.1-1.3 (Core Components with simplified data model)
**Week 3-4:** Tasks 1.4-1.7 (State Management, Persistence & Types)
**Week 5-6:** Phase 2 Planning & Task 2.1 (Simple Conflict Management)
**Week 7-8:** Tasks 2.2-2.3 (Export & Notifications)

## Key Simplifications Made

1. **Data Model:** `{ periodNumber: 2, portion: 'first_half' }` instead of complex time calculations
2. **Conflict Detection:** Simple period + portion overlap instead of time-based math
3. **Display Logic:** Calculate times on-demand from bell schedule, not stored
4. **User Interface:** "First half of Period 2" matches mental model exactly
5. **Database Queries:** Simple `WHERE periodNumber = 2 AND portion = 'first_half'`
6. **Feature Organization:** All unique functionality contained within feature folder

## Success Metrics Tracking

**Efficiency Metrics:**
- [ ] Scheduling time reduction: Target 75%
- [ ] User adoption rate: Target 90% within 4 weeks
- [ ] Schedule completion rate: Target 95%

**Quality Metrics:**
- [ ] Schedule accuracy: <5% modifications required
- [ ] Teacher satisfaction: 85% positive feedback
- [ ] System reliability: 99.5% uptime, 99% autosave success

**Business Impact:**
- [ ] Visit coverage increase: Target 20%
- [ ] Schedule export usage: Target 70%
- [ ] Conflict reduction: Target 50%