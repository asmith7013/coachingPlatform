# Google Sheets Data Normalization System

A simple, robust system for normalizing Google Sheets data into structured events with basic column resilience and comprehensive error handling.

## Overview

This system follows established patterns in the codebase:
- **Schema-first design** with Zod validation
- **Established error handling** using existing error handlers
- **Simple column resilience** for real-world spreadsheet variations
- **Comprehensive validation** at every step

## Key Features

### ✅ Simple Column Resilience
- Handles whitespace and case variations automatically
- Supports known aliases for commonly varying column names
- Clear error messages for missing required columns
- Single-pass validation and transformation

### ✅ Comprehensive Error Handling
- Integration with existing error handling system
- Clear, actionable error messages
- Batch processing with detailed error tracking
- Graceful fallbacks and validation

### ✅ Schema-Driven Architecture
- Full Zod schema validation
- Type-safe transformations
- Consistent data structures
- Integration with existing schema system

## Usage

### Basic Usage

```typescript
import { 
  normalizeRowToEvents, 
  normalizeMultipleRows, 
  validateHeaders 
} from '@/lib/integrations/google-sheets';

// Validate headers first
const headerValidation = validateHeaders(headers);
if (!headerValidation.success) {
  console.error('Invalid headers:', headerValidation.suggestions);
  return;
}

// Process single row
const result = normalizeRowToEvents(rawRow, headers);
if (result.success) {
  console.log('Daily events:', result.data.dailyEvents);
  console.log('Lesson completions:', result.data.lessonCompletions);
}

// Process multiple rows
const batchResult = normalizeMultipleRows(rawRows, headers);
console.log(`Processed ${batchResult.metadata.successfulRows} of ${batchResult.metadata.totalRows} rows`);
```

### Expected Data Structure

The system expects spreadsheets with these required columns:
- `Date` - Date in MM/DD/YYYY format
- `Student ID` - Numeric student identifier
- `Name` - Student full name
- `Teacher` - Teacher name (must match enum values)
- `Section` - Class section identifier
- `Class length (min)` - Class duration in minutes
- `Attendance` - Attendance status (✅ for present)

Optional columns for lesson tracking:
- `Instruction Received (Min)` - Minutes of instruction
- `Lessons Completed ☑️` - Comma-separated lesson codes
- `Mastery Checks Attempted ✏️` - Mastery check lesson codes
- `#1`, `# of Attempts`, `Mastered ✅` - Mastery attempt details

## Column Resilience

The system handles common column name variations:

| Standard Name | Accepted Aliases |
|---------------|------------------|
| `lessons completed ☑️` | `lessons completed`, `completed lessons`, `zearn completed` |
| `mastery checks attempted ✏️` | `mastery attempted`, `checks attempted`, `mastery checks` |
| `student id` | `id`, `student number`, `studentid` |
| `student name` | `name`, `full name`, `student` |
| `# of attempts` | `attempts`, `number of attempts`, `tries` |

## Output Structure

### Successful Normalization
```typescript
{
  success: true,
  data: {
    dailyEvents: DailyClassEventInput[],
    lessonCompletions: (ZearnCompletionInput | SnorklCompletionInput)[]
  },
  metadata: {
    zearnCompletionsCreated: number,
    snorklCompletionsCreated: number,
    dailyEventsCreated: number
  }
}
```

### Failed Normalization
```typescript
{
  success: false,
  data: {
    dailyEvents: [],
    lessonCompletions: []
  },
  errors: [{
    type: 'validation' | 'parsing',
    message: string
  }],
  metadata: {
    zearnCompletionsCreated: 0,
    snorklCompletionsCreated: 0,
    dailyEventsCreated: 0
  }
}
```

## Architecture

### File Structure
```
src/lib/integrations/google-sheets/
├── data-processor.ts          # Main normalization orchestration
├── types/
│   └── spreadsheet-types.ts   # TypeScript interfaces
├── validators/
│   └── row-validator.ts       # Row validation and column mapping
├── parsers/
│   └── row-parser.ts          # Event creation from validated data
├── client.ts                  # Google Sheets API client
└── index.ts                   # Clean exports
```

### Key Components

1. **Data Processor** (`data-processor.ts`)
   - Main orchestration function
   - Error handling integration
   - Batch processing logic

2. **Row Validator** (`validators/row-validator.ts`)
   - Column name normalization
   - Column alias resolution
   - Data type validation

3. **Row Parser** (`parsers/row-parser.ts`)
   - Event creation from validated data
   - Lesson completion parsing
   - Mastery check handling

4. **Type Definitions** (`types/spreadsheet-types.ts`)
   - Raw spreadsheet interfaces
   - Validated data types
   - Result type definitions

## Integration Points

- **Error Handling**: Uses `@error/handlers/validation` and `@error/handlers/server`
- **Schema System**: Integrates with `@zod-schema/313/core` schemas
- **Database Models**: Compatible with existing MongoDB models
- **Existing Patterns**: Follows established transformation patterns

## Testing

The system includes comprehensive testing for:
- ✅ Header validation with clear error messages
- ✅ Single row normalization with success/failure cases
- ✅ Batch processing with error tracking
- ✅ Column resilience with alternative names
- ✅ Schema validation integration
- ✅ Error handling robustness

## Performance

- **Single-pass processing** - No redundant validation steps
- **Batch optimization** - Efficient handling of multiple rows
- **Memory efficient** - Streaming-friendly architecture
- **Fast validation** - Zod schema validation with caching 