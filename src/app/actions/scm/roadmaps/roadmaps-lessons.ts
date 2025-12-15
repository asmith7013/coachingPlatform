"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { RoadmapsLessonModel } from "@mongoose-schema/scm/roadmaps/roadmap.model";
import { RoadmapsLessonInputZodSchema } from "@zod-schema/scm/roadmaps/roadmap";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { handleValidationError } from "@error/handlers/validation";

// =====================================
// CREATE ROADMAPS LESSON
// =====================================

export async function createRoadmapsLesson(lessonData: unknown) {
  return withDbConnection(async () => {
    try {
      // Validate input data
      const validatedData = RoadmapsLessonInputZodSchema.parse(lessonData);
      
      console.log('📚 Creating Roadmaps lesson:', validatedData.title);
      console.log('🔍 Skill Number:', validatedData.skillNumber);

      // Check if skill with this skillNumber already exists (skills are unique by skillNumber)
      if (validatedData.skillNumber) {
        const existingLesson = await RoadmapsLessonModel.findOne({ skillNumber: validatedData.skillNumber });
        if (existingLesson) {
          console.log(`⚠️ Skill ${validatedData.skillNumber} already exists, updating instead`);
          return updateRoadmapsLesson(existingLesson._id.toString(), validatedData);
        }
      }
      
      // Create new lesson
      const lesson = new RoadmapsLessonModel({
        ...validatedData,
        skillNumber: validatedData.skillNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      const savedLesson = await lesson.save();
      console.log('✅ Roadmaps lesson created successfully:', savedLesson._id);
      
      // Revalidate relevant paths
      revalidatePath('/313/roadmaps');
      
      return {
        success: true,
        data: savedLesson.toObject(),
        message: 'Roadmaps lesson saved successfully'
      };
      
    } catch (error) {
      console.error('💥 Error creating Roadmaps lesson:', error);
      
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: handleValidationError(error, 'createRoadmapsLesson')
        };
      }
      
      return {
        success: false,
        error: handleServerError(error, 'createRoadmapsLesson')
      };
    }
  });
}

// =====================================
// BULK CREATE ROADMAPS LESSONS
// =====================================

export async function bulkCreateRoadmapsLessons(lessonsData: unknown) {
  return withDbConnection(async () => {
    try {
      // Validate array of lessons
      const lessonsArray = z.array(RoadmapsLessonInputZodSchema).parse(lessonsData);
      
      console.log('📚 Bulk creating', lessonsArray.length, 'Roadmaps lessons');
      
      const results = [];
      const errors = [];
      
      for (const lessonData of lessonsArray) {
        try {
          // Check if skill with this skillNumber already exists
          const existingLesson = lessonData.skillNumber
            ? await RoadmapsLessonModel.findOne({ skillNumber: lessonData.skillNumber })
            : null;

          if (existingLesson) {
            console.log(`⚠️ Updating existing skill ${lessonData.skillNumber}:`, lessonData.title);
            const updateResult = await RoadmapsLessonModel.findByIdAndUpdate(
              existingLesson._id,
              {
                ...lessonData,
                updatedAt: new Date().toISOString()
              },
              { new: true, runValidators: true }
            );
            
            if (updateResult) {
              results.push({
                action: 'updated',
                lesson: updateResult.toObject()
              });
            }
          } else {
            console.log('✅ Creating new lesson:', lessonData.title);
            const lesson = new RoadmapsLessonModel({
              ...lessonData,
              skillNumber: lessonData.skillNumber,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
            
            const savedLesson = await lesson.save();
            results.push({
              action: 'created',
              lesson: savedLesson.toObject()
            });
          }
        } catch (lessonError) {
          console.error('❌ Error processing lesson:', lessonData.url, lessonError);
          errors.push({
            url: lessonData.url,
            title: lessonData.title,
            error: lessonError instanceof Error ? lessonError.message : 'Unknown error'
          });
        }
      }
      
      console.log(`📊 Bulk operation complete: ${results.length} successful, ${errors.length} errors`);
      
      // Revalidate relevant paths
      revalidatePath('/313/roadmaps');
      
      return {
        success: true,
        data: {
          totalProcessed: lessonsArray.length,
          successful: results.length,
          failed: errors.length,
          results,
          errors
        },
        message: `Processed ${lessonsArray.length} lessons: ${results.length} successful, ${errors.length} failed`
      };
      
    } catch (error) {
      console.error('💥 Error in bulk create Roadmaps lessons:', error);
      
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: handleValidationError(error, 'bulkCreateRoadmapsLessons')
        };
      }
      
      return {
        success: false,
        error: handleServerError(error, 'bulkCreateRoadmapsLessons')
      };
    }
  });
}

