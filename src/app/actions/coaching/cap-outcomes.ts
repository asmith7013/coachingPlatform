"use server";

import { CapOutcomeModel } from "@mongoose-schema/cap/cap-outcome.model";
import { 
  CapOutcomeZodSchema, 
  CapOutcomeInputZodSchema,
  type CapOutcome,
  type CapOutcomeInput
} from "@zod-schema/cap/cap-outcome";
import { createCrudActions } from "@server/crud/crud-factory";
import { withDbConnection } from "@server/db/ensure-connection";
import { QueryParams, DEFAULT_QUERY_PARAMS } from "@core-types/query";
import { ZodType } from "zod";

// Create actions internally (not exported)
const capOutcomeActions = createCrudActions({
  model: CapOutcomeModel,
  schema: CapOutcomeZodSchema as ZodType<CapOutcome>,
  inputSchema: CapOutcomeInputZodSchema,
  name: "CAP Outcome",
  revalidationPaths: ["/dashboard/coaching-action-plans"],
  sortFields: ['description', 'achieved', 'sortOrder', 'createdAt'],
  defaultSortField: 'sortOrder',
  defaultSortOrder: 'asc'
});

// Export only async functions
export async function fetchCapOutcomes(params: QueryParams = DEFAULT_QUERY_PARAMS) {
  return withDbConnection(() => capOutcomeActions.fetch(params));
}

export async function fetchCapOutcomesByCapId(capId: string) {
  return withDbConnection(() => capOutcomeActions.fetch({ 
    ...DEFAULT_QUERY_PARAMS,
    filters: { capId }
  }));
}

export async function fetchCapOutcomeById(id: string) {
  return withDbConnection(() => capOutcomeActions.fetchById(id));
}

export async function createCapOutcome(data: CapOutcomeInput) {
  return withDbConnection(() => capOutcomeActions.create(data));
}

export async function updateCapOutcome(id: string, data: Partial<CapOutcomeInput>) {
  return withDbConnection(() => capOutcomeActions.update(id, data));
}

export async function deleteCapOutcome(id: string) {
  return withDbConnection(() => capOutcomeActions.delete(id));
} 