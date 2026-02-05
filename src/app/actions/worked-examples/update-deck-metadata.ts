"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { WorkedExampleDeck } from "@mongoose-schema/worked-example-deck.model";
import { getAuthenticatedUser } from "@server/auth/getAuthenticatedUser";
import { handleServerError } from "@error/handlers/server";
import { z } from "zod";
import { GradeZod } from "@zod-schema/scm/scope-and-sequence/scope-and-sequence";
import { PodsieScmModuleModel } from "@mongoose-schema/scm/podsie/podsie-scm-module.model";

const WorkedExampleTypeEnum = z.enum([
  "masteryCheck",
  "prerequisiteSkill",
  "other",
]);
export type WorkedExampleType = z.infer<typeof WorkedExampleTypeEnum>;

const UpdateMetadataSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  gradeLevel: GradeZod.optional(),
  unitNumber: z.number().int().positive().nullable().optional(),
  lessonNumber: z.number().int().nullable().optional(),
  mathConcept: z.string().optional(),
  mathStandard: z.string().optional(),
  learningGoals: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
  podsieAssignmentId: z.number().int().nullable().optional(),
  podsieAssignmentTitle: z.string().nullable().optional(),
  workedExampleType: WorkedExampleTypeEnum.optional(),
});

export type UpdateDeckMetadataInput = z.infer<typeof UpdateMetadataSchema>;

/**
 * Update metadata fields for a worked example deck.
 * Only the deck owner or super admins can update metadata.
 */
export async function updateDeckMetadata(
  slug: string,
  updates: UpdateDeckMetadataInput,
) {
  return withDbConnection(async () => {
    try {
      const authResult = await getAuthenticatedUser();

      if (!authResult.success) {
        return {
          success: false,
          error: "You must be logged in to update decks",
        };
      }

      const { email: userEmail, isSuperAdmin } = authResult.data;

      const deck = await WorkedExampleDeck.findOne({ slug });

      if (!deck) {
        return {
          success: false,
          error: "Deck not found",
        };
      }

      // Super admins can always modify, otherwise only the owner
      const isOwner = deck.createdBy === userEmail;
      if (!isOwner && !isSuperAdmin) {
        return {
          success: false,
          error: "You do not have permission to modify this deck",
        };
      }

      // Validate updates
      const validated = UpdateMetadataSchema.parse(updates);

      // Apply only the fields that were provided
      if (validated.title !== undefined) deck.title = validated.title;
      if (validated.gradeLevel !== undefined)
        deck.gradeLevel = validated.gradeLevel;
      if (validated.unitNumber !== undefined)
        deck.unitNumber = validated.unitNumber ?? undefined;
      if (validated.lessonNumber !== undefined)
        deck.lessonNumber = validated.lessonNumber ?? undefined;
      if (validated.mathConcept !== undefined)
        deck.mathConcept = validated.mathConcept;
      if (validated.mathStandard !== undefined)
        deck.mathStandard = validated.mathStandard;
      if (validated.learningGoals !== undefined)
        deck.learningGoals = validated.learningGoals;
      if (validated.isPublic !== undefined) deck.isPublic = validated.isPublic;
      if (validated.podsieAssignmentId !== undefined)
        deck.podsieAssignmentId = validated.podsieAssignmentId ?? undefined;
      if (validated.podsieAssignmentTitle !== undefined)
        deck.podsieAssignmentTitle =
          validated.podsieAssignmentTitle ?? undefined;

      deck.updatedAt = new Date();
      await deck.save();

      // Update all podsie-scm-modules that contain this assignment
      if (validated.podsieAssignmentId && validated.workedExampleType) {
        const workedExampleEntry = {
          slug,
          workedExampleType: validated.workedExampleType,
        };

        // First, remove any existing entry with this slug (to avoid duplicates)
        await PodsieScmModuleModel.updateMany(
          { "assignments.podsieAssignmentId": validated.podsieAssignmentId },
          { $pull: { "assignments.$[elem].workedExamples": { slug } } },
          {
            arrayFilters: [
              { "elem.podsieAssignmentId": validated.podsieAssignmentId },
            ],
          },
        );

        // Then add the new entry
        await PodsieScmModuleModel.updateMany(
          { "assignments.podsieAssignmentId": validated.podsieAssignmentId },
          {
            $push: { "assignments.$[elem].workedExamples": workedExampleEntry },
          },
          {
            arrayFilters: [
              { "elem.podsieAssignmentId": validated.podsieAssignmentId },
            ],
          },
        );
      }

      return {
        success: true,
        data: {
          slug: deck.slug,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to update deck metadata"),
      };
    }
  });
}
