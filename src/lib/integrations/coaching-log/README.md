# Coaching Log Form Integration

This module provides automated form filling capabilities for coaching log forms, with support for both legacy event data and the new VisitSchedule architecture.

## Architecture Overview

The integration follows a modular approach with clear separation of concerns:

```
┌─────────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│   Visit Document    │    │  VisitSchedule Doc   │    │   Staff Documents   │
│  - visitScheduleId  │───▶│  - timeBlocks[]      │    │  - staffName        │
│  - date            │    │  - staffIds[]        │◀───│  - rolesNYCPS[]     │
│  - modeDone        │    │  - eventType         │    │                     │
└─────────────────────┘    └──────────────────────┘    └─────────────────────┘
           │                           │                           │
           │                           │                           │
           ▼                           ▼                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    fetchVisitScheduleData()                                │
│  1. Fetch Visit by ID                                                      │
│  2. Fetch VisitSchedule if exists                                          │
│  3. Collect unique staffIds                                                │
│  4. Fetch Staff documents in parallel                                      │
│  5. Create Map<string, Staff> lookup                                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                   visitScheduleToEventData()                               │
│  1. Transform timeBlocks to EventData[]                                    │
│  2. Resolve staff names from lookup                                        │
│  3. Map event types to form activities                                     │
│  4. Calculate durations from time blocks                                   │
│  5. Handle fallbacks gracefully                                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CoachingLogFormFiller                                   │
│  - fillFormFromVisit() - NEW: Uses VisitSchedule architecture              │
│  - fillFormFromSchema() - EXISTING: Direct schema mapping                  │
│  - fillForm() - LEGACY: JSON-based form filling                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. Visit Schedule Data Fetcher

**File**: `services/visit-schedule-fetcher.ts`

Fetches and aggregates data from multiple sources:

```typescript
interface VisitScheduleData {
  visit?: Visit;
  visitSchedule?: VisitSchedule;
  staffLookup: Map<string, NYCPSStaff>;
}

// Usage
const data = await fetchVisitScheduleData(visitId);
```

**Features**:
- Parallel staff data fetching for performance
- Graceful handling of missing data
- Comprehensive error logging
- TypeScript type safety

### 2. Event Data Transformer

**File**: `mappers/visit-schedule-to-events.ts`

Converts VisitSchedule data to form-compatible EventData:

```typescript
interface EventData {
  name: string[];      // Staff names
  role: string;        // Primary staff role
  activity: string;    // Form activity type
  duration: string;    // Duration in minutes
}

// Usage
const events = visitScheduleToEventData(visitSchedule, staffLookup);
```

**Mapping Logic**:
- **Event Types**: `Observation` → `"Observed instruction"`
- **Staff Roles**: `Teacher` → `"Teacher"`, `Coach` → `"School-based coach"`
- **Durations**: Stored duration (if valid) → Default to "45" minutes
- **Fallbacks**: Missing data → `"Teacher TBD"` with default values

### 3. Enhanced Form Filler

**File**: `services/playwright-form-filler.ts`

Three methods for different use cases:

```typescript
// NEW: Visit-based form filling
await formFiller.fillFormFromVisit(visitId, coachingLogData, overrides);

// EXISTING: Schema-based form filling  
await formFiller.fillFormFromSchema(coachingLogData, overrides);

// LEGACY: JSON-based form filling
await formFiller.fillForm(jsonData);
```

### 4. Server Actions

**File**: `../../app/actions/integrations/coaching-log-automation.ts`

```typescript
// NEW: Visit-based automation
export async function automateCoachingLogFillFromVisit(
  visitId: string,
  coachingLogData: CoachingLogInput,
  formOverrides?: FormOverrides
): Promise<AutomationResult>

// EXISTING: Schema-based automation
export async function automateCoachingLogFillFromSchema(
  coachingLogData: CoachingLogInput,
  formOverrides?: FormOverrides
): Promise<AutomationResult>
```

## Usage Examples

### Basic Visit-Based Form Filling

```typescript
import { automateCoachingLogFillFromVisit } from '@/app/actions/integrations/coaching-log-automation';
import { createCoachingLogDefaults } from '@zod-schema/visits/coaching-log';

