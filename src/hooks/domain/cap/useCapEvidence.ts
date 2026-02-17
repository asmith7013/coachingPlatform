import { createCrudHooks } from "@query/client/factories/crud-factory";
import {
  CapEvidence,
  CapEvidenceZodSchema,
} from "@zod-schema/cap/cap-evidence";
import {
  fetchCapEvidence,
  createCapEvidence,
  updateCapEvidence,
  deleteCapEvidence,
} from "@actions/coaching/cap-evidence";
import { ZodType } from "zod";

const capEvidenceHooks = createCrudHooks({
  entityType: "capEvidence",
  schema: CapEvidenceZodSchema as ZodType<CapEvidence>,
  serverActions: {
    fetch: fetchCapEvidence,
    create: createCapEvidence,
    update: updateCapEvidence,
    delete: deleteCapEvidence,
  },
  validSortFields: ["title", "type", "dateCollected", "sortOrder", "createdAt"],
  relatedEntityTypes: ["coachingActionPlans"],
});

export function useCapEvidenceByCapId(capId: string) {
  return capEvidenceHooks.useList({ filters: { capId }, sortBy: "sortOrder" });
}

export const useCapEvidence = {
  list: capEvidenceHooks.useList,
  mutations: capEvidenceHooks.useMutations,
  manager: capEvidenceHooks.useManager,
  byCapId: useCapEvidenceByCapId,
};
