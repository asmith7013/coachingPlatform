import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@query/core/keys';
import { fetchLessonCompletions, fetchDailyClassEvents } from '@actions/scm/analytics';
import { ZearnCompletion, AssessmentCompletion, DailyClassEvent, LessonCompletion } from '@zod-schema/scm/core';

/**
 * Hook for fetching all lesson completion data with filtering capability
 */
export function useLessonCompletions(filters?: Record<string, unknown>) {
  const query = useQuery({
    queryKey: queryKeys.entities.list('lesson-completions', filters || {}),
    queryFn: async () => {
      const result = await fetchLessonCompletions({
        page: 1,
        limit: 1000, // Get all data for analytics
        sortBy: 'dateOfCompletion',
        sortOrder: 'desc',
        filters: filters || {}
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch lesson completions');
      }
      
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    data: query.data?.success && 'items' in query.data ? query.data.items as LessonCompletion[] : undefined,
    isLoading: query.isLoading,
    error: query.error, 
    refetch: query.refetch
  };
}

/**
 * Hook for fetching Zearn completion data specifically
 */
export function useZearnData() {
  const { data, isLoading, error, refetch } = useLessonCompletions({
    completionType: 'zearn'
  });

  const zearnData = useMemo(() => {
    return data?.filter((item): item is ZearnCompletion => 
      item.completionType === 'zearn'
    ) || null;
  }, [data]);

  return {
    data: zearnData,
    isLoading,
    error: error?.message || null,
    refetch
  };
}

/**
 * Hook for fetching Snorkl completion data specifically
 */
export function useSnorklData() {
  const { data, isLoading, error, refetch } = useLessonCompletions({
    completionType: 'snorkl_assessment'
  });

  const snorklData = useMemo(() => {
    return data?.filter((item): item is AssessmentCompletion => 
      item.completionType === 'snorkl_assessment'
    ) || null;
  }, [data]);

  return {
    data: snorklData,
    isLoading,
    error: error?.message || null,
    refetch
  };
}

/**
 * Hook for fetching attendance data
 */
export function useAttendanceData() {
  const query = useQuery({
    queryKey: queryKeys.entities.list('daily-class-events', {}),
    queryFn: async () => {
      const result = await fetchDailyClassEvents({
        page: 1,
        limit: 1000, // Get all data for analytics
        sortBy: 'date',
        sortOrder: 'desc',
        filters: {}
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch attendance data');
      }
      
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    data: query.data?.success && 'items' in query.data ? query.data.items as DailyClassEvent[] : null,
    isLoading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch
  };
}

/**
 * Enhanced analytics manager with filtering capabilities
 */
export function useAnalyticsManager() {
  const lessonCompletions = useLessonCompletions();
  const attendanceData = useAttendanceData();

  return {
    // Base data
    lessonCompletions,
    attendanceData,
    
    // Combined loading state
    isLoading: lessonCompletions.isLoading || attendanceData.isLoading,
    
    // Combined error state
    error: lessonCompletions.error || attendanceData.error
  };
} 