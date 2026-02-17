"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { GoogleSheetsSyncService } from "@/lib/integrations/google-sheets/services/sync-service";

/**
 * Server action wrapper for sync functionality
 * Delegates to API-safe service
 */
export async function syncSheetsData(
  spreadsheetId: string,
  range: string = "Full Data!A:Z",
) {
  return withDbConnection(() =>
    GoogleSheetsSyncService.syncSheetsData(spreadsheetId, range),
  );
}

/**
 * Server action wrapper for sync status
 */
export async function getSyncStatus() {
  return withDbConnection(() => GoogleSheetsSyncService.getSyncStatus());
}

/**
 * Trigger manual sync for testing
 */
export async function triggerManualSync() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  if (!spreadsheetId) {
    return {
      success: false,
      error: "GOOGLE_SHEETS_ID environment variable not set",
    };
  }

  return withDbConnection(() =>
    GoogleSheetsSyncService.syncSheetsData(spreadsheetId),
  );
}
