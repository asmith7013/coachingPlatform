import { createCrudHooks } from '@query/client/factories/crud-factory';
import { SchoolZodSchema, School, SchoolReference, schoolToReference } from '@zod-schema/core/school';
import { ZodSchema } from 'zod';
import { fetchSchools, fetchSchoolById, createSchool, updateSchool, deleteSchool } from '@actions/schools/schools';
import { useInvalidation } from '@query/cache/invalidation';
import { useBulkOperations } from '@/query/client/hooks/mutations/useBulkOperations';
import { useCallback } from 'react';

/**
 * Custom React Query hooks for School entity
 * SIMPLIFIED: Direct CRUD factory usage, no unnecessary abstraction
 */
const schoolHooks = createCrudHooks({
  entityType: 'schools',
  schema: SchoolZodSchema as ZodSchema<School>,
  serverActions: {
    fetch: fetchSchools,
    fetchById: fetchSchoolById,
    create: createSchool,
    update: updateSchool,
    delete: deleteSchool
  },
  validSortFields: ['schoolName', 'district', 'createdAt', 'updatedAt'],
  relatedEntityTypes: ['cycles', 'staff']
});

// Export with domain-specific names
const useSchoolsList = schoolHooks.useList;
const useSchoolById = schoolHooks.useDetail;
const useSchoolsMutations = schoolHooks.useMutations;
const useSchoolManager = schoolHooks.useManager;

/**
 * Enhanced school manager with explicit invalidation capabilities
 */
function useSchoolManagerWithInvalidation() {
  const manager = useSchoolManager();
  const { invalidateEntity, invalidateList } = useInvalidation();
  
  const bulkOps = useBulkOperations({
    entityType: 'schools',
    schema: SchoolZodSchema as ZodSchema<School>,
    bulkUpdate: async (updates) => {
      const result = await fetch('/api/schools/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      }).then(res => res.json());
      
      return result;
    },
    relatedEntityTypes: ['staff', 'cycles', 'visits']
  });
  
  const addTeacherToSchool = useCallback(async (schoolId: string, teacherId: string) => {
    const result = await fetch(`/api/schools/${schoolId}/teachers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacherId })
    }).then(res => res.json());
    
    if (result.success) {
      await Promise.all([
        invalidateEntity('schools', schoolId),
        invalidateEntity('staff', teacherId)
      ]);
    }
    
    return result;
  }, [invalidateEntity]);
  
  const refreshSchool = useCallback(async (schoolId: string) => {
    await invalidateEntity('schools', schoolId);
  }, [invalidateEntity]);
  
  const refreshAllSchools = useCallback(async () => {
    await invalidateList('schools');
  }, [invalidateList]);
  
  const toReference = useCallback((school: School): SchoolReference => {
    return schoolToReference(school);
  }, []);
  
  const toReferences = useCallback((schools: School[]): SchoolReference[] => {
    return schools.map(school => toReference(school));
  }, [toReference]);
  
  return {
    ...manager,
    addTeacherToSchool,
    refreshSchool,
    refreshAllSchools,
    toReference,
    toReferences,
    bulkUpdateSchools: bulkOps.bulkUpdate,
    isBulkUpdating: bulkOps.isUpdating,
    bulkUpdateError: bulkOps.updateError
  };
}

// Export individual hooks
export { 
  useSchoolsList, 
  useSchoolById, 
  useSchoolsMutations, 
  useSchoolManager,
  useSchoolManagerWithInvalidation
};

/**
 * Unified interface for all school-related hooks
 */
export const useSchools = {
  list: useSchoolsList,
  byId: useSchoolById,
  mutations: useSchoolsMutations,
  manager: useSchoolManager,
  withInvalidation: useSchoolManagerWithInvalidation
};

export default useSchools;