"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { AssignmentVariationModel } from "@mongoose-schema/scm/podsie";
import { handleServerError } from "@error/handlers/server";

interface ListVariationsFilters {
  scopeSequenceTag?: string;
  grade?: string;
  unitNumber?: number;
  lessonNumber?: number;
  limit?: number;
  skip?: number;
}

export async function listAssignmentVariations(
  filters?: ListVariationsFilters,
) {
  return withDbConnection(async () => {
    try {
      const query: Record<string, unknown> = {};

      // Apply filters
      if (filters?.scopeSequenceTag) {
        query.scopeSequenceTag = filters.scopeSequenceTag;
      }

      if (filters?.grade) {
        query.grade = filters.grade;
      }

      if (filters?.unitNumber) {
        query.unitNumber = filters.unitNumber;
      }

      if (filters?.lessonNumber !== undefined) {
        query.lessonNumber = filters.lessonNumber;
      }

      // Only show public variations
      query.isPublic = true;

      const variations = await AssignmentVariationModel.find(query)
        .sort({ unitNumber: 1, lessonNumber: 1, createdAt: -1 })
        .limit(filters?.limit || 50)
        .skip(filters?.skip || 0)
        .select(
          "title slug scopeSequenceTag grade unitNumber lessonNumber section originalAssignmentName questions generatedBy isPublic createdAt",
        );

      const total = await AssignmentVariationModel.countDocuments(query);

      return {
        success: true,
        data: variations.map((v) => {
          const json = v.toJSON();
          return {
            ...json,
            _id: v._id.toString(),
            id: v._id.toString(),
            questionCount:
              (json as { questions?: unknown[] }).questions?.length || 0,
          };
        }),
        pagination: {
          total,
          limit: filters?.limit || 50,
          skip: filters?.skip || 0,
          hasMore: (filters?.skip || 0) + (filters?.limit || 50) < total,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to list assignment variations"),
      };
    }
  });
}
