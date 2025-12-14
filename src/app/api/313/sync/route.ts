import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withRequestValidation } from "@server/api/validation/api-validation";
import { createEntityResponse, createMonitoredErrorResponse } from "@api-responses/action-response-helper";
import { syncSheetsData, getSyncStatus } from "@/app/actions/scm/sync-sheets";

// =====================================
// REQUEST SCHEMAS
// =====================================

const SyncRequestSchema = z.object({
  spreadsheetId: z.string().min(1, "Spreadsheet ID is required"),
  range: z.string().optional().default('Full Data!A:Z'),
  force: z.boolean().optional().default(false).describe("Force sync even if no new data"),
});

// const GetStatusRequestSchema = z.object({
//   includeErrors: z.boolean().optional().default(false),
// });

// =====================================
// POST /api/lesson-tracking/sync
// Sync data from Google Sheets
// =====================================

const handleSyncRequest = async (
  validatedData: { spreadsheetId: string; range?: string; force?: boolean }, 
  _req: NextRequest
) => {
  try {
    // Provide defaults for optional fields to ensure type safety
    const { 
      spreadsheetId, 
      range = 'Full Data!A:Z',
      force = false 
    } = validatedData;
    
    console.log('📥 Sheets sync request:', { spreadsheetId, range, force });
    
    // Perform the sync
    const result = await syncSheetsData(spreadsheetId, range);
    
    if (!result.success) {
      return NextResponse.json(
        createMonitoredErrorResponse(
          new Error(result.error || 'Sync failed'),
          { component: 'SheetsSync', operation: 'syncData' }
        ),
        { status: 400 }
      );
    }
    
    console.log('📤 Sheets sync completed:', {
      processed: result.processed,
      eventsCreated: result.dailyEventsCreated,
      hasErrors: !result.success || !!result.error
    });
    
    return NextResponse.json(
      createEntityResponse(result, 'Sync completed successfully')
    );
    
  } catch (error) {
    console.error('❌ Sheets sync API error:', error);
    
    return NextResponse.json(
      createMonitoredErrorResponse(
        error,
        { component: 'SheetsSync', operation: 'handleSyncRequest' }
      ),
      { status: 500 }
    );
  }
};

// =====================================
// GET /api/lesson-tracking/sync
// Get sync status information
// =====================================

const handleStatusRequest = async (_req: NextRequest) => {
  try {
    console.log('📥 Sync status request');
    
    const result = await getSyncStatus();
    
    if (!result.success) {
      return NextResponse.json(
        createMonitoredErrorResponse(
          new Error(result.error || 'Failed to get sync status'),
          { component: 'SheetsSync', operation: 'getStatus' }
        ),
        { status: 400 }
      );
    }
    
    console.log('📤 Sync status response:', { hasData: !!result.data });
    
    return NextResponse.json(
      createEntityResponse(result.data, 'Sync status retrieved successfully')
    );
    
  } catch (error) {
    console.error('❌ Sync status API error:', error);
    
    return NextResponse.json(
      createMonitoredErrorResponse(
        error,
        { component: 'SheetsSync', operation: 'handleStatusRequest' }
      ),
      { status: 500 }
    );
  }
};

// =====================================
// ROUTE HANDLERS
// =====================================

// POST handler with validation
export const POST = withRequestValidation(SyncRequestSchema)(handleSyncRequest);

// GET handler for status
export async function GET(req: NextRequest) {
  return handleStatusRequest(req);
}

// OPTIONS handler for CORS (if needed)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
