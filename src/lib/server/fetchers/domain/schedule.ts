import { TeacherScheduleModel, BellScheduleModel } from '@/lib/schema/mongoose-schema/schedules/schedule.model';
import { createApiSafeFetcher } from '@/lib/server/fetchers/fetcher-factory';
import type { QueryParams } from '@core-types/query';
import type { CollectionResponse } from '@core-types/response';
import { TeacherSchedule, BellSchedule } from '@/lib/schema/zod-schema/schedules/schedule';

export const fetchTeacherSchedulesForApi = createApiSafeFetcher(
  TeacherScheduleModel,
  "teacher"
) as (params: QueryParams) => Promise<CollectionResponse<TeacherSchedule>>;

export const fetchBellSchedulesForApi = createApiSafeFetcher(
  BellScheduleModel,
  "school"
) as (params: QueryParams) => Promise<CollectionResponse<BellSchedule>>;

/**
 * Unified schedule fetcher that handles type parameter
 */
export async function fetchSchedulesForApi(params: QueryParams): Promise<CollectionResponse<TeacherSchedule | BellSchedule>> {
  const { type, ...otherParams } = params;
  switch (type) {
    case 'teacher':
      return fetchTeacherSchedulesForApi(otherParams);
    case 'bell':
      return fetchBellSchedulesForApi(otherParams);
    default: {
      const [teacherData, bellData] = await Promise.all([
        fetchTeacherSchedulesForApi(otherParams),
        fetchBellSchedulesForApi(otherParams)
      ]);
      return {
        success: true,
        items: [...(teacherData.items || []), ...(bellData.items || [])],
        total: (teacherData.total || 0) + (bellData.total || 0)
      };
    }
  }
}

 