// =====================================
// UPDATE ROADMAPS LESSON
// =====================================

export async function updateRoadmapsLesson(lessonId: string, updateData: unknown) {
  return withDbConnection(async () => {
    try {
      // Validate update data (partial update allowed)
      const validatedData = RoadmapsLessonInputZodSchema.partial().parse(updateData);
      
      console.log('📝 Updating Roadmaps lesson:', lessonId);
      
      const updatedLesson = await RoadmapsLessonModel.findByIdAndUpdate(
        lessonId,
        {
          ...validatedData,
          updatedAt: new Date().toISOString()
        },
        { new: true, runValidators: true }
      );
      
      if (!updatedLesson) {
        return {
          success: false,
          error: 'Roadmaps lesson not found'
        };
      }
      
      console.log('✅ Roadmaps lesson updated successfully:', updatedLesson._id);
      
      // Revalidate relevant paths
      revalidatePath('/313/roadmaps');
      revalidatePath(`/313/roadmaps/${lessonId}`);
      
      return {
        success: true,
        data: updatedLesson.toObject(),
        message: 'Roadmaps lesson updated successfully'
      };
      
    } catch (error) {
      console.error('💥 Error updating Roadmaps lesson:', error);
      
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: handleValidationError(error, 'updateRoadmapsLesson')
        };
      }
      
      return {
        success: false,
        error: handleServerError(error, 'updateRoadmapsLesson')
      };
    }
  });
}

// =====================================
// GET ROADMAPS LESSONS
// =====================================

export async function getRoadmapsLessons(options: {
  search?: string;
  successOnly?: boolean;
  limit?: number;
} = {}) {
  return withDbConnection(async () => {
    try {
      const {
        search,
        successOnly = true,
        limit = 100
      } = options;
      
      const query: Record<string, unknown> = {};
      
      // Apply filters
      if (successOnly) {
        query.success = true;
      }
      
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { vocabulary: { $in: [new RegExp(search, 'i')] } }
        ];
      }
      
      const lessons = await RoadmapsLessonModel
        .find(query)
        .sort({ scrapedAt: -1 })
        .limit(limit)
        .exec();
      
      console.log(`📚 Retrieved ${lessons.length} Roadmaps lessons`);
      
      return {
        success: true,
        data: lessons.map(lesson => lesson.toObject()),
        count: lessons.length
      };
      
    } catch (error) {
      console.error('💥 Error getting Roadmaps lessons:', error);
      return {
        success: false,
        error: handleServerError(error, 'getRoadmapsLessons')
      };
    }
  });
}

// =====================================
// DELETE ROADMAPS LESSON
// =====================================

export async function deleteRoadmapsLesson(lessonId: string) {
  return withDbConnection(async () => {
    try {
      console.log('🗑️ Deleting Roadmaps lesson:', lessonId);
      
      const deletedLesson = await RoadmapsLessonModel.findByIdAndDelete(lessonId);
      
      if (!deletedLesson) {
        return {
          success: false,
          error: 'Roadmaps lesson not found'
        };
      }
      
      console.log('✅ Roadmaps lesson deleted successfully');
      
      // Revalidate relevant paths
      revalidatePath('/313/roadmaps');
      
      return {
        success: true,
        message: 'Roadmaps lesson deleted successfully'
      };
      
    } catch (error) {
      console.error('💥 Error deleting Roadmaps lesson:', error);
      return {
        success: false,
        error: handleServerError(error, 'deleteRoadmapsLesson')
      };
    }
  });
}
