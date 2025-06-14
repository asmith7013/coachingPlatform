"use server";

import { CapMetricModel } from "@mongoose-schema/cap/cap-metric.model";
import { 
  CapMetricZodSchema, 
  CapMetricInputZodSchema,
  type CapMetric,
  type CapMetricInput
} from "@zod-schema/cap/cap-metric";
import { createCrudActions } from "@server/crud/crud-factory";
import { withDbConnection } from "@server/db/ensure-connection";
import { QueryParams, DEFAULT_QUERY_PARAMS } from "@core-types/query";
import { ZodType } from "zod";

// Create actions internally (not exported to avoid "use server" violations)
const capMetricActions = createCrudActions({
  model: CapMetricModel,
  schema: CapMetricZodSchema as ZodType<CapMetric>,
  inputSchema: CapMetricInputZodSchema as ZodType<CapMetricInput>,
  name: "CAP Metric",
  revalidationPaths: ["/dashboard/coaching-action-plans"],
  sortFields: ['name', 'type', 'sortOrder', 'createdAt'],
  defaultSortField: 'sortOrder',
  defaultSortOrder: 'asc'
});

// Export only async functions
export async function fetchCapMetrics(params: QueryParams = DEFAULT_QUERY_PARAMS) {
  return withDbConnection(() => capMetricActions.fetch(params));
}

export async function fetchCapMetricsByCapId(capId: string) {
  return withDbConnection(() => capMetricActions.fetch({ 
    ...DEFAULT_QUERY_PARAMS,
    filters: { capId }
  }));
}

export async function fetchCapMetricById(id: string) {
  return withDbConnection(() => capMetricActions.fetchById(id));
}

export async function createCapMetric(data: CapMetricInput) {
  return withDbConnection(() => capMetricActions.create(data));
}

export async function updateCapMetric(id: string, data: Partial<CapMetricInput>) {
  return withDbConnection(() => capMetricActions.update(id, data));
}

export async function deleteCapMetric(id: string) {
  return withDbConnection(() => capMetricActions.delete(id));
}

// Domain-specific operation (only if truly needed)
export async function bulkUpdateCapMetrics(
  metrics: Array<{ id: string; data: Partial<CapMetricInput> }>
) {
  return withDbConnection(async () => {
    try {
      const results = await Promise.allSettled(
        metrics.map(({ id, data }) => capMetricActions.update(id, data))
      );
      const successful = results.filter(r => r.status === 'fulfilled').length;
      return {
        success: true,
        data: { updated: successful, total: metrics.length }
      };
    } catch (error) {
      return { 
        success: false, 
        error: `Bulk update failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  });
}