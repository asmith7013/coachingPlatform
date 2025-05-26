import { fetchTeacherSchedulesForApi } from "@server/fetchers/schedule";
import { createReferenceEndpoint, FetchFunction } from "@api-handlers/reference-endpoint";
import type { TeacherSchedule } from "@zod-schema/schedule/schedule";
import type { TeacherScheduleReference } from "@zod-schema/schedule/schedule";

// Export GET handler directly - follows same pattern as school API
export const GET = createReferenceEndpoint<TeacherSchedule, TeacherScheduleReference>({
  fetchFunction: fetchTeacherSchedulesForApi  as unknown as FetchFunction<TeacherSchedule>,
  mapItem: (schedule) => ({
    _id: schedule._id,
    label: `Schedule for ${schedule.teacher} at ${schedule.school}`,
    teacher: schedule.teacher,
    school: schedule.school,
    value: schedule._id
  }),
  defaultSearchField: "teacher",
  defaultLimit: 20,
  logPrefix: "Schedule API"
}); 