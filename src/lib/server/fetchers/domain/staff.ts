import { NYCPSStaffModel, TeachingLabStaffModel } from '@mongoose-schema/core/staff.model';
import { NYCPSStaff, TeachingLabStaff } from '@zod-schema/core/staff';
import { createApiSafeFetcher } from '@/lib/server/fetchers/fetcher-factory';
import { fetchById } from '@/lib/server/fetchers/fetch-by-id';
import type { QueryParams } from '@core-types/query';
import type { CollectionResponse } from '@core-types/response';

export const fetchNYCPSStaffForApi = createApiSafeFetcher(
  NYCPSStaffModel,
  "staffName"
) as (params: QueryParams) => Promise<CollectionResponse<NYCPSStaff>>;

export const fetchTeachingLabStaffForApi = createApiSafeFetcher(
  TeachingLabStaffModel,
  "staffName"
) as (params: QueryParams) => Promise<CollectionResponse<TeachingLabStaff>>;

/**
 * Fetches NYCPS staff by ID - using centralized utility
 */
export async function fetchNYCPSStaffByIdForApi(id: string) {
  return fetchById(NYCPSStaffModel, id, "NYCPS staff");
}

/**
 * Fetches Teaching Lab staff by ID - using centralized utility
 */
export async function fetchTeachingLabStaffByIdForApi(id: string) {
  return fetchById(TeachingLabStaffModel, id, "Teaching Lab staff");
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

/**
 * Unified staff fetcher that handles type parameter
 */
export async function fetchStaffForApi(params: QueryParams): Promise<CollectionResponse<NYCPSStaff | TeachingLabStaff>> {
  const { type, ...otherParams } = params;
  
  switch (type) {
    case 'nycps':
      return fetchNYCPSStaffForApi(otherParams);
      
    case 'teachingLab':
      return fetchTeachingLabStaffForApi(otherParams);
      
    default: {
      // Fetch both and combine
      const [nycpsResult, tlResult] = await Promise.all([
        fetchNYCPSStaffForApi(otherParams),
        fetchTeachingLabStaffForApi(otherParams)
      ]);
      
      return {
        success: true,
        items: [...nycpsResult.items, ...tlResult.items],
        total: (nycpsResult.total || 0) + (tlResult.total || 0)
      };
    }
  }
}
