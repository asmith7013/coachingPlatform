"use server";

import { createCrudActions } from "@server/crud";
import { TeacherScheduleModel } from "@/lib/schema/mongoose-schema/schedules/schedule-documents.model";
import { 
  TeacherScheduleZodSchema, 
  TeacherScheduleInputZodSchema,
  type TeacherSchedule,
  type TeacherScheduleInput
} from "@/lib/schema/zod-schema/schedules/schedule-documents";
import { withDbConnection } from "@server/db/ensure-connection";
import { QueryParams } from "@core-types/query";
import { ZodType } from "zod";

// Standard CRUD actions using established pattern
const teacherScheduleActions = createCrudActions({
  model: TeacherScheduleModel,
  schema: TeacherScheduleZodSchema as ZodType<TeacherSchedule>,
  inputSchema: TeacherScheduleInputZodSchema as ZodType<TeacherScheduleInput>,
  name: "Teacher Schedule",
  revalidationPaths: ["/dashboard/schedules"],
  sortFields: ['teacherId', 'schoolId', 'createdAt'],
  defaultSortField: 'teacherId',
  defaultSortOrder: 'asc'
});

// Export standard CRUD functions with connection handling
export async function fetchTeacherSchedules(params: QueryParams) {
  return withDbConnection(() => teacherScheduleActions.fetch(params));
}

export async function createTeacherSchedule(data: TeacherScheduleInput) {
  return withDbConnection(() => teacherScheduleActions.create(data));
}

export async function updateTeacherSchedule(id: string, data: Partial<TeacherScheduleInput>) {
  return withDbConnection(() => teacherScheduleActions.update(id, data));
}

export async function deleteTeacherSchedule(id: string) {
  return withDbConnection(() => teacherScheduleActions.delete(id));
}

export async function fetchTeacherScheduleById(id: string) {
  return withDbConnection(() => teacherScheduleActions.fetchById(id));
} 
