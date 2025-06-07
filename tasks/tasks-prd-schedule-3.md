# Tasks: MasterScheduleCard Scheduling Interface Enhancement

## Context Strategy

**Primary Context Template:** UI Component Context (interactive components with state management)
**Domain Reference:** Visit scheduling and teacher schedule management

## Relevant Files

**Pattern References:**
- `src/components/domain/schools/singleSchool/cards/MasterScheduleCard.tsx` - WHEN: enhancing existing component, WHY: core component being extended per PRD
- `src/components/features/scheduleBuilder/hooks/useThreeZoneScheduling.ts` - WHEN: scheduling state integration, WHY: existing three-zone scheduling logic per PRD
- `src/components/features/scheduleBuilder/SchedulingInterface.tsx` - WHEN: scheduling UI implementation, WHY: existing scheduling interface patterns
- `src/components/features/scheduleBuilder/TeacherDailySchedule.tsx` - WHEN: view mode integration, WHY: existing schedule display component
- `src/hooks/utilities/useAutoSave.ts` - WHEN: implementing auto-save, WHY: established auto-save patterns for visit data

**New Files to Create:**
- `src/components/features/scheduleBuilder/PlannedVisitsColumn.tsx` (~150 lines)
  - PURPOSE: Frozen column for displaying and managing planned visits
  - IMPORTS: `@core-components/cards/Card`, `@core-components/buttons/Button`, `@hooks/utilities/useAutoSave`
  - EXPORTS: `PlannedVisitsColumn` component with `PlannedVisitsColumnProps` interface
  - INTEGRATES: Visit schema types and auto-save functionality

- `src/components/features/scheduleBuilder/VisitCard.tsx` (~100 lines)
  - PURPOSE: Individual visit card display with edit/delete capabilities
  - IMPORTS: `@core-components/cards/Card`, `@core-components/dropdowns/Dropdown`
  - EXPORTS: `VisitCard` component with `VisitCardProps` interface
  - REPLACES: Basic visit display elements (consolidates into reusable card)

- `src/hooks/domain/useVisitScheduling.ts` (~200 lines)
  - PURPOSE: Visit scheduling data management and persistence
  - IMPORTS: `@hooks/utilities/useAutoSave`, `@zod-schema/visits/visit`, `@app/actions/visits/visit`
  - EXPORTS: `useVisitScheduling` hook with comprehensive visit management
  - INTEGRATES: Three-zone scheduling hook and server actions

**Files to Modify:**
- `src/components/domain/schools/singleSchool/cards/MasterScheduleCard.tsx` - ✅ UPDATED: Added frozen column layout props and callback handlers
- `src/components/features/scheduleBuilder/types.ts` - ADD: Visit scheduling type definitions  
- `src/lib/types/domain/visits.ts` - ADD: Enhanced visit scheduling interfaces

**Files Created:**
- `src/components/features/scheduleBuilder/PlannedVisitsColumn.tsx` - ✅ CREATED: Frozen column component with visit cards and empty state (127 lines)

**Files to Delete:** [None - this is an enhancement, not a replacement]

## Tasks

