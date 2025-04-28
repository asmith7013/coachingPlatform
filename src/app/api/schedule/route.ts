import { fetchTeacherSchedulesForApi } from "@/lib/api/fetchers/schedule";
import { createReferenceEndpoint } from "@/lib/api/handlers/reference-endpoint";
import type { TeacherSchedule } from "@/lib/data-schema/zod-schema/schedule/schedule";
import type { ScheduleReference } from "@/lib/types/core/reference";

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