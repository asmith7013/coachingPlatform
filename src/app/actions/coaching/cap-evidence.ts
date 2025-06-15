"use server";

import { CapEvidenceModel } from "@/lib/schema/mongoose-schema/cap/cap-evidence.model";
import { 
  CapEvidenceZodSchema, 
  CapEvidenceInputZodSchema,
  type CapEvidenceInput,
  CapEvidence
} from "@zod-schema/cap/cap-evidence";
import { createCrudActions } from "@server/crud/crud-factory";
import { withDbConnection } from "@server/db/ensure-connection";
import { QueryParams, DEFAULT_QUERY_PARAMS } from "@core-types/query";
import { ZodType } from "zod";

// Create actions internally (not exported to avoid "use server" violations)
const capEvidenceActions = createCrudActions({
  model: CapEvidenceModel,
  schema: CapEvidenceZodSchema as ZodType<CapEvidence>,
  inputSchema: CapEvidenceInputZodSchema,
  name: "CAP Evidence",
  revalidationPaths: ["/dashboard/coaching-action-plans"],
  sortFields: ['title', 'type', 'dateCollected', 'sortOrder', 'createdAt'],
  defaultSortField: 'sortOrder',
  defaultSortOrder: 'asc'
});

// Export only async functions
export async function fetchCapEvidence(params: QueryParams = DEFAULT_QUERY_PARAMS) {
  return withDbConnection(() => capEvidenceActions.fetch(params));
}

export async function fetchCapEvidenceByCapId(capId: string) {
  return withDbConnection(() => capEvidenceActions.fetch({ 
    ...DEFAULT_QUERY_PARAMS,
    filters: { capId }
  }));
}

export async function fetchCapEvidenceById(id: string) {
  return withDbConnection(() => capEvidenceActions.fetchById(id));
}

export async function createCapEvidence(data: CapEvidenceInput) {
  return withDbConnection(() => capEvidenceActions.create(data));
}

export async function updateCapEvidence(id: string, data: Partial<CapEvidenceInput>) {
  return withDbConnection(() => capEvidenceActions.update(id, data));
}

export async function deleteCapEvidence(id: string) {
  return withDbConnection(() => capEvidenceActions.delete(id));
} 