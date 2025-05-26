import { ApiResponse } from '@lib/integrations/monday/types/api';
import { withDbConnection } from '@server/db/ensure-connection';
import { VisitModel } from '@mongoose-schema/visits/visit.model';
import { updateMondayItem } from '@lib/integrations/monday/client/client';
import { transformVisitToMondayItem } from '@lib/integrations/monday/services/transform-service';

/**
 * Sync a visit from the local database to Monday.com
 * 
 * Business logic for updating a Monday.com item based on changes
 * to a local Visit entity.
 * 
 * @param visitId The local visit ID to sync
 * @returns API response with success/failure info
 */
export async function syncVisitWithMondayService(visitId: string): Promise<ApiResponse<unknown>> {
  return withDbConnection(async () => {
    try {
      // Find the visit
      const visit = await VisitModel.findById(visitId);
      
      if (!visit) {
        return {
          success: false,
          error: `Visit with ID ${visitId} not found`
        };
      }
      
      // Check if visit has Monday.com data
      if (!visit.mondayItemId || !visit.mondayBoardId) {
        return {
          success: false,
          error: "Visit is not linked to a Monday.com item"
        };
      }
      
      // Transform Visit to Monday column values
      const mondayValues = transformVisitToMondayItem(visit.toObject());
      
      // Update the Monday.com item
      await updateMondayItem(
        visit.mondayBoardId,
        visit.mondayItemId,
        mondayValues
      );
      
      // Update the last synced timestamp
      visit.mondayLastSyncedAt = new Date().toISOString();
      await visit.save();
      
      return {
        success: true,
        message: "Visit successfully synced with Monday.com"
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  });
}
