# Calendar Page: React Query Migration Plan

## Overview

Migrate `/src/app/scm/logistics/calendar/page.tsx` from manual useState + server actions to React Query with optimistic mutations, aligning with established codebase patterns.

## Current State

- **Location**: `src/app/scm/logistics/calendar/`
- **Page size**: 1086 lines
- **Data hook**: `hooks/useCalendarData.ts` (329 lines) - uses useState + useEffect for data loading
- **Problem**: 6 large `useCallback` handlers (~500 lines total) doing manual optimistic updates

### Current Data Flow
```
page.tsx
  ├── useCalendarData hook (useState + useEffect)
  │   ├── Fetches: calendar, lessons, daysOff, savedSchedules, sectionConfigs, sectionDaysOff
  │   └── Returns: data + setters for optimistic updates
  │
  └── Manual callbacks (clearSectionDates, handleUnitDateChange, handleDateClick, etc.)
      ├── Update local state optimistically
      ├── Call server action
      ├── Update state with response
      └── Handle errors
```

## Target State

Use React Query with `useOptimisticMutation` pattern already established in codebase:
- `src/query/client/hooks/mutations/useOptimisticMutation.ts`
- `src/query/client/utilities/optimistic-update-helpers.ts`

### Target Data Flow
```
page.tsx
  ├── React Query hooks (useQuery for reads)
  │   ├── useCalendarQuery
  │   ├── useLessonsQuery
  │   ├── useSavedSchedulesQuery
  │   └── useSectionDaysOffQuery
  │
  └── Mutation hooks (useOptimisticMutation for writes)
      ├── useUpdateSectionDatesMutation
      ├── useUpdateUnitDatesMutation
      ├── useAddDayOffMutation
      └── useDeleteDayOffMutation
```

## Implementation Steps

### Phase 1: Create Query Hooks

**File**: `src/app/scm/logistics/calendar/hooks/queries.ts`

Create query hooks for each data type:

```typescript
// Query keys
export const calendarKeys = {
  all: ['calendar'] as const,
  calendar: (schoolYear: string) => [...calendarKeys.all, 'school-calendar', schoolYear] as const,
  daysOff: (schoolYear: string) => [...calendarKeys.all, 'days-off', schoolYear] as const,
  lessons: (grade: string) => [...calendarKeys.all, 'lessons', grade] as const,
  schedules: (schoolYear: string, grade: string) => [...calendarKeys.all, 'schedules', schoolYear, grade] as const,
  sectionSchedules: (schoolYear: string, scopeTag: string, school: string, section: string) =>
    [...calendarKeys.all, 'section-schedules', schoolYear, scopeTag, school, section] as const,
  sectionDaysOff: (schoolYear: string, school: string, section: string) =>
    [...calendarKeys.all, 'section-days-off', schoolYear, school, section] as const,
  sectionConfigs: () => [...calendarKeys.all, 'section-configs'] as const,
};

// Query hooks
export function useSchoolCalendarQuery(schoolYear: string) { ... }
export function useDaysOffQuery(schoolYear: string) { ... }
export function useLessonsQuery(grade: string) { ... }
export function useSavedSchedulesQuery(schoolYear: string, grade: string, selectedSection: SectionConfigOption | null) { ... }
export function useSectionDaysOffQuery(schoolYear: string, school: string, classSection: string) { ... }
export function useSectionConfigsQuery() { ... }
```

### Phase 2: Create Mutation Hooks

**File**: `src/app/scm/logistics/calendar/hooks/mutations.ts`

Use `useOptimisticMutation` from `@query/client/hooks/mutations/useOptimisticMutation`:

```typescript
import { useOptimisticMutation } from '@query/client/hooks/mutations/useOptimisticMutation';
import { calendarKeys } from './queries';

// Update section dates (start/end for a section within a unit)
export function useUpdateSectionDatesMutation(schoolYear: string, selectedSection: SectionConfigOption | null) {
  return useOptimisticMutation(
    async (data: { unitKey: string; sectionId: string; startDate: string; endDate: string }) => {
      // Call appropriate server action based on selectedSection
    },
    {
      invalidateQueries: [calendarKeys.schedules(schoolYear, ...)],
      onMutate: async (newData) => {
        // Optimistically update cache
      },
      onError: (err, newData, context) => {
        // Rollback on error
      },
    }
  );
}

// Similar for: useUpdateUnitDatesMutation, useAddDayOffMutation, useDeleteDayOffMutation, useCopySchedulesMutation
```

### Phase 3: Create Composed Hook

**File**: `src/app/scm/logistics/calendar/hooks/useCalendarPageData.ts`

Compose all queries and mutations into a single hook for the page:

