import { useCallback, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useVisits } from '@/hooks/domain/useVisits'
import { useCoachId } from '@hooks/auth/useCoachData'
import { createConflictDetector } from '../utils/visit-conflict-detector'
import type { Visit } from '@zod-schema/visits/visit'
import { EventItemZodSchema, VisitInputZodSchema } from '@zod-schema/visits/visit'
import { 
  VisitCreationDataSchema,
  VisitUpdateDataSchema,
  ConflictCheckDataSchema,
  TeacherPeriodQuerySchema,
  VisitIdSchema,
  type VisitCreationData,
  type VisitUpdateData,
  type ConflictCheckData
} from '@zod-schema/schedule/schedule-actions'
import { AllowedPurposes, ModeDone, Duration, ScheduleAssignment } from '@enums'

export interface UseScheduleActionsProps {
  schoolId: string
  date: string
  visits: Visit[]
  mode?: 'create' | 'edit'
  visitId?: string
}

/**
 * Schema-driven schedule actions with centralized validation
 */
export function useScheduleActions({ 
  schoolId, 
  date, 
  visits, 
  mode = 'create', 
  visitId 
}: UseScheduleActionsProps) {
  const coachId = useCoachId()
  const queryClient = useQueryClient()
  
  // ✅ DELEGATE: Use domain hook manager for all CRUD
  const visitsManager = useVisits.manager()
  
  // ✅ SCHEMA-DRIVEN CONFLICT DETECTION
  const conflictDetector = useMemo(() => {
    const conflictData: Array<{
      id: string
      teacherId: string
      teacherName: string
      periodNumber: number
      portion: ScheduleAssignment
    }> = [];
    
    // Extract ALL events from ALL visits for comprehensive conflict detection
    visits.forEach(visit => {
      visit.events?.forEach((event, eventIndex) => {
        // ✅ VALIDATE each event against schema before using
        const validatedEvent = EventItemZodSchema.safeParse(event)
        if (validatedEvent.success && validatedEvent.data.periodNumber && validatedEvent.data.staffIds?.[0]) {
          conflictData.push({
            id: `${visit._id}-event-${eventIndex}`,
            teacherId: validatedEvent.data.staffIds[0],
            teacherName: 'Teacher',
            periodNumber: validatedEvent.data.periodNumber,
            portion: (validatedEvent.data.portion as ScheduleAssignment) || ScheduleAssignment.FULL_PERIOD
          });
        }
      });
    });
    
    return createConflictDetector(conflictData)
  }, [visits])

  const scheduleVisit = useCallback(async (data: VisitCreationData) => {
    try {
      // ✅ CENTRALIZED SCHEMA VALIDATION
      const validationResult = VisitCreationDataSchema.safeParse(data);
      
      if (!validationResult.success) {
        return { success: false, error: 'Invalid visit data provided' }
      }
      
      const validatedData = validationResult.data

      // ✅ CONFLICT VALIDATION using centralized schema
      const conflictValidation = ConflictCheckDataSchema.safeParse({
        teacherId: validatedData.teacherId,
        periodNumber: validatedData.periodNumber,
        portion: validatedData.portion as ScheduleAssignment
      });
      
      if (!conflictValidation.success) {
        return { success: false, error: 'Invalid conflict check data' };
      }
      
      const conflict = conflictDetector.checkConflict({
        ...conflictValidation.data,
        portion: conflictValidation.data.portion as ScheduleAssignment
      });
      if (conflict.hasConflict) {
        return { success: false, error: conflict.message };
      }

      // Find existing visit for this school/date/coach combination
      const existingVisit = visits.find(visit => 
        visit.schoolId === schoolId && 
        visit.coachId === (coachId || 'unknown') &&
        visit.date && new Date(visit.date).toDateString() === new Date(date).toDateString()
      );
      
      // ✅ SCHEMA-DRIVEN EVENT CREATION using validated purpose
      const newEventData = {
        eventType: validatedData.purpose,  // ← Use validated purpose
        staffIds: [validatedData.teacherId],
        duration: validatedData.portion === ScheduleAssignment.FULL_PERIOD ? Duration.MIN_45 : Duration.MIN_30,
        purpose: validatedData.purpose,    // ← Consistent with eventType
        periodNumber: validatedData.periodNumber,
        portion: validatedData.portion as ScheduleAssignment,
        orderIndex: existingVisit ? (existingVisit.events?.length || 0) + 1 : 1
      }
      
      // ✅ VALIDATE EVENT against schema before using
      const validatedEvent = EventItemZodSchema.safeParse(newEventData)
      if (!validatedEvent.success) {
        return { success: false, error: 'Failed to create valid event data' }
      }

      if (mode === 'create') {
        let result;
        
        if (existingVisit) {
          // ✅ APPEND EVENT: Add event to existing visit with schema validation
          const updatedEvents = [...(existingVisit.events || []), validatedEvent.data];
          
          // ✅ VALIDATE entire visit update against schema
          const visitUpdateData = { events: updatedEvents }
          const visitValidation = VisitInputZodSchema.partial().safeParse(visitUpdateData)
          
          if (!visitValidation.success) {
            return { success: false, error: 'Failed to create valid visit update' }
          }
          
          result = await visitsManager.updateAsync?.(existingVisit._id, visitValidation.data);
        } else {
          // ✅ CREATE NEW VISIT: Schema-driven visit creation
          const visitData = {
            date: new Date(date),
            schoolId: schoolId,
            coachId: coachId || 'unknown',
            gradeLevelsSupported: [],
            allowedPurpose: AllowedPurposes.VISIT,
            modeDone: ModeDone.IN_PERSON,
            events: [validatedEvent.data],
            ownerIds: [coachId || 'unknown']
          }
          
          // ✅ VALIDATE entire visit against schema
          const visitValidation = VisitInputZodSchema.safeParse(visitData)
          if (!visitValidation.success) {
            return { success: false, error: 'Failed to create valid visit data' }
          }
          
          result = await visitsManager.createAsync?.(visitValidation.data as Visit);
        }
        
        // ✅ CACHE INVALIDATION
        if (result) {
          await queryClient.invalidateQueries({ 
            queryKey: ['entities', 'list', 'visits'],
            exact: false
          });
        }
        
        return { success: !!result, error: result ? undefined : 'Failed to create visit' }
      }
              
      if (mode === 'edit' && visitId) {
        // ✅ EDIT MODE: Find existing visit and append event (same as create mode)
        const existingVisitForEdit = visits.find(v => v._id === visitId);
        
        if (!existingVisitForEdit) {
          return { success: false, error: 'Visit not found for editing' };
        }
        
        // ✅ APPEND EVENT: Add to existing events array (same as create mode)
        const updatedEvents = [...(existingVisitForEdit.events || []), validatedEvent.data];
        
        // ✅ FIX: Use FULL visit data, not partial update
        const fullVisitData = {
          ...existingVisitForEdit, // ← Include all existing fields
          events: updatedEvents    // ← Only update events
        };
        
        // ✅ VALIDATE: Full visit data (no partial validation issues)
        const visitValidation = VisitInputZodSchema.safeParse(fullVisitData);
        
        if (!visitValidation.success) {
          return { success: false, error: 'Failed to create valid visit update' };
        }
        
        const result = await visitsManager.updateAsync?.(visitId, visitValidation.data);
        
        if (result) {
          await queryClient.invalidateQueries({ 
            queryKey: ['entities', 'list', 'visits'],
            exact: false 
          });
        }
        return { success: !!result, error: result ? undefined : 'Failed to update visit' };
      }
      
      return { success: false, error: 'Invalid mode' }
    } catch (error) {
      console.error('❌ Schedule visit error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Operation failed' 
      }
    }
  }, [conflictDetector, schoolId, date, coachId, mode, visitId, visitsManager, queryClient, visits])

  // ✅ SCHEMA-FIRST EVENT UPDATE
  const updateVisit = useCallback(async (visitId: string, updates: VisitUpdateData) => {
    try {
      
      // ✅ CENTRALIZED VALIDATION
      const idValidation = VisitIdSchema.safeParse(visitId);
      const updateValidation = VisitUpdateDataSchema.safeParse(updates);
      
      if (!idValidation.success || !updateValidation.success) {
        return { success: false, error: 'Invalid update data' };
      }
      
      const validatedUpdates = updateValidation.data
      
      // Handle event ID vs visit ID detection
      const isEventId = visitId.includes('-');
      
      if (isEventId) {
        // ✅ EVENT-LEVEL UPDATE: Extract visit ID and event index
        const [actualVisitId, eventIndexStr] = visitId.split('-');
        const eventIndex = parseInt(eventIndexStr, 10);
        
        const visit = visits.find(v => v._id === actualVisitId);
        if (!visit || !visit.events || visit.events.length <= eventIndex) {
          return { success: false, error: 'Visit or event not found' };
        }
        
        // ✅ UPDATE: Specific event in events array
        const updatedEvents = visit.events.map((event, index) => 
          index === eventIndex 
            ? { 
                ...event, 
                ...(validatedUpdates.purpose && { eventType: validatedUpdates.purpose, purpose: validatedUpdates.purpose }),
                ...(validatedUpdates.portion && { portion: validatedUpdates.portion })
              }
            : event
        );
        
        // ✅ USE: Full visit data for update
        const fullVisitData = { ...visit, events: updatedEvents };
        const visitValidation = VisitInputZodSchema.safeParse(fullVisitData);
        
        if (!visitValidation.success) {
          return { success: false, error: 'Failed to create valid visit update' };
        }
        
        const result = await visitsManager.updateAsync?.(actualVisitId, visitValidation.data);
        
        if (result) {
          await queryClient.invalidateQueries({ 
            queryKey: ['entities', 'list', 'visits'],
            exact: false 
          });
        }
        
        return { success: !!result, error: result ? undefined : 'Failed to update event' };
        
      } else if (validatedUpdates.events) {
        // ✅ EVENTS ARRAY UPDATE: Direct events array replacement
        const visit = visits.find(v => v._id === visitId);
        if (!visit) {
          return { success: false, error: 'Visit not found' };
        }
        
        const fullVisitData = { ...visit, events: validatedUpdates.events };
        const visitValidation = VisitInputZodSchema.safeParse(fullVisitData);
        
        if (!visitValidation.success) {
          return { success: false, error: 'Failed to create valid visit update' };
        }
        
        const result = await visitsManager.updateAsync?.(visitId, visitValidation.data);
        
        if (result) {
          await queryClient.invalidateQueries({ 
            queryKey: ['entities', 'list', 'visits'],
            exact: false 
          });
        }
        
        return { success: !!result, error: result ? undefined : 'Failed to update visit events' };
        
      } else {
        // ✅ VISIT-LEVEL UPDATE: Legacy support
        const result = await visitsManager.updateAsync?.(visitId, validatedUpdates);
        
        if (result) {
          await queryClient.invalidateQueries({ 
            queryKey: ['entities', 'list', 'visits'],
            exact: false 
          });
        }
        
        return { success: !!result, error: result ? undefined : 'Failed to update visit' };
      }
      
    } catch (error) {
      console.error('❌ Update visit error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Update failed' 
      }
    }
  }, [visitsManager, visits, queryClient])

  // ✅ ENHANCED DELETE with event/visit ID handling
  const deleteVisit = useCallback(async (id: string) => {
    try {
      // ✅ CENTRALIZED VALIDATION
      const idValidation = VisitIdSchema.safeParse(id);
      if (!idValidation.success) {
        return { success: false, error: 'Invalid ID provided' };
      }
      
      const isEventId = id.includes('-');
      
      if (isEventId) {
        // ✅ EVENT DELETION: Remove specific event from visit
        const [visitId, eventIndexStr] = id.split('-');
        const eventIndex = parseInt(eventIndexStr, 10);
        
        const visit = visits.find(v => v._id === visitId);
        if (!visit || !visit.events || visit.events.length <= eventIndex) {
          return { success: false, error: 'Event not found' };
        }
        
        const updatedEvents = visit.events.filter((_, index) => index !== eventIndex);
        
        // ✅ ALWAYS update visit with remaining events (even if empty array)
        // This preserves visit metadata while removing only the specific event
        const fullVisitData = { ...visit, events: updatedEvents };
        const visitValidation = VisitInputZodSchema.safeParse(fullVisitData);
        
        if (!visitValidation.success) {
          return { success: false, error: 'Failed to create valid visit update' };
        }
        
        const result = await visitsManager.updateAsync?.(visitId, visitValidation.data);
        if (result) {
          await queryClient.invalidateQueries({ 
            queryKey: ['entities', 'list', 'visits'],
            exact: false 
          });
        }
        return { success: !!result, error: result ? undefined : 'Failed to remove event' };
      } else {
        // ✅ VISIT DELETION: Delete entire visit
        const result = await visitsManager.deleteAsync?.(id);
        if (result) {
          await queryClient.invalidateQueries({ 
            queryKey: ['entities', 'list', 'visits'],
            exact: false 
          });
        }
        return { success: !!result, error: result ? undefined : 'Failed to delete visit' };
      }
    } catch (error) {
      console.error('❌ Delete error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Delete failed' 
      };
    }
  }, [visitsManager, visits, queryClient]);

  // ✅ CLEAR ALL VISITS for current school/date/coach
  const clearAllVisits = useCallback(async () => {
    try {
      // Find all visits for current school/date/coach combination
      const visitsToDelete = visits.filter(visit => 
        visit.schoolId === schoolId && 
        visit.coachId === (coachId || 'unknown') &&
        visit.date && new Date(visit.date).toDateString() === new Date(date).toDateString()
      );
      
      if (visitsToDelete.length === 0) {
        return { success: true, deletedCount: 0 };
      }
      
      // Delete all visits
      const deletePromises = visitsToDelete.map(visit => 
        visitsManager.deleteAsync?.(visit._id)
      );
      
      const results = await Promise.allSettled(deletePromises);
      
      // Count successful deletions
      const successfulDeletions = results.filter(
        result => result.status === 'fulfilled' && result.value
      ).length;
      
      // Invalidate cache
      if (successfulDeletions > 0) {
        await queryClient.invalidateQueries({ 
          queryKey: ['entities', 'list', 'visits'],
          exact: false 
        });
      }
      
      return { 
        success: successfulDeletions > 0, 
        deletedCount: successfulDeletions,
        error: successfulDeletions < visitsToDelete.length ? 
          `Only ${successfulDeletions} of ${visitsToDelete.length} visits were deleted` : 
          undefined
      };
      
    } catch (error) {
      console.error('❌ Clear all visits error:', error);
      return { 
        success: false, 
        deletedCount: 0,
        error: error instanceof Error ? error.message : 'Clear operation failed' 
      };
    }
  }, [visits, schoolId, date, coachId, visitsManager, queryClient]);

  // ✅ HELPER FUNCTIONS with centralized validation
  const getVisitForTeacherPeriod = useCallback((teacherId: string, period: number): Visit | undefined => {
    // ✅ CENTRALIZED VALIDATION
    const validation = TeacherPeriodQuerySchema.safeParse({ teacherId, period });
    
    if (!validation.success) {
      console.error('❌ Invalid query parameters:', validation.error);
      return undefined;
    }
    
    return visits.find(visit => 
      visit.events?.some(event => {
        const eventValidation = EventItemZodSchema.safeParse(event);
        return eventValidation.success && 
               eventValidation.data.staffIds?.includes(validation.data.teacherId) && 
               eventValidation.data.periodNumber === validation.data.period;
      })
    );
  }, [visits]);
  
  const hasVisitConflict = useCallback((data: ConflictCheckData): boolean => {
    // ✅ CENTRALIZED VALIDATION
    const validation = ConflictCheckDataSchema.safeParse(data);
    
    if (!validation.success) {
      console.error('❌ Invalid conflict check data:', validation.error);
      return false;
    }
    
    return conflictDetector.checkConflict({
      ...validation.data,
      portion: validation.data.portion as ScheduleAssignment
    }).hasConflict;
  }, [conflictDetector]);

  // ✅ DEDICATED EVENT REMOVAL FUNCTION
  const removeEventFromVisit = useCallback(async (visitId: string, eventIndex: number) => {
    try {
      // ✅ CENTRALIZED VALIDATION
      const idValidation = VisitIdSchema.safeParse(visitId);
      if (!idValidation.success) {
        return { success: false, error: 'Invalid visit ID provided' };
      }
      
      const visit = visits.find(v => v._id === visitId);
      if (!visit || !visit.events || visit.events.length <= eventIndex) {
        return { success: false, error: 'Event not found' };
      }
      
      // ✅ REMOVE EVENT: Filter out the specific event
      const updatedEvents = visit.events.filter((_, index) => index !== eventIndex);
      
      // ✅ PRESERVE VISIT: Keep visit with remaining events (even if empty array)
      // This maintains visit metadata while only removing the specific event
      const fullVisitData = { ...visit, events: updatedEvents };
      const visitValidation = VisitInputZodSchema.safeParse(fullVisitData);
      
      if (!visitValidation.success) {
        return { success: false, error: 'Failed to create valid visit update' };
      }
      
      const result = await visitsManager.updateAsync?.(visitId, visitValidation.data);
      
      if (result) {
        await queryClient.invalidateQueries({ 
          queryKey: ['entities', 'list', 'visits'],
          exact: false 
        });
      }
      return { success: !!result, error: result ? undefined : 'Failed to remove event' };
      
    } catch (error) {
      console.error('❌ Remove event error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Event removal failed' 
      };
    }
  }, [visits, visitsManager, queryClient]);

  return {
    scheduleVisit,
    updateVisit,
    deleteVisit,
    removeEventFromVisit,
    getVisitForTeacherPeriod,
    hasVisitConflict,
    clearAllVisits,
    isLoading: visitsManager.isCreating || visitsManager.isUpdating || visitsManager.isDeleting,
    error: visitsManager.createError || visitsManager.updateError || visitsManager.deleteError
  };
}