- [x] 1.0 Implement Core Frozen Column Layout
  **Context Stack:** `MasterScheduleCard.tsx`, `TeacherDailySchedule.tsx`, existing grid layout patterns
  **Pattern Reference:** CSS Grid with sticky positioning from existing schedule components
  **Quality Gate:** Smooth horizontal scrolling with frozen columns maintained across screen sizes
  - [x] 1.1 Add Planned Visits column to existing grid layout
    **File:** `src/components/domain/schools/singleSchool/cards/MasterScheduleCard.tsx`
    **Scope:** ~50 lines modification, CSS Grid layout enhancement
    **Interfaces to Update:**
    ```typescript
    interface MasterScheduleCardProps {
      // ... existing props
      showPlannedVisits?: boolean // Default: true
      onVisitScheduled?: (visitData: ScheduledVisitData) => void
      onVisitModified?: (visitId: string, visitData: Partial<ScheduledVisitData>) => void
      onVisitDeleted?: (visitId: string) => void
    }
    ```
    **Implementation Notes:**
    - Use CSS `position: sticky` for column freezing
    - Maintain existing `TeacherDailySchedule` in view mode unchanged
    - Add frozen column container with proper z-index layering
    **Anti-Patterns:**
    - Don't use JavaScript scroll synchronization - use CSS sticky positioning
    - Avoid recreating existing grid structure - extend it
    **Quality Checklist:**
    - [ ] Maintains existing view mode functionality (backward compatibility)
    - [ ] Frozen columns stay in position during horizontal scroll
    - [ ] No layout shift between view and schedule modes
    - [ ] Responsive on mobile devices (minimum viable experience)

  - [x] 1.2 Create PlannedVisitsColumn component with empty state
    **File:** `src/components/features/scheduleBuilder/PlannedVisitsColumn.tsx`
    **Scope:** ~100 lines, frozen column component with visit cards
    **Interfaces to Create:**
    ```typescript
    interface PlannedVisitsColumnProps {
      visits: ScheduledVisit[]
      periodTimes: Array<{ period: number; start: string; end: string }>
      onVisitEdit?: (visitId: string) => void
      onVisitDelete?: (visitId: string) => void
      className?: string
    }
    
    interface ScheduledVisit {
      id: string
      teacherId: string
      teacherName: string
      periodNumber: number
      portion: VisitPortion
      purpose?: string
      createdAt: Date
    }
    ```
    **Functions to Implement:**
    - `PlannedVisitsColumn(props: PlannedVisitsColumnProps): JSX.Element` (~70 lines)
    - `renderEmptyState(): JSX.Element` (~20 lines)
    - `renderVisitsByPeriod(): JSX.Element` (~30 lines)
    **Reference Files:**
    - `src/components/features/scheduleBuilder/TeacherDailySchedule.tsx` - WHEN: styling period rows, WHY: consistent visual alignment
    - `src/components/composed/cards/Card.tsx` - WHEN: visit card styling, WHY: consistent card patterns
    **Integration Points:**
    - Period alignment with main schedule grid
    - Consistent height with schedule rows
    - Empty state messaging for new users

- [ ] 2.0 Implement Three-Zone Selection Interface
  **Context Stack:** `ThreeZoneTimeSlot.tsx`, `useThreeZoneScheduling.ts`, `SchedulingInterface.tsx`
  **Pattern Reference:** Existing three-zone time slot component with hover states
  **Quality Gate:** Intuitive click-to-select workflow with immediate visual feedback
  - [ ] 2.1 Integrate three-zone selection in schedule mode
    **File:** `src/components/domain/schools/singleSchool/cards/MasterScheduleCard.tsx`
    **Scope:** ~80 lines modification, mode-specific rendering
    **Functions to Modify:**
    - `handlePeriodPortionSelect(periodNumber: number, portion: VisitPortion): void` (~15 lines)
    - `renderScheduleMode(): JSX.Element` (~40 lines)
    - `handleScheduleVisit(purpose?: string): Promise<void>` (~25 lines)
    **Implementation Notes:**
    - Replace SchedulingInterface with embedded three-zone grid
    - Only show three-zone selector for clicked periods
    - Maintain selection state across mode switches
    **PRD Requirements:**
    - Show selector only for specific period that was clicked
    - Immediate scheduling when zone selected (no confirmation step)
    - Purpose dropdown selection after initial scheduling
    **Quality Checklist:**
    - [ ] Three-zone selector appears only for clicked period
    - [ ] Click outside selector clears selection
    - [ ] Visual feedback during selection process
    - [ ] Consistent with existing `ThreeZoneTimeSlot` patterns

  - [ ] 2.2 Add immediate visit scheduling workflow
    **File:** `src/hooks/domain/useVisitScheduling.ts`
    **Scope:** ~150 lines, new hook for visit data management
    **Interfaces to Create:**
    ```typescript
    interface UseVisitSchedulingOptions {
      schoolId: string
      date: string
      onVisitScheduled?: (visit: ScheduledVisit) => void
      onError?: (error: string) => void
    }
    
    interface UseVisitSchedulingReturn {
      visits: ScheduledVisit[]
      scheduleVisit: (visitData: CreateVisitData) => Promise<SchedulingResult>
      updateVisit: (visitId: string, data: Partial<ScheduledVisit>) => Promise<boolean>
      deleteVisit: (visitId: string) => Promise<boolean>
      isLoading: boolean
      error: string | null
    }
    ```
    **Functions to Implement:**
    - `useVisitScheduling(options: UseVisitSchedulingOptions): UseVisitSchedulingReturn` (~100 lines)
    - `createOptimisticVisit(data: CreateVisitData): ScheduledVisit` (~20 lines)
    - `validateVisitData(data: CreateVisitData): ValidationResult` (~30 lines)
    **Reference Files:**
    - `src/hooks/utilities/useAutoSave.ts` - WHEN: implementing auto-save, WHY: established auto-save patterns
    - `src/hooks/domain/useSchoolDailyView.ts` - WHEN: school data integration, WHY: consistent data fetching patterns
    **Integration Points:**
    - Optimistic updates for immediate UI response
    - Auto-save with 2-second debouncing per useAutoSave pattern
    - Error handling with retry logic

- [ ] 3.0 Create Visit Card Management System
  **Context Stack:** `Card.tsx`, `Dropdown.tsx`, purpose assignment patterns
  **Pattern Reference:** Existing card components with action buttons
  **Quality Gate:** Seamless edit/delete workflow without modal disruption
  - [ ] 3.1 Build VisitCard component with edit capabilities
    **File:** `src/components/features/scheduleBuilder/VisitCard.tsx`
    **Scope:** ~80 lines, reusable visit display card
    **Interfaces to Create:**
    ```typescript
    interface VisitCardProps {
      visit: ScheduledVisit
      onEdit?: () => void
      onDelete?: () => void
      onPurposeChange?: (purpose: string) => void
      compact?: boolean
      className?: string
    }
    ```
    **Functions to Implement:**
    - `VisitCard(props: VisitCardProps): JSX.Element` (~50 lines)
    - `formatVisitTime(portion: VisitPortion): string` (~15 lines)
    - `getPurposeIcon(purpose?: string): IconComponent` (~15 lines)
    **Reference Files:**
    - `src/components/core/dropdowns/PurposeAssignmentDropdown.tsx` - WHEN: purpose selection, WHY: consistent purpose assignment interface
    - `src/components/core/icons/AccountabilityIcon.tsx` - WHEN: visit type icons, WHY: established icon patterns for visit types
    **Implementation Notes:**
    - Use existing purpose dropdown component
    - Show teacher name with visit type and time portion
    - Inline edit for purpose, dedicated delete button
    **Quality Checklist:**
    - [ ] Compact display suitable for schedule grid
    - [ ] Purpose dropdown matches existing patterns
    - [ ] Edit/delete actions don't require modal confirmation
    - [ ] Proper loading states during updates

  - [ ] 3.2 Integrate visit cards in PlannedVisitsColumn
    **File:** `src/components/features/scheduleBuilder/PlannedVisitsColumn.tsx`
    **Scope:** ~50 lines modification, visit card integration
    **Functions to Update:**
    - `renderVisitsByPeriod(): JSX.Element` (~30 lines) - integrate VisitCard component
    - `handleVisitPurposeChange(visitId: string, purpose: string): void` (~20 lines) - new function
    **Implementation Notes:**
    - Organize visit cards by period for visual alignment
    - Handle multiple visits per period with stacking
    - Maintain consistent height with schedule grid rows
    **Integration Points:**
    - Connects to useVisitScheduling hook for data operations
    - Aligns period numbering with main schedule grid
    - Handles purpose changes with auto-save functionality

