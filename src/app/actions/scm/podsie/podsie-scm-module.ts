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

interface AssignmentEntry {
  podsieAssignmentId: number;
  zearnLessonCode?: string | null;
}

interface ModuleDoc {
  assignments: AssignmentEntry[];
  save: () => Promise<void>;
}

/**
 * Update Zearn codes for assignments across all groups.
 * Takes a map of assignmentId → zearnCode and updates all matching assignments
 * in all PodsieScmModule documents.
 */
export async function updateZearnCodesAcrossGroups(
  assignmentCodeMap: Record<number, string | null>
): Promise<{ success: boolean; updatedCount?: number; error?: string }> {
  return withDbConnection(async () => {
    try {
      const assignmentIds = Object.keys(assignmentCodeMap).map(Number);

      if (assignmentIds.length === 0) {
        return { success: true, updatedCount: 0 };
      }

      // Find all modules containing any of these assignments
      const modules = (await PodsieScmModuleModel.find({
        "assignments.podsieAssignmentId": { $in: assignmentIds },
      })) as unknown as ModuleDoc[];

      let updatedCount = 0;
      for (const moduleDoc of modules) {
        let changed = false;
        for (const assignment of moduleDoc.assignments) {
          const newCode = assignmentCodeMap[assignment.podsieAssignmentId];
          if (newCode !== undefined && assignment.zearnLessonCode !== newCode) {
            assignment.zearnLessonCode = newCode;
            changed = true;
          }
        }
        if (changed) {
          await moduleDoc.save();
          updatedCount++;
        }
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
