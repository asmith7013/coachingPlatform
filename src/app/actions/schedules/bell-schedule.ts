"use server";

import { createCrudActions } from "@server/crud";
import { BellScheduleModel } from "@/lib/schema/mongoose-schema/schedules/schedule-documents.model";
import {
  BellScheduleZodSchema,
  BellScheduleInputZodSchema,
  type BellSchedule,
  type BellScheduleInput,
} from "@/lib/schema/zod-schema/schedules/schedule-documents";
import { withDbConnection } from "@server/db/ensure-connection";
import { QueryParams } from "@core-types/query";
import { ZodType } from "zod";

// Standard CRUD actions using established pattern
const bellScheduleActions = createCrudActions({
  model: BellScheduleModel,
  schema: BellScheduleZodSchema as ZodType<BellSchedule>,
  inputSchema: BellScheduleInputZodSchema as ZodType<BellScheduleInput>,
  name: "Bell Schedule",
  revalidationPaths: ["/dashboard/schedules"],
  sortFields: ["name", "schoolId", "bellScheduleType", "createdAt"],
  defaultSortField: "name",
  defaultSortOrder: "asc",
});

// Export standard CRUD functions with connection handling
export async function fetchBellSchedules(params: QueryParams) {
  return withDbConnection(() => bellScheduleActions.fetch(params));
}

export async function createBellSchedule(data: BellScheduleInput) {
  return withDbConnection(() => bellScheduleActions.create(data));
}

export async function updateBellSchedule(
  id: string,
  data: Partial<BellScheduleInput>,
) {
  return withDbConnection(() => bellScheduleActions.update(id, data));
}

export async function deleteBellSchedule(id: string) {
  return withDbConnection(() => bellScheduleActions.delete(id));
}

export async function fetchBellScheduleById(id: string) {
  return withDbConnection(() => bellScheduleActions.fetchById(id));
}
