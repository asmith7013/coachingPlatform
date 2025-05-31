import { createEntityHooks } from '@query/client/factories/entity-factory';
import { 
  SchoolZodSchema, 
  SchoolInputZodSchema, 
  School,
  SchoolReference,
  schoolToReference
} from '@zod-schema/core/school';
import { 
  fetchSchools, 
  fetchSchoolById, 
  createSchool, 
  updateSchool, 
  deleteSchool 
} from '@actions/schools/schools';
import { DocumentInput, WithDateObjects } from '@core-types/document';
import { createTransformationService } from '@transformers/core/transformation-service';
import { useInvalidation } from '@query/cache/invalidation';
import { useBulkOperations } from '@query/client/hooks/mutations/useBulkOperations';
import { useCallback } from 'react';
import { z } from 'zod';

/**
 * School entity with Date objects instead of string dates
 */
export type SchoolWithDates = WithDateObjects<School>;

/**
 * Input type that satisfies DocumentInput constraint for School
 */
export type SchoolInput = DocumentInput<School>;

/**
 * Create a transformation service for School entities
 * This centralizes all transformation logic in one place
 */
const schoolTransformation = createTransformationService<School, SchoolWithDates>({
  entityType: 'schools',
  schema: SchoolZodSchema as z.ZodSchema<School>,
  handleDates: true,
  errorContext: 'useSchools'
});

/**
 * Wrap server actions with the transformation service
 * This ensures consistent data transformation across all operations
 */
const wrappedActions = schoolTransformation.wrapServerActions({
  fetch: fetchSchools,
  fetchById: fetchSchoolById,
  create: createSchool,
  update: updateSchool,
  delete: deleteSchool
});

/**
 * Custom React Query hooks for School entity
 * 
 * These hooks handle fetching, creating, updating, and deleting schools
 * with proper date transformation (string dates to Date objects)
 */
const {
  useEntityList: useSchoolsList,
  useEntityById: useSchoolById,
  useMutations: useSchoolsMutations,
  useManager: useSchoolManager
} = createEntityHooks<SchoolWithDates, SchoolInput>({
  entityType: 'schools',
  fullSchema: SchoolZodSchema as z.ZodType<SchoolWithDates>,
  inputSchema: SchoolInputZodSchema as unknown as z.ZodType<SchoolInput>,
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

/**
 * Enhanced school manager hook with explicit invalidation capabilities
 * 
 * @example Basic usage with invalidation
 * ```typescript
 * const schoolManager = useSchoolManagerWithInvalidation();
 * 
 * // Add a teacher to a school and automatically invalidate both caches
 * await schoolManager.addTeacherToSchool('school123', 'teacher456');
 * 
 * // Bulk add multiple teachers with proper loading states
 * await schoolManager.bulkAddTeachersToSchool('school123', ['teacher1', 'teacher2']);
 * 
 * // Use bulk operations with loading states
 * schoolManager.bulkUpdateSchools([{ id: 'school123', data: { schoolName: 'New Name' } }]);
 * if (schoolManager.isBulkUpdating) {
 *   // Show loading state
 * }
 * 
 * // Manually refresh a school's data
 * await schoolManager.refreshSchool('school123');
 * 
 * // Refresh all schools data
 * await schoolManager.refreshAllSchools();
 * ```
 * 
 * @example Using with the unified interface
 * ```typescript
 * const { withInvalidation } = useSchools;
 * const enhancedManager = withInvalidation();
 * 
 * // All enhanced functionality is available
 * await enhancedManager.addTeacherToSchool('school123', 'teacher456');
 * ```
 */
function useSchoolManagerWithInvalidation() {
  // Get the base school manager
  const manager = useSchoolManager();
  
  // Get invalidation utilities
  const { invalidateEntity, invalidateList } = useInvalidation();
  
  // Use the bulk operations hook for bulk operations
  const bulkOps = useBulkOperations({
    entityType: 'schools',
    schema: SchoolZodSchema as z.ZodType<SchoolWithDates>,
    bulkUpdate: async (updates) => {
      // Implementation of bulk update for schools
      // This would need to be implemented as a server action
      const result = await fetch('/api/schools/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      }).then(res => res.json());
      
      return result;
    },
    // Add related entity types for invalidation
    relatedEntityTypes: ['staff', 'cycles', 'visits']
  });
  
  /**
   * Add a teacher to a school with explicit invalidation
   */
  const addTeacherToSchool = useCallback(async (schoolId: string, teacherId: string) => {
    // Call the API to add the teacher to the school
    // This would be implemented in your server actions
    const result = await fetch(`/api/schools/${schoolId}/teachers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacherId })
    }).then(res => res.json());
    
    // If successful, invalidate both entities
    if (result.success) {
      await Promise.all([
        invalidateEntity('schools', schoolId),
        invalidateEntity('staff', teacherId)
      ]);
    }
    
    return result;
  }, [invalidateEntity]);
  
  /**
   * Bulk add teachers to a school - leveraging bulkOps
   */
  const bulkAddTeachersToSchool = useCallback(async (schoolId: string, teacherIds: string[]) => {
    // First, get the current school data using the server action directly
    const schoolData = await fetchSchoolById(schoolId);
    
    if (!schoolData || !schoolData.success || !schoolData.data) {
      return { success: false, error: "Failed to fetch school data" };
    }
    
    // Prepare the update - add teachers to the school's staffList
    const currentSchool = schoolData.data;
    const updates = [{
      id: schoolId,
      data: {
        staffList: [
          ...(currentSchool.staffList || []),
          ...teacherIds
        ]
      }
    }];
    
    // Use the bulkUpdate functionality from bulkOps
    try {
      // This will handle both the update and cache invalidation
      const result = await bulkOps.bulkUpdateAsync?.(updates);
      return result || { success: false, error: "Bulk update not available" };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }, [bulkOps]);
  
  /**
   * Explicitly invalidate a school's data
   */
  const refreshSchool = useCallback(async (schoolId: string) => {
    await invalidateEntity('schools', schoolId);
  }, [invalidateEntity]);
  
  /**
   * Explicitly invalidate all schools data
   */
  const refreshAllSchools = useCallback(async () => {
    await invalidateList('schools');
  }, [invalidateList]);
  
  /**
   * Convert a school to reference format for select inputs
   */
  const toReference = useCallback((school: SchoolWithDates): SchoolReference => {
    return schoolToReference(school as unknown as School);
  }, []);
  
  /**
   * Convert multiple schools to reference format
   */
  const toReferences = useCallback((schools: SchoolWithDates[]): SchoolReference[] => {
    return schools.map(school => toReference(school));
  }, [toReference]);
  
  return {
    ...manager, // Include all original manager functions
    
    // Add additional functions with explicit invalidation
    addTeacherToSchool,
    bulkAddTeachersToSchool,
    refreshSchool,
    refreshAllSchools,
    
    // Add reference conversion utilities
    toReference,
    toReferences,
    
    // Expose the bulk operations with loading states
    bulkUpdateSchools: bulkOps.bulkUpdate,
    isBulkUpdating: bulkOps.isUpdating,
    bulkUpdateError: bulkOps.updateError
  };
}

// Export individual hooks with descriptive aliases
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
  // Original hooks
  list: useSchoolsList,
  byId: useSchoolById,
  mutations: useSchoolsMutations,
  manager: useSchoolManager,
  
  // Enhanced hooks with invalidation
  withInvalidation: useSchoolManagerWithInvalidation,
  
  // Expose transformation service for advanced usage
  transformation: schoolTransformation
};

// For backward compatibility during migration
export default useSchools;