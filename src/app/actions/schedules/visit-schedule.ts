"use server";

import { createCrudActions } from "@server/crud";
import { VisitScheduleModel } from "@/lib/schema/mongoose-schema/schedules/schedule-documents.model";
import {
  VisitScheduleZodSchema,
  VisitScheduleInputZodSchema,
  type VisitSchedule,
  type VisitScheduleInput,
} from "@/lib/schema/zod-schema/schedules/schedule-documents";
import { withDbConnection } from "@server/db/ensure-connection";
import { QueryParams } from "@core-types/query";
import { ZodType } from "zod";

// Standard CRUD actions using established pattern
const visitScheduleActions = createCrudActions({
  model: VisitScheduleModel,
  schema: VisitScheduleZodSchema as ZodType<VisitSchedule>,
  inputSchema: VisitScheduleInputZodSchema as ZodType<VisitScheduleInput>,
  name: "Visit Schedule",
  revalidationPaths: ["/dashboard/schedules", "/dashboard/visits"],
  sortFields: ["date", "coachId", "schoolId", "createdAt"],
  defaultSortField: "date",
  defaultSortOrder: "desc",
});

// Export standard CRUD functions with connection handling
export async function fetchVisitSchedules(params: QueryParams) {
  return withDbConnection(() => visitScheduleActions.fetch(params));
}

export async function createVisitSchedule(data: VisitScheduleInput) {
  return withDbConnection(() => visitScheduleActions.create(data));
}

export async function updateVisitSchedule(
  id: string,
  data: Partial<VisitScheduleInput>,
) {
  return withDbConnection(() => visitScheduleActions.update(id, data));
}

export async function deleteVisitSchedule(id: string) {
  return withDbConnection(() => visitScheduleActions.delete(id));
}

export async function fetchVisitScheduleById(id: string) {
  return withDbConnection(() => visitScheduleActions.fetchById(id));
}
