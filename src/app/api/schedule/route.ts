import { fetchTeacherSchedulesForApi } from "@server/fetchers/schedule";
import { createReferenceEndpoint } from "@api-handlers/reference-endpoint";
import type { TeacherSchedule } from "@zod-schema/schedule/schedule";
import type { ScheduleReference } from "@zod-schema/schedule/schedule";

// Export GET handler directly - follows same pattern as school API
export const GET = createReferenceEndpoint<TeacherSchedule, ScheduleReference>({
  fetchFunction: fetchTeacherSchedulesForApi,
  mapItem: (schedule) => ({
    _id: schedule._id,
    label: `Schedule for ${schedule.teacher} at ${schedule.school}`,
    teacher: schedule.teacher,
    school: schedule.school
  }),
  defaultSearchField: "teacher",
  defaultLimit: 20,
  logPrefix: "Schedule API"
}); 