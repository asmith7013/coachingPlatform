import { useState, useCallback } from 'react';
import type { TeacherAccountabilityState } from '@zod-schema/visits/schedule-builder-state';

/**
 * Enhanced accountability state for icon-based tracking
 */
export interface IconAccountabilityState {
  teacherId: string
  hasObservation: boolean
  hasMeeting: boolean
  notes?: string
  lastUpdated?: Date
}

/**
 * Hook for managing teacher accountability tracking with icon-based interface
 * ✅ TASK 2.3: Uses optimistic update patterns for immediate UI feedback
 */
export function useAccountabilityTracking() {
  const [accountability, setAccountability] = useState<TeacherAccountabilityState[]>([]);
  const [iconAccountability, setIconAccountability] = useState<IconAccountabilityState[]>([]);

  // Legacy compatibility functions
  const updateTeacherAccountability = useCallback((
    teacherId: string,
    isScheduled: boolean,
    isCrossedOff: boolean,
    notes?: string
  ) => {
    setAccountability(prev => [
      ...prev.filter(t => t.teacherId !== teacherId),
      {
        teacherId,
        isScheduled,
        isCrossedOff,
        isCompleted: isScheduled || isCrossedOff,
        notes
      }
    ]);
  }, []);

  const getTeacherAccountability = useCallback((teacherId: string): TeacherAccountabilityState | undefined => {
    return accountability.find(t => t.teacherId === teacherId);
  }, [accountability]);

  const isTeacherAccountable = useCallback((teacherId: string): boolean => {
    const teacherState = accountability.find(t => t.teacherId === teacherId);
    return teacherState?.isCompleted ?? false;
  }, [accountability]);

  const clearAccountability = useCallback(() => {
    setAccountability([]);
    setIconAccountability([]);
  }, []);

  // ✅ TASK 2.3: Enhanced toggle functions with optimistic update patterns
  const toggleObservation = useCallback((teacherId: string, hasObservation: boolean) => {
    // ✅ TASK 2.3: Optimistic update - immediately update UI
    setIconAccountability(prev => {
      const existing = prev.find(t => t.teacherId === teacherId);
      const updated: IconAccountabilityState = {
        teacherId,
        hasObservation,
        hasMeeting: existing?.hasMeeting ?? false,
        notes: existing?.notes,
        lastUpdated: new Date() // ✅ TASK 1.4: Date object appropriate for internal state tracking
      };

      return [
        ...prev.filter(t => t.teacherId !== teacherId),
        updated
      ];
    });

    // ✅ TASK 2.3: Update legacy accountability with optimistic pattern
    const iconState = iconAccountability.find(t => t.teacherId === teacherId);
    updateTeacherAccountability(teacherId, hasObservation, iconState?.hasMeeting ?? false);
    
    // TODO: If this becomes server-persisted, add mutation with rollback:
    // const mutation = useMutation({
    //   mutationFn: () => updateTeacherObservationOnServer(teacherId, hasObservation),
    //   onError: () => {
    //     // Rollback optimistic update
    //     setIconAccountability(prev => prev.filter(t => t.teacherId !== teacherId));
    //   }
    // });
    // mutation.mutate();
  }, [iconAccountability, updateTeacherAccountability]);

  const toggleMeeting = useCallback((teacherId: string, hasMeeting: boolean) => {
    // ✅ TASK 2.3: Optimistic update - immediately update UI
    setIconAccountability(prev => {
      const existing = prev.find(t => t.teacherId === teacherId);
      const updated: IconAccountabilityState = {
        teacherId,
        hasObservation: existing?.hasObservation ?? false,
        hasMeeting,
        notes: existing?.notes,
        lastUpdated: new Date() // ✅ TASK 1.4: Date object appropriate for internal state tracking
      };

      return [
        ...prev.filter(t => t.teacherId !== teacherId),
        updated
      ];
    });

    // ✅ TASK 2.3: Update legacy accountability with optimistic pattern
    const iconState = iconAccountability.find(t => t.teacherId === teacherId);
    updateTeacherAccountability(teacherId, iconState?.hasObservation ?? false, hasMeeting);
    
    // TODO: If this becomes server-persisted, add mutation with rollback:
    // const mutation = useMutation({
    //   mutationFn: () => updateTeacherMeetingOnServer(teacherId, hasMeeting),
    //   onError: () => {
    //     // Rollback optimistic update
    //     setIconAccountability(prev => prev.filter(t => t.teacherId !== teacherId));
    //   }
    // });
    // mutation.mutate();
  }, [iconAccountability, updateTeacherAccountability]);

  const getIconAccountabilityState = useCallback((teacherId: string): IconAccountabilityState => {
    return iconAccountability.find(t => t.teacherId === teacherId) || {
      teacherId,
      hasObservation: false,
      hasMeeting: false
    };
  }, [iconAccountability]);

  // ✅ TASK 2.3: Enhanced notes update with optimistic pattern
  const updateTeacherNotes = useCallback((teacherId: string, notes: string) => {
    // ✅ TASK 2.3: Optimistic update - immediately update UI
    setIconAccountability(prev => {
      const existing = prev.find(t => t.teacherId === teacherId);
      if (!existing) {
        return [
          ...prev,
          {
            teacherId,
            hasObservation: false,
            hasMeeting: false,
            notes,
            lastUpdated: new Date() // ✅ TASK 1.4: Date object appropriate for internal state tracking
          }
        ];
      }

      return prev.map(t => 
        t.teacherId === teacherId 
          ? { ...t, notes, lastUpdated: new Date() } // ✅ TASK 1.4: Date object appropriate for internal state tracking
          : t
      );
    });
    
    // TODO: If this becomes server-persisted, add mutation with rollback:
    // const mutation = useMutation({
    //   mutationFn: () => updateTeacherNotesOnServer(teacherId, notes),
    //   onError: (error, variables, context) => {
    //     // Rollback optimistic update
    //     if (context?.previousNotes !== undefined) {
    //       updateTeacherNotes(teacherId, context.previousNotes);
    //     }
    //   }
    // });
    // mutation.mutate();
  }, []);

  const isTeacherComplete = useCallback((teacherId: string): boolean => {
    const iconState = getIconAccountabilityState(teacherId);
    return iconState.hasObservation || iconState.hasMeeting;
  }, [getIconAccountabilityState]);

  // ✅ TASK 2.3: Enhanced completion stats with real-time updates from optimistic state
  const getCompletionStats = useCallback(() => {
    const totalTeachers = iconAccountability.length;
    const completedObservations = iconAccountability.filter(t => t.hasObservation).length;
    const completedMeetings = iconAccountability.filter(t => t.hasMeeting).length;
    const totalCompleted = iconAccountability.filter(t => t.hasObservation || t.hasMeeting).length;

    return {
      totalTeachers,
      completedObservations,
      completedMeetings,
      totalCompleted,
      completionRate: totalTeachers > 0 ? (totalCompleted / totalTeachers) * 100 : 0
    };
  }, [iconAccountability]);

  // Initialize icon accountability from legacy data if needed
  const initializeFromLegacy = useCallback((teachers: { id: string; name: string }[]) => {
    if (iconAccountability.length === 0 && accountability.length > 0) {
      const iconStates: IconAccountabilityState[] = teachers.map(teacher => {
        const legacy = accountability.find(a => a.teacherId === teacher.id);
        return {
          teacherId: teacher.id,
          hasObservation: legacy?.isScheduled ?? false,
          hasMeeting: legacy?.isCrossedOff ?? false,
          notes: legacy?.notes
        };
      });
      setIconAccountability(iconStates);
    }
  }, [accountability, iconAccountability]);

  return {
    // Legacy interface (backward compatibility)
    accountability,
    updateTeacherAccountability,
    getTeacherAccountability,
    isTeacherAccountable,
    clearAccountability,

    // New icon-based interface with optimistic updates
    iconAccountability,
    toggleObservation,
    toggleMeeting,
    getIconAccountabilityState,
    updateTeacherNotes,
    isTeacherComplete,
    getCompletionStats,
    initializeFromLegacy
  };
} 