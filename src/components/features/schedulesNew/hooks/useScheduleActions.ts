import { useCallback, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useVisits } from '@/hooks/domain/useVisits'
import { useCoachId } from '@hooks/auth/useCoachData'
import { createConflictDetector, type ConflictCheckData, type ScheduledVisitMinimal } from '../utils/visit-conflict-detector'
import type { Visit, VisitInput } from '@zod-schema/visits/visit'
import { VisitInputZodSchema } from '@zod-schema/visits/visit'
import { AllowedPurposeZod, ModeDoneZod, ScheduleAssignment } from '@enums'
import type { Event } from '@/lib/schema/zod-schema/schedules/schedule'
import { EventFieldsSchema } from '@/lib/schema/zod-schema/schedules/schedule'

// DRY: Use EventItem schema types (single source of truth)
type VisitCreationData = Pick<Event, 'eventType' | 'staffIds' | 'periodNumber' | 'portion'>
// type VisitUpdateData = Partial<VisitInput> & { events?: EventItem[] }

export interface UseScheduleActionsProps {
  schoolId: string
  date: string
  visits: Visit[]
  mode?: 'create' | 'edit'
  visitId?: string
  coachingActionPlanId: string
}

/**
 * Schema-driven actions hook following domain hook patterns
 */
export function useScheduleActions({ 
  schoolId, 
  date, 
  visits, 
  mode = 'create', 
  visitId,
  coachingActionPlanId 
}: UseScheduleActionsProps) {
  const coachId = useCoachId()
  const queryClient = useQueryClient()
  const visitsManager = useVisits.manager()

  // Single event creation helper
  const createEventData = useCallback((data: VisitCreationData, orderIndex: number = 1): Event => {
    return EventFieldsSchema.parse({
      eventType: data.eventType,
      staffIds: data.staffIds,
      periodNumber: data.periodNumber,
      portion: data.portion,
      orderIndex,
      notes: '',
      duration: data.portion === 'full_period' ? 45 : 30
    });
  }, []);

  // Transform visit events to conflict detector format
  const conflictDetector = useMemo(() => {
    const conflictData: ScheduledVisitMinimal[] = [];
    visits.forEach(visit => {
      visit.events?.forEach((event, eventIndex) => {
        try {
          const validatedEvent = EventFieldsSchema.parse(event)
          if (validatedEvent.staffIds?.[0]) {
            conflictData.push({
              id: `${visit._id}-event-${eventIndex}`,
              teacherId: validatedEvent.staffIds[0],
              teacherName: 'Teacher', // TODO: Get actual teacher name from teachers data
              periodNumber: validatedEvent.periodNumber || 0,
              portion: validatedEvent.portion as ScheduleAssignment || 'full_period'
            });
          }
        } catch {
          // Skip invalid events during schema migration
        }
      });
    });
    return createConflictDetector(conflictData)
  }, [visits])

  // Adapter function for conflict checks
  const toConflictCheckData = useCallback((data: VisitCreationData): ConflictCheckData => ({
    teacherId: data.staffIds[0],
    periodNumber: data.periodNumber || 0,
    portion: data.portion as ScheduleAssignment || 'full_period'
  }), []);

  const scheduleVisit = useCallback(async (data: VisitCreationData) => {
    try {
      const validatedData = EventFieldsSchema.pick({
        eventType: true,
        staffIds: true,
        periodNumber: true,
        portion: true
      }).parse(data);
      const conflict = conflictDetector.checkConflict(toConflictCheckData(validatedData));
      if (conflict.hasConflict) {
        return { success: false, error: conflict.message };
      }
      const existingVisit = visits.find(visit => 
        visit.schoolId === schoolId && 
        visit.coachId === (coachId || 'unknown') &&
        visit.date && new Date(visit.date).toDateString() === new Date(date).toDateString()
      );
      const newEvent = createEventData(validatedData, (existingVisit?.events?.length || 0) + 1);
      if (mode === 'create') {
        let result;
        if (existingVisit) {
          const updatedEvents = [...(existingVisit.events || []), newEvent];
          const { _id, id: _idUnused, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = existingVisit;
          const updatedVisit: VisitInput = {
            ownerIds: rest.ownerIds,
            coachingActionPlanId: rest.coachingActionPlanId,
            schoolId: rest.schoolId,
            coachId: rest.coachId,
            gradeLevelsSupported: rest.gradeLevelsSupported,
            events: updatedEvents,
            allowedPurpose: rest.allowedPurpose,
            modeDone: rest.modeDone,
            teacherId: rest.teacherId,
            cycleId: rest.cycleId,
            visitScheduleId: rest.visitScheduleId,
            sessionLinks: rest.sessionLinks,
            mondayItemId: rest.mondayItemId,
            mondayBoardId: rest.mondayBoardId,
            mondayItemName: rest.mondayItemName,
            mondayLastSyncedAt: rest.mondayLastSyncedAt,
            siteAddress: rest.siteAddress,
            endDate: rest.endDate
          };
          const visitValidation = VisitInputZodSchema.safeParse(updatedVisit);
          if (!visitValidation.success) {
            return { success: false, error: 'Failed to create valid visit update' }
          }
          result = await visitsManager.updateAsync?.(_id, visitValidation.data);
        } else {
          const visitData = VisitInputZodSchema.parse({
            coachingActionPlanId,
            date: new Date(date).toISOString(),
            schoolId,
            coachId: coachId || 'unknown',
            teacherId: validatedData.staffIds[0],
            gradeLevelsSupported: [],
            allowedPurpose: AllowedPurposeZod.options[0],
            modeDone: ModeDoneZod.options[0],
            events: [newEvent],
            sessionLinks: [],
            ownerIds: [coachId || 'unknown']
          });
          const visitValidation = VisitInputZodSchema.safeParse(visitData)
          if (!visitValidation.success) {
            return { success: false, error: 'Failed to create valid visit data' }
          }
          result = await visitsManager.createAsync?.(visitValidation.data as Visit);
        }
        if (result) {
          await queryClient.invalidateQueries({ 
            queryKey: ['entities', 'list', 'visits'],
            exact: false
          });
        }
        return { success: !!result, error: result ? undefined : 'Failed to create visit' }
      }
      if (mode === 'edit' && visitId) {
        const existingVisitForEdit = visits.find(v => v._id === visitId);
        if (!existingVisitForEdit) {
          return { success: false, error: 'Visit not found for editing' };
        }
        const updatedEvents = [...(existingVisitForEdit.events || []), newEvent];
        const { _id, id: _idUnused, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = existingVisitForEdit;
        const updatedVisit: VisitInput = {
          ownerIds: rest.ownerIds,
          coachingActionPlanId: rest.coachingActionPlanId,
          schoolId: rest.schoolId,
          coachId: rest.coachId,
          gradeLevelsSupported: rest.gradeLevelsSupported,
          events: updatedEvents,
          allowedPurpose: rest.allowedPurpose,
          modeDone: rest.modeDone,
          teacherId: rest.teacherId,
          cycleId: rest.cycleId,
          visitScheduleId: rest.visitScheduleId,
          sessionLinks: rest.sessionLinks,
          mondayItemId: rest.mondayItemId,
          mondayBoardId: rest.mondayBoardId,
          mondayItemName: rest.mondayItemName,
          mondayLastSyncedAt: rest.mondayLastSyncedAt,
          siteAddress: rest.siteAddress,
          endDate: rest.endDate
        };
        const visitValidation = VisitInputZodSchema.safeParse(updatedVisit);
        if (!visitValidation.success) {
          console.error('Validation errors:', visitValidation.error);
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
  }, [conflictDetector, toConflictCheckData, schoolId, date, coachId, mode, visitId, visitsManager, queryClient, visits, coachingActionPlanId, createEventData])

  // Update operation with event/visit ID handling
  const updateVisit = useCallback(async (id: string, updates: Partial<Event> | { events?: Event[] }) => {
    try {
      const isEventId = id.includes('-event-');
      if (isEventId) {
        const [visitId, eventIndexStr] = id.split('-event-');
        const eventIndex = parseInt(eventIndexStr, 10);
        const visit = visits.find(v => v._id === visitId);
        if (!visit?.events?.[eventIndex]) {
          return { success: false, error: 'Event not found' };
        }
        const updatedEvents = visit.events.map((event, index) => 
          index === eventIndex 
            ? EventFieldsSchema.parse({ ...event, ...updates })
            : event
        );
        const { _id, id: _idUnused, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = visit;
        const updatedVisit: VisitInput = {
          ownerIds: rest.ownerIds,
          coachingActionPlanId: rest.coachingActionPlanId,
          schoolId: rest.schoolId,
          coachId: rest.coachId,
          gradeLevelsSupported: rest.gradeLevelsSupported,
          events: updatedEvents,
          allowedPurpose: rest.allowedPurpose,
          modeDone: rest.modeDone,
          teacherId: rest.teacherId,
          cycleId: rest.cycleId,
          visitScheduleId: rest.visitScheduleId,
          sessionLinks: rest.sessionLinks,
          mondayItemId: rest.mondayItemId,
          mondayBoardId: rest.mondayBoardId,
          mondayItemName: rest.mondayItemName,
          mondayLastSyncedAt: rest.mondayLastSyncedAt,
          siteAddress: rest.siteAddress,
          endDate: rest.endDate
        };
        const visitValidation = VisitInputZodSchema.safeParse(updatedVisit);
        if (!visitValidation.success) {
          return { success: false, error: 'Failed to create valid visit update' };
        }
        const result = await visitsManager.updateAsync?.(_id, visitValidation.data);
        if (result) {
          await queryClient.invalidateQueries({ 
            queryKey: ['entities', 'list', 'visits'],
            exact: false 
          });
        }
        return { success: !!result, error: result ? undefined : 'Failed to update event' };
      } else {
        const visit = visits.find(v => v._id === id);
        if (!visit) {
          return { success: false, error: 'Visit not found' };
        }
        const { _id, id: _idUnused, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = visit;
        const updatedVisit: VisitInput = {
          ownerIds: rest.ownerIds,
          coachingActionPlanId: rest.coachingActionPlanId,
          schoolId: rest.schoolId,
          coachId: rest.coachId,
          gradeLevelsSupported: rest.gradeLevelsSupported,
          events: ('events' in updates && Array.isArray((updates as { events?: Event[] }).events))
            ? (updates as { events: Event[] }).events
            : rest.events,
          allowedPurpose: rest.allowedPurpose,
          modeDone: rest.modeDone,
          teacherId: rest.teacherId,
          cycleId: rest.cycleId,
          visitScheduleId: rest.visitScheduleId,
          sessionLinks: rest.sessionLinks,
          mondayItemId: rest.mondayItemId,
          mondayBoardId: rest.mondayBoardId,
          mondayItemName: rest.mondayItemName,
          mondayLastSyncedAt: rest.mondayLastSyncedAt,
          siteAddress: rest.siteAddress,
          endDate: rest.endDate
        };
        const visitValidation = VisitInputZodSchema.safeParse(updatedVisit);
        if (!visitValidation.success) {
          return { success: false, error: 'Failed to create valid visit update' };
        }
        const result = await visitsManager.updateAsync?.(id, visitValidation.data);
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

  const deleteVisit = useCallback(async (id: string) => {
    try {
      const isEventId = id.includes('-event-');
      if (isEventId) {
        const [visitId, eventIndexStr] = id.split('-event-');
        const eventIndex = parseInt(eventIndexStr, 10);
        const visit = visits.find(v => v._id === visitId);
        if (!visit || !visit.events || visit.events.length <= eventIndex) {
          return { success: false, error: 'Event not found' };
        }
        const updatedEvents = visit.events.filter((_, index) => index !== eventIndex);
        const { _id, id: _idUnused, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = visit;
        const updatedVisit: VisitInput = {
          ownerIds: rest.ownerIds,
          coachingActionPlanId: rest.coachingActionPlanId,
          schoolId: rest.schoolId,
          coachId: rest.coachId,
          gradeLevelsSupported: rest.gradeLevelsSupported,
          events: updatedEvents,
          allowedPurpose: rest.allowedPurpose,
          modeDone: rest.modeDone,
          teacherId: rest.teacherId,
          cycleId: rest.cycleId,
          visitScheduleId: rest.visitScheduleId,
          sessionLinks: rest.sessionLinks,
          mondayItemId: rest.mondayItemId,
          mondayBoardId: rest.mondayBoardId,
          mondayItemName: rest.mondayItemName,
          mondayLastSyncedAt: rest.mondayLastSyncedAt,
          siteAddress: rest.siteAddress,
          endDate: rest.endDate
        };
        const visitValidation = VisitInputZodSchema.safeParse(updatedVisit);
        if (!visitValidation.success) {
          return { success: false, error: 'Failed to create valid visit update' };
        }
        const result = await visitsManager.updateAsync?.(_id, visitValidation.data);
        if (result) {
          await queryClient.invalidateQueries({ 
            queryKey: ['entities', 'list', 'visits'],
            exact: false 
          });
        }
        return { success: !!result, error: result ? undefined : 'Failed to remove event' };
      } else {
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

  const clearAllVisits = useCallback(async () => {
    try {
      const visitsToDelete = visits.filter(visit => 
        visit.schoolId === schoolId && 
        visit.coachId === (coachId || 'unknown') &&
        visit.date && new Date(visit.date).toDateString() === new Date(date).toDateString()
      );
      if (visitsToDelete.length === 0) {
        return { success: true, deletedCount: 0 };
      }
      const deletePromises = visitsToDelete.map(visit => 
        visitsManager.deleteAsync?.(visit._id)
      );
      const results = await Promise.allSettled(deletePromises);
      const successfulDeletions = results.filter(
        result => result.status === 'fulfilled' && result.value
      ).length;
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

  // Helper functions
  const getVisitForTeacherPeriod = useCallback((teacherId: string, period: number): Visit | undefined => {
    return visits.find(visit => 
      visit.events?.some(event => {
        try {
          const validatedEvent = EventFieldsSchema.parse(event);
          return validatedEvent.staffIds?.includes(teacherId) && 
                 (validatedEvent.periodNumber || 0) === period;
        } catch {
          return false;
        }
      })
    );
  }, [visits]);
  
  // Use existing ConflictCheckData type
  const hasVisitConflict = useCallback((data: ConflictCheckData): boolean => {
    return conflictDetector.checkConflict(data).hasConflict;
  }, [conflictDetector]);

  const removeEventFromVisit = useCallback(async (visitId: string, eventIndex: number) => {
    try {
      const visit = visits.find(v => v._id === visitId);
      if (!visit?.events?.[eventIndex]) {
        return { success: false, error: 'Event not found' };
      }
      const updatedEvents = visit.events.filter((_, index) => index !== eventIndex);
      const result = await visitsManager.updateAsync?.(visitId, { events: updatedEvents });
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