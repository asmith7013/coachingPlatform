import { fetchSchedules } from "@/app/actions/schedule/schedule";
import { createReferenceEndpoint } from "@api/handlers/reference-endpoint";
import type { TeacherSchedule } from "@/lib/data-schema/zod-schema/schedule/schedule";
import type { ScheduleReference } from "@core-types/reference";

export const GET = createReferenceEndpoint<TeacherSchedule, ScheduleReference>({
  fetchFunction: fetchSchedules,
  defaultSearchField: "teacher", // Default search by teacher ID
  defaultLimit: 20,
  logPrefix: "API",
  mapItem: (schedule) => ({
    _id: schedule._id,
    label: `Schedule for ${schedule.teacher} at ${schedule.school}`,
    teacher: schedule.teacher,
    school: schedule.school
  })
}); 