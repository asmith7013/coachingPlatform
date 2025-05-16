import { createCrudHooks } from '@/lib/query/crud-hooks-factory';
import { SchoolZodSchema, SchoolInputZodSchema } from '@/lib/data-schema/zod-schema/core/school';
import type { School, SchoolInput } from '@/lib/data-schema/zod-schema/core/school';
import { fetchSchools, fetchSchoolById, createSchool, updateSchool, deleteSchool } from '@/app/actions/schools/schools';

// Create CRUD hooks for schools
const {
  useList: useSchoolsList,
  useById: useSchoolById,
  useMutations: useSchoolMutations,
  useManager: useSchoolManager
} = createCrudHooks<School, SchoolInput>({
  entityType: 'school',
  fullSchema: SchoolZodSchema,
  inputSchema: SchoolInputZodSchema,
  serverActions: {
    fetch: fetchSchools,
    fetchById: fetchSchoolById,
    create: createSchool,
    update: updateSchool,
    delete: deleteSchool
  },
  validSortFields: ['schoolName', 'district', 'createdAt', 'updatedAt'],
  defaultParams: {
    page: 1,
    limit: 10,
    sortBy: 'schoolName',
    sortOrder: 'asc'
  }
});

export {
  useSchoolsList,
  useSchoolById,
  useSchoolMutations,
  useSchoolManager
};

export default useSchoolManager; 