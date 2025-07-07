<section id="1-lesson-analytics-dashboard">

## 1. Lesson Analytics Dashboard

**Status:** PLANNED  
**Priority:** High  
**Effort:** Large  
**Business Value:** High

### Core Definition
**Problem:** Teachers and administrators need comprehensive analytics to track student attendance, lesson completion velocity, and mastery performance across Zearn and Snorkl platforms, but currently rely on manual Google Sheets analysis.

**Solution:** Build a dedicated analytics dashboard with three specialized pages (Attendance, Zearn, Mastery) that provide filterable data views, summary metrics, trend visualization, and drill-down capabilities for up to 160 students across ~20 days of instruction.

### Requirements Overview
- Must provide three dedicated analytics pages: Attendance, Zearn Completion, Mastery Check
- Must support filtering by date ranges (custom, presets, by unit), teacher, section, and granularity levels
- Must display summary cards, trend charts, and detailed data tables with drill-down capability
- Must handle pagination for large datasets (160 students × 20+ days)
- Must support shareable URLs with applied filters
- Must integrate with existing `lesson_completions` and `daily_class_events` MongoDB collections

### Scope & Boundaries

**In Scope:**
- Attendance analytics (daily class events with emoji status indicators)
- Zearn completion analytics (velocity, time per lesson, completion rates)
- Mastery check analytics (attempts, scores, success rates)
- Filter controls for date ranges, units, teachers, sections
- Summary metric cards with color-coded performance indicators
- Data tables with student-level drill-down
- URL-based filter sharing
- Desktop-optimized responsive design

**Out of Scope:**
- Real-time data updates (manual refresh only)
- Role-based access controls (future consideration)
- PDF/CSV export functionality
- Mobile optimization (desktop-focused)
- Automated alert notifications
- Performance comparison baselines (future feature)

### Data Requirements

**Primary Collections:**
- `daily_class_events` - Attendance tracking with emoji status
- `lesson_completions` - Discriminated union of Zearn and Snorkl completions

**Analytics Queries Needed:**
- Attendance aggregation by date, teacher, section, student
- Lesson completion velocity calculations (lessons per day/week/unit)
- Average time per lesson for Zearn completions
- Mastery attempt counts and success rates for Snorkl completions
- Unit-based progress tracking using SCOPE_SEQUENCE

**Filter Schema:**
```typescript
interface AnalyticsFilters {
  dateRange: { start: string; end: string } | 'today' | 'this-week' | string; // unit codes
  teachers?: ('Isaac' | 'Scerra')[];
  sections?: ('601' | '802')[];
  granularity: 'student' | 'section' | 'teacher' | 'overall';
  students?: number[]; // studentIDref values
}
```

### UI/UX Considerations

**Navigation Structure:**
- Separate analytics section similar to existing dashboard layout
- Three main pages: `/analytics/attendance`, `/analytics/zearn`, `/analytics/mastery`
- Shared filter component across all three pages

**Component Strategy:**
- Extend existing Card component for summary metrics
- Create new AnalyticsTable component with drill-down capability
- Develop AnalyticsFilters component for date/granularity controls
- Build VelocityChart and AttendanceChart components using existing design tokens

**Key Interactions:**
- Filter persistence in URL parameters for sharing
- Click-through from summary cards to detailed views
- Table row expansion for student-level detail
- Pagination controls for large datasets

### Technical Architecture

**Server Actions Required:**
```typescript
// src/app/actions/analytics/
- fetchAttendanceAnalytics(filters: AnalyticsFilters)
- fetchZearnAnalytics(filters: AnalyticsFilters)
- fetchMasteryAnalytics(filters: AnalyticsFilters)
- fetchVelocityMetrics(filters: AnalyticsFilters)
```

**Hook Architecture:**
```typescript
// src/hooks/domain/analytics/
- useAttendanceAnalytics(filters)
- useZearnAnalytics(filters)
- useMasteryAnalytics(filters)
```

**Component Hierarchy:**
- Page Components (attendance/zearn/mastery pages)
- Shared AnalyticsLayout component
- Domain-specific analytics components
- Reusable chart and table components

### Success Metrics
- Reduce time spent on manual Google Sheets analysis by 80%
- Enable real-time decision making for student intervention needs
- Provide comprehensive velocity tracking across both platforms
- Support data-driven conversations about student progress

### Implementation Strategy

**Recommended Context Templates:**
- Primary: data-layer-context.md (server actions and analytics queries)
- Secondary: ui-component-context.md (dashboard components and charts)
- Domain Reference: analytics, lesson-tracking

**Staging Approach:**
1. Analytics Server Actions (data aggregation and filtering)
2. Analytics Hooks (React Query integration with existing patterns)
3. Shared Components (filters, cards, tables, charts)
4. Attendance Page (first complete implementation)
5. Zearn and Mastery Pages (using established component patterns)
6. URL Filter Sharing (query parameter persistence)

**Quality Gates:**
- DRY: Extend existing Card, Table, and Chart components from design system
- Abstraction: Analytics hooks follow CRUD factory patterns established in project
- Separation: Analytics logic isolated from existing coaching/visit functionality

### Dependencies
**Requires:** Existing lesson_completions and daily_class_events MongoDB collections
**Integrates With:** Existing design system, authentication, and navigation patterns

### Open Questions
- Should velocity baselines be calculated automatically or manually configured?
- What specific thresholds should trigger performance alert badges?
- How should unit-based filtering handle partial unit completion?
- Should we cache analytics queries for performance, or recalculate each time?

</section>