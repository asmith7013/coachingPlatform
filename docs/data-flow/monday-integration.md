I'll update the Monday.com integration documentation to reference the proposed `useMondayIntegration` hook. Here's how the updated section should look:

<doc id="monday-integration">

# Monday.com Integration

<section id="monday-overview">

## Overview

Our platform implements a flexible integration with Monday.com that enables bidirectional data synchronization. This integration follows our schema-driven architecture while providing specialized mapping capabilities for Monday.com's unique data structures.

[RULE] All Monday.com integration code must be organized in the designated `/src/lib/integrations/monday/` directory.

</section>

<section id="monday-organization">

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

</section>

<section id="monday-architecture">

## Integration Architecture

The Monday.com integration follows a layered architecture:

1. **Client Layer**: Handles API communication with Monday.com
2. **Mapping Layer**: Transforms Monday data to application entities
3. **Service Layer**: Provides high-level operations for other application modules
4. **UI Layer**: Components for data selection and completion

This layered approach provides clean separation of concerns and allows each part to evolve independently.

[RULE] Use the API client for all Monday.com GraphQL queries rather than implementing custom fetch logic.

</section>

<section id="monday-data-flow">

## Data Flow

The integration follows a specific flow when handling Monday.com data:

1. **Retrieval**: Data is fetched from Monday.com using the GraphQL API
2. **Transformation**: Board items are mapped to application entities using the mapping system
3. **Validation**: Transformed data is validated against Zod schemas
4. **Completion**: Missing fields are collected and presented for user input
5. **Storage**: Completed data is saved to the application database

This flow ensures data consistency while handling the variations in Monday.com board structures.

[RULE] Always validate transformed data against Zod schemas before storing in the database.

</section>

<section id="monday-mapping-system">

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

</section>

<section id="monday-hooks">

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
  
  // Example: Load board when ID is provided
  const handleBoardLoad = async (boardId) => {
    await getBoard(boardId);
  };
  
  // Example: Import selected items
  const handleImport = async (selectedIds) => {
    await importItems(selectedIds);
  };
  
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

</section>

<section id="monday-extending">

## Extending the Integration

The integration is designed to be extensible through several mechanisms:

### Board-Specific Adapters

Custom configurations for specific Monday.com boards:

```typescript
// Create a custom mapping for a specific board
export const customBoardConfig = {
  ...baseVisitMappingConfig,
  titleMappings: {
    ...baseVisitMappingConfig.titleMappings,
    date: [...baseVisitMappingConfig.titleMappings.date, "Custom Date Field"]
  }
};
```

### Custom Field Transformers

For complex field transformations:

```typescript
// Custom transformer for a complex field
const customTransformer = (value: MondayColumnValue): string[] => {
  // Implementation...
  return transformedValue;
};
```

[RULE] Create board-specific adapters for boards with unique column structures.

</section>

<section id="monday-ui-components">

## UI Components

The integration includes specialized UI components in the `/src/components/integrations/monday/` directory:

1. **MondayVisitsSelector**: Displays visits from Monday.com for selection and import
2. **ImportCompletionForm**: Form for completing missing fields during import
3. **MondayUserFinder**: Component for looking up Monday.com users

These components maintain our application's design system while providing specialized functionality for the Monday.com workflow.

[RULE] Use the provided UI components rather than creating custom components for Monday.com integration.

</section>

<section id="monday-server-actions">

## Server Actions

Server actions for Monday.com integration are located in `/src/app/actions/integrations/monday.ts` and provide core functionality:

```typescript
// Import selected visits from Monday.com
const result = await importSelectedVisits(selectedItems);

// Test Monday.com connection
const connectionTest = await testConnection();

// Get Monday.com board data
const board = await getBoard(boardId);

// Find potential visits to import
const previewItems = await findPotentialVisitsToImport(boardId);
```

These server actions handle the server-side logic while providing standardized error handling and response formats.

[RULE] Always access server actions through the provided React hooks in client components.

</section>

<section id="monday-api-endpoints">

## API Endpoints

The integration exposes several API endpoints for external access and integration:

```
/api/integrations/monday/route.ts         # Reference data endpoint
/api/integrations/monday/user/route.ts    # Monday.com user lookup
```

These endpoints follow our standard API patterns and provide error handling and response formatting according to application standards.

The Monday.com API endpoints are designed to:

1. Support external integrations (like webhooks)
2. Provide reference data for UI components
3. Enable lookups without requiring server action permissions

[RULE] Use API endpoints for external integrations and React hooks for internal access.

</section>

<section id="monday-error-handling">

## Error Handling

The integration implements consistent error handling with several tiers:

1. **API Errors**: Network and API-level errors from Monday.com
2. **Mapping Errors**: Field-specific mapping and transformation errors
3. **Validation Errors**: Schema validation failures for transformed data
4. **Application Errors**: Errors during database operations

Each error includes:
- Error category
- Field or operation that failed
- Detailed message with context
- Suggestion for resolution (when possible)

[RULE] Always use standardized error handling when working with Monday.com data.

</section>

</doc>