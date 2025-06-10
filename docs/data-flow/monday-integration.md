# Monday.com Integration

## Overview

Our platform implements a flexible integration with Monday.com that enables bidirectional data synchronization. This integration follows our schema-driven architecture while providing specialized mapping capabilities for Monday.com's unique data structures.

[RULE] All Monday.com integration code must be organized in the designated `/src/lib/integrations/monday/` directory.

## Code Organization

All Monday.com integration code follows a dedicated structure within the `/src/lib/integrations/monday/` directory:

```
src/lib/integrations/monday/
├── client/                # API client implementation
├── config/                # Field mappings and configuration
├── mappers/               # Entity transformation system
│   ├── adapters/          # Board-specific adaptations
│   ├── schemas/           # Entity-specific mappers
│   └── utils/             # Mapping utilities
├── services/              # Service layer for integration
├── utils/                 # Utility functions
├── types.ts               # Type definitions
└── index.ts               # Main entry point
```

This organization maintains separation of concerns while keeping the integration code isolated from the core application.

[RULE] Always import Monday integration code from `@/lib/integrations/monday` rather than directly from subfolders.

## Integration Architecture

The Monday.com integration follows a layered architecture:

1. **Client Layer**: Handles API communication with Monday.com
2. **Mapping Layer**: Transforms Monday data to application entities
3. **Service Layer**: Provides high-level operations for other application modules
4. **UI Layer**: Components for data selection and completion

This layered approach provides clean separation of concerns and allows each part to evolve independently.

[RULE] Use the API client for all Monday.com GraphQL queries rather than implementing custom fetch logic.

## Data Flow

The integration follows a specific flow when handling Monday.com data:

1. **Retrieval**: Data is fetched from Monday.com using the GraphQL API
2. **Transformation**: Board items are mapped to application entities using the mapping system
3. **Validation**: Transformed data is validated against Zod schemas
4. **Completion**: Missing fields are collected and presented for user input
5. **Storage**: Completed data is saved to the application database

This flow ensures data consistency while handling the variations in Monday.com board structures.

[RULE] Always validate transformed data against Zod schemas before storing in the database.

## Entity Mapping System

The core of the integration is a flexible mapping system that transforms Monday.com items into application entities:

```typescript
// Transform a Monday item to a Visit entity
const result = transformMondayItemToVisit(mondayItem, boardColumns);

// Check if transformation was successful
if (result.valid) {
  // Use the transformed data
  const visitData = result.transformed;
} else {
  // Handle missing required fields
  console.log("Missing fields:", result.missingRequired);
}
```

The mapping system supports multiple strategies:

1. **Title-Based Mapping**: Maps using column titles (e.g., "Visit Date" → date)
2. **Type-Based Mapping**: Uses column types when titles don't match
3. **Pattern-Based Mapping**: Matches column IDs to fields using patterns
4. **Custom Transformers**: Field-specific transformations for complex types

[RULE] Use the existing mapping system rather than creating custom one-off mappings.

## React Hooks

The integration provides React hooks for client-side interaction with Monday.com functionality:

### useMondayIntegration

A comprehensive hook that provides access to all Monday.com integration features:

```typescript
import { useMondayIntegration } from '@/hooks/integrations/monday/useMondayIntegration';

function MondayIntegrationComponent() {
  const { 
    // Connection status
    connectionStatus, 
    testConnection,
    
    // Board operations
    getBoard,
    board,
    boardLoading,
    
    // Import operations
    findItemsToImport,
    previewItems,
    previewLoading,
    
    // Import execution
    importItems,
    importResult,
    importing
  } = useMondayIntegration();
  
  // Example: Test connection on component mount
  useEffect(() => {
    testConnection();
  }, [testConnection]);
  
  return (
    // Component implementation
  );
}
```

### useStaffExistence

A specialized hook for checking if a staff member exists in both systems:

```typescript
import { useStaffExistence } from '@/hooks/integrations/monday/useStaffExistence';

function StaffIntegrationComponent() {
  const { checkExistence, exists, checking } = useStaffExistence();
  
  const handleCheck = async (email) => {
    const exists = await checkExistence(email);
    if (exists) {
      // Staff member exists in both systems
    } else {
      // Staff member needs to be created
    }
  };
  
  return (
    // Component implementation
  );
}
```

[RULE] Use these hooks for client-side integration with Monday.com rather than directly calling server actions.

## Extending the Integration

The integration is designed to be extensible through several mechanisms:

### Board-Specific Adapters

Create adapters for boards with unique structures:

```typescript
// src/lib/integrations/monday/mappers/adapters/customBoardAdapter.ts
export function createCustomBoardAdapter(boardId: string) {
  return {
    transformItem: (item: MondayItem, columns: MondayColumn[]) => {
      // Custom transformation logic for this board
      return transformedData;
    },
    validateMapping: (mapping: FieldMapping) => {
      // Custom validation for this board's requirements
      return isValid;
    }
  };
}
```

### Custom Field Transformers

Add transformers for new field types:

```typescript
// src/lib/integrations/monday/mappers/utils/customTransformers.ts
export function transformCustomField(value: any, column: MondayColumn): any {
  // Custom transformation logic
  return transformedValue;
}
```

### Entity-Specific Mappers

Create mappers for new entity types:

```typescript
// src/lib/integrations/monday/mappers/schemas/newEntityMapper.ts
export function transformMondayItemToNewEntity(
  item: MondayItem, 
  columns: MondayColumn[]
): TransformationResult<NewEntity> {
  // Implementation following existing patterns
}
```

[RULE] Follow the established patterns when extending the integration to maintain consistency.

## Configuration Management

The integration uses a configuration system for managing field mappings and board-specific settings:

```typescript
// Board configuration example
const boardConfig = {
  boardId: "12345",
  entityType: "visit",
  fieldMappings: {
    "visit_date": { columnTitle: "Visit Date", required: true },
    "coach_name": { columnTitle: "Coach", required: true },
    "school_name": { columnTitle: "School", required: true }
  },
  customTransformers: {
    "visit_date": transformDateField,
    "coach_name": transformPersonField
  }
};
```

[RULE] Use the configuration system for board-specific settings rather than hardcoding values.

## Error Handling

The integration implements comprehensive error handling:

- **Connection Errors**: Handled at the client layer with retry logic
- **Mapping Errors**: Collected and presented to users for resolution
- **Validation Errors**: Caught and displayed with specific field information
- **Import Errors**: Tracked and reported with detailed error messages

```typescript
// Example error handling in components
const { error, isError } = useMondayIntegration();

if (isError) {
  return <ErrorDisplay error={error} />;
}
```

[RULE] Always handle errors gracefully and provide meaningful feedback to users.

## Testing Integration Features

Test Monday.com integration features using mocked data:

```typescript
// Mock Monday API responses for testing
const mockMondayData = {
  boards: [{ id: "123", name: "Test Board" }],
  items: [{ id: "456", name: "Test Item", column_values: [] }]
};

// Test transformation functions
const result = transformMondayItemToVisit(mockMondayData.items[0], mockColumns);
expect(result.valid).toBe(true);
```

[RULE] Use mocked data for testing to avoid dependencies on external Monday.com boards.
```
