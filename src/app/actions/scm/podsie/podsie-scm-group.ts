"use server";

import { ZodType } from "zod";
import { PodsieScmGroupModel } from "@mongoose-schema/scm/podsie/podsie-scm-group.model";
import {
  PodsieScmGroupZodSchema,
  PodsieScmGroupInputZodSchema,
  PodsieScmGroup,
  PodsieScmGroupInput,
} from "@zod-schema/scm/podsie/podsie-scm-group";
import { createCrudActions } from "@server/crud/crud-factory";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";

// =====================================
// CRUD OPERATIONS (using factory)
// =====================================

const podsieScmGroupCrud = createCrudActions({
  model: PodsieScmGroupModel as unknown as Parameters<typeof createCrudActions>[0]['model'],
  schema: PodsieScmGroupZodSchema as ZodType<PodsieScmGroup>,
  inputSchema: PodsieScmGroupInputZodSchema as ZodType<PodsieScmGroupInput>,
  name: 'PodsieScmGroup',
  revalidationPaths: ['/scm/podsie/scm-groups'],
  sortFields: ['podsieGroupId', 'podsieModuleId', 'createdAt', 'updatedAt'],
  defaultSortField: 'podsieGroupId',
  defaultSortOrder: 'asc'
});

export const createPodsieScmGroup = podsieScmGroupCrud.create;
export const updatePodsieScmGroup = podsieScmGroupCrud.update;
export const deletePodsieScmGroup = podsieScmGroupCrud.delete;
export const fetchPodsieScmGroups = podsieScmGroupCrud.fetch;
export const fetchPodsieScmGroupById = podsieScmGroupCrud.fetchById;

// =====================================
// CUSTOM OPERATIONS
// =====================================

/**
 * Get all distinct Podsie group IDs from the collection
 */
export async function fetchDistinctGroupIds(): Promise<{ success: boolean; groupIds?: number[]; error?: string }> {
  return withDbConnection(async () => {
    try {
      const rawIds = await PodsieScmGroupModel.distinct('podsieGroupId');
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
