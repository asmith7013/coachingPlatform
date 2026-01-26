"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { SectionConfigModel } from "@mongoose-schema/scm/podsie/section-config.model";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { handleValidationError } from "@error/handlers/validation";
import { SchoolsZod, AllSectionsZod, ScopeSequenceTagZod, SpecialPopulationsZod } from "@schema/enum/scm";
import { GradeZod } from "@zod-schema/scm/scope-and-sequence/scope-and-sequence";

// Input schema for creating a new section config
const CreateSectionConfigInputSchema = z.object({
  school: SchoolsZod,
  classSection: AllSectionsZod,
  gradeLevel: GradeZod,
  scopeSequenceTag: ScopeSequenceTagZod.optional(),
  groupId: z.string().optional(),
  specialPopulations: z.array(SpecialPopulationsZod).default([]),
});

type CreateSectionConfigInput = z.infer<typeof CreateSectionConfigInputSchema>;

/**
 * Create a new section config
 * Used when adding a new Podsie group/section
 */
export async function createSectionConfig(data: CreateSectionConfigInput): Promise<{
  success: boolean;
  error?: string;
  data?: { id: string };
}> {
  return withDbConnection(async () => {
    try {
      // Validate input
      const validatedData = CreateSectionConfigInputSchema.parse(data);

      // Check if a section config already exists for this school + classSection
      const existing = await SectionConfigModel.findOne({
        school: validatedData.school,
        classSection: validatedData.classSection,
      });

      if (existing) {
        return {
          success: false,
          error: `A section config already exists for ${validatedData.school} ${validatedData.classSection}`,
        };
      }

      // Create the new section config
      const newConfig = await SectionConfigModel.create({
        school: validatedData.school,
        classSection: validatedData.classSection,
        gradeLevel: validatedData.gradeLevel,
        scopeSequenceTag: validatedData.scopeSequenceTag,
        groupId: validatedData.groupId,
        specialPopulations: validatedData.specialPopulations,
        active: true,
        assignmentContent: [],
        youtubeLinks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Revalidate relevant paths
      revalidatePath("/scm/podsie/sections");
      revalidatePath("/scm/podsie/progress");
      revalidatePath("/scm/podsie/pace");

      return {
        success: true,
        data: { id: newConfig._id.toString() },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: handleValidationError(error),
        };
      }
      console.error("💥 Error creating section config:", error);
      return {
        success: false,
        error: handleServerError(error, "Failed to create section config"),
      };
    }
  });
}
