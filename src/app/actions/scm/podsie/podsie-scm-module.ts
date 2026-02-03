"use server";

import { ZodType } from "zod";
import { revalidatePath } from "next/cache";
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

/**
 * Update Zearn codes for assignments across all groups.
 * Takes a map of assignmentId → zearnCode and updates all matching assignments
 * in all PodsieScmModule documents.
 *
 * Uses atomic MongoDB updateMany with array filters to prevent race conditions
 * that could occur with find/modify/save patterns.
 */
export async function updateZearnCodesAcrossGroups(
  assignmentCodeMap: Record<number, string | null>
): Promise<{ success: boolean; updatedCount?: number; error?: string }> {
  return withDbConnection(async () => {
    try {
      const entries = Object.entries(assignmentCodeMap);

      if (entries.length === 0) {
        return { success: true, updatedCount: 0 };
      }

      let updatedCount = 0;

      // Update each assignment atomically using positional operator with array filters
      // This prevents race conditions that can occur with find/modify/save patterns
      for (const [assignmentIdStr, zearnCode] of entries) {
        const assignmentId = Number(assignmentIdStr);

        const result = await PodsieScmModuleModel.updateMany(
          { "assignments.podsieAssignmentId": assignmentId },
          { $set: { "assignments.$[elem].zearnLessonCode": zearnCode } },
          {
            arrayFilters: [{ "elem.podsieAssignmentId": assignmentId }],
          }
        );

        updatedCount += result.modifiedCount;
      }

      revalidatePath("/scm/podsie/module-config");
      return { success: true, updatedCount };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error),
      };
    }
  });
}
