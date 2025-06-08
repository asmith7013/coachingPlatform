import { NYCPSStaffModel, TeachingLabStaffModel } from '@mongoose-schema/core/staff.model';
import { NYCPSStaffZodSchema, TeachingLabStaffZodSchema } from '@zod-schema/core/staff';
import { createApiSafeFetcher } from '@/lib/server/fetchers/fetcher-factory';
import { fetchById } from '@transformers/utils/fetch-utils';
import { ensureBaseDocumentCompatibility } from "@zod-schema/base-schemas";

/**
 * API-safe fetcher for NYCPS staff
 */
export const fetchNYCPSStaffForApi = createApiSafeFetcher(
  NYCPSStaffModel,
  ensureBaseDocumentCompatibility(NYCPSStaffZodSchema),
  "staffName"
);

/**
 * API-safe fetcher for Teaching Lab staff
 */
export const fetchTeachingLabStaffForApi = createApiSafeFetcher(
  TeachingLabStaffModel,
  ensureBaseDocumentCompatibility(TeachingLabStaffZodSchema),
  "staffName"
);

/**
 * Fetches NYCPS staff by ID
 */
export async function fetchNYCPSStaffByIdForApi(id: string) {
  return fetchById(NYCPSStaffModel, id, ensureBaseDocumentCompatibility(NYCPSStaffZodSchema));
}

/**
 * Fetches Teaching Lab staff by ID
 */
export async function fetchTeachingLabStaffByIdForApi(id: string) {
  return fetchById(TeachingLabStaffModel, id, ensureBaseDocumentCompatibility(TeachingLabStaffZodSchema));
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