// Prepare coaching log data
const coachingLogData = createCoachingLogDefaults({
  reasonDone: 'Yes',
  totalDuration: 'Half day - 3 hours',
  solvesTouchpoint: 'Teacher OR teacher & leader support'
});

// Optional form overrides
const formOverrides = {
  schoolName: 'PS 123',
  districtName: 'District 15',
  coachName: 'Jane Smith'
};

// Fill form from visit
const result = await automateCoachingLogFillFromVisit(
  visitId,
  coachingLogData,
  formOverrides
);
```

### Manual Workflow

```typescript
import { fetchVisitScheduleData } from '@/lib/integrations/coaching-log/services/visit-schedule-fetcher';
import { visitScheduleToEventData } from '@/lib/integrations/coaching-log/mappers/visit-schedule-to-events';

// Step 1: Fetch data
const scheduleData = await fetchVisitScheduleData(visitId);

// Step 2: Transform to events
const events = visitScheduleToEventData(
  scheduleData.visitSchedule,
  scheduleData.staffLookup
);

// Step 3: Use with existing form filler
const formOverrides = {
  visitDate: scheduleData.visit?.date,
  modeDone: scheduleData.visit?.modeDone,
  events
};

await formFiller.fillFormFromSchema(coachingLogData, formOverrides);
```

## Error Handling & Fallbacks

The system provides graceful degradation at every level:

### Missing Visit
```typescript
// Returns empty data structure, allows form filling to continue
{ staffLookup: new Map() }
```

### Missing VisitSchedule
```typescript
// Returns single fallback event
[{
  name: ["Teacher TBD"],
  role: "Teacher",
  activity: "Observed instruction",
  duration: "45"
}]
```

### Missing Staff Data
```typescript
// Uses partial ID for debugging
name: ["Staff f-id"]  // Last 4 chars of ID
role: "Teacher"       // Default role
```

### Invalid Duration Data
```typescript
// Validates stored duration, defaults to 45-minute duration
duration: "45"
```

## Migration Strategy

The implementation maintains full backward compatibility:

1. **Existing `fillFormFromSchema`** continues working unchanged
2. **New `fillFormFromVisit`** provides enhanced functionality
3. **Legacy `fillForm`** remains for JSON-based workflows
4. **Gradual adoption** - update integration points when ready

## Testing

### Integration Tests
```typescript
// Run all demonstrations
import { runAllDemonstrations } from './examples/visit-schedule-demo';
const results = await runAllDemonstrations(visitId);
```

### Manual Testing
```typescript
// Test individual components
import { testMissingVisit, testValidVisit } from './services/__tests__/visit-schedule-integration.test';
const result = await testMissingVisit();
```

## Performance Considerations

- **Parallel API calls** for staff data fetching
- **Efficient Map lookups** for staff resolution
- **Minimal data transformation** overhead
- **Graceful fallbacks** prevent blocking operations

## Security & Validation

- **Zod schema validation** for all coaching log data
- **Type-safe transformations** throughout the pipeline
- **Input sanitization** at API boundaries
- **Error boundary protection** with try/catch blocks

## Future Enhancements

1. **Caching layer** for frequently accessed staff data
2. **Real-time sync** between Visit and form data
3. **Advanced error recovery** with retry mechanisms
4. **Form validation** before submission
5. **Audit logging** for form automation activities

## Dependencies

- `@zod-schema/schedules/schedule-documents` - VisitSchedule types
- `@zod-schema/core/staff` - Staff types
- `@zod-schema/visits/visit` - Visit types
- `@zod-schema/visits/coaching-log` - CoachingLog types
- `@enums` - Shared enumerations
- `playwright` - Browser automation

## API Endpoints Required

The fetcher expects these endpoints to be available:

- `GET /api/visits/{visitId}` - Fetch visit data
- `GET /api/schedules/{scheduleId}` - Fetch visit schedule data  
- `GET /api/staff/{staffId}` - Fetch staff data

Ensure these endpoints return the expected schema types. 