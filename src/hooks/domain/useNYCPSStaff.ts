import { createEntityHooks } from '@/query/client/factories/entity-hooks';
import { 
  NYCPSStaffZodSchema, 
  NYCPSStaffInputZodSchema, 
  NYCPSStaff, 
  NYCPSStaffInput,
  // MondayUserZodSchema
} from '@zod-schema/core/staff';
import { 
  fetchNYCPSStaff, 
  fetchNYCPSStaffById, 
  createNYCPSStaff, 
  updateNYCPSStaff, 
  deleteNYCPSStaff 
} from '@actions/staff/operations';
import { WithDateObjects } from '@core-types/document';
import { wrapServerActions } from '@/lib/data-utilities/transformers/mappers/response-transformer';
import { transformDocument } from '@/lib/data-utilities/transformers/core/db-transformers';
import { ZodType } from 'zod';

/**
 * NYCPSStaff entity with Date objects instead of string dates
 */
export type NYCPSStaffWithDates = WithDateObjects<NYCPSStaff>;

/**
 * Ensures mondayUser.isConnected is always a boolean
 */
const ensureMondayUserIsConnected = (items: NYCPSStaff[]): NYCPSStaffWithDates[] => {
  return items.map(item => ({
    ...item,
    mondayUser: item.mondayUser ? {
      ...item.mondayUser,
      isConnected: item.mondayUser.isConnected ?? true
    } : undefined
  })) as NYCPSStaffWithDates[];
};

/**
 * Wraps all server actions to transform dates in responses
 */
const wrappedActions = wrapServerActions<NYCPSStaff, NYCPSStaffWithDates, NYCPSStaffInput>(
  {
    fetch: fetchNYCPSStaff,
    fetchById: fetchNYCPSStaffById,
    create: createNYCPSStaff,
    update: updateNYCPSStaff,
    delete: deleteNYCPSStaff
  },
  items => ensureMondayUserIsConnected(transformDocument(items))
);

/**
 * Custom React Query hooks for NYCPSStaff entity
 * 
 * These hooks handle fetching, creating, updating, and deleting NYCPS staff members
 * with proper date transformation (string dates to Date objects)
 */
const {
  useList: useNYCPSStaffList,
  useById: useNYCPSStaffById,
  useMutations: useNYCPSStaffMutations,
  useManager: useNYCPSStaff
} = createEntityHooks<NYCPSStaffWithDates, NYCPSStaffInput>({
  entityType: 'nycps-staff',
  schema: NYCPSStaffZodSchema as ZodType<NYCPSStaffWithDates>,
  inputSchema: NYCPSStaffInputZodSchema,
  serverActions: wrappedActions,
  validSortFields: ['staffName', 'email', 'createdAt', 'updatedAt'],
  defaultParams: {
    sortBy: 'staffName',
    sortOrder: 'asc',
    page: 1,
    limit: 10
  },
  staleTime: 5 * 60 * 1000, // 5 minutes
  persistFilters: true,
  relatedEntityTypes: ['schools']
});

// Export individual hooks
export { useNYCPSStaffList, useNYCPSStaffById, useNYCPSStaffMutations, useNYCPSStaff };

// Default export
export default useNYCPSStaff; 