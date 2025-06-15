import { createCrudHooks } from '@query/client/factories/crud-factory';
import { SchoolZodSchema, School, SchoolReference, schoolToReference } from '@zod-schema/core/school';
import { ZodSchema } from 'zod';
import { fetchSchools, fetchSchoolById, createSchool, updateSchool, deleteSchool } from '@actions/schools/schools';
import { useInvalidation } from '@query/cache/invalidation';
import { useBulkOperations } from '@query/client/hooks/mutations/useBulkOperations';
import { useCallback } from 'react';
import { useNotifications } from '@/hooks/ui/useNotifications';
import { createDefaultToastConfig } from '@/lib/ui/notifications/toast-configs';
import { FEATURE_FLAGS } from '@/lib/ui/notifications/types';

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
    return schoolToReference(school as School); // Cast for transformer compatibility
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

// Enhanced: Compose CRUD with notifications
function useSchoolsWithNotifications() {
  const notifications = useNotifications();
  const toastConfig = createDefaultToastConfig('schools');
  const enableToasts = FEATURE_FLAGS?.ENABLE_TOASTS !== false;
  const mutations = useSchoolsMutations();

  return {
    ...mutations,
    createWithToast: (data: Parameters<NonNullable<typeof mutations.createAsync>>[0]) => {
      if (!mutations.createAsync) throw new Error('createAsync is not defined');
      return notifications.withToast(
        () => mutations.createAsync!(data),
        toastConfig.create!,
        enableToasts
      );
    },
    updateWithToast: (id: string, data: Partial<School>) => {
      if (!mutations.updateAsync) throw new Error('updateAsync is not defined');
      return notifications.withToast(
        () => mutations.updateAsync!(id, data),
        toastConfig.update!,
        enableToasts
      );
    },
    deleteWithToast: (id: string) => {
      if (!mutations.deleteAsync) throw new Error('deleteAsync is not defined');
      return notifications.withToast(
        () => mutations.deleteAsync!(id),
        toastConfig.delete!,
        enableToasts
      );
    }
  };
}

// Export individual hooks
export { 
  useSchoolsList, 
  useSchoolById, 
  useSchoolsMutations, 
  useSchoolManager,
  useSchoolManagerWithInvalidation,
  useSchoolsWithNotifications
};

/**
 * Unified interface for all school-related hooks
 */
export const useSchools = {
  list: useSchoolsList,
  byId: useSchoolById,
  mutations: useSchoolsMutations,
  manager: useSchoolManager,
  withInvalidation: useSchoolManagerWithInvalidation,
  withNotifications: useSchoolsWithNotifications
};

export default useSchools;