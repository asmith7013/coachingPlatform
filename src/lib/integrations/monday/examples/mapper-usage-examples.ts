// src/lib/integrations/monday/examples/mapper-usage-examples.ts

/**
 * Example usage of the Monday mapper system
 * 
 * This file demonstrates how to use the mapper system in various scenarios.
 * These examples are meant for reference and documentation purposes.
 */

import { MondayItem, MondayColumn, MondayColumnValue } from "@/lib/integrations/monday/types";
import { 
  // Main factory function
  transformMondayItem,
  
  // Entity-specific mappers
  transformMondayItemToVisit,
  
  // Board-specific mappers
  transformStandardBoardItemToVisit,
  
  // Core mappers for custom usage
  VisitMapper
} from "@/lib/integrations/monday/mappers";

import { baseVisitMappingConfig } from "@/lib/integrations/monday/mappers/schemas/visit/config";

// Add example to import the BaseEntityMapper directly if needed
import { SchemaTransformer } from "@/lib/integrations/monday/mappers/utils/transformer";

/**
 * EXAMPLE 1: Basic usage with the universal transformer
 * 
 * This is the simplest way to use the system. The factory function
 * automatically selects the appropriate mapper based on the board ID.
 */
function example1(mondayItem: MondayItem, boardColumns: MondayColumnValue[]) {
  // The system will automatically select the right mapper based on board ID
  const result = transformMondayItem(mondayItem, boardColumns);
  
  if (result.valid) {
    // All required fields were successfully mapped
    console.log('Successfully mapped item:', result.transformed);
    
    // Use the mapped data
    return result.transformed;
  } else {
    // Some required fields are missing
    console.warn('Missing required fields:', result.missingRequired);
    
    // Show specific error messages
    Object.entries(result.errors).forEach(([field, error]) => {
      console.error(`Field ${field}: ${error}`);
    });
    
    // Handle the partial data or request additional input
    return {
      partialData: result.transformed,
      missingFields: result.missingRequired
    };
  }
}

/**
 * EXAMPLE 2: Using a specific entity mapper
 * 
 * Use this approach when you know you're working with a specific
 * entity type regardless of the board.
 */
function example2(mondayItem: MondayItem, boardColumns: MondayColumnValue[]) {
  // Always map as a Visit entity using the base Visit mapper
  const result = transformMondayItemToVisit(mondayItem, boardColumns as unknown as MondayColumn[]);
  
  // Process result...
  return result.transformed;
}

/**
 * EXAMPLE 3: Using a board-specific mapper
 * 
 * Use this approach when you know you're working with a specific
 * Monday.com board that has its own mapping configuration.
 */
function example3(mondayItem: MondayItem, boardColumns: MondayColumnValue[]) {
  // Map using the standard board's Visit mapper
  const result = transformStandardBoardItemToVisit(mondayItem, boardColumns);
  
  // Process result...
  return result.transformed;
}

/**
 * EXAMPLE 4: Creating a custom mapper on the fly
 * 
 * Use this approach when you need to override or extend the base
 * configuration for a one-off use case.
 */
function example4(mondayItem: MondayItem, boardColumns: MondayColumnValue[]) {
  // Extend the base config with custom mappings
  const customConfig = {
    ...baseVisitMappingConfig,
    titleMappings: {
      ...baseVisitMappingConfig.titleMappings,
      date: [...baseVisitMappingConfig.titleMappings.date, "Custom Date Field"]
    }
  };
  
  // Create custom mapper and use it
  const customMapper = new VisitMapper(customConfig);
  const result = customMapper.transformMondayItemToVisitEntity(mondayItem, boardColumns as unknown as MondayColumn[]);
  
  // Process result...
  return result.transformed;
}

/**
 * EXAMPLE 5: Integration with your application code
 * 
 * This example shows how to integrate the mapper system with
 * your application's existing Monday.com integration code.
 */
async function example5(boardId: string) {
  // Existing code for fetching data from Monday.com
  // const client = new MondayClient();
  // const board = await client.getBoard(boardId);
  // const items = await client.getBoardItems(boardId);
  
  // Mock data for the example
  const board = { columns: [] as MondayColumnValue[] };
  const items = [] as MondayItem[];
  
  // Map each item to your entity type
  const mappedItems = items.map(item => {
    return transformMondayItem(item, board.columns);
  });
  
  // Filter to valid items only
  const validItems = mappedItems.filter(result => result.valid);
  
  // Return the transformed data
  return validItems.map(result => result.transformed);
} 