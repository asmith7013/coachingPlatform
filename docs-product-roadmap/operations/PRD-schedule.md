<section id="1-master-schedule-card-improvements">
## 1. Master Schedule Card UI/UX Improvements

**Status:** PLANNED  
**Priority:** High  
**Effort:** Large  
**Business Value:** High

### Core Definition
**Problem:** The current Master Schedule Card displays information redundantly, expands beyond its container, and lacks an intuitive interface for planning teacher visits with proper accountability tracking.

**Solution:** Redesign the interface with a compact accountability tracker using icons, streamlined teacher schedule display, and an intuitive drag-and-drop system for visit planning with automatic duration selection.

### Requirements Overview
- Replace verbose accountability tracking with compact icon-based system
- Implement three-zone time slot interaction (Full Period, First Half, Second Half)
- Add teacher assignment with visit purpose dropdown selection
- Ensure responsive container sizing that doesn't overflow
- Provide automatic state persistence for accountability and visit planning
- Add visual feedback for hover states and assignment completion

### UI/UX Considerations

**Key Interactions:**
- **Accountability Tracker**: Binary icon system (empty circle → filled icon with purpose)
- **Visit Planning**: Click planned visits column → show three overlapping duration zones → select zone → assign teacher → choose purpose
- **Teacher Management**: Display assigned teacher name with purpose dropdown and remove (X) button
- **Hover Feedback**: Clear visual distinction between three time slot zones during interaction

**Icon System:**
- Empty circle: No visits planned
- Pencil icon (colored): Observation planned  
- Speech bubble icon (colored): Meeting planned
- Icons appear in accountability tracker row above teacher columns

**Three-Zone Layout:**
```
┌─────────────────┐
│   Full Period   │ ← Covers entire slot
│  ┌─────────────┐│
│  │ First Half  ││ ← Overlaps top portion
│  └─────────────┘│
│  ┌─────────────┐│
│  │Second Half  ││ ← Overlaps bottom portion  
│  └─────────────┘│
└─────────────────┘
```
Visual approach: Overlapping/layered zones that clearly show First Half + Second Half = Full Period relationship

### Data Requirements

**Schema Extensions:**
- Extend visit purpose enum with "Pre-meeting" and "Visitation" options
- Add visit duration field with values: "full_period", "first_half", "second_half"
- Create accountability state tracking with teacherId and purpose type

**State Management:**
- Real-time accountability updates (observation/meeting binary flags)
- Visit assignments with teacher, time slot, duration, and purpose
- Automatic persistence without explicit save actions

### Technical Architecture

**Component Strategy:**
- Extend existing `AccountabilityTrackingPanel` with icon-based display
- Enhance `VisitScheduleBuilder` with three-zone time slot interaction
- Add `TeacherAssignmentDropdown` for visit purpose selection
- Implement `ThreeZoneTimeSlot` component for duration selection

**State Integration:**
- Use existing `useVisitScheduleBuilder` hook for visit planning state
- Extend `useAccountabilityTracking` for icon-based tracking
- Add automatic persistence through existing save mechanisms

### Success Metrics
- Reduce Master Schedule Card height by 40% through compact display
- Increase visit planning efficiency (measured by time to create visit plan)
- Improve user satisfaction with accountability tracking interface
- Eliminate container overflow issues

### Dependencies
**Requires:** Current VisitScheduleBuilder and AccountabilityTrackingPanel components
**Blocks:** Daily visit planning workflow optimization

### Open Questions
- Should accountability icons support both observation AND meeting simultaneously?
- What's the optimal visual hierarchy for the three-zone time slot layout?
- Should there be keyboard shortcuts for common visit planning actions?

</section>