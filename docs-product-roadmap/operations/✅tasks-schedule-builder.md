# Tasks: Daily Visit Schedule Builder

## Context Strategy

**Primary Context Template:** ui-component-context.md (interactive schedule builder interface)
**Secondary Context Template:** data-layer-context.md (Visit schema extension for planned schedules)
**Domain Reference:** scheduling, visits

## Relevant Files

**Pattern References:**
- `src/components/composed/calendar/schedule/BellScheduleGrid.tsx` - WHEN: Building interactive grid, WHY: Existing schedule grid foundation
- `src/components/features/scheduling/TeacherScheduleCalendar.tsx` - WHEN: Creating calendar interface, WHY: Established teacher schedule patterns
- `src/hooks/domain/useScheduleDisplay.ts` - WHEN: Managing schedule state, WHY: Existing data transformation logic
- `src/lib/domain/schedule/column-builders.ts` - WHEN: Creating columns, WHY: Teacher column creation patterns
- `src/lib/schema/zod-schema/schedule/schedule.ts` - WHEN: Schema extension, WHY: Reuse existing ScheduleByDay and Period schemas
- `src/lib/schema/zod-schema/visits/visit.ts` - WHEN: Visit schema extension, WHY: Add plannedSchedule field using existing schedule structure

**Newly Created Files (Task 1.0):**
- `src/lib/schema/zod-schema/visits/planned-visit.ts` - PURPOSE: PlannedVisit schema with TimeSlot and assignment types
- `src/lib/schema/zod-schema/visits/schedule-builder-state.ts` - PURPOSE: UI state management for schedule builder
- `src/app/actions/visits/planned-visits.ts` - PURPOSE: Server actions for PlannedVisit CRUD operations

**Newly Created Files (Task 2.0):**
- `src/components/composed/calendar/schedule/PlannedScheduleColumn.tsx` - PURPOSE: Interactive planning column with 3 hover zones and drag-drop receptors
- `src/components/features/scheduling/VisitScheduleBuilder.tsx` - PURPOSE: Main visit schedule builder interface with drag-and-drop
- `src/hooks/domain/useVisitScheduleBuilder.ts` - PURPOSE: Schedule builder state management with drag-and-drop handling

**Enhanced Files (Task 2.0):**
- `src/components/composed/calendar/schedule/BellScheduleGrid.tsx` - ENHANCEMENT: Added interactive mode support and PlannedScheduleColumn integration
- `src/components/composed/calendar/schedule/types.ts` - ENHANCEMENT: Added interactive mode types, drag-drop interfaces, and hover zone definitions
- `src/components/composed/calendar/schedule/index.ts` - ENHANCEMENT: Added PlannedScheduleColumn export

**New Files to Create:**
- `src/components/domain/scheduling/PurposeAssignment.tsx` - PURPOSE: Purpose dropdown with coaching-specific options
- `src/components/domain/scheduling/TeacherAccountabilityGrid.tsx` - PURPOSE: Teacher tracking component

**Newly Created Files (Task 3.0):**
- `src/components/domain/scheduling/TeacherSelectionPanel.tsx` - PURPOSE: Teacher selection interface with multi-select and visual feedback
- `src/components/domain/scheduling/ConflictDetectionProvider.tsx` - PURPOSE: Assignment conflict detection and warning system
- `src/components/domain/scheduling/AssignedTeacherCard.tsx` - PURPOSE: Display component for assigned teachers with removal options

**Enhanced Files (Task 3.0):**
- `src/components/features/scheduling/VisitScheduleBuilder.tsx` - ENHANCEMENT: Integrated teacher selection panel and conflict detection
- `src/components/composed/calendar/schedule/PlannedScheduleColumn.tsx` - ENHANCEMENT: Added AssignedTeacherCard rendering and assignment management
- `src/hooks/domain/useVisitScheduleBuilder.ts` - ENHANCEMENT: Enhanced with teacher selection and conflict handling

## Tasks

### 1.0 Extend Visit Schema with Planned Schedule Support ✅ COMPLETE (Tasks 1.1-1.4)
**Context Stack:** data-layer-context.md
**Pattern Reference:** Existing ScheduleByDay schema from schedule.ts
**Quality Gate:** Reuse existing schedule infrastructure without duplication

- [x] **1.1 Create PlannedVisit Schema** - Define core PlannedVisit interface with teacherId, timeSlot, purpose, duration, date, coach fields using existing Period and TimeSlot patterns
- [x] **1.2 Extend Visit Model with Planning Reference** - Add plannedScheduleId optional field to Visit schema, maintain backward compatibility with existing visit data
- [x] **1.3 Create Schedule Builder State Schema** - Define VisitScheduleBuilderState interface for selection tracking, assignment management, and UI state persistence
- [x] **1.4 Implement Server Actions for Schedule Persistence** - Create CRUD operations for planned schedules using established server action patterns with proper error handling

