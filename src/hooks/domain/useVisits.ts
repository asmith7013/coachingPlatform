import { createCrudHooks } from '@query/client/factories/crud-factory';
import { VisitZodSchema, Visit } from '@zod-schema/visits/visit';
import { ZodSchema } from 'zod';
import { fetchVisits, createVisit, updateVisit, deleteVisit, fetchVisitById } from '@actions/visits/visits';
import { useCallback } from 'react';
import { DocumentInput } from '@core-types/document';

/**
 * Custom React Query hooks for Visit entity
 * SIMPLIFIED: Direct CRUD factory usage, no unnecessary abstraction
 */
const visitHooks = createCrudHooks({
  entityType: 'visits',
  schema: VisitZodSchema as ZodSchema<Visit>,
  serverActions: {
    fetch: fetchVisits,
    fetchById: fetchVisitById,
    create: createVisit,
    update: updateVisit,
    delete: deleteVisit
  },
  validSortFields: ['date', 'school', 'coach', 'createdAt', 'updatedAt'],
  relatedEntityTypes: ['schools', 'coachingLogs']
});

// Export with domain-specific names
const useVisitsList = visitHooks.useList;
const useVisitById = visitHooks.useDetail;
const useVisitsMutations = visitHooks.useMutations;
const useVisitManager = visitHooks.useManager;

/**
 * Enhanced visit manager with scheduling-specific functionality
 */
function useVisitManagerWithScheduling() {
  const manager = useVisitManager();
  
  /**
   * Create multiple visits for scheduling scenarios
   */
  const createMultipleVisits = useCallback(async (visitsData: DocumentInput<Visit>[]) => {
    try {
      const results = await Promise.all(
        visitsData.map(visitData => manager.createAsync?.(visitData))
      );
      
      return {
        success: true,
        data: results.map(r => r?.data).filter(Boolean)
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create visits'
      };
    }
  }, [manager]);
  
  /**
   * Get visits for a specific school and date - triggers filtering
   */
  const getVisitsForSchoolAndDate = useCallback((schoolId: string, date: Date) => {
    manager.applyFilters({
      school: schoolId,
      date: date.toISOString().split('T')[0]
    });
    return manager;
  }, [manager]);
  
  /**
   * Get visits for a date range - triggers filtering
   */
  const getVisitsByDateRange = useCallback((startDate: Date, endDate: Date) => {
    manager.applyFilters({
      date: {
        $gte: startDate.toISOString(),
        $lte: endDate.toISOString()
      }
    });
    return manager;
  }, [manager]);
  
  return {
    ...manager,
    createMultipleVisits,
    getVisitsForSchoolAndDate,
    getVisitsByDateRange
  };
}

/**
 * Unified interface following the useSchools pattern
 */
export const useVisits = {
  list: useVisitsList,
  byId: useVisitById,
  mutations: useVisitsMutations,
  manager: useVisitManager,
  withScheduling: useVisitManagerWithScheduling
};

// Export individual hooks for backward compatibility
export { 
  useVisitsList, 
  useVisitById, 
  useVisitsMutations, 
  useVisitManager,
  useVisitManagerWithScheduling
};

export default useVisits; 