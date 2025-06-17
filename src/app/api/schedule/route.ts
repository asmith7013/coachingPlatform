
import { fetchSchedulesForApi } from "@/lib/server/fetchers/domain/schedule";
import { createReferenceEndpoint, FetchFunction } from "@api-handlers/reference-endpoint";
import { TeacherSchedule, BellSchedule } from "@/lib/schema/zod-schema/schedules/schedule";

function mapScheduleToReference(schedule: TeacherSchedule | BellSchedule) {
  if ('teacherId' in schedule) {
    // Teacher schedule
    return {
      _id: schedule._id,
      value: schedule._id,
      label: `Teacher Schedule: ${schedule.teacherId} at ${schedule.schoolId}`,
      type: 'teacher',
      teacherId: schedule.teacherId,
      schoolId: schedule.schoolId
    };
  } else {
    // Bell schedule
    const bell = schedule as BellSchedule;
    return {
      _id: bell._id,
      value: bell._id,
      label: `Bell Schedule: ${bell.bellScheduleType} at ${bell.schoolId}`,
      type: 'bell',
      schoolId: bell.schoolId,
      bellScheduleType: bell.bellScheduleType
    };
  }
}

export const GET = createReferenceEndpoint({
  fetchFunction: fetchSchedulesForApi as FetchFunction<TeacherSchedule | BellSchedule>,
  mapItem: mapScheduleToReference,
  defaultSearchField: "schoolId",
  logPrefix: "Schedule API"
}); 