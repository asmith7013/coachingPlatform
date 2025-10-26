"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { RoadmapUnitModel } from "@mongoose-schema/313/roadmap-unit.model";
import {
  RoadmapUnitZodSchema,
  RoadmapUnitInputZodSchema
} from "@zod-schema/313/roadmap-unit";
import { createCrudActions } from "@server/crud/crud-factory";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { handleValidationError } from "@error/handlers/validation";
import { upsertRoadmapsSkill } from "./roadmaps-skills";

// =====================================
// CRUD OPERATIONS (using factory)
// =====================================

const roadmapUnitCrud = createCrudActions({
  model: RoadmapUnitModel,
  schema: RoadmapUnitZodSchema,
  inputSchema: RoadmapUnitInputZodSchema,
  name: 'RoadmapUnit',
  revalidationPaths: ['/roadmaps/units', '/roadmaps/unit-scraper'],
  sortFields: ['grade', 'unitNumber', 'unitTitle', 'createdAt', 'updatedAt'],
  defaultSortField: 'unitNumber',
  defaultSortOrder: 'asc'
});

// Export CRUD operations (rename 'delete' to avoid reserved keyword conflict)
export const createRoadmapUnit = roadmapUnitCrud.create;
export const updateRoadmapUnit = roadmapUnitCrud.update;
export const deleteRoadmapUnit = roadmapUnitCrud.delete;
export const fetchRoadmapUnits = roadmapUnitCrud.fetch;
export const fetchRoadmapUnitById = roadmapUnitCrud.fetchById;

// =====================================
// CUSTOM OPERATIONS
// =====================================

