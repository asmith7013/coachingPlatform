"use server";

import { CapImplementationRecordModel } from "@mongoose-schema/cap/cap-implementation-record.model";
import {
  CapImplementationRecordZodSchema,
  CapImplementationRecordInputZodSchema,
  type CapImplementationRecord,
  type CapImplementationRecordInput,
} from "@zod-schema/cap/cap-implementation-record";
import { createCrudActions } from "@server/crud/crud-factory";
import { withDbConnection } from "@server/db/ensure-connection";
import { QueryParams, DEFAULT_QUERY_PARAMS } from "@core-types/query";
import { ZodType } from "zod";

// Create actions internally (not exported)
const capImplementationRecordActions = createCrudActions({
  model: CapImplementationRecordModel,
  schema: CapImplementationRecordZodSchema as ZodType<CapImplementationRecord>,
  inputSchema: CapImplementationRecordInputZodSchema,
  name: "CAP Implementation Record",
  revalidationPaths: ["/dashboard/coaching-action-plans"],
  sortFields: ["date", "visitNumber", "sortOrder", "createdAt"],
  defaultSortField: "visitNumber",
  defaultSortOrder: "asc",
});

// Export only async functions
export async function fetchCapImplementationRecords(
  params: QueryParams = DEFAULT_QUERY_PARAMS,
) {
  return withDbConnection(() => capImplementationRecordActions.fetch(params));
}

export async function fetchCapImplementationRecordsByCapId(capId: string) {
  return withDbConnection(() =>
    capImplementationRecordActions.fetch({
      ...DEFAULT_QUERY_PARAMS,
      filters: { capId },
    }),
  );
}

export async function fetchCapImplementationRecordById(id: string) {
  return withDbConnection(() => capImplementationRecordActions.fetchById(id));
}

export async function createCapImplementationRecord(
  data: CapImplementationRecordInput,
) {
  return withDbConnection(() => capImplementationRecordActions.create(data));
}

export async function updateCapImplementationRecord(
  id: string,
  data: Partial<CapImplementationRecordInput>,
) {
  return withDbConnection(() =>
    capImplementationRecordActions.update(id, data),
  );
}

export async function deleteCapImplementationRecord(id: string) {
  return withDbConnection(() => capImplementationRecordActions.delete(id));
}
