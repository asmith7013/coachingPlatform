import { z } from 'zod';
import { createEntityHooks } from '@query/client/factories/entity-factory';
import { 
  NYCPSStaffZodSchema, 
  NYCPSStaff,
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
import { wrapServerActions } from '@transformers/factories/server-action-factory';
import { transformData } from '@transformers/core/unified-transformer';
import { ZodType } from 'zod';
import { DocumentInput } from '@core-types/document';
import { ensureBaseDocumentCompatibility } from '@/lib/transformers/utils/response-utils';

/**
 * NYCPSStaff entity with Date objects instead of string dates
 */
export type NYCPSStaffWithDates = WithDateObjects<NYCPSStaff>;

/**
 * Input type that satisfies DocumentInput constraint for NYCPSStaff
 */
export type NYCPSStaffInput = DocumentInput<NYCPSStaff>;

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
  items => transformData<NYCPSStaff, NYCPSStaffWithDates>(items, {
    schema: NYCPSStaffZodSchema as unknown as ZodType<NYCPSStaffWithDates>,
    handleDates: true,
    errorContext: 'useNYCPSStaff',
    domainTransform: (item) => ensureMondayUserIsConnected([item])[0]
  })
);

/**
 * Custom React Query hooks for NYCPSStaff entity
 * 
 * These hooks handle fetching, creating, updating, and deleting NYCPS staff members
 * with proper date transformation (string dates to Date objects)
 */
const {
  useEntityList: useNYCPSStaffList,
  useEntityById: useNYCPSStaffById,
  useMutations: useNYCPSStaffMutations,
  useManager: useNYCPSStaff
} = createEntityHooks<NYCPSStaffWithDates, NYCPSStaffInput>({
  entityType: 'nycps-staff',
  fullSchema: NYCPSStaffZodSchema as z.ZodType<NYCPSStaffWithDates>,
  inputSchema: ensureBaseDocumentCompatibility<NYCPSStaff>(NYCPSStaffZodSchema),
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