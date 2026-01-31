"use server";

import { ZodType } from "zod";
import { PodsieScmModuleModel } from "@mongoose-schema/scm/podsie/podsie-scm-module.model";
import {
  PodsieScmModuleZodSchema,
  PodsieScmModuleInputZodSchema,
  PodsieScmModule,
  PodsieScmModuleInput,
} from "@zod-schema/scm/podsie/podsie-scm-module";
import { createCrudActions } from "@server/crud/crud-factory";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";

// =====================================
// CRUD OPERATIONS (using factory)
// =====================================

const podsieScmModuleCrud = createCrudActions({
  model: PodsieScmModuleModel as unknown as Parameters<typeof createCrudActions>[0]['model'],
  schema: PodsieScmModuleZodSchema as ZodType<PodsieScmModule>,
  inputSchema: PodsieScmModuleInputZodSchema as ZodType<PodsieScmModuleInput>,
  name: 'PodsieScmModule',
  revalidationPaths: ['/scm/podsie/module-config'],
  sortFields: ['podsieGroupId', 'podsieModuleId', 'createdAt', 'updatedAt'],
  defaultSortField: 'podsieGroupId',
  defaultSortOrder: 'asc'
});

export const createPodsieScmModule = podsieScmModuleCrud.create;
export const updatePodsieScmModule = podsieScmModuleCrud.update;
export const deletePodsieScmModule = podsieScmModuleCrud.delete;
export const fetchPodsieScmModules = podsieScmModuleCrud.fetch;
export const fetchPodsieScmModuleById = podsieScmModuleCrud.fetchById;

// =====================================
// CUSTOM OPERATIONS
// =====================================

/**
 * Get all distinct Podsie group IDs from the collection
 */
export async function fetchDistinctGroupIds(): Promise<{ success: boolean; groupIds?: number[]; error?: string }> {
  return withDbConnection(async () => {
    try {
      const rawIds = await PodsieScmModuleModel.distinct('podsieGroupId');
      const groupIds = rawIds.map((id) => Number(id));
      return {
        success: true,
        groupIds: groupIds.sort((a, b) => a - b),
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error),
      };
    }
  });
}
