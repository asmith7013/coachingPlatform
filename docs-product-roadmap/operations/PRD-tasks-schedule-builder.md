<section id="1-schedule-builder">
## 1. Daily Visit Schedule Builder

**Status:** PLANNED  
**Priority:** High  
**Effort:** Large  
**Business Value:** High

### Core Definition
**Problem:** Coaches currently struggle with creating daily visit schedules across multiple tabs and tools, making the planning process cumbersome and time-consuming when managing 2-15 teachers per day.

**Solution:** A visual drag-and-drop schedule builder that extends the existing schedule viewer with an interactive "Planned Schedule" column, allowing coaches to assign teachers to specific time slots with purpose definitions while maintaining comprehensive teacher accountability tracking.

### Requirements Overview
- **Must extend existing schedule viewer** with interactive planning capabilities
- **Must support teacher selection** via click-to-select interface with visual feedback
- **Must provide drag-and-drop scheduling** with 3 hover zones (full period, first half, second half)
- **Must include purpose assignment** with dropdown options and custom purposes
- **Must maintain teacher accountability** with completion tracking grid
- **Must persist planned schedules** for future reference and email sharing
- **Must integrate with existing teacher/visit data** and scale from 2-15 teachers
- **Must support 30-minute time increments** for both full-day and partial-day planning
- **Must display responsively** with mobile viewing capability

### Data Requirements
**Schema Extensions:**
- New `PlannedVisit` schema with fields: teacherId, timeSlot, purpose, duration, date, coach
- Extend Visit model with `plannedScheduleId` reference field
- Add scheduling state management for builder UI

**External Data Integration:**
- Pull existing teacher data from current NYCPS Staff system
- Import visit data to populate historical context
- Sync with existing school bell schedule data

### UI/UX Considerations
**Key Interactions:**
- **Teacher Selection Flow**: Light blue/gray → dark blue selection → X button deselection
- **Schedule Assignment Interface**: 3 distinct hover zones with gray overlay feedback
- **Purpose Assignment System**: Immediate dropdown with placeholder + caret + X removal
- **Teacher Accountability Grid**: Comprehensive checkbox-style tracking with cross-off functionality

**Component Strategy:**
- Extend existing `BellScheduleGrid` component with interactive capabilities
- Create new `PlannedScheduleColumn` component for assignment interface
- Develop `PurposeDropdown` component with custom option support
- Build `TeacherAccountabilityGrid` component for bottom tracking section

**Visual Hierarchy:**
- Selected teachers: Dark background (#1e40af), white text
- Unselected teachers: Light background (#f3f4f6)
- Schedule slots: Teacher name + purpose dropdown + X button (styled consistently)
- Hover states: Semi-transparent gray (#6b7280/50) overlay with clear zone boundaries

### Technical Architecture
**Dependencies:**
- Leverages existing `TeacherScheduleCalendar` and `BellScheduleGrid` components
- Integrates with current `useScheduleDisplay` hook for data transformation
- Requires real-time state management for selection and assignment tracking
- Uses existing visit schemas and teacher data structures

**Implementation Approach:**
- React state management for selection and planning state
- Optimistic UI updates with background persistence
- Local storage backup for unsaved changes
- Server actions for schedule persistence

### User Journey
**Primary Flow:**
1. Coach opens daily visit planning page for selected school and date
2. Views existing teacher schedule grid with new "Planned Schedule" column
3. Clicks teachers during specific periods (visual selection feedback)
4. Drags selected teachers to Planned Schedule column hover zones
5. Assigns purpose via dropdown for each scheduled slot
6. Reviews teacher accountability grid to ensure comprehensive coverage
7. Saves and shares completed schedule via email or internal system

**Edge Cases:**
- Handle duplicate teacher assignments across time periods
- Manage schedule conflicts with existing commitments
- Support partial period assignments (first/second half)
- Graceful handling of unsaved changes on navigation
- Mobile responsiveness for schedule viewing (editing desktop-only initially)

### Success Metrics
- **Reduce schedule creation time** by 60% compared to manual cross-tab process
- **Increase schedule completion rate** to 95%+ through accountability tracking
- **Improve coach productivity** with streamlined single-page workflow
- **Enable data reuse** across website through persistent schedule storage

### Dependencies
**Requires:** Extension of existing schedule viewer infrastructure
**Blocks:** Advanced scheduling features, mobile editing capabilities

### Implementation Strategy

**Recommended Context Templates:**
- Primary: ui-component-context.md (interactive schedule builder interface)
- Secondary: data-layer-context.md (PlannedVisit schema and persistence)
- Domain Reference: scheduling, visits

**Staging Approach:**
1. **Schema Implementation** (data-layer-context.md)
   - Create PlannedVisit schema and server actions
   - Extend Visit model with planning references
2. **Interactive Grid Components** (ui-component-context.md)
   - Enhance BellScheduleGrid with selection capabilities
   - Build PlannedScheduleColumn with hover zones
3. **Purpose Assignment System** (ui-component-context.md)
   - Develop PurposeDropdown with custom options
   - Implement assignment validation logic
4. **Teacher Accountability Tracking** (ui-component-context.md)
   - Create TeacherAccountabilityGrid component
   - Build completion tracking system
5. **Schedule Persistence** (data-layer-context.md)
   - Implement save/load functionality
   - Add email sharing capabilities

**Quality Gates:**
- **DRY**: Extend existing BellScheduleGrid and schedule infrastructure
- **Abstraction**: Fits feature-level in component hierarchy
- **Separation**: Single responsibility of daily visit planning workflow

### Open Questions
- Should the system prevent scheduling conflicts automatically or just warn coaches?
- What's the preferred method for sharing completed schedules (email templates, export formats)?
- Should there be role-based permissions for who can create vs. view schedules?
- How should the system handle teachers who are absent or unavailable during planning?

</section>