import { NYCPSStaffModel, TeachingLabStaffModel } from '@mongoose-schema/core/staff.model';
import { NYCPSStaffZodSchema, TeachingLabStaffZodSchema } from '@zod-schema/core/staff';
import { createApiSafeFetcher } from '@api-fetchers/factory';
import { fetchById } from '@/lib/data-utilities/transformers/utils/fetch-utils';

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
  // Determine the correct model and schema based on staff type
  const Model = staffType === 'nycps' ? NYCPSStaffModel : TeachingLabStaffModel;
  const Schema = staffType === 'nycps' ? NYCPSStaffZodSchema : TeachingLabStaffZodSchema;
  
  // Use the centralized fetchById utility
  return fetchById(Model, id, Schema);
}

/**
 * Checks if a staff member exists by email
 */
export async function checkStaffExistenceByEmailForApi(email: string) {
  try {
    if (!email) {
      return {
        success: false,
        items: [],
        exists: false,
        error: "Email is required"
      };
    }
    
    const nycpsStaff = await NYCPSStaffModel.findOne({ email });
    const tlStaff = await TeachingLabStaffModel.findOne({ email });
    
    const exists = !!nycpsStaff || !!tlStaff;
    
    return {
      success: true,
      items: [],
      exists,
      total: exists ? 1 : 0
    };
  } catch (error) {
    console.error(`Error checking staff existence:`, error);
    return {
      success: false,
      items: [],
      exists: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
