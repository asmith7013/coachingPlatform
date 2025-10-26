"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { RoadmapsSkillModel } from "@mongoose-schema/313/roadmap-skill.model";
import {
  RoadmapsSkillZodSchema,
  RoadmapsSkillInputZodSchema
} from "@zod-schema/313/roadmap-skill";
import { createCrudActions } from "@server/crud/crud-factory";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { handleValidationError } from "@error/handlers/validation";

// =====================================
// CRUD OPERATIONS (using factory)
// =====================================

const roadmapsSkillCrud = createCrudActions({
  model: RoadmapsSkillModel,
  schema: RoadmapsSkillZodSchema,
  inputSchema: RoadmapsSkillInputZodSchema,
  name: 'RoadmapsSkill',
  revalidationPaths: ['/roadmaps/units', '/roadmaps/unit-scraper'],
  sortFields: ['skillNumber', 'title', 'createdAt', 'updatedAt'],
  defaultSortField: 'skillNumber',
  defaultSortOrder: 'asc'
});

// Export CRUD operations
export const createRoadmapsSkill = roadmapsSkillCrud.create;
export const updateRoadmapsSkill = roadmapsSkillCrud.update;
export const deleteRoadmapsSkill = roadmapsSkillCrud.delete;
export const fetchRoadmapsSkills = roadmapsSkillCrud.fetch;
export const fetchRoadmapsSkillById = roadmapsSkillCrud.fetchById;

// =====================================
// CUSTOM OPERATIONS
// =====================================

/**
 * Fetch skills by their skill numbers
 */
export async function fetchRoadmapsSkillsByNumbers(skillNumbers: string[]) {
  return withDbConnection(async () => {
    try {
      const skills = await RoadmapsSkillModel
        .find({ skillNumber: { $in: skillNumbers } })
        .exec();

      return {
        success: true,
        data: skills.map(skill => skill.toObject())
      };
    } catch (error) {
      console.error('💥 Error fetching skills by numbers:', error);
      return {
        success: false,
        error: handleServerError(error, 'fetchRoadmapsSkillsByNumbers')
      };
    }
  });
}

/**
 * Upsert a skill - create if doesn't exist, add unit reference if it does
 * Accepts all skill fields including rich content
 */
