import { createEntityHooks } from '@/lib/query/factories/entity-hooks';
import { 
  SchoolZodSchema, 
  SchoolInputZodSchema, 
  School, 
  SchoolInput 
} from '@/lib/data-schema/zod-schema/core/school';
import { 
  fetchSchools, 
  fetchSchoolById, 
  createSchool, 
  updateSchool, 
  deleteSchool 
} from '@/app/actions/schools/schools';
import { WithDateObjects } from '@core-types/document';
import { wrapServerActions } from '@/lib/data-utilities/transformers/mappers/response-transformer';
import { transformDocument } from '@/lib/data-utilities/transformers/core/db-transformers';

/**
 * School entity with Date objects instead of string dates
 */
export type SchoolWithDates = WithDateObjects<School>;

/**
 * Wraps all server actions to transform dates in responses
 */
const wrappedActions = wrapServerActions(
  {
    fetch: fetchSchools,
    fetchById: fetchSchoolById,
    create: createSchool,
    update: updateSchool,
    delete: deleteSchool
  },
  items => transformDocument(items) as SchoolWithDates[]
);

/**
 * Custom React Query hooks for School entity
 * 
 * These hooks handle fetching, creating, updating, and deleting schools
 * with proper date transformation (string dates to Date objects)
 */
const {
  useList: useSchoolsList,
  useById: useSchoolById,
  useMutations: useSchoolsMutations,
  useEntity: useSchools
} = createEntityHooks<SchoolWithDates, SchoolInput>({
  entityType: 'schools',
  fullSchema: SchoolZodSchema as unknown as import('zod').ZodType<SchoolWithDates>,
  inputSchema: SchoolInputZodSchema,
  serverActions: wrappedActions,
  validSortFields: ['schoolName', 'district', 'createdAt', 'updatedAt'],
  defaultParams: {
    sortBy: 'schoolName',
    sortOrder: 'asc',
    page: 1,
    limit: 10
  },
  staleTime: 5 * 60 * 1000, // 5 minutes
  persistFilters: true,
  relatedEntityTypes: ['cycles', 'staff']
});

// Export individual hooks
export { useSchoolsList, useSchoolById, useSchoolsMutations, useSchools };

// Default export
export default useSchools; 