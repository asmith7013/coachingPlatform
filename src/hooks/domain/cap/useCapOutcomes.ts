import { createCrudHooks } from "@query/client/factories/crud-factory";
import { CapOutcomeZodSchema, CapOutcome } from "@zod-schema/cap/cap-outcome";
import {
  fetchCapOutcomes,
  createCapOutcome,
  updateCapOutcome,
  deleteCapOutcome,
} from "@actions/coaching/cap-outcomes";
import { ZodType } from "zod";

const capOutcomeHooks = createCrudHooks({
  entityType: "capOutcomes",
  schema: CapOutcomeZodSchema as ZodType<CapOutcome>,
  serverActions: {
    fetch: fetchCapOutcomes,
    create: createCapOutcome,
    update: updateCapOutcome,
    delete: deleteCapOutcome,
  },
  validSortFields: ["title", "type", "sortOrder", "createdAt"],
  relatedEntityTypes: ["coachingActionPlans"],
});

export function useCapOutcomesByCapId(capId: string) {
  return capOutcomeHooks.useList({ filters: { capId }, sortBy: "sortOrder" });
}

export const useCapOutcomes = {
  list: capOutcomeHooks.useList,
  mutations: capOutcomeHooks.useMutations,
  manager: capOutcomeHooks.useManager,
  byCapId: useCapOutcomesByCapId,
};
