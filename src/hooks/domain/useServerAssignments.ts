// src/hooks/domain/useServerAssignments.ts
import { useCallback } from 'react';
import { useErrorHandledMutation } from '@query/client/hooks/mutations/useErrorHandledMutation';
import { useInvalidation } from '@query/cache/invalidation';
import { usePlannedVisits } from '@hooks/domain/usePlannedVisits';
import { checkTeacherConflicts } from '@actions/visits/planned-visits';
import type { AssignmentState } from '@zod-schema/visits/schedule-builder-state';
import type { TimeSlot } from '@zod-schema/visits/planned-visit';
import { toDateString } from '@transformers/utils/date-utils';

export function useServerAssignments(date: Date) {
  const plannedVisits = usePlannedVisits.withBulk();
  const { invalidateEntity, invalidateList } = useInvalidation();

  const conflictCheckMutation = useErrorHandledMutation(
    ({ teacherId, timeSlot }: { teacherId: string, timeSlot: TimeSlot }) => 
      checkTeacherConflicts(teacherId, toDateString(date), timeSlot),
    {
      mutationKey: ['assignment-conflict-check'],
      retry: 1,
      retryDelay: 500,
    },
    'ServerAssignments.conflictCheck'
  );

  const checkConflicts = useCallback(async (
    teacherId: string, 
    timeSlot: TimeSlot
  ) => {
    const result = await conflictCheckMutation.mutateAsync({
      teacherId,
      timeSlot
    });

    return result;
  }, [conflictCheckMutation]);

  const saveAssignmentsAsPlannedVisits = useCallback(async (
    assignments: AssignmentState[],
    schoolId: string,
    coachId: string
  ) => {
    if (assignments.length === 0) {
      return { success: true, message: 'No assignments to save' };
    }

    try {
      const result = await plannedVisits.createFromAssignments(
        assignments,
        { date, school: schoolId, coach: coachId }
      );

      if (result?.success) {
        await Promise.all([
          invalidateList('plannedVisits'),
          invalidateList('visits'),
          invalidateEntity('schools', schoolId)
        ]);
      }

      return result || { success: false, error: 'Failed to create planned visits' };
    } catch (error) {
      console.error('Failed to save assignments as planned visits:', error);
      return { success: false, error: 'Failed to save assignments' };
    }
  }, [date, plannedVisits, invalidateList, invalidateEntity]);

  return {
    checkConflicts,
    saveAssignmentsAsPlannedVisits,
    isSavingToServer: plannedVisits.isBulkCreating,
    serverSaveError: plannedVisits.bulkCreateError,
  };
}