```typescript
export function useCalendarPageData(schoolYear: string, selectedGrade: string, selectedSection: SectionConfigOption | null) {
  // Queries
  const calendarQuery = useSchoolCalendarQuery(schoolYear);
  const daysOffQuery = useDaysOffQuery(schoolYear);
  const lessonsQuery = useLessonsQuery(selectedGrade);
  const schedulesQuery = useSavedSchedulesQuery(schoolYear, selectedGrade, selectedSection);
  const sectionDaysOffQuery = useSectionDaysOffQuery(...);
  const sectionConfigsQuery = useSectionConfigsQuery();

  // Mutations
  const updateSectionDates = useUpdateSectionDatesMutation(schoolYear, selectedSection);
  const updateUnitDates = useUpdateUnitDatesMutation(schoolYear, selectedSection);
  const addDayOff = useAddDayOffMutation(schoolYear, selectedSection);
  const deleteDayOff = useDeleteDayOffMutation(schoolYear, selectedSection);
  const copySchedules = useCopySchedulesMutation(schoolYear, selectedSection);

  // Derived state
  const isLoading = calendarQuery.isLoading || daysOffQuery.isLoading || ...;

  return {
    // Data
    calendar: calendarQuery.data,
    daysOff: daysOffQuery.data,
    lessons: lessonsQuery.data,
    savedSchedules: schedulesQuery.data,
    sectionDaysOff: sectionDaysOffQuery.data,
    sectionConfigs: sectionConfigsQuery.data,

    // Loading states
    isLoading,
    isLoadingGradeData: lessonsQuery.isLoading,
    isLoadingSchedules: schedulesQuery.isLoading,

    // Mutations
    updateSectionDates,
    updateUnitDates,
    addDayOff,
    deleteDayOff,
    copySchedules,
  };
}
```

### Phase 4: Refactor page.tsx

1. Replace `useCalendarData` with `useCalendarPageData`
2. Remove manual callbacks - use mutation hooks directly
3. Keep derived state (unitSchedules building) - can stay as useMemo
4. Keep UI state (modals, selection mode, currentMonth)

**Before** (~60 lines per handler):
```typescript
const handleDateClick = useCallback(async (dateStr: string) => {
  // Update local state
  setUnitSchedules(prev => ...);

  // Find schedule, call server action
  const result = await updateSectionDates(...);

  // Update with response
  if (result.success) {
    setSavedSchedules(prev => ...);
  }
}, [many, dependencies]);
```

**After** (~5 lines per handler):
```typescript
const handleDateClick = (dateStr: string) => {
  if (!selectionMode) return;
  updateSectionDates.mutate({
    unitKey: selectionMode.unitKey,
    sectionId: selectionMode.sectionId,
    [selectionMode.type === 'start' ? 'startDate' : 'endDate']: dateStr,
  });
};
```

### Phase 5: Update exports

**File**: `src/app/scm/logistics/calendar/hooks/index.ts`

```typescript
export * from './queries';
export * from './mutations';
export * from './useCalendarPageData';
export { CALENDAR_STORAGE_KEY } from './useCalendarData'; // Keep for localStorage
```

## Files to Create/Modify

### Create
- `src/app/scm/logistics/calendar/hooks/queries.ts` - Query hooks
- `src/app/scm/logistics/calendar/hooks/mutations.ts` - Mutation hooks
- `src/app/scm/logistics/calendar/hooks/useCalendarPageData.ts` - Composed hook

### Modify
- `src/app/scm/logistics/calendar/hooks/index.ts` - Update exports
- `src/app/scm/logistics/calendar/page.tsx` - Use new hooks, remove callbacks

### Delete (after migration complete)
- `src/app/scm/logistics/calendar/hooks/useCalendarData.ts` - Replaced by query hooks

## Key Patterns to Follow

### From existing codebase:

1. **Query hook pattern** (from `src/query/` examples):
```typescript
import { useQuery } from "@tanstack/react-query";

export function useDataQuery(params: Params) {
  return useQuery({
    queryKey: ["data", params],
    queryFn: () => fetchData(params),
    enabled: !!params, // conditional fetching
  });
}
```

2. **Optimistic mutation pattern** (from `useOptimisticMutation.ts`):
```typescript
import { useOptimisticMutation } from '@query/client/hooks/mutations/useOptimisticMutation';

export function useMyMutation() {
  return useOptimisticMutation(
    mutationFn,
    {
      invalidateQueries: [queryKeys],
      onMutate: async (data) => { /* optimistic update */ },
      onError: (err, data, context) => { /* rollback */ },
    }
  );
}
```

3. **Error handling** (from `@error/handleServerError`):
```typescript
import { handleServerError } from "@error/handleServerError";
```

## Expected Outcome

- **page.tsx**: ~600-700 lines (down from 1086)
- **Callbacks**: ~5-10 lines each (down from ~60-100)
- **Data flow**: Aligned with React Query patterns used elsewhere in codebase
- **Error handling**: Automatic rollback via optimistic mutation helpers
- **Caching**: React Query cache management instead of manual setState

## Testing Checklist

- [ ] Grade selection loads correct lessons and schedules
- [ ] Section selection loads section-specific schedules and days off
- [ ] Clicking calendar dates updates section start/end dates
- [ ] Unit date inputs update correctly
- [ ] Clear section dates works
- [ ] Copy schedules to other sections works
- [ ] Add section day off works (with schedule shift option)
- [ ] Delete section day off works (with schedule shift option)
- [ ] Error cases show appropriate feedback and rollback
- [ ] Loading states display correctly
- [ ] LocalStorage persistence of grade/section selection works

## Notes

- The `unitSchedules` building logic (transforming lessons + savedSchedules into display format) can stay as a `useMemo` in page.tsx - it's derived state, not fetched data
- LocalStorage persistence for grade/section selection should remain (not part of React Query)
- The modals can stay as-is - they're presentation components
