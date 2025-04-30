"use server";

import { debugMondayAPIIssue } from "@/lib/api/integrations/monday-debug";
import { BOARD_WITH_ITEMS_QUERY } from "@/lib/api/integrations/monday-queries";

// Define a minimal type for the result to help with type checking
interface DebugResult {
  success: boolean;
  error?: string;
  message?: string;
  fullBoardResult?: {
    success: boolean;
    itemCount?: number;
    errorSummary?: string;
  } | null;
}

/**
 * Tests the fixed Monday.com API integration by running the diagnostic utilities
 * and verifying the updated GraphQL query works correctly.
 */
export async function testMondayAPIFix(boardId: string) {
  console.log("Testing Monday.com API integration with updated GraphQL query");
  console.log("Updated BOARD_WITH_ITEMS_QUERY:", BOARD_WITH_ITEMS_QUERY);
  
  try {
    // Run the comprehensive debug which includes testBoardWithItemsAccess
    const results = await debugMondayAPIIssue(boardId) as unknown as DebugResult;
    
    // Specifically check if the fullBoardResult was successful
    if (results.success && results.fullBoardResult?.success) {
      console.log("✅ Monday.com API integration fix VERIFIED");
      console.log(`Successfully fetched ${results.fullBoardResult.itemCount ?? 0} items with column values`);
      return {
        success: true,
        message: "Monday.com API integration fix is working correctly",
        itemCount: results.fullBoardResult.itemCount,
      };
    } else {
      console.error("❌ Monday.com API integration fix FAILED");
      console.error("Error:", results.fullBoardResult?.errorSummary || results.error || "Unknown error");
      return {
        success: false,
        error: results.fullBoardResult?.errorSummary || results.error || "Failed to fetch board data with items",
      };
    }
  } catch (error) {
    console.error("❌ Monday.com API integration test failed with exception:", error);
    return {
      success: false,
      error: String(error)
    };
  }
} 