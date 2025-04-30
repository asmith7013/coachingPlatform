// src/app/actions/integrations/monday.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { mondayClient } from "@/app/api/integrations/monday/client";
import { ITEMS_QUERY, BOARD_WITH_ITEMS_QUERY } from "@/lib/api/integrations/monday-queries";
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
  MondayBoard
} from "@/lib/types/domain/monday";

// Map Monday.com column IDs to their meanings
const COLUMN_IDS = {
  COACH: "person",
  SESSION_DATE: "date4",
  SCHOOL_NAME: "text0",
  SITE_ADDRESS: "text",
  MODE_DONE: "status"
};

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
            mondayLastSyncedAt: new Date(),
            
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
export async function testConnection(): Promise<ApiResponse<{ name: string; email: string }>> {
  try {
    const response = await mondayClient.query<{ me: { name: string; email: string } }>(
      `query { me { name email } }`
    );
    
    return {
      success: true,
      data: response.me
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}