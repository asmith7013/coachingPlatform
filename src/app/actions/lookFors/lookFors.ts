"use server";

import { z, ZodType } from "zod";
import { LookForModel } from "@mongoose-schema/look-fors/look-for.model";
import { LookFor,LookForZodSchema, LookForInputZodSchema } from "@zod-schema/look-fors/look-for";
import { createCrudActions } from "@server/crud";
import { withDbConnection } from "@server/db/ensure-connection";
import type { QueryParams } from "@core-types/query";
import { handleServerError } from "@error/handlers/server";
import { handleValidationError } from "@error/handlers/validation";
import { bulkUploadToDB } from "@server/crud/bulk-operations";
import { uploadFileWithProgress } from "@server/file-handling/file-upload";

// Type definitions
type LookForInput = z.infer<typeof LookForInputZodSchema>;

// Create standard CRUD actions for Look Fors
const lookForActions = createCrudActions({
  model: LookForModel,
  schema: LookForZodSchema as ZodType<LookFor>,
  inputSchema: LookForInputZodSchema,
  name: "Look For",
  revalidationPaths: ["/dashboard/lookFors"],
  sortFields: ['lookForText', 'createdAt', 'updatedAt'],
  defaultSortField: 'createdAt',
  defaultSortOrder: 'desc'
});

// Export the generated actions with connection handling
export async function fetchLookFors(params: QueryParams) {
  return withDbConnection(() => lookForActions.fetch(params));
}

export async function createLookFor(data: LookForInput) {
  return withDbConnection(() => lookForActions.create(data));
}

export async function updateLookFor(id: string, data: Partial<LookForInput>) {
  return withDbConnection(() => lookForActions.update(id, data));
}

export async function deleteLookFor(id: string) {
  return withDbConnection(() => lookForActions.delete(id));
}

export async function fetchLookForById(id: string) {
  return withDbConnection(() => lookForActions.fetchById(id));
}

// File upload actions
export const uploadLookForFile = async (file: File): Promise<string> => {
  try {
    const result = await uploadFileWithProgress(file, "/api/lookFors/bulk-upload");
    return result.message || "No message";
  } catch (error) {
    throw handleServerError(error);
  }
};

export async function uploadLookFors(data: LookForInput[]) {
  return withDbConnection(async () => {
    try {
      const result = await bulkUploadToDB(
        data, 
        LookForModel, 
        LookForInputZodSchema, 
        ["/dashboard/lookFors"]
      );
      
      if (!result.success) {
        return {
          success: false,
          error: result.error
        };
      }

      return {
        success: true,
        items: result.items
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: handleValidationError(error)
        };
      }
      return {
        success: false,
        error: handleServerError(error)
      };
    }
  });
}