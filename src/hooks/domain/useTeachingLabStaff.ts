import { createEntityHooks } from '@/query/client/factories/entity-factory';
import { 
  TeachingLabStaff, 
  MondayUser,
  TeachingLabStaffZodSchema,
  TeachingLabStaffInputZodSchema
} from '@zod-schema/core/staff';
import { 
  fetchTeachingLabStaff, 
  fetchTeachingLabStaffById, 
  createTeachingLabStaff, 
  updateTeachingLabStaff, 
  deleteTeachingLabStaff 
} from '@/app/actions/staff/operations';
import { WithDateObjects, DocumentInput } from '@core-types/document';
import { wrapServerActions } from '@transformers/factories/server-action-factory';
import { createTransformer } from '@transformers/core/unified-transformer';
import { ZodType } from 'zod';

/**
 * TeachingLabStaff entity with Date objects instead of string dates
 */
export type TeachingLabStaffWithDates = WithDateObjects<TeachingLabStaff>;

/**
 * Input type that satisfies DocumentInput constraint for TeachingLabStaff
 */
export type TeachingLabStaffInput = DocumentInput<TeachingLabStaff>;

/**
 * Create a domain transformer for TeachingLabStaff
 */
const staffTransformer = createTransformer<TeachingLabStaff, TeachingLabStaffWithDates>({
  schema: TeachingLabStaffZodSchema as unknown as ZodType<TeachingLabStaff>,
  strictValidation: true,
  handleDates: true,
  domainTransform: (item) => ({
    ...item,
    mondayUser: item.mondayUser ? {
      ...item.mondayUser,
      isConnected: true, // Always set to true as per schema default
      isVerified: item.mondayUser.isVerified ?? false,
      title: item.mondayUser.title ?? undefined,
      lastSynced: item.mondayUser.lastSynced ? new Date(item.mondayUser.lastSynced) : undefined
    } as MondayUser : undefined
  }),
  errorContext: 'TeachingLabStaffTransformer'
});

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
  items => staffTransformer.transform(items)
);

/**
 * Custom React Query hooks for TeachingLabStaff entity
 * 
 * These hooks handle fetching, creating, updating, and deleting Teaching Lab staff members
 * with proper date transformation (string dates to Date objects)
 */
const {
  useEntityList: useTeachingLabStaffList,
  useEntityById: useTeachingLabStaffById,
  useMutations: useTeachingLabStaffMutations,
  useManager: useTeachingLabStaff
} = createEntityHooks<TeachingLabStaffWithDates, TeachingLabStaffInput>({
  entityType: 'teaching-lab-staff',
  serverActions: wrappedActions,
  fullSchema: TeachingLabStaffZodSchema as ZodType<TeachingLabStaffWithDates>,
  inputSchema: TeachingLabStaffInputZodSchema as unknown as ZodType<TeachingLabStaffInput>,
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