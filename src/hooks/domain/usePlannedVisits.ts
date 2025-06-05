import { createEntityHooks } from '@query/client/factories/entity-factory';
import { z } from 'zod';
import { 
  PlannedVisitZodSchema, 
  type PlannedVisit,
  type PlannedVisitInput
} from '@zod-schema/visits/planned-visit';
import { 
  fetchPlannedVisits,
  fetchPlannedVisitById, 
  createPlannedVisit, 
  updatePlannedVisit, 
  deletePlannedVisit,
  bulkCreatePlannedVisits
} from '@actions/visits/planned-visits';
import { DocumentInput, WithDateObjects } from '@core-types/document';
import { createTransformationService } from '@transformers/core/transformation-service';
import { ensureBaseDocumentCompatibility } from '@transformers/utils/response-utils';
import { useBulkOperations } from '@query/client/hooks/mutations/useBulkOperations';
import { useCallback } from 'react';
import type { CollectionResponse } from '@core-types/response';

/**
 * Planned Visit entity with Date objects instead of string dates
 */
export type PlannedVisitWithDates = WithDateObjects<PlannedVisit>;

/**
 * Input type that satisfies DocumentInput constraint
 */
export type PlannedVisitInputType = DocumentInput<PlannedVisit>;

/**
 * Create transformation service following established pattern
 */
const plannedVisitTransformation = createTransformationService({
  entityType: 'plannedVisits',
  schema: ensureBaseDocumentCompatibility<PlannedVisit>(PlannedVisitZodSchema),
  handleDates: true,
  errorContext: 'usePlannedVisits'
});

/**
 * Wrap server actions with transformation service
 */
const wrappedActions = plannedVisitTransformation.wrapServerActions({
  fetch: fetchPlannedVisits,
  fetchById: fetchPlannedVisitById,
  create: createPlannedVisit,
  update: updatePlannedVisit,
  delete: deletePlannedVisit
});

/**
 * Create entity hooks using established factory pattern
 */
const {
  useEntityList: usePlannedVisitsList,
  useEntityById: usePlannedVisitById,
  useMutations: usePlannedVisitsMutations,
  useManager: usePlannedVisitManager
} = createEntityHooks<PlannedVisitWithDates, PlannedVisitInputType>({
  entityType: 'plannedVisits',
  fullSchema: PlannedVisitZodSchema as z.ZodType<PlannedVisitWithDates>,
  inputSchema: ensureBaseDocumentCompatibility<PlannedVisit>(PlannedVisitZodSchema),
  serverActions: wrappedActions,
  validSortFields: ['date', 'teacherId', 'coach', 'timeSlot.startTime', 'createdAt', 'updatedAt'],
  defaultParams: {
    sortBy: 'date',
    sortOrder: 'asc',
    page: 1,
    limit: 50
  },
  staleTime: 5 * 60 * 1000, // 5 minutes
  persistFilters: true,
  relatedEntityTypes: ['visits', 'schools', 'staff']
});

/**
 * Enhanced planned visit manager with bulk operations
 */
function usePlannedVisitManagerWithBulk() {
  const manager = usePlannedVisitManager();
  
  // Add bulk operations capability
  const bulkOps = useBulkOperations({
    entityType: 'plannedVisits',
    schema: PlannedVisitZodSchema as z.ZodType<PlannedVisitWithDates>,
    bulkUpload: async (data: PlannedVisitWithDates[]): Promise<CollectionResponse<PlannedVisitWithDates>> => {
      const result = await bulkCreatePlannedVisits(data as PlannedVisitInput[]);
      return {
        success: result.success,
        items: result.success ? result.data as unknown as PlannedVisitWithDates[] : [],
        total: result.count || 0
      };
    },
    relatedEntityTypes: ['visits', 'schools', 'staff']
  });
  
  /**
   * Convert assignments to planned visits and bulk create
   */
  const createFromAssignments = useCallback(async (
    assignments: Array<{
      teacherId: string;
      timeSlot: { startTime: string; endTime: string };
      assignmentType: 'full_period' | 'first_half' | 'second_half';
      purpose?: string;
    }>,
    context: { date: Date; school: string; coach: string }
  ) => {
    const plannedVisits: PlannedVisitInput[] = assignments.map(assignment => ({
      teacherId: assignment.teacherId,
      timeSlot: assignment.timeSlot,
      purpose: assignment.purpose || 'Coaching Visit',
      duration: '60', // Default duration
      date: context.date,
      coach: context.coach,
      school: context.school,
      assignmentType: assignment.assignmentType
    }));
    
    return bulkOps.bulkUploadAsync?.(plannedVisits as PlannedVisitWithDates[]);
  }, [bulkOps]);
  
  return {
    ...manager,
    
    // Bulk operations
    bulkCreate: bulkOps.bulkUpload,
    isBulkCreating: bulkOps.isUploading,
    bulkCreateError: bulkOps.uploadError,
    
    // Specialized functions
    createFromAssignments
  };
}

/**
 * Unified interface following established pattern
 */
export const usePlannedVisits = {
  list: usePlannedVisitsList,
  byId: usePlannedVisitById,
  mutations: usePlannedVisitsMutations,
  manager: usePlannedVisitManager,
  withBulk: usePlannedVisitManagerWithBulk,
  transformation: plannedVisitTransformation
};

// Export individual hooks for backward compatibility
export { 
  usePlannedVisitsList, 
  usePlannedVisitById, 
  usePlannedVisitsMutations, 
  usePlannedVisitManager,
  usePlannedVisitManagerWithBulk
};

export default usePlannedVisits; 