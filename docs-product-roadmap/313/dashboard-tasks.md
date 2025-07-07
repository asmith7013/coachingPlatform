# Tasks: Lesson Analytics Dashboard

## Context Strategy

**Primary Context Template:** data-layer-context.md (server actions and analytics queries)
**Secondary Context Template:** ui-component-context.md (dashboard components and charts)
**Domain Reference:** analytics, lesson-tracking

## Relevant Files

**Pattern References:**
- `src/app/dashboard/layout.tsx` - WHEN: analytics layout phase, WHY: follow established dashboard layout patterns with AuthGuard → AppShell
- `src/app/dashboard/config.ts` - WHEN: navigation setup, WHY: consistent navigation configuration approach
- `src/components/composed/tables/tanstack/TanStackTable.tsx` - WHEN: data table implementation, WHY: leverage existing table component with pagination and filtering
- `src/hooks/domain/313/useZearnData.ts` - WHEN: data integration, WHY: existing analytics hook patterns for 313 domain
- `src/hooks/domain/313/useSnorklData.ts` - WHEN: data integration, WHY: existing analytics hook patterns for 313 domain

**New Files to Create:**
- `src/app/analytics/layout.tsx` (~50 lines)
  - PURPOSE: analytics section layout with navigation
  - IMPORTS: `@components/composed/layouts/AppShell`, `@components/auth/AuthGuard`
  - EXPORTS: default layout component
  - PATTERN: follows dashboard layout structure
- `src/app/analytics/config.ts` (~40 lines)
  - PURPOSE: analytics navigation configuration
  - IMPORTS: navigation types
  - EXPORTS: analyticsNavigation config object
  - PATTERN: follows dashboard config pattern
- `src/app/analytics/page.tsx` (~100 lines)
  - PURPOSE: main analytics overview page
  - IMPORTS: analytics components, layout utilities
  - EXPORTS: default page component
  - INTEGRATES: summary cards from all three analytics types
- `src/app/analytics/attendance/page.tsx` (~150 lines)
  - PURPOSE: attendance analytics page
  - IMPORTS: `@components/features/analytics/AttendanceAnalytics`, filters
  - EXPORTS: default page component
  - INTEGRATES: daily_class_events collection
- `src/app/analytics/zearn/page.tsx` (~150 lines)
  - PURPOSE: Zearn completion analytics page
  - IMPORTS: `@components/features/analytics/ZearnAnalytics`, filters
  - EXPORTS: default page component
  - INTEGRATES: lesson_completions collection (Zearn type)
- `src/app/analytics/mastery/page.tsx` (~150 lines)
  - PURPOSE: mastery check analytics page
  - IMPORTS: `@components/features/analytics/MasteryAnalytics`, filters
  - EXPORTS: default page component
  - INTEGRATES: lesson_completions collection (Snorkl type)
- `src/app/actions/analytics/attendance.ts` (~200 lines)
  - PURPOSE: attendance analytics server actions
  - IMPORTS: MongoDB client, analytics filters schema
  - EXPORTS: fetchAttendanceAnalytics, fetchAttendanceSummary
  - INTEGRATES: daily_class_events collection
- `src/app/actions/analytics/zearn.ts` (~200 lines)
  - PURPOSE: Zearn analytics server actions
  - IMPORTS: MongoDB client, analytics filters schema
  - EXPORTS: fetchZearnAnalytics, fetchZearnVelocity
  - INTEGRATES: lesson_completions collection
- `src/app/actions/analytics/mastery.ts` (~200 lines)
  - PURPOSE: mastery analytics server actions
  - IMPORTS: MongoDB client, analytics filters schema
  - EXPORTS: fetchMasteryAnalytics, fetchMasterySuccess
  - INTEGRATES: lesson_completions collection
- `src/hooks/domain/analytics/useAttendanceAnalytics.ts` (~80 lines)
  - PURPOSE: attendance analytics React Query hook
  - IMPORTS: `@query/client`, attendance server actions
  - EXPORTS: useAttendanceAnalytics hook with filters
  - PATTERN: follows established analytics hook patterns
