import { fetchSchedules } from "@/app/actions/schedules/schedules";
import { createReferenceEndpoint } from "@/lib/core/api";
import type { TeacherSchedule } from "@/lib/data/schemas/scheduling/schedule";

// Define the minimal schedule reference type
type ScheduleReference = {
  _id: string;
  teacher: string;
  school: string;
};

export const GET = createReferenceEndpoint<TeacherSchedule, ScheduleReference>({
  fetchFunction: fetchSchedules,
  defaultSearchField: "teacher", // Default search by teacher ID
  defaultLimit: 20,
  logPrefix: "API",
  mapItem: (schedule) => ({
    _id: schedule._id,
    teacher: schedule.teacher,
    school: schedule.school
  })
}); 