- [ ] 4.0 Implement Auto-Save and Data Persistence
  **Context Stack:** `useAutoSave.ts`, visit server actions, error handling patterns
  **Pattern Reference:** Existing auto-save hook with debounced saving
  **Quality Gate:** Invisible auto-save with proper error handling and retry logic
  - [ ] 4.1 Add visit persistence with auto-save
    **File:** `src/hooks/domain/useVisitScheduling.ts`
    **Scope:** ~60 lines addition, auto-save integration
    **Functions to Add:**
    - `setupAutoSave(): void` (~30 lines) - integrate useAutoSave hook
    - `handleAutoSaveError(error: string): void` (~15 lines) - error handling
    - `syncWithServer(): Promise<void>` (~15 lines) - manual sync capability
    **Reference Files:**
    - `src/hooks/utilities/useAutoSave.ts` - WHEN: implementing persistence, WHY: established auto-save patterns with retry logic
    **Implementation Notes:**
    - 2-second debounce delay per useAutoSave pattern
    - Silent error handling (no user interruption)
    - Optimistic updates with server sync
    - Last-write-wins conflict resolution
    **Quality Checklist:**
    - [ ] Auto-save triggers after visit changes (create, edit, delete)
    - [ ] Error handling doesn't interrupt user workflow
    - [ ] Retry logic with exponential backoff
    - [ ] Proper cleanup on component unmount

  - [ ] 4.2 Add server action integration for visit management
    **File:** `src/app/actions/visits/visitScheduling.ts`
    **Scope:** ~120 lines, new server action file
    **Functions to Implement:**
    - `createVisit(visitData: CreateVisitData): Promise<ScheduledVisit>` (~40 lines)
    - `updateVisit(visitId: string, data: Partial<ScheduledVisit>): Promise<ScheduledVisit>` (~40 lines)
    - `deleteVisit(visitId: string): Promise<boolean>` (~40 lines)
    **Interfaces to Create:**
    ```typescript
    interface CreateVisitData {
      schoolId: string
      teacherId: string
      periodNumber: number
      portion: VisitPortion
      purpose?: string
      date: string
    }
    ```
    **Reference Files:**
    - `src/app/actions/schedule/schedule.ts` - WHEN: database operations, WHY: established server action patterns
    - `src/lib/zod-schema/visits/visit.ts` - WHEN: data validation, WHY: visit schema validation patterns
    **Integration Points:**
    - MongoDB operations with error handling
    - Zod schema validation for data integrity
    - Proper error messages for client consumption

- [ ] 5.0 Enhance Mode Toggle and User Experience
  **Context Stack:** Mode toggle patterns, existing MasterScheduleCard UI
  **Pattern Reference:** Existing mode toggle with visual feedback
  **Quality Gate:** Seamless mode switching with state preservation
  - [ ] 5.1 Preserve scheduling state during mode switches
    **File:** `src/components/domain/schools/singleSchool/cards/MasterScheduleCard.tsx`
    **Scope:** ~40 lines modification, state management enhancement
    **Functions to Modify:**
    - `handleModeChange(newMode: ScheduleMode): void` (~20 lines) - preserve selection state
    - `initializeSchedulingState(): void` (~20 lines) - new function for state initialization
    **Implementation Notes:**
    - Maintain three-zone selection when switching to view mode
    - Clear scheduling state only on explicit clear action
    - Visual indication of scheduling state in view mode
    **Quality Checklist:**
    - [ ] Scheduled visits remain visible in view mode
    - [ ] Partial selections preserved during mode switch
    - [ ] Clear visual distinction between view and schedule modes
    - [ ] Mode toggle reflects current scheduling activity

  - [ ] 5.2 Add visual feedback for scheduled visits in view mode
    **File:** `src/components/features/scheduleBuilder/TeacherDailySchedule.tsx`
    **Scope:** ~30 lines modification, visit indicators in view mode
    **Functions to Add:**
    - `renderVisitIndicators(visits: ScheduledVisit[]): JSX.Element` (~30 lines)
    **Implementation Notes:**
    - Subtle visual indicators for periods with scheduled visits
    - Non-intrusive overlay on existing schedule grid
    - Purpose-based color coding per existing icon patterns
    **Integration Points:**
    - Receives visit data from parent MasterScheduleCard
    - Aligns indicators with period grid structure
    - Uses existing accountability icon color patterns 