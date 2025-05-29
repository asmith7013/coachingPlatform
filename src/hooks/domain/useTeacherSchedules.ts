import { createEntityHooks } from '@query/client/factories/entity-factory';
import { 
  TeacherScheduleZodSchema, 
  TeacherScheduleInputZodSchema, 
  TeacherSchedule,
  Period
} from '@zod-schema/schedule/schedule';
import { 
  fetchTeacherSchedules,
  createTeacherSchedule,
  updateTeacherSchedule,
  deleteTeacherSchedule,
  fetchTeacherSchedulesBySchool
} from '@actions/schedule/schedule';
import { WithDateObjects, DocumentInput } from '@core-types/document';
import { wrapServerActions } from '@transformers/factories/server-action-factory';
import { transformData } from '@transformers/core/unified-transformer';
import { ZodType } from 'zod';
import { ServerActions } from '@core-types/query-factory';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CollectionResponse, EntityResponse } from '@core-types/response';

/**
 * TeacherSchedule entity with Date objects instead of string dates
 */
export type TeacherScheduleWithDates = WithDateObjects<TeacherSchedule>;

/**
 * Input type that satisfies DocumentInput constraint for TeacherSchedule
 */
export type TeacherScheduleInput = DocumentInput<TeacherSchedule>;

// Type for server action that accepts both TeacherScheduleInput and inferred input
type CreateTeacherScheduleFn = (data: TeacherScheduleInput) => Promise<CollectionResponse<TeacherScheduleWithDates> | EntityResponse<TeacherScheduleWithDates>>;
type UpdateTeacherScheduleFn = (id: string, data: Partial<TeacherScheduleInput>) => Promise<CollectionResponse<TeacherScheduleWithDates> | EntityResponse<TeacherScheduleWithDates>>;

// Stub function for fetchById since it doesn't exist in the actions
const fetchTeacherScheduleById = async (_id: string) => {
  throw new Error('fetchTeacherScheduleById not implemented');
};

/**
 * Extended Period with optional runtime properties
 */
interface ExtendedPeriod extends Period {
  startTime?: string;
  endTime?: string;
}

/**
 * UI representation of schedule data
 */
export interface ScheduleForUI {
  id: string;
  teacherId: string;
  teacherName: string;
  scheduleData: Array<{
    id: number;
    startTime: string;
    endTime: string;
    timeSlot: string;
    what: string;
    who: string[];
    classInfo: string;
    roomInfo: string;
  }>;
}

/**
 * Wraps all server actions to transform dates in responses
 */
const wrappedActions = wrapServerActions<TeacherSchedule, TeacherScheduleWithDates, TeacherScheduleInput>(
  {
    fetch: fetchTeacherSchedules,
    fetchById: fetchTeacherScheduleById,
    create: createTeacherSchedule as unknown as CreateTeacherScheduleFn,
    update: updateTeacherSchedule as unknown as UpdateTeacherScheduleFn,
    delete: deleteTeacherSchedule
  },
  items => transformData<TeacherSchedule, TeacherScheduleWithDates>(items, {
    schema: TeacherScheduleZodSchema as unknown as ZodType<TeacherScheduleWithDates>,
    handleDates: true,
    errorContext: 'useTeacherSchedules'
  })
);

/**
 * Custom React Query hooks for TeacherSchedule entity
 * 
 * These hooks handle fetching, creating, updating, and deleting teacher schedules
 * with proper date transformation (string dates to Date objects)
 */
const entityHooks = createEntityHooks<TeacherScheduleWithDates, TeacherScheduleInput>({
  entityType: 'teacher-schedules',
  fullSchema: TeacherScheduleZodSchema as unknown as ZodType<TeacherScheduleWithDates>,
  inputSchema: TeacherScheduleInputZodSchema as unknown as ZodType<TeacherScheduleInput>,
  serverActions: wrappedActions as ServerActions<TeacherScheduleWithDates, TeacherScheduleInput>,
  validSortFields: ['createdAt', 'updatedAt'],
  defaultParams: {
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 50
  },
  staleTime: 5 * 60 * 1000, // 5 minutes
  persistFilters: true,
  relatedEntityTypes: ['schools', 'staff']
});

// Export entity hooks with renamed manager function
export const {
  useEntityList: useTeacherScheduleList,
  useEntityById: useTeacherScheduleById, 
  useMutations: useTeacherScheduleMutations
} = entityHooks;

/**
 * Hook for accessing teacher schedules for a specific school
 */
export function useTeacherSchedules(schoolId?: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['teacher-schedules', 'school', schoolId],
    queryFn: async () => {
      if (!schoolId) return { items: [], success: true, total: 0 };
      return fetchTeacherSchedulesBySchool(schoolId);
    },
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000
  });
  
  // Get mutations for CRUD operations
  const { create, update, delete: remove } = useTeacherScheduleMutations();
  
  // Transform data for UI display
  const schedulesForUI = useMemo(() => {
    if (!data?.items) return [];
    
    return data.items.map((schedule) => {
      // Type assertion to TeacherSchedule for safe property access
      const typedSchedule = schedule as unknown as TeacherSchedule;
      // Get the first day's schedule (usually the default)
      const daySchedule = typedSchedule.scheduleByDay?.[0] || { day: 'uniform', periods: [] };
      
      // Convert periods to UI format
      const scheduleData = daySchedule.periods.map((period: Period) => {
        // Cast to ExtendedPeriod to safely access optional properties
        const extendedPeriod = period as ExtendedPeriod;
        const startTime = extendedPeriod.startTime || '';
        const endTime = extendedPeriod.endTime || '';
        
        return {
          id: period.periodNum,
          startTime,
          endTime,
          timeSlot: `${startTime}-${endTime}`,
          what: period.periodType || 'class',
          who: [typedSchedule.teacher],
          classInfo: period.className || '',
          roomInfo: period.room || ''
        };
      });
      
      return {
        id: typedSchedule._id,
        teacherId: typedSchedule.teacher,
        teacherName: typedSchedule.teacher, // This would be replaced with actual teacher name in the component
        scheduleData
      };
    });
  }, [data]);
  
  return {
    schedules: data?.items || [],
    schedulesForUI,
    isLoading,
    error,
    createSchedule: create,
    updateSchedule: update,
    deleteSchedule: remove
  };
}

// Default export
export default useTeacherSchedules; 