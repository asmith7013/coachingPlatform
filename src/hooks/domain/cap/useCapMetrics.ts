import { createCrudHooks } from "@query/client/factories/crud-factory";
import { CapMetricZodSchema, CapMetric } from "@zod-schema/cap/cap-metric";
import {
  fetchCapMetrics,
  createCapMetric,
  updateCapMetric,
  deleteCapMetric,
  bulkUpdateCapMetrics,
} from "@actions/coaching/cap-metrics";
import { ZodType } from "zod";

const capMetricHooks = createCrudHooks({
  entityType: "capMetrics",
  schema: CapMetricZodSchema as ZodType<CapMetric>,
  serverActions: {
    fetch: fetchCapMetrics,
    create: createCapMetric,
    update: updateCapMetric,
    delete: deleteCapMetric,
  },
  validSortFields: ["name", "type", "sortOrder", "createdAt"],
  relatedEntityTypes: ["coachingActionPlans"],
});

export function useCapMetricsByCapId(capId: string) {
  return capMetricHooks.useList({ filters: { capId }, sortBy: "sortOrder" });
}

export function useCapMetricsAutosave() {
  const mutations = capMetricHooks.useMutations();
  const autosaveMetric = async (id: string, data: Partial<CapMetric>) => {
    return mutations.updateAsync!(id, data);
  };
  const bulkAutosave = async (
    metrics: Array<{ id: string; data: Partial<CapMetric> }>,
  ) => {
    return bulkUpdateCapMetrics(metrics);
  };
  return {
    autosaveMetric,
    bulkAutosave,
    isAutosaving: mutations.isUpdating,
  };
}

export const useCapMetrics = {
  list: capMetricHooks.useList,
  mutations: capMetricHooks.useMutations,
  manager: capMetricHooks.useManager,
  byCapId: useCapMetricsByCapId,
  autosave: useCapMetricsAutosave,
};
