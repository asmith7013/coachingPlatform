"use server";

import { mondayClient } from "@/app/api/integrations/monday/client";
import { 
  WORKSPACES_QUERY, 
  BOARDS_BY_WORKSPACE_QUERY,
  BOARD_ITEMS_QUERY 
} from "@/lib/api/integrations/queries";

export async function getMondayWorkspaces() {
  try {
    const response = await mondayClient.query<{ workspaces: { id: string, name: string }[] }>(
      WORKSPACES_QUERY
    );
    
    return { 
      success: true, 
      data: response.workspaces || []
    };
  } catch (error) {
    console.error("Failed to fetch Monday workspaces:", error);
    return { 
      success: false, 
      error: (error as Error).message 
    };
  }
}

export async function getBoardsByWorkspace(workspaceId: string) {
  try {
    const response = await mondayClient.query<{ 
      boards: {
        id: string;
        name: string;
        columns: {
          id: string;
          title: string;
          type: string;
        }[];
      }[] 
    }>(
      BOARDS_BY_WORKSPACE_QUERY,
      { workspaceId }
    );
    
    return { 
      success: true, 
      data: response.boards || []
    };
  } catch (error) {
    console.error(`Failed to fetch boards for workspace ${workspaceId}:`, error);
    return { 
      success: false, 
      error: (error as Error).message 
    };
  }
}

export async function getBoardItemSamples(boardId: string, limit: number = 5) {
  try {
    const response = await mondayClient.query<{
      boards: {
        items: {
          id: string;
          name: string;
          column_values: {
            id: string;
            title: string;
            text: string | null;
            value: string | null;
          }[];
        }[];
      }[];
    }>(
      BOARD_ITEMS_QUERY,
      { boardId, limit }
    );
    
    return { 
      success: true, 
      data: response.boards?.[0]?.items || []
    };
  } catch (error) {
    console.error(`Failed to fetch items for board ${boardId}:`, error);
    return { 
      success: false, 
      error: (error as Error).message 
    };
  }
} 