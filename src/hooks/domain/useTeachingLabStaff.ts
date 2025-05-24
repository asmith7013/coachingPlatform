import { createEntityHooks } from '@/query/client/factories/entity-hooks';
import { 
  TeachingLabStaffZodSchema, 
  TeachingLabStaffInputZodSchema, 
  TeachingLabStaff, 
  TeachingLabStaffInput,
  MondayUser
} from '@/lib/data-schema/zod-schema/core/staff';
import { 
  fetchTeachingLabStaff, 
  fetchTeachingLabStaffById, 
  createTeachingLabStaff, 
  updateTeachingLabStaff, 
  deleteTeachingLabStaff 
} from '@/app/actions/staff/operations';
import { WithDateObjects } from '@core-types/document';
import { wrapServerActions } from '@/lib/data-utilities/transformers/mappers/response-transformer';
import { transformDocument } from '@/lib/data-utilities/transformers/core/db-transformers';

/**
 * TeachingLabStaff entity with Date objects instead of string dates
 */
export type TeachingLabStaffWithDates = WithDateObjects<TeachingLabStaff>;

/**
 * Wraps all server actions to transform dates in responses
 */
const wrappedActions = wrapServerActions<TeachingLabStaff, TeachingLabStaffWithDates, TeachingLabStaffInput>(
  {
    fetch: fetchTeachingLabStaff,
    fetchById: fetchTeachingLabStaffById,
    create: createTeachingLabStaff,
    update: updateTeachingLabStaff,
    delete: deleteTeachingLabStaff
  },
  items => transformDocument(items).map(item => ({
    ...item,
    mondayUser: item.mondayUser ? {
      ...item.mondayUser,
      isConnected: true, // Always set to true as per schema default
      isVerified: item.mondayUser.isVerified ?? false,
      title: item.mondayUser.title ?? undefined,
      lastSynced: item.mondayUser.lastSynced ? new Date(item.mondayUser.lastSynced) : undefined
    } as MondayUser : undefined
  })) as TeachingLabStaffWithDates[]
);

/**
 * Custom React Query hooks for TeachingLabStaff entity
 * 
 * These hooks handle fetching, creating, updating, and deleting Teaching Lab staff members
 * with proper date transformation (string dates to Date objects)
 */
const {
  useList: useTeachingLabStaffList,
  useById: useTeachingLabStaffById,
  useMutations: useTeachingLabStaffMutations,
  useManager: useTeachingLabStaff
} = createEntityHooks<TeachingLabStaffWithDates, TeachingLabStaffInput>({
  entityType: 'teaching-lab-staff',
  serverActions: wrappedActions,
  validSortFields: ['staffName', 'email', 'adminLevel', 'createdAt', 'updatedAt'],
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
export { useTeachingLabStaffList, useTeachingLabStaffById, useTeachingLabStaffMutations, useTeachingLabStaff };

// Default export
export default useTeachingLabStaff; 