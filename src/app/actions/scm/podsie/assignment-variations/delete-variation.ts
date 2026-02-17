"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { AssignmentVariationModel } from "@mongoose-schema/scm/podsie";
import { handleServerError } from "@error/handlers/server";

export async function deleteVariationBySlug(slug: string) {
  return withDbConnection(async () => {
    try {
      const result = await AssignmentVariationModel.deleteOne({ slug });

      if (result.deletedCount === 0) {
        return {
          success: false,
          error: "Assignment variation not found",
        };
      }

      return {
        success: true,
        message: `Deleted variation: ${slug}`,
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(
          error,
          "Failed to delete assignment variation",
        ),
      };
    }
  });
}