// Helper function to extract unit number from title
function extractUnitNumber(unitTitle: string): number {
  const match = unitTitle.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Schema for scraped unit data (before transformation)
 * This matches what comes from the scraper
 */
const ScrapedUnitSchema = z.object({
  unitTitle: z.string(),
  url: z.string().url(),
  targetCount: z.number(),
  supportCount: z.number(),
  extensionCount: z.number(),
  targetSkills: z.array(z.object({
    title: z.string(),
    skillNumber: z.string(),
    essentialSkills: z.array(z.object({
      title: z.string(),
      skillNumber: z.string()
    })).default([]),
    helpfulSkills: z.array(z.object({
      title: z.string(),
      skillNumber: z.string()
    })).default([]),
  })).default([]),
  additionalSupportSkills: z.array(z.object({
    title: z.string(),
    skillNumber: z.string()
  })).default([]),
  extensionSkills: z.array(z.object({
    title: z.string(),
    skillNumber: z.string()
  })).default([]),
  scrapedAt: z.string(),
  success: z.boolean(),
  error: z.string().optional(),
});

/**
 * Bulk create/update roadmap units (with new architecture)
 * - Saves target skills to roadmap-skills collection
 * - Saves units with only skill number references
 */
export async function bulkCreateRoadmapUnits(data: unknown) {
  return withDbConnection(async () => {
    try {
      // Expect data in format: { grade: string, units: ScrapedUnit[] }
      const parsed = z.object({
        grade: z.string(),
        units: z.array(ScrapedUnitSchema)
      }).parse(data);

      const { grade, units: unitsArray } = parsed;

      console.log('📚 Bulk creating', unitsArray.length, 'Roadmaps units for grade:', grade);

      const results = [];
      const errors = [];
      let totalSkillsProcessed = 0;

      for (const unitData of unitsArray) {
        try {
          // Extract unit number if not provided
          const unitNumber = extractUnitNumber(unitData.unitTitle);

          console.log(`💾 Processing unit: ${unitData.unitTitle} (number: ${unitNumber})`);
          console.log(`   📊 Target skills: ${unitData.targetSkills?.length || 0}`);
          console.log(`   📊 Support skills: ${unitData.additionalSupportSkills?.length || 0}`);
          console.log(`   📊 Extension skills: ${unitData.extensionSkills?.length || 0}`);

          // 1. Save all target skills to roadmaps-skills collection
          for (const targetSkill of unitData.targetSkills) {
            const skillResult = await upsertRoadmapsSkill({
              skillNumber: targetSkill.skillNumber,
              title: targetSkill.title,
              essentialSkills: targetSkill.essentialSkills,
              helpfulSkills: targetSkill.helpfulSkills,
              unit: {
                grade,
                unitTitle: unitData.unitTitle,
                unitNumber
              },
              scrapedAt: unitData.scrapedAt
            });

            if (skillResult.success) {
              totalSkillsProcessed++;
            }
          }

          // 2. Transform unit data to only include skill number arrays
          const transformedUnit = {
            grade,
            unitTitle: unitData.unitTitle,
            unitNumber,
            url: unitData.url,
            targetCount: unitData.targetCount,
            supportCount: unitData.supportCount,
            extensionCount: unitData.extensionCount,
            // Only store skill numbers (strings)
            targetSkills: unitData.targetSkills.map(s => s.skillNumber),
            additionalSupportSkills: unitData.additionalSupportSkills.map(s => s.skillNumber),
            extensionSkills: unitData.extensionSkills.map(s => s.skillNumber),
            scrapedAt: unitData.scrapedAt,
            success: unitData.success,
            error: unitData.error
          };

          // 3. Upsert the unit
          const existingUnit = await RoadmapUnitModel.findOne({
            grade,
            unitTitle: unitData.unitTitle
          });

          if (existingUnit) {
            console.log('⚠️ Updating existing unit:', unitData.unitTitle);
            const updateResult = await RoadmapUnitModel.findByIdAndUpdate(
              existingUnit._id,
              {
                ...transformedUnit,
                updatedAt: new Date().toISOString()
              },
              { new: true, runValidators: true }
            );

            if (updateResult) {
              const saved = updateResult.toObject();
              console.log(`   ✅ Updated - Saved with ${saved.targetSkills?.length || 0} target skill references`);
              results.push({
                action: 'updated',
                unit: saved
              });
            }
          } else {
            console.log('✅ Creating new unit:', unitData.unitTitle);
            const unit = new RoadmapUnitModel({
              ...transformedUnit,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });

            const savedUnit = await unit.save();
            const saved = savedUnit.toObject();
            console.log(`   ✅ Created - Saved with ${saved.targetSkills?.length || 0} target skill references`);
            results.push({
              action: 'created',
              unit: saved
            });
          }
        } catch (unitError) {
          console.error('❌ Error processing unit:', unitData.unitTitle, unitError);
          errors.push({
            unitTitle: unitData.unitTitle,
            grade,
            error: unitError instanceof Error ? unitError.message : 'Unknown error'
          });
        }
      }

      console.log(`📊 Bulk operation complete: ${results.length} units processed, ${totalSkillsProcessed} skills saved, ${errors.length} errors`);

      // Revalidate relevant paths
      revalidatePath('/roadmaps/units');
      revalidatePath('/roadmaps/unit-scraper');

      return {
        success: true,
        data: {
          totalProcessed: unitsArray.length,
          successful: results.length,
          failed: errors.length,
          totalSkillsProcessed,
          results,
          errors
        },
        message: `Processed ${unitsArray.length} units (${totalSkillsProcessed} skills): ${results.length} successful, ${errors.length} failed`
      };

    } catch (error) {
      console.error('💥 Error in bulk create Roadmaps units:', error);

      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: handleValidationError(error, 'bulkCreateRoadmapUnits')
        };
      }

      return {
        success: false,
        error: handleServerError(error, 'bulkCreateRoadmapUnits')
      };
    }
  });
}

/**
 * Get roadmap units with custom filtering
 * Extends the basic fetch operation with domain-specific filters
 */
export async function getRoadmapUnits(options: {
  grade?: string;
  search?: string;
  successOnly?: boolean;
  limit?: number;
} = {}) {
  return withDbConnection(async () => {
    try {
      const {
        grade,
        search,
        successOnly = true,
        limit = 100
      } = options;

      const query: Record<string, unknown> = {};

      // Apply filters
      if (successOnly) {
        query.success = true;
      }

      if (grade) {
        query.grade = grade;
      }

      if (search) {
        query.$or = [
          { unitTitle: { $regex: search, $options: 'i' } },
          { 'targetSkills.title': { $regex: search, $options: 'i' } }
        ];
      }

      const units = await RoadmapUnitModel
        .find(query)
        .sort({ grade: 1, unitNumber: 1 })
        .limit(limit)
        .exec();

      console.log(`📚 Retrieved ${units.length} Roadmap units`);

      return {
        success: true,
        data: units.map(unit => unit.toObject()),
        count: units.length
      };

    } catch (error) {
      console.error('💥 Error getting Roadmap units:', error);
      return {
        success: false,
        error: handleServerError(error, 'getRoadmapUnits')
      };
    }
  });
}
