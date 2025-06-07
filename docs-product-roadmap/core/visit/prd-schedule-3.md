# PRD: MasterScheduleCard Scheduling Interface Enhancement

## Introduction/Overview

This feature enhances the existing MasterScheduleCard component to provide an intuitive scheduling interface that allows coaches to quickly plan classroom visits by clicking on teacher periods and selecting visit portions (first half, second half, or full period). The interface maintains the existing schedule view while adding a frozen "Planned Visits" column for visit planning and management.

**Goal**: Transform the MasterScheduleCard from a view-only schedule into an interactive scheduling tool that enables coaches to efficiently plan and manage classroom visits within the daily teacher schedule grid.

## Goals

1. **Streamline Visit Planning**: Reduce the time needed to schedule classroom visits from multiple steps to a simple click-and-select workflow
2. **Maintain Schedule Context**: Keep the full teacher schedule visible while planning visits to avoid scheduling conflicts
3. **Provide Clear Visual Feedback**: Make it immediately obvious where visits are planned and what type of visit is scheduled
4. **Enable Quick Edits**: Allow coaches to easily modify or remove scheduled visits without leaving the interface
5. **Preserve Mobile Usability**: Ensure the frozen column layout works effectively on different screen sizes

## User Stories

1. **As a coach**, I want to see all teacher schedules for a day so that I can identify the best periods to schedule visits
2. **As a coach**, I want to click on a teacher's period and immediately select a visit portion (first half, second half, full) so that I can quickly schedule visits
3. **As a coach**, I want to specify the type of visit (observation, debrief, meeting) so that teachers know what to expect
4. **As a coach**, I want to see all my planned visits in a frozen column so that I can review my daily schedule at a glance
5. **As a coach**, I want to edit or delete scheduled visits so that I can adjust my plans as needed
6. **As a coach**, I want to scroll through multiple teachers while keeping my visit plan visible so that I can plan efficiently for large schools

## Functional Requirements

### Core Scheduling Functionality
1. **The system must display a "Planned Visits" column as the leftmost column after the Period/Time column**
2. **The system must freeze both the Period/Time column and Planned Visits column during horizontal scrolling**
3. **The system must show a three-zone selector (first half | second half | full period) when a user clicks on any teacher's class period**
4. **The system must only show the three-zone selector for the specific period that was clicked**
5. **The system must immediately schedule the visit when a user selects a zone (no confirmation step required)**
6. **The system must display scheduled visits as cards showing "Teacher Name - Visit Type"**
7. **The system must provide a dropdown to select visit purpose after scheduling (Observation, Debrief, Meeting, etc.)**

### Mode Management
8. **The system must provide a toggle between "View" and "Schedule" modes**
9. **The system must default to "View" mode showing existing scheduled visits**
10. **The system must show the three-zone selector and planning interface only in "Schedule" mode**
11. **The system must display visit details and action plan information in "View" mode**

### Visit Card Management
12. **The system must display visit cards with edit and delete options**
13. **The system must allow users to modify visit purpose after initial scheduling**
14. **The system must allow users to delete scheduled visits with a single click**
15. **The system must update the display immediately when visits are modified or deleted**

### Data Integration
16. **The system must integrate with existing Visit schema structures**
17. **The system must save visit data including teacher, period, portion, and purpose**
18. **The system must load existing scheduled visits when the component initializes**
19. **The system must call the onVisitScheduled callback with visit data when visits are created**

### UI/UX Requirements
20. **The system must maintain the existing schedule grid layout and styling**
21. **The system must ensure the three-zone selector is visually clear and intuitive**
22. **The system must provide hover states for interactive elements**
23. **The system must show empty state messaging in the Planned Visits column when no visits are scheduled**

## Non-Goals (Out of Scope)

- **Multi-day scheduling**: This feature only handles single-day visit planning
- **Teacher availability checking**: No integration with teacher availability or conflict detection
- **Automatic scheduling optimization**: No AI-powered scheduling suggestions
- **Visit confirmation workflow**: No approval process or teacher notification system
- **Calendar integration**: No sync with external calendar systems
- **Mobile-specific optimizations**: Focus on desktop experience first
- **Action plan creation**: Action plan functionality will be added in a future iteration

## Design Considerations

### Layout Structure
- **Grid Layout**: Maintain existing CSS Grid structure with frozen columns using `position: sticky`
- **Three-Zone Selector**: Implement as a clickable overlay with three equal sections (visual design TBD)
- **Visit Cards**: Use existing Card component patterns with compact styling for the schedule grid
- **Purpose Dropdown**: Leverage existing dropdown component with visit type options

### Visual Hierarchy
- **Frozen Columns**: Use subtle background differentiation to indicate frozen vs. scrollable areas
- **Active States**: Clear visual feedback when periods are clickable vs. selected
- **Visit Cards**: Distinct styling that doesn't interfere with schedule readability

### Responsive Considerations
- **Horizontal Scrolling**: Ensure smooth scrolling performance with frozen columns
- **Touch Interactions**: Consider touch-friendly sizing for three-zone selector on tablets

## Technical Considerations

### Component Architecture
- **Extend existing MasterScheduleCard**: Build on the current component rather than creating new one
- **Leverage useThreeZoneScheduling hook**: The existing hook appears to handle much of the core logic
- **Integrate with SchedulingInterface component**: Reuse existing scheduling patterns where possible

### Data Flow
- **Visit Schema Integration**: Use existing Visit and VisitPortion types from the codebase
- **State Management**: Maintain visit data in component state with callbacks for persistence
- **Error Handling**: Include proper error states for failed scheduling operations

### Performance
- **Virtualization**: Consider virtual scrolling for schools with many teachers
- **Debouncing**: Implement debounced saves to prevent excessive API calls
- **Optimistic Updates**: Update UI immediately while persisting data in background

## Success Metrics

1. **User Efficiency**: Reduce average time to schedule a visit by 60% compared to previous workflow
2. **User Adoption**: 80% of coaches use the scheduling interface within 30 days of release
3. **Error Reduction**: Decrease scheduling conflicts by 40% through improved visual context
4. **User Satisfaction**: Achieve 4.5/5 rating in user feedback surveys
5. **Performance**: Maintain <200ms response time for scheduling actions

## Open Questions

1. **Visit Type Options**: What are the exact options for the purpose dropdown? (Need to locate in existing codebase)
2. **Conflict Handling**: Should the system prevent double-booking or warn users about potential conflicts?
3. **Undo Functionality**: Should there be an undo option for recently scheduled/deleted visits?
4. **Keyboard Navigation**: Are there accessibility requirements for keyboard-only navigation?
5. **Data Persistence**: Should visit data auto-save or require explicit save action?
6. **Teacher Selection Limits**: Are there any restrictions on which teachers/periods can be scheduled?

## Implementation Notes

- **Existing Hook Usage**: The `useThreeZoneScheduling` hook mentioned in the current code should be leveraged for core scheduling logic
- **Type Definitions**: Visit portion types already exist in the codebase as `VisitPortion`
- **Purpose Options**: Visit purpose options should be sourced from existing schema definitions
- **Component Integration**: Build on existing `TeacherDailySchedule`, `PurposeAssignmentDropdown`, `AccountabilityIcon`, `AccountabilityTrackingPanel` and `SchedulingInterface` components where possible