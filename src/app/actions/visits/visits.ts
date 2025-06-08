"use server";

import { createCrudActions } from "@server/crud";
import { VisitModel } from "@mongoose-schema/visits/visit.model";
import { 
  Visit,
  VisitZodSchema, 
  VisitInputZodSchema,
  type VisitInput
} from "@zod-schema/visits/visit";
import { withDbConnection } from "@server/db/ensure-connection";
import { QueryParams } from "@core-types/query";
import { ZodType } from "zod";

// Create Visit actions
const visitActions = createCrudActions({
  model: VisitModel,
  schema: VisitZodSchema as ZodType<Visit>,
  inputSchema: VisitInputZodSchema,
  name: "Visit",
  revalidationPaths: ["/dashboard/visits"],
  sortFields: ['date', 'school', 'coach', 'createdAt', 'updatedAt'],
  defaultSortField: 'date',
  defaultSortOrder: 'desc'
});

// Export individual functions with connection handling
export async function createVisit(data: VisitInput) {
  return withDbConnection(() => visitActions.create(data));
}

export async function updateVisit(id: string, data: Partial<VisitInput>) {
  return withDbConnection(() => visitActions.update(id, data));
}

export async function deleteVisit(id: string) {
  return withDbConnection(() => visitActions.delete(id));
}

export async function fetchVisits(params: QueryParams) {
  return withDbConnection(() => visitActions.fetch(params));
}

export async function fetchVisitById(id: string) {
  return withDbConnection(() => visitActions.fetchById(id));
}

// ✅ ADD: Export the raw actions object for debugging
// export { visitActions }; 