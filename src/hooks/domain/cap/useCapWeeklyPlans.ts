import { createCrudHooks } from "@query/client/factories/crud-factory";
import {
  CapWeeklyPlanZodSchema,
  CapWeeklyPlan,
} from "@zod-schema/cap/cap-weekly-plan";
import {
  fetchCapWeeklyPlans,
  createCapWeeklyPlan,
  updateCapWeeklyPlan,
  deleteCapWeeklyPlan,
} from "@actions/coaching/cap-weekly-plans";
import { ZodType } from "zod";

const capWeeklyPlanHooks = createCrudHooks({
  entityType: "capWeeklyPlans",
  schema: CapWeeklyPlanZodSchema as ZodType<CapWeeklyPlan>,
  serverActions: {
    fetch: fetchCapWeeklyPlans,
    create: createCapWeeklyPlan,
    update: updateCapWeeklyPlan,
    delete: deleteCapWeeklyPlan,
  },
  validSortFields: ["title", "weekNumber", "sortOrder", "createdAt"],
  relatedEntityTypes: ["coachingActionPlans"],
});

export function useCapWeeklyPlansByCapId(capId: string) {
  return capWeeklyPlanHooks.useList({
    filters: { capId },
    sortBy: "weekNumber",
  });
}

export const useCapWeeklyPlans = {
  list: capWeeklyPlanHooks.useList,
  mutations: capWeeklyPlanHooks.useMutations,
  manager: capWeeklyPlanHooks.useManager,
  byCapId: useCapWeeklyPlansByCapId,
};