- `src/hooks/domain/analytics/useZearnAnalytics.ts` (~80 lines)
  - PURPOSE: Zearn analytics React Query hook
  - IMPORTS: `@query/client`, Zearn server actions
  - EXPORTS: useZearnAnalytics hook with velocity metrics
  - PATTERN: follows established analytics hook patterns
- `src/hooks/domain/analytics/useMasteryAnalytics.ts` (~80 lines)
  - PURPOSE: mastery analytics React Query hook
  - IMPORTS: `@query/client`, mastery server actions
  - EXPORTS: useMasteryAnalytics hook with success rates
  - PATTERN: follows established analytics hook patterns
- `src/components/features/analytics/AnalyticsFilters.tsx` (~150 lines)
  - PURPOSE: shared filter component for all analytics pages
  - IMPORTS: `@components/core/forms`, date utilities, filter types
  - EXPORTS: AnalyticsFilters component with AnalyticsFiltersProps
  - PATTERN: follows established filter component patterns
- `src/components/features/analytics/AttendanceAnalytics.tsx` (~200 lines)
  - PURPOSE: attendance analytics dashboard component
  - IMPORTS: TanStackTable, summary cards, attendance hooks
  - EXPORTS: AttendanceAnalytics component
  - INTEGRATES: useAttendanceAnalytics hook
- `src/components/features/analytics/ZearnAnalytics.tsx` (~200 lines)
  - PURPOSE: Zearn analytics dashboard component
  - IMPORTS: TanStackTable, velocity charts, Zearn hooks
  - EXPORTS: ZearnAnalytics component
  - INTEGRATES: useZearnAnalytics hook
- `src/components/features/analytics/MasteryAnalytics.tsx` (~200 lines)
  - PURPOSE: mastery analytics dashboard component
  - IMPORTS: TanStackTable, success rate charts, mastery hooks
  - EXPORTS: MasteryAnalytics component
  - INTEGRATES: useMasteryAnalytics hook
- `src/lib/schema/zod-schema/analytics/filters.ts` (~100 lines)
  - PURPOSE: analytics filter validation schemas
  - IMPORTS: zod, domain enums
  - EXPORTS: AnalyticsFiltersSchema, filter type definitions
  - PATTERN: follows established schema patterns

**Files to Modify:**
- `src/app/layout.tsx` - ADD: analytics route to navigation if needed
- `src/lib/types/domain/313/analytics.ts` - ADD: new analytics response types

## Tasks

- [ ] 1.0 Analytics Data Layer Implementation
  **Context Stack:** data-layer-context.md, existing analytics hooks, MongoDB patterns
  **Pattern Reference:** existing 313 analytics hooks (useZearnData, useSnorklData)
  **Quality Gate:** Zero TypeScript errors, follows established server action patterns

- [ ] 2.0 Analytics Schema and Type System
  **Context Stack:** schema validation patterns, analytics domain types
  **Pattern Reference:** existing 313 domain schemas and filter patterns
  **Quality Gate:** Complete schema validation, consistent with existing type system

- [ ] 3.0 Analytics Hook Architecture
  **Context Stack:** React Query patterns, analytics domain hooks
  **Pattern Reference:** existing analytics hooks with SWR/React Query integration
  **Quality Gate:** Follows CRUD factory patterns, proper error handling

- [ ] 4.0 Analytics UI Components
  **Context Stack:** ui-component-context.md, TanStack table patterns, design system
  **Pattern Reference:** existing dashboard components, TanStackTable implementation
  **Quality Gate:** Extends existing Card/Table components, follows design system

- [ ] 5.0 Analytics Pages and Navigation
  **Context Stack:** page routing patterns, analytics layout structure
  **Pattern Reference:** dashboard layout and navigation configuration
  **Quality Gate:** Consistent with dashboard patterns, proper URL filter sharing

I have generated the high-level tasks based on the PRD. Ready to generate the sub-tasks? Respond with 'Go' to proceed.
