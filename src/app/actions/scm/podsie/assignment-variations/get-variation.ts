"use server";

import { withDbConnection } from '@server/db/ensure-connection';
import { AssignmentVariationModel } from '@mongoose-schema/scm/podsie';
import { handleServerError } from '@error/handlers/server';

export async function getVariationBySlug(slug: string) {
  return withDbConnection(async () => {
    try {
      const variation = await AssignmentVariationModel.findOne({ slug });

      if (!variation) {
        return {
          success: false,
          error: 'Assignment variation not found',
        };
      }

      // Check if public
      if (!variation.isPublic) {
        return {
          success: false,
          error: 'This variation is not publicly available',
        };
      }

      // Convert to plain object and serialize ObjectIds
      const plainVariation = JSON.parse(JSON.stringify(variation.toJSON()));

      return {
        success: true,
        data: plainVariation,
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, 'Failed to retrieve assignment variation'),
      };
    }
  });
}

export async function getVariationById(variationId: string) {
  return withDbConnection(async () => {
    try {
      const variation = await AssignmentVariationModel.findById(variationId);

      if (!variation) {
        return {
          success: false,
          error: 'Assignment variation not found',
        };
      }

      // Check if public
      if (!variation.isPublic) {
        return {
          success: false,
          error: 'This variation is not publicly available',
        };
      }

      // Convert to plain object and serialize ObjectIds
      const plainVariation = JSON.parse(JSON.stringify(variation.toJSON()));

      return {
        success: true,
        data: plainVariation,
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, 'Failed to retrieve assignment variation'),
      };
    }
  });
}
