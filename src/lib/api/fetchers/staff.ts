import { NYCPSStaffModel, TeachingLabStaffModel } from '@mongoose-schema/core/staff.model';
import { NYCPSStaffZodSchema, TeachingLabStaffZodSchema } from '@zod-schema/core/staff';
import { createApiSafeFetcher } from '@api/handlers/api-adapter';
import { sanitizeDocument } from '@data-utilities/transformers/sanitize';

/**
 * API-safe fetcher for NYCPS staff
 */
export const fetchNYCPSStaffForApi = createApiSafeFetcher(
  NYCPSStaffModel,
  NYCPSStaffZodSchema,
  "staffName" 
);

/**
 * API-safe fetcher for Teaching Lab staff
 */
export const fetchTLStaffForApi = createApiSafeFetcher(
  TeachingLabStaffModel,
  TeachingLabStaffZodSchema,
  "staffName" 
);

/**
 * Fetches a staff member by ID
 */
export async function fetchStaffByIdForApi(id: string, staffType = 'nycps') {
  try {
    const Model = staffType === 'nycps' ? NYCPSStaffModel : TeachingLabStaffModel;
    const Schema = staffType === 'nycps' ? NYCPSStaffZodSchema : TeachingLabStaffZodSchema;
    
    const staff = await Model.findById(id);
    
    if (!staff) {
      return {
        success: false,
        items: [],
        error: `Staff member with ID ${id} not found`
      };
    }
    
    const sanitized = sanitizeDocument(staff, Schema);
    
    return {
      success: true,
      items: [sanitized],
      total: 1
    };
  } catch (error) {
    console.error(`Error fetching staff by ID:`, error);
    return {
      success: false,
      items: [],
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