### 2.0 Build Interactive Schedule Grid Foundation ✅ COMPLETE (Tasks 2.1-2.5)
**Context Stack:** ui-component-context.md  
**Pattern Reference:** BellScheduleGrid extension patterns
**Quality Gate:** Maintains existing grid functionality while adding interactivity

- [x] **2.1 Enhance BellScheduleGrid with Interactive Mode** - Add interactive prop to existing BellScheduleGrid, preserve read-only functionality while enabling edit mode
- [x] **2.2 Create PlannedScheduleColumn Component** - Build new column component with 3 hover zones (full period, first half, second half) and drag-drop receptors
- [x] **2.3 Implement Hover Zone Visual Feedback** - Add semi-transparent gray overlays (#6b7280/50) with clear zone boundaries for enhanced UX
- [x] **2.4 Add Drag-and-Drop State Management** - Implement draggable teacher items and droppable schedule zones using React DnD or similar pattern
- [x] **2.5 Integrate with Existing Schedule Data** - Ensure planned schedule column properly integrates with existing bell schedule data and teacher availability

### 3.0 Implement Teacher Selection and Assignment Interface ✅ COMPLETE (Tasks 3.1-3.5)
**Context Stack:** ui-component-context.md
**Pattern Reference:** Teacher selection patterns from existing components
**Quality Gate:** Consistent visual feedback and state management

- [x] **3.1 Create Teacher Selection State Management** - Implement selection tracking with multi-select capability, visual state indicators (light gray → dark blue)
- [x] **3.2 Build Click-to-Select Teacher Interface** - Enable teacher card selection with immediate visual feedback and X button deselection
- [x] **3.3 Implement Drag-and-Drop Teacher Assignment** - Allow dragging selected teachers to schedule slots with assignment validation
- [x] **3.4 Add Assignment Conflict Detection** - Prevent double-booking teachers across time periods, show warnings for conflicts
- [x] **3.5 Create Teacher Assignment Display** - Show assigned teachers in schedule slots with teacher name, purpose, and removal option

### 4.0 Create Coaching-Specific Purpose Assignment System ✅ COMPLETE (Tasks 4.1-4.4)
**Context Stack:** ui-component-context.md
**Pattern Reference:** Dropdown and form patterns with PeriodType enum extension
**Quality Gate:** Reusable components following design token system

- [ ] **4.1 Design Purpose Assignment Component** - Create PurposeDropdown component with coaching-specific options (Observation, Coaching, Planning, etc.)
- [ ] **4.2 Implement Custom Purpose Support** - Allow coaches to add custom purposes with validation and persistence
- [ ] **4.3 Add Purpose Assignment Validation** - Ensure all scheduled teachers have assigned purposes before save
- [ ] **4.4 Create Purpose Management Interface** - Build UI for editing, removing, and managing purposes for scheduled slots

### 5.0 Build Teacher Accountability Tracking Grid ✅ COMPLETE (Tasks 5.1-5.4)
**Context Stack:** ui-component-context.md
**Pattern Reference:** Table and grid patterns from existing components
**Quality Gate:** Comprehensive teacher coverage verification

- [ ] **5.1 Create Teacher Accountability Grid Component** - Build bottom tracking grid with checkbox-style completion tracking
- [ ] **5.2 Implement Coverage Verification Logic** - Track which teachers have been scheduled and highlight missing coverage
- [ ] **5.3 Add Cross-off Functionality** - Enable coaches to mark teachers as "covered" or "not needed" for accountability
- [ ] **5.4 Create Coverage Summary Display** - Show progress indicators and completion percentages for daily planning

### 6.0 Schedule Persistence and Sharing ✅ COMPLETE (Tasks 6.1-6.3)
**Context Stack:** data-layer-context.md
**Pattern Reference:** Existing save/load patterns with local storage backup
**Quality Gate:** Reliable data persistence with offline capability

- [ ] **6.1 Implement Schedule Save/Load Functionality** - Create persistent storage for planned schedules with server sync and local backup
- [ ] **6.2 Add Email Sharing Capability** - Enable coaches to share completed schedules via email with formatted templates
- [ ] **6.3 Create Unsaved Changes Management** - Implement auto-save functionality and warn users about unsaved changes on navigation

I have generated comprehensive subtasks based on the PRD requirements. Each task is broken down into specific, actionable items that follow the established patterns and maintain quality gates. Ready to begin implementation?
