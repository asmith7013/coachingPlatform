"use server";

import { createCrudActions } from "@server/crud";
import { CoachingLogModel } from "@mongoose-schema/visits/coaching-log.model";
import { 
  CoachingLog,
  CoachingLogZodSchema, 
  CoachingLogInputZodSchema,
  type CoachingLogInput
} from "@zod-schema/visits/coaching-log";
import { withDbConnection } from "@server/db/ensure-connection";
import { QueryParams } from "@core-types/query";
import { ZodType } from "zod";

// Create Coaching Log actions
const coachingLogActions = createCrudActions({
  model: CoachingLogModel,
  schema: CoachingLogZodSchema as ZodType<CoachingLog>,
  inputSchema: CoachingLogInputZodSchema as ZodType<CoachingLogInput>,
  name: "Coaching Log",
  revalidationPaths: ["/dashboard/coaching-logs"],
  sortFields: ['reasonDone', 'totalDuration', 'createdAt', 'updatedAt'],
  defaultSortField: 'createdAt',
  defaultSortOrder: 'desc'
});

// Export individual functions with connection handling
export async function createCoachingLog(data: CoachingLogInput) {
  return withDbConnection(() => coachingLogActions.create(data));
}

export async function updateCoachingLog(id: string, data: Partial<CoachingLogInput>) {
  return withDbConnection(() => coachingLogActions.update(id, data));
}

export async function deleteCoachingLog(id: string) {
  return withDbConnection(() => coachingLogActions.delete(id));
}

export async function fetchCoachingLogs(params: QueryParams) {
  return withDbConnection(() => coachingLogActions.fetch(params));
}

export async function fetchCoachingLogById(id: string) {
  return withDbConnection(() => coachingLogActions.fetchById(id));
} 