export async function upsertRoadmapsSkill(skillData: {
  skillNumber: string;
  title: string;
  essentialSkills: Array<{ skillNumber: string; title: string }>;
  helpfulSkills: Array<{ skillNumber: string; title: string }>;
  unit: {
    grade: string;
    unitTitle: string;
    unitNumber: number;
  };
  scrapedAt: string;
  // Optional content fields
  url?: string;
  description?: string;
  skillChallengeCriteria?: string;
  essentialQuestion?: string;
  launch?: string;
  teacherStudentStrategies?: string;
  modelsAndManipulatives?: string;
  questionsToHelp?: string;
  discussionQuestions?: string;
  commonMisconceptions?: string;
  additionalResources?: string;
  standards?: string;
  vocabulary?: string[];
  images?: string[];
  videoUrl?: string;
  tags?: string[];
  // IM Lesson fields
  section?: string;
  lesson?: number;
  lessonName?: string;
  grade?: string;
  learningTargets?: string;
  suggestedTargetSkills?: string[];
  success?: boolean;
  error?: string;
}) {
  return withDbConnection(async () => {
    try {
      // Find existing skill
      const existingSkill = await RoadmapsSkillModel.findOne({
        skillNumber: skillData.skillNumber
      });

      if (existingSkill) {
        // Check if this unit is already in the units array
        const unitExists = existingSkill.units.some(
          (u: any) => u.grade === skillData.unit.grade && u.unitTitle === skillData.unit.unitTitle
        );

        if (!unitExists) {
          // Add the new unit reference using $addToSet
          await RoadmapsSkillModel.findOneAndUpdate(
            { skillNumber: skillData.skillNumber },
            {
              $addToSet: { units: skillData.unit },
              $set: {
                scrapedAt: skillData.scrapedAt,
                updatedAt: new Date().toISOString()
              }
            },
            { new: true }
          );
        }

        return {
          success: true,
          action: 'updated'
        };
      } else {
        // Create new skill with all available fields
        const skill = new RoadmapsSkillModel({
          skillNumber: skillData.skillNumber,
          title: skillData.title,
          url: skillData.url,
          essentialSkills: skillData.essentialSkills,
          helpfulSkills: skillData.helpfulSkills,
          units: [skillData.unit],
          // Content fields
          description: skillData.description || '',
          skillChallengeCriteria: skillData.skillChallengeCriteria || '',
          essentialQuestion: skillData.essentialQuestion || '',
          launch: skillData.launch || '',
          teacherStudentStrategies: skillData.teacherStudentStrategies || '',
          modelsAndManipulatives: skillData.modelsAndManipulatives || '',
          questionsToHelp: skillData.questionsToHelp || '',
          discussionQuestions: skillData.discussionQuestions || '',
          commonMisconceptions: skillData.commonMisconceptions || '',
          additionalResources: skillData.additionalResources || '',
          standards: skillData.standards || '',
          vocabulary: skillData.vocabulary || [],
          images: skillData.images || [],
          videoUrl: skillData.videoUrl,
          tags: skillData.tags || [],
          // IM Lesson fields
          section: skillData.section,
          lesson: skillData.lesson,
          lessonName: skillData.lessonName,
          grade: skillData.grade,
          learningTargets: skillData.learningTargets,
          suggestedTargetSkills: skillData.suggestedTargetSkills || [],
          // Metadata
          scrapedAt: skillData.scrapedAt,
          success: skillData.success !== undefined ? skillData.success : true,
          error: skillData.error,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        await skill.save();

        return {
          success: true,
          action: 'created'
        };
      }
    } catch (error) {
      console.error('💥 Error upserting skill:', error);
      return {
        success: false,
        error: handleServerError(error, 'upsertRoadmapsSkill')
      };
    }
  });
}

/**
 * Update an existing skill's content from scraper (adds practice problems, images, etc.)
 * This is used by the skill scraper to enrich existing skills created by unit scraper
 */
export async function updateRoadmapsSkillContent(skillData: z.infer<typeof RoadmapsSkillInputZodSchema>) {
  return withDbConnection(async () => {
    try {
      console.log(`🔍 [DB] updateRoadmapsSkillContent called for skill ${skillData.skillNumber}`);
      console.log(`🔍 [DB] Input has ${skillData.practiceProblems?.length || 0} practice problems`);

      // Validate input
      const validatedData = RoadmapsSkillInputZodSchema.parse(skillData);
      console.log(`🔍 [DB] After validation: ${validatedData.practiceProblems?.length || 0} practice problems`);

      // Find existing skill by skillNumber
      const existingSkill = await RoadmapsSkillModel.findOne({
        skillNumber: validatedData.skillNumber
      });

      if (existingSkill) {
        console.log(`⚠️ Updating existing skill ${validatedData.skillNumber}:`, validatedData.title);
        console.log(`🔍 [DB] Existing skill has ${existingSkill.practiceProblems?.length || 0} practice problems`);
        console.log(`🔍 [DB] Will update with ${validatedData.practiceProblems?.length || 0} practice problems`);

        // Update with new content, preserving existing relationship arrays
        const updatedSkill = await RoadmapsSkillModel.findByIdAndUpdate(
          existingSkill._id,
          {
            $set: {
              ...validatedData,
              // Preserve existing data from unit scraper
              units: existingSkill.units,
              essentialSkills: existingSkill.essentialSkills,
              helpfulSkills: existingSkill.helpfulSkills,
              updatedAt: new Date().toISOString()
            }
          },
          { new: true, runValidators: true }
        );

        console.log(`🔍 [DB] Updated skill now has ${updatedSkill?.practiceProblems?.length || 0} practice problems`);

        revalidatePath('/roadmaps/skills');
        revalidatePath('/roadmaps/skill-scraper');

        return {
          success: true,
          data: updatedSkill?.toObject(),
          message: `Updated skill ${validatedData.skillNumber}`
        };
      } else {
        console.log(`✨ Creating new skill ${validatedData.skillNumber}:`, validatedData.title);

        // Create new skill (no units since this is from skill scraper, not unit scraper)
        const newSkill = await RoadmapsSkillModel.create({
          ...validatedData,
          units: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        revalidatePath('/roadmaps/skills');
        revalidatePath('/roadmaps/skill-scraper');

        return {
          success: true,
          data: newSkill.toObject(),
          message: `Created new skill ${validatedData.skillNumber}`
        };
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: handleValidationError(error)
        };
      }
      console.error('💥 Error updating skill content:', error);
      return {
        success: false,
        error: handleServerError(error, 'updateRoadmapsSkillContent')
      };
    }
  });
}

/**
 * Bulk update skills content from scraper
 */
export async function bulkUpdateRoadmapsSkillsContent(
  skillsData: z.infer<typeof RoadmapsSkillInputZodSchema>[]
) {
  return withDbConnection(async () => {
    try {
      const results = {
        created: [] as string[],
        updated: [] as string[],
        failed: [] as { skillNumber: string; error: string }[]
      };

      for (const skillData of skillsData) {
        try {
          const validatedData = RoadmapsSkillInputZodSchema.parse(skillData);

          const existingSkill = await RoadmapsSkillModel.findOne({
            skillNumber: validatedData.skillNumber
          });

          if (existingSkill) {
            console.log(`⚠️ Updating existing skill ${validatedData.skillNumber}:`, validatedData.title);

            await RoadmapsSkillModel.findByIdAndUpdate(
              existingSkill._id,
              {
                $set: {
                  ...validatedData,
                  // Preserve existing data from unit scraper
                  units: existingSkill.units,
                  essentialSkills: existingSkill.essentialSkills,
                  helpfulSkills: existingSkill.helpfulSkills,
                  updatedAt: new Date().toISOString()
                }
              },
              { new: true, runValidators: true }
            );

            results.updated.push(validatedData.skillNumber);
          } else {
            console.log(`✨ Creating new skill ${validatedData.skillNumber}:`, validatedData.title);

            await RoadmapsSkillModel.create({
              ...validatedData,
              units: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });

            results.created.push(validatedData.skillNumber);
          }
        } catch (itemError) {
          console.error(`Error processing skill:`, itemError);
          results.failed.push({
            skillNumber: skillData.skillNumber || 'unknown',
            error: itemError instanceof Error ? itemError.message : 'Unknown error'
          });
        }
      }

      revalidatePath('/roadmaps/skills');
      revalidatePath('/roadmaps/skill-scraper');

      return {
        success: true,
        data: results,
        message: `Created: ${results.created.length}, Updated: ${results.updated.length}, Failed: ${results.failed.length}`
      };
    } catch (error) {
      console.error('💥 Error in bulk update:', error);
      return {
        success: false,
        error: handleServerError(error, 'bulkUpdateRoadmapsSkillsContent')
      };
    }
  });
}
