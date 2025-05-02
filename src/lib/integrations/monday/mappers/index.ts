// Re-export the main functionality

// Core exports
export * from "./utils";

// Entity exports
export * from "./schemas";

// Board-specific exports
export * from "./adapters";

// Factory function to get the appropriate mapper based on board ID
import { MondayItem, MondayColumn, TransformResult, MondayColumnValue } from "@/lib/integrations/monday/types";
import { transformMondayItemToVisit } from "./schemas/visit";
import { transformStandardBoardItemToVisit } from "./adapters/standard";

/**
 * Get the appropriate transformer based on board ID
 */
export function getMondayItemTransformer(boardId: string) {
  // Map of board IDs to transformer functions
  const transformers: Record<string, (item: MondayItem, columns: MondayColumnValue[]) => TransformResult> = {
    // Standard board IDs
    "7259948291": transformStandardBoardItemToVisit,
    
    // Add more board-specific transformers as needed
  };
  
  // Return the appropriate transformer or the default
  return transformers[boardId] || transformMondayItemToVisit;
}

/**
 * Universal transformer that uses the appropriate mapper based on board ID
 */
export function transformMondayItem(
  mondayItem: MondayItem, 
  boardColumns: MondayColumnValue[]
): TransformResult {
  const boardId = mondayItem.board_id || '';
  const transformer = getMondayItemTransformer(boardId);
  return transformer(mondayItem, boardColumns);
} 