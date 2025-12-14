import { NextRequest, NextResponse } from "next/server";
import { createEntityResponse, createMonitoredErrorResponse } from "@api-responses/action-response-helper";
import { triggerManualSync } from "@/app/actions/scm/sync-sheets";

// =====================================
// POST /api/lesson-tracking/sync-manual
// Manual sync trigger using environment variables
// =====================================

export async function POST(_req: NextRequest) {
  try {
    console.log('📥 Manual sync request triggered');
    
    // Check if Google Sheet ID is configured
    if (!process.env.GOOGLE_SHEETS_ID) {
      return NextResponse.json(
        createMonitoredErrorResponse(
          new Error('Google Sheets ID not configured'),
          { component: 'ManualSync', operation: 'checkConfig' }
        ),
        { status: 400 }
      );
    }
    
    // Trigger the sync
    const result = await triggerManualSync();
    
    if (!result.success) {
      return NextResponse.json(
        createMonitoredErrorResponse(
          new Error(result.error || 'Manual sync failed'),
          { component: 'ManualSync', operation: 'triggerSync' }
        ),
        { status: 400 }
      );
    }
    
    // console.log('📤 Manual sync completed:', {
    //   processed: result.metadata.processed,
    //   eventsCreated: result.metadata.dailyEventsCreated,
    // });
    
    return NextResponse.json(
      createEntityResponse(result, 'Manual sync completed successfully')
    );
    
  } catch (error) {
    console.error('❌ Manual sync API error:', error);
    
    return NextResponse.json(
      createMonitoredErrorResponse(
        error,
        { component: 'ManualSync', operation: 'handleRequest' }
      ),
      { status: 500 }
    );
  }
}

// GET handler to show sync status
export async function GET() {
  return NextResponse.json({
    message: 'Manual sync endpoint. Use POST to trigger sync.',
    environment: {
      hasGoogleSheetId: !!process.env.GOOGLE_SHEETS_ID,
      hasGoogleCredentials: !!(process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY),
    }
  });
}
