// src/lib/api/fetchers/monday.ts
import { createApiSafeFetcher } from '@/lib/server/fetchers/fetcher-factory';
import { VisitZodSchema } from "@zod-schema/visits/visit";
import { VisitModel } from "@mongoose-schema/visits/visit.model";
import { mondayClient } from "@/lib/integrations/monday/client/client";
import { BOARD_WITH_ITEMS_QUERY } from "@/lib/integrations/monday/client/queries";
import { MondayBoardResponse } from "@lib/integrations/monday/types/api";
import { ensureBaseDocumentCompatibility } from "@zod-schema/base-schemas";

// For the standard resource fetching pattern (visits in your MongoDB)
export const fetchMondayVisitsForApi = createApiSafeFetcher(
  VisitModel,
  ensureBaseDocumentCompatibility(VisitZodSchema),
  "mondayItemName"
);

// API-safe version of the board fetcher (without "use server" directive)
export async function fetchMondayBoard(boardId: string, itemLimit: number = 20) {
  try {
    // Make API request
    const response = await mondayClient.query<MondayBoardResponse>(
      BOARD_WITH_ITEMS_QUERY, 
      { 
        boardId,
        itemLimit
      }
    );
    
    // Check if board exists
    if (!response.boards || response.boards.length === 0) {
      return { 
        success: false, 
        error: `Board with ID ${boardId} not found or not accessible`,
        items: []
      };
    }
    
    return { 
      success: true, 
      items: [response.boards[0]],
      total: 1
    };
  } catch (error) {
    console.error("Error fetching Monday board:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error",
      items: []
    };
  }
}

// Test connection function (API-safe version)
export async function testMondayConnection() {
  try {
    const response = await mondayClient.query<{ me: { name: string; email: string } }>(
      `query { me { name email } }`
    );
    
    return {
      success: true,
      items: [response.me],
      total: 1
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      items: []
    };
  }
}

