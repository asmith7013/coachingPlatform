"use server";

import { z, ZodType } from "zod";
import { revalidatePath } from "next/cache";
import { RoadmapsSkillModel } from "@mongoose-schema/scm/roadmaps/roadmap-skill.model";
import {
  RoadmapsSkillZodSchema,
  RoadmapsSkillInputZodSchema,
  RoadmapsSkill,
  RoadmapsSkillInput
} from "@zod-schema/scm/roadmaps/roadmap-skill";
import { createCrudActions } from "@server/crud/crud-factory";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { handleValidationError } from "@error/handlers/validation";

// =====================================
// CRUD OPERATIONS (using factory)
// =====================================

const roadmapsSkillCrud = createCrudActions({
  model: RoadmapsSkillModel,
  schema: RoadmapsSkillZodSchema as ZodType<RoadmapsSkill>,
  inputSchema: RoadmapsSkillInputZodSchema as ZodType<RoadmapsSkillInput>,
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
        const units = existingSkill.get('units') as unknown as Array<{grade: string, unitTitle: string, unitNumber: number}>;
        const unitExists = units.some(
          (u) => u.grade === skillData.unit.grade && u.unitTitle === skillData.unit.unitTitle
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
      const practiceProblemsInput = skillData.practiceProblems as Array<{problemNumber: number, screenshotUrl: string, scrapedAt: string}> | undefined;
      console.log(`🔍 [DB] Input has ${practiceProblemsInput?.length || 0} practice problems`);

      // Validate input
      const validatedData = RoadmapsSkillInputZodSchema.parse(skillData);
      const practiceProblemsValidated = validatedData.practiceProblems as Array<{problemNumber: number, screenshotUrl: string, scrapedAt: string}> | undefined;
      console.log(`🔍 [DB] After validation: ${practiceProblemsValidated?.length || 0} practice problems`);

      // Find existing skill by skillNumber
      const existingSkill = await RoadmapsSkillModel.findOne({
        skillNumber: validatedData.skillNumber
      });

      if (existingSkill) {
        // Update with new content, preserving existing relationship arrays
        const updatedSkill = await RoadmapsSkillModel.findByIdAndUpdate(
          existingSkill._id,
          {
            $set: {
              ...validatedData,
              // Preserve existing data from unit scraper
              units: existingSkill.get('units'),
              essentialSkills: existingSkill.get('essentialSkills'),
              helpfulSkills: existingSkill.get('helpfulSkills'),
              updatedAt: new Date().toISOString()
            }
          },
          { new: true, runValidators: true }
        );

        const updatedPracticeProblems = updatedSkill?.get('practiceProblems') as Array<{problemNumber: number, screenshotUrl: string, scrapedAt: string}> | undefined;
        console.log(`🔍 [DB] Updated skill now has ${updatedPracticeProblems?.length || 0} practice problems`);

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
 * Add IM lesson to a skill's imLessons array
 */
export async function addImLessonToSkill(data: {
  skillNumber: string;
  grade?: string;
  unitNumber: number;
  lessonNumber: number;
  lessonName?: string;
}) {
  return withDbConnection(async () => {
    try {
      // Find existing skill by skillNumber
      const existingSkill = await RoadmapsSkillModel.findOne({
        skillNumber: data.skillNumber
      });

      if (!existingSkill) {
        return {
          success: false,
          error: `Skill ${data.skillNumber} not found`
        };
      }

      // Check if this IM lesson already exists
      const imLessons = existingSkill.get('imLessons') as unknown as Array<{unitNumber: number, lessonNumber: number, lessonName?: string, grade?: string}> | undefined;
      const existingLessonIndex = imLessons?.findIndex(
        (lesson) =>
          lesson.unitNumber === data.unitNumber &&
          lesson.lessonNumber === data.lessonNumber
      );

      // Case 1: Lesson exists and has grade matching the new grade
      if (existingLessonIndex !== undefined && existingLessonIndex !== -1 && imLessons) {
        const existingLesson = imLessons[existingLessonIndex];

        // If existing lesson has grade and matches our grade, skip
        if (existingLesson.grade && data.grade && existingLesson.grade === data.grade) {
          return {
            success: true,
            message: `IM Lesson already exists for skill ${data.skillNumber} (${data.grade})`,
            action: 'skipped'
          };
        }

        // If existing lesson has NO grade but we have one, update it
        if (!existingLesson.grade && data.grade) {
          await RoadmapsSkillModel.findOneAndUpdate(
            {
              _id: existingSkill._id,
              'imLessons.unitNumber': data.unitNumber,
              'imLessons.lessonNumber': data.lessonNumber
            },
            {
              $set: {
                'imLessons.$.grade': data.grade,
                'imLessons.$.lessonName': data.lessonName || existingLesson.lessonName,
                updatedAt: new Date().toISOString()
              }
            },
            { new: true }
          );

          revalidatePath('/roadmaps/skills');

          return {
            success: true,
            message: `Updated IM Lesson with grade for skill ${data.skillNumber} (${data.grade})`,
            action: 'updated'
          };
        }

        // If existing lesson has different grade, this is a new entry for different grade
        if (existingLesson.grade && data.grade && existingLesson.grade !== data.grade) {
          // Add as new entry
          const updatedSkill = await RoadmapsSkillModel.findByIdAndUpdate(
            existingSkill._id,
            {
              $addToSet: {
                imLessons: {
                  grade: data.grade,
                  unitNumber: data.unitNumber,
                  lessonNumber: data.lessonNumber,
                  lessonName: data.lessonName
                }
              },
              $set: {
                updatedAt: new Date().toISOString()
              }
            },
            { new: true }
          );

          revalidatePath('/roadmaps/skills');

          return {
            success: true,
            message: `Added IM Lesson for different grade to skill ${data.skillNumber} (${data.grade})`,
            action: 'updated',
            data: updatedSkill?.toObject()
          };
        }

        // If no grade provided and lesson exists, skip
        return {
          success: true,
          message: `IM Lesson already exists for skill ${data.skillNumber}`,
          action: 'skipped'
        };
      }

      // Case 2: Lesson doesn't exist at all, add it
      const updatedSkill = await RoadmapsSkillModel.findByIdAndUpdate(
        existingSkill._id,
        {
          $addToSet: {
            imLessons: {
              grade: data.grade,
              unitNumber: data.unitNumber,
              lessonNumber: data.lessonNumber,
              lessonName: data.lessonName
            }
          },
          $set: {
            updatedAt: new Date().toISOString()
          }
        },
        { new: true }
      );

      revalidatePath('/roadmaps/skills');

      return {
        success: true,
        message: `Added IM Lesson to skill ${data.skillNumber}${data.grade ? ` (${data.grade})` : ''}`,
        action: 'updated',
        data: updatedSkill?.toObject()
      };
    } catch (error) {
      console.error('💥 Error adding IM lesson to skill:', error);
      return {
        success: false,
        error: handleServerError(error, 'addImLessonToSkill')
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
                  units: existingSkill.get('units'),
                  essentialSkills: existingSkill.get('essentialSkills'),
                  helpfulSkills: existingSkill.get('helpfulSkills'),
                  updatedAt: new Date().toISOString()
                }
              },
              { new: true, runValidators: true }
            );

            results.updated.push(validatedData.skillNumber as string);
          } else {
            console.log(`✨ Creating new skill ${validatedData.skillNumber}:`, validatedData.title);

            await RoadmapsSkillModel.create({
              ...validatedData,
              units: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });

            results.created.push(validatedData.skillNumber as string);
          }
        } catch (itemError) {
          console.error(`Error processing skill:`, itemError);
          results.failed.push({
            skillNumber: skillData.skillNumber as string || 'unknown',
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
