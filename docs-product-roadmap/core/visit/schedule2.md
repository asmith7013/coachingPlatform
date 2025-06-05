# Detailed Implementation Plan: Schedule Grid Refactoring

## Phase 1: Create Shared Grid Cell Infrastructure

### Step 1.1: Extract Grid Cell Factory
**File**: `src/lib/domain/schedule/grid-cell-factory.ts`

```typescript
interface GridCellOptions {
  hasPlannedColumn: boolean
  columnType: 'planned' | 'teacher'
  teacherIndex?: number
}

interface GridCellConfig {
  gridColumn: number
  gridRow: number
  className: string
  stickyStyle?: React.CSSProperties
}

export function createGridCellConfig(
  column: ScheduleColumn,
  columnIndex: number,
  periodIndex: number,
  options: GridCellOptions
): GridCellConfig {
  // Centralized grid positioning and styling logic
}

export function renderGridCells(
  columns: ScheduleColumn[],
  periodTimes: PeriodTime[],
  cellRenderer: (column: ScheduleColumn, columnIndex: number, periodTime: PeriodTime, periodIndex: number, config: GridCellConfig) => React.ReactNode
): React.ReactNode[] {
  // Shared iteration and cell creation logic
}
```

### Step 1.2: Create Base Grid Cell Component
**File**: `src/components/domain/schedule/BaseGridCell.tsx`

```typescript
interface BaseGridCellProps {
  column: ScheduleColumn
  columnIndex: number
  periodTime: PeriodTime
  periodIndex: number
  config: GridCellConfig
  children: React.ReactNode
}

export function BaseGridCell({
  column,
  columnIndex,
  periodTime,
  periodIndex,
  config,
  children
}: BaseGridCellProps) {
  // Base cell wrapper with positioning and styling
}
```

## Phase 2: Refactor Component Hierarchy

### Step 2.1: Create ScheduleEventGrid (New Component)
**File**: `src/components/domain/schedule/ScheduleEventGrid.tsx`

**Purpose**: Handle events with basic interactions (click handling)
**Responsibilities**:
- Render events in grid cells
- Handle event clicks
- Manage event selection state

```typescript
interface ScheduleEventGridProps {
  columns: ScheduleColumn[]
  periodTimes: PeriodTime[]
  events: BellScheduleEvent[]
  onEventClick?: (event: BellScheduleEvent) => void
  isEventSelected?: (event: BellScheduleEvent) => boolean
  className?: string
}

export function ScheduleEventGrid(props: ScheduleEventGridProps) {
  // Use renderGridCells with ScheduleEventCell renderer
  // No interactive features beyond basic event handling
}
```

### Step 2.2: Simplify InteractiveScheduleGrid
**File**: `src/components/domain/schedule/InteractiveScheduleGrid.tsx` (UPDATE)

**New Responsibilities**:
- Extend ScheduleEventGrid with interactive features
- Handle planned visits
- Manage teacher period assignments
- Provide hover zone feedback

**Changes**:
- Remove duplicated cell rendering logic
- Use shared grid cell factory
- Focus only on interactive-specific features

### Step 2.3: Simplify BellScheduleGrid
**File**: `src/components/domain/schedule/BellScheduleGrid.tsx` (UPDATE)

**New Responsibilities**:
- Simple composition component
- Route to appropriate grid type
- Handle prop transformation if needed

**Changes**:
- Remove `interactive` boolean flag
- Remove duplicated rendering logic
- Become pure composition component

## Phase 3: Implementation Steps

### Step 3.1: Extract Shared Logic (1-2 hours)
1. Create `grid-cell-factory.ts` with shared positioning logic
2. Create `BaseGridCell` component
3. Extract `renderGridCells` utility function

### Step 3.2: Create ScheduleEventGrid (1 hour)
1. New component for basic event handling
2. Use shared grid cell infrastructure
3. Handle only events and basic interactions

### Step 3.3: Refactor InteractiveScheduleGrid (1-2 hours)
1. Remove duplicated cell rendering
2. Use shared infrastructure
3. Focus on interactive-only features
4. Remove props adaptation layer

### Step 3.4: Simplify BellScheduleGrid (30 minutes)
1. Remove conditional rendering logic
2. Make it a pure composition component
3. Clean up prop interfaces

### Step 3.5: Update Type Definitions (30 minutes)
1. Align interfaces to remove adaptation needs
2. Ensure type safety across all components
3. Update domain types if needed

## Phase 4: Testing Strategy

### Step 4.1: Component Testing
- Test each grid type independently
- Verify shared logic works across all grids
- Ensure no regression in existing functionality

### Step 4.2: Integration Testing
- Test with real schedule data
- Verify interactive features work correctly
- Test responsive behavior

## Expected Outcomes

### Before Refactoring Issues:
- ~150 lines of duplicated cell rendering logic
- Mixed responsibilities in components
- Props adaptation layers
- Maintenance burden across multiple files

### After Refactoring Benefits:
- Single source of truth for grid cell logic
- Clear component hierarchy and responsibilities
- No props adaptation needed
- ~50% reduction in code duplication
- Easier testing and maintenance

## File Impact Summary

**New Files (3)**:
- `src/lib/domain/schedule/grid-cell-factory.ts`
- `src/components/domain/schedule/BaseGridCell.tsx`
- `src/components/domain/schedule/ScheduleEventGrid.tsx`

**Modified Files (2)**:
- `src/components/domain/schedule/InteractiveScheduleGrid.tsx`
- `src/components/domain/schedule/BellScheduleGrid.tsx`

**Total Estimated Time**: 4-6 hours

## Risk Assessment

**Low Risk**: 
- Shared logic extraction is straightforward
- Component hierarchy is logical
- Type safety maintained throughout

**Mitigation**:
- Implement incrementally
- Test each component independently
- Keep existing components working during transition

Would you like me to proceed with more detailed code specifications for any particular phase, or would you prefer to start with Phase 1 implementation?