// src/app/actions/integrations/monday.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { 
  mondayClient, 
  fetchMondayItems, 
  fetchMondayItemById, 
  fetchMondayUserById,
  fetchMondayUserByEmail,
  MondayUser 
} from "@/lib/integrations/monday/client/client";
import { 
  ITEMS_QUERY, 
  BOARD_WITH_ITEMS_QUERY,
  WORKSPACES_QUERY, 
  BOARDS_BY_WORKSPACE_QUERY,
  BOARD_QUERY,
  // ITEM_BY_ID_QUERY,
  // USER_BY_ID_QUERY,
  // USER_BY_EMAIL_QUERY
} from "@/lib/integrations/monday/client/queries";
import { VisitModel } from "@mongoose-schema/visits/visit.model";
import { SchoolModel } from "@mongoose-schema/core/school.model";
import { TeachingLabStaffModel } from "@mongoose-schema/core/staff.model";
import { VisitInputZodSchema } from "@zod-schema/visits/visit";
import { withDbConnection } from "@data-server/db/ensure-connection";
import { handleValidationError } from "@error/handle-validation-error";
import { handleServerError } from "@error/handle-server-error";
import { 
  MondayBoardResponse, 
  ApiResponse, 
  MondayColumnValue,
  MondayResponse,
  MondayBoard,
  ImportPreview,
  ImportResult,
  MondayConnectionTestResult,
  MondayColumnMap,
  MondayColumn,
  MondayItem
} from "@/lib/integrations/monday/types";
import { transformMondayItemToVisit } from "@/lib/integrations/monday/services/transform-service";
import { shouldImportItemWithStatus } from "@/lib/integrations/monday/utils/monday-utils";
import { VisitImportZodSchema } from "@/lib/data-schema/zod-schema/visits/visit";

// Map Monday.com column IDs to their meanings
const COLUMN_IDS: MondayColumnMap = {
  COACH: "person",
  SESSION_DATE: "date4",
  SCHOOL_NAME: "text0",
  SITE_ADDRESS: "text",
  MODE_DONE: "status"
};

export type { ImportPreview }; // Re-export for component usage

/**
 * Import Item interface for providing additional data when importing
 */
export interface ImportItem {
  id: string;
  ownerId?: string;
  completeData?: Record<string, unknown>;
}

export async function importVisitsFromMonday(boardId: string) {
  return withDbConnection(async () => {
    try {
      // Fetch items from Monday
      const response = await mondayClient.query<MondayResponse>(ITEMS_QUERY, { boardId });
      
      if (!response.boards || response.boards.length === 0) {
        return { success: false, error: "Board not found" };
      }
      
      const items = response.boards[0].items_page.items;
      
      const results = {
        total: items.length,
        imported: 0,
        updated: 0,
        errors: 0,
        errorDetails: [] as string[]
      };
      
      // Process each item
      for (const item of items) {
        try {
          // Find column values
          const columnValues = item.column_values.reduce<Record<string, MondayColumnValue>>((acc: Record<string, MondayColumnValue>, cv: MondayColumnValue) => {
            acc[cv.id] = cv;
            return acc;
          }, {});
          
          // Extract data
          const coachValue = columnValues[COLUMN_IDS.COACH]?.text;
          const dateValue = columnValues[COLUMN_IDS.SESSION_DATE]?.text;
          const schoolNameValue = columnValues[COLUMN_IDS.SCHOOL_NAME]?.text;
          const siteAddressValue = columnValues[COLUMN_IDS.SITE_ADDRESS]?.text;
          const modeDoneValue = columnValues[COLUMN_IDS.MODE_DONE]?.text;
          
          // Find coach in database
          let coachId = "";
          if (coachValue) {
            const coach = await TeachingLabStaffModel.findOne({ 
              staffName: { $regex: new RegExp(coachValue, "i") } 
            });
            if (coach) {
              coachId = coach._id.toString();
            }
          }
          
          // Find school in database
          let schoolId = "";
          if (schoolNameValue) {
            const school = await SchoolModel.findOne({ 
              schoolName: { $regex: new RegExp(schoolNameValue, "i") } 
            });
            if (school) {
              schoolId = school._id.toString();
            }
          }
          
          // Map mode to enum value
          let modeDone;
          if (modeDoneValue) {
            const modeMap: Record<string, string> = {
              "Virtual": "Virtual",
              "In-person": "In-person", 
              "Hybrid": "Hybrid"
            };
            modeDone = modeMap[modeDoneValue];
          }
          
          // Create visit data
          const visitData = {
            // Core Visit data
            date: dateValue || new Date().toISOString().split('T')[0],
            school: schoolId,
            coach: coachId,
            cycleRef: "", // Would need to be populated or made optional
            gradeLevelsSupported: [],
            owners: [coachId].filter(Boolean),
            
            // Monday specific fields
            mondayItemId: item.id,
            mondayBoardId: boardId,
            mondayItemName: item.name,
            mondayLastSyncedAt: new Date().toISOString(),
            
            // Additional fields from Monday
            siteAddress: siteAddressValue,
            modeDone: modeDone,
          };
          
          // Find existing or create new
          const existingVisit = await VisitModel.findOne({ mondayItemId: item.id });
          
          if (existingVisit) {
            // Update existing
            Object.assign(existingVisit, visitData);
            await existingVisit.save();
            results.updated++;
          } else {
            // Create new (with validation)
            const validatedData = VisitInputZodSchema.parse(visitData);
            await VisitModel.create(validatedData);
            results.imported++;
          }
        } catch (itemError) {
          results.errors++;
          
          if (itemError instanceof z.ZodError) {
            results.errorDetails.push(
              `Validation error for item ${item.id}: ${handleValidationError(itemError)}`
            );
          } else {
            results.errorDetails.push(
              `Error processing item ${item.id}: ${(itemError as Error).message}`
            );
          }
        }
      }
      
      // Revalidate paths
      revalidatePath("/dashboard/visits");
      
      return { 
        success: true,
        data: results
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error: handleValidationError(error) };
      }
      return { success: false, error: handleServerError(error) };
    }
  });
}

/**
 * Fetch a Monday.com board by ID
 */
export async function getBoard(boardId: string, itemLimit: number = 20): Promise<ApiResponse<MondayBoard>> {
  try {
    // Input validation
    const parsedInput = z.object({
      boardId: z.string().min(1, "Board ID is required"),
      itemLimit: z.number().int().positive().default(20)
    }).parse({ boardId, itemLimit });
    
    // console.log(boardId, 'boardId monday actions')
    // Make API request
    const response = await mondayClient.query<MondayBoardResponse>(
      BOARD_WITH_ITEMS_QUERY, 
      { 
        boardId: parsedInput.boardId, 
        itemLimit: parsedInput.itemLimit 
      }
    );
    
    // Check if board exists
    if (!response.boards || response.boards.length === 0) {
      return { 
        success: false, 
        error: `Board with ID ${boardId} not found or not accessible`
      };
    }
    
    return { 
      success: true, 
      data: response.boards[0]
    };
  } catch (error) {
    console.error("Error fetching Monday board:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Test Monday.com API connection
 */
export async function testConnection(): Promise<MondayConnectionTestResult> {
  try {
    // Get current user info from Monday - using direct query string for simple query
    const response = await mondayClient.query<{ users: { id: string; name: string; email: string }[] }>(
      `query { users { id name email } }`
    );
    
    if (!response.users || response.users.length === 0) {
      return { 
        success: false, 
        error: "No users found. Check API token permissions."
      };
    }
    
    // Just return the first user (token owner)
    const currentUser = response.users[0];
    
    return {
      success: true,
      data: {
        name: currentUser.name,
        email: currentUser.email
      }
    };
  } catch (error) {
    return {
      success: false,
      error: handleServerError(error)
    };
  }
}

/**
 * Find potential visits to import from a Monday.com board
 */
export async function findPotentialVisitsToImport(boardId: string): Promise<ImportPreview[]> {
  try {
    const mondayItems = await fetchMondayItems(boardId);
    const previews: ImportPreview[] = [];
    
    await withDbConnection(async () => {
      for (const item of mondayItems) {
        // Skip items that don't have statuses we want to import
        if (!shouldImportItemWithStatus(item.state)) {
          continue;
        }
        
        // Check if already imported by mondayItemId
        const existingVisit = await VisitModel.findOne({ mondayItemId: item.id });
        
        // Transform the item with two-stage validation
        const { transformed, valid, missingRequired, errors, requiredForFinalValidation } = 
          await transformMondayItemToVisit(item);
        
        // Add to preview list
        previews.push({
          original: item,
          transformed,
          valid,
          existingItem: existingVisit?.toObject() || undefined,
          isDuplicate: !!existingVisit,
          missingRequired,
          errors,
          requiredForFinalValidation
        });
      }
    });
    
    return previews;
  } catch (error) {
    console.error("Error finding potential visits to import:", error);
    throw handleServerError(error);
  }
}

/**
 * Import selected visits from Monday.com
 * Supports providing owner IDs for visits and completing missing fields
 */
export async function importSelectedVisits(selectedItems: ImportItem[] | string[]): Promise<ImportResult> {
  const errors: Record<string, string> = {};
  let imported = 0;
  
  await withDbConnection(async () => {
    // Handle both string[] and ImportItem[] formats
    const itemsToProcess = Array.isArray(selectedItems) && selectedItems.length > 0 && typeof selectedItems[0] === 'string'
      ? (selectedItems as string[]).map(id => ({ id }))
      : (selectedItems as ImportItem[]);
    
    for (const item of itemsToProcess) {
      try {
        // Get the Monday item
        const mondayItem = await fetchMondayItemById(item.id);
        
        // Transform to Visit - this now includes auto-assigned owners from coach
        const { transformed } = await transformMondayItemToVisit(mondayItem);
        
        // Apply owner from selection if provided - this overrides any auto-assigned owners
        if ('ownerId' in item && item.ownerId) {
          transformed.owners = [item.ownerId];
        }
        
        // Apply completed data if provided - this adds any fields filled in via form
        if ('completeData' in item && item.completeData) {
          Object.assign(transformed, item.completeData);
        }
        
        // Try to validate with the full schema first for complete data
        let validatedData;
        const fullValidation = VisitInputZodSchema.safeParse(transformed);
        if (fullValidation.success) {
          validatedData = fullValidation.data;
        } else {
          // Fall back to import schema for partial imports
          if (!VisitImportZodSchema.safeParse(transformed).success) {
            errors[item.id] = "Invalid item data after transformation";
            continue;
          }
          validatedData = transformed;
        }
        
        // Create the Visit in MongoDB
        await VisitModel.create(validatedData);
        imported++;
      } catch (error) {
        if (error instanceof Error) {
          errors[item.id] = error.message;
        } else {
          errors[item.id] = 'Unknown error occurred';
        }
      }
    }
  });
  
  // Revalidate paths
  revalidatePath("/dashboard/visits");
  
  const hasErrors = Object.keys(errors).length > 0;
  
  return {
    success: imported > 0,
    imported,
    errors,
    message: hasErrors 
      ? `Imported ${imported} visits with ${Object.keys(errors).length} errors` 
      : `Successfully imported ${imported} visits`
  };
}

/**
 * Fetch a Monday.com user by ID
 */
export async function getMondayUserById(userId: string): Promise<ApiResponse<MondayUser>> {
  try {
    // Input validation
    const parsedInput = z.object({
      userId: z.string().min(1, "User ID is required")
    }).parse({ userId });
    
    // Fetch the user
    const user = await fetchMondayUserById(parsedInput.userId);
    
    if (!user) {
      return {
        success: false,
        error: `User with ID ${userId} not found or not accessible`
      };
    }
    
    return {
      success: true,
      data: user
    };
  } catch (error) {
    console.error("Error fetching Monday user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Fetch a Monday.com user by email
 */
export async function getMondayUserByEmail(email: string): Promise<ApiResponse<MondayUser>> {
  try {
    // Input validation
    const parsedInput = z.object({
      email: z.string().email("Valid email is required")
    }).parse({ email });
    
    // Fetch the user
    const user = await fetchMondayUserByEmail(parsedInput.email);
    
    if (!user) {
      return {
        success: false,
        error: `User with email ${email} not found or not accessible`
      };
    }
    
    return {
      success: true,
      data: user
    };
  } catch (error) {
    console.error("Error fetching Monday user by email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Get all boards from Monday.com
 */
export async function getBoards(): Promise<{ success: boolean; data?: MondayBoard[]; error?: string }> {
  try {
    // Get all workspaces first
    const workspacesResponse = await mondayClient.query<{ workspaces: { id: string; name: string }[] }>(
      WORKSPACES_QUERY
    );
    
    if (!workspacesResponse.workspaces || workspacesResponse.workspaces.length === 0) {
      return { 
        success: false, 
        error: "No workspaces found. Check API token permissions."
      };
    }
    
    // Get boards from all workspaces
    const boards: MondayBoard[] = [];
    
    for (const workspace of workspacesResponse.workspaces) {
      const boardsResponse = await mondayClient.query<{ boards: MondayBoard[] }>(
        BOARDS_BY_WORKSPACE_QUERY,
        { workspaceId: workspace.id }
      );
      
      if (boardsResponse.boards) {
        boards.push(...boardsResponse.boards);
      }
    }
    
    return {
      success: true,
      data: boards
    };
  } catch (error) {
    return {
      success: false,
      error: handleServerError(error)
    };
  }
}

/**
 * Get columns for a specific board
 */
export async function getBoardColumns(boardId: string): Promise<{ success: boolean; data?: MondayColumn[]; error?: string }> {
  try {
    if (!boardId) {
      return { 
        success: false, 
        error: "Board ID is required"
      };
    }
    
    // Get board columns
    const response = await mondayClient.query<{ boards: { id: string; name: string; columns: MondayColumn[] }[] }>(
      BOARD_QUERY,
      { boardId }
    );
    
    if (!response.boards || response.boards.length === 0) {
      return { 
        success: false, 
        error: "Board not found"
      };
    }
    
    const board = response.boards[0];
    
    return {
      success: true,
      data: board.columns
    };
  } catch (error) {
    return {
      success: false,
      error: handleServerError(error)
    };
  }
}

/**
 * Get items for a specific board
 */
export async function getBoardItems(boardId: string): Promise<{ success: boolean; data?: MondayItem[]; error?: string }> {
  try {
    if (!boardId) {
      return { 
        success: false, 
        error: "Board ID is required"
      };
    }
    
    // Get board items
    const response = await mondayClient.query<MondayResponse>(
      ITEMS_QUERY,
      { boardId }
    );
    
    if (!response.boards || response.boards.length === 0) {
      return { 
        success: false, 
        error: "Board not found"
      };
    }
    
    const board = response.boards[0];
    
    if (!board.items_page || !board.items_page.items) {
      return {
        success: true,
        data: []
      };
    }
    
    return {
      success: true,
      data: board.items_page.items
    };
  } catch (error) {
    return {
      success: false,
      error: handleServerError(error)
    };
  }
}

