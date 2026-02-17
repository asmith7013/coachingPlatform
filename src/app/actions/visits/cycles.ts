"use server";

import { createCrudActions } from "@server/crud";
import { CycleModel } from "@mongoose-schema/core/cycle.model";
import {
  CycleZodSchema,
  CycleInputZodSchema,
  type CycleInput,
  Cycle,
} from "@zod-schema/core/cycle";
import { withDbConnection } from "@server/db/ensure-connection";
import { QueryParams } from "@core-types/query";
import { ZodType } from "zod";

// Create Cycle actions
const cycleActions = createCrudActions({
  model: CycleModel,
  schema: CycleZodSchema as ZodType<Cycle>,
  inputSchema: CycleInputZodSchema as ZodType<CycleInput>,
  name: "Cycle",
  revalidationPaths: ["/dashboard/cycles"],
  sortFields: ["cycleNum", "createdAt", "updatedAt"],
  defaultSortField: "cycleNum",
  defaultSortOrder: "asc",
});

// Export individual functions with connection handling
export async function createCycle(data: CycleInput) {
  return withDbConnection(() => cycleActions.create(data));
}

export async function updateCycle(id: string, data: Partial<CycleInput>) {
  return withDbConnection(() => cycleActions.update(id, data));
}

export async function deleteCycle(id: string) {
  return withDbConnection(() => cycleActions.delete(id));
}

export async function fetchCycles(params: QueryParams) {
  return withDbConnection(() => cycleActions.fetch(params));
}

export async function fetchCycleById(id: string) {
  return withDbConnection(() => cycleActions.fetchById(id));
}
