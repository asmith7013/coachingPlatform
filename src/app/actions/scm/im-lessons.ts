"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { RoadmapsLessonModel } from "@mongoose-schema/313/curriculum/roadmap.model";
import { RoadmapsLessonInputZodSchema } from "@zod-schema/scm/curriculum/roadmap";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { handleValidationError } from "@error/handlers/validation";

// =====================================
// CREATE IM LESSON
// =====================================

export async function createIMLesson(lessonData: unknown) {
  return withDbConnection(async () => {
    try {
      // Validate input data
      const validatedData = RoadmapsLessonInputZodSchema.parse(lessonData);
      
      console.log('📚 Creating IM lesson:', validatedData.lessonName);
      
      // Check if lesson with same identifiers already exists
      const existingLesson = await RoadmapsLessonModel.findOne({
        grade: validatedData.grade,
        unit: validatedData.unit,
        section: validatedData.section,
        lesson: validatedData.lesson
      });
      
      if (existingLesson) {
        console.log('⚠️ Lesson with same identifiers already exists, updating instead');
        return updateIMLesson(existingLesson._id.toString(), validatedData);
      }
      
      // Create new lesson
      const lesson = new RoadmapsLessonModel({
        ...validatedData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      const savedLesson = await lesson.save();
      console.log('✅ IM lesson created successfully:', savedLesson._id);
      
      // Revalidate relevant paths
      revalidatePath('/tools/im-lessons');
      
      return {
        success: true,
        data: savedLesson.toObject(),
        message: 'IM lesson saved successfully'
      };
      
    } catch (error) {
      console.error('💥 Error creating IM lesson:', error);
      
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: handleValidationError(error, 'createIMLesson')
        };
      }
      
      return {
        success: false,
        error: handleServerError(error, 'createIMLesson')
      };
    }
  });
}

// =====================================
// FETCH IM LESSONS
// =====================================

export async function fetchIMLessons(params: {
  grade?: string;
  unit?: string;
  section?: string;
  page?: number;
  limit?: number;
  search?: string;
} = {}) {
  return withDbConnection(async () => {
    try {
      const { 
        grade, 
        unit, 
        section, 
        page = 1, 
        limit = 50,
        search
      } = params;
      
      // Build filter
      const filter: Record<string, unknown> = {};
      if (grade) filter.grade = grade;
      if (unit) filter.unit = unit;
      if (section) filter.section = section;
      
      // Add search functionality
      if (search) {
        filter.$or = [
          { lessonName: { $regex: search, $options: 'i' } },
          { learningTargets: { $regex: search, $options: 'i' } },
          { suggestedTargetSkills: { $in: [new RegExp(search, 'i')] } }
        ];
      }
      
      // Execute query with pagination
      const skip = (page - 1) * limit;
      const lessons = await RoadmapsLessonModel
        .find(filter)
        .sort({ grade: 1, unit: 1, section: 1, lesson: 1 })
        .skip(skip)
        .limit(limit)
        .exec();
      
      const total = await RoadmapsLessonModel.countDocuments(filter);
      
      console.log(`📚 Retrieved ${lessons.length} IM lessons`);
      
      return {
        success: true,
        data: {
          items: lessons.map(lesson => lesson.toObject()),
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('💥 Error fetching IM lessons:', error);
      return {
        success: false,
        error: handleServerError(error, 'fetchIMLessons')
      };
    }
  });
}

// =====================================
// UPDATE IM LESSON
// =====================================

export async function updateIMLesson(lessonId: string, updateData: unknown) {
  return withDbConnection(async () => {
    try {
      // Validate update data (partial update allowed)
      const validatedData = RoadmapsLessonInputZodSchema.partial().parse(updateData);
      
      console.log('📝 Updating IM lesson:', lessonId);
      
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
          error: 'IM lesson not found'
        };
      }
      
      console.log('✅ IM lesson updated successfully:', updatedLesson._id);
      
      // Revalidate relevant paths
      revalidatePath('/tools/im-lessons');
      revalidatePath(`/tools/im-lessons/${lessonId}`);
      
      return {
        success: true,
        data: updatedLesson.toObject(),
        message: 'IM lesson updated successfully'
      };
      
    } catch (error) {
      console.error('💥 Error updating IM lesson:', error);
      
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: handleValidationError(error, 'updateIMLesson')
        };
      }
      
      return {
        success: false,
        error: handleServerError(error, 'updateIMLesson')
      };
    }
  });
}

// =====================================
// DELETE IM LESSON
// =====================================

export async function deleteIMLesson(lessonId: string) {
  return withDbConnection(async () => {
    try {
      console.log('🗑️ Deleting IM lesson:', lessonId);
      
      const deletedLesson = await RoadmapsLessonModel.findByIdAndDelete(lessonId);
      
      if (!deletedLesson) {
        return {
          success: false,
          error: 'IM lesson not found'
        };
      }
      
      console.log('✅ IM lesson deleted successfully');
      
      // Revalidate relevant paths
      revalidatePath('/tools/im-lessons');
      
      return {
        success: true,
        message: 'IM lesson deleted successfully'
      };
      
    } catch (error) {
      console.error('💥 Error deleting IM lesson:', error);
      return {
        success: false,
        error: handleServerError(error, 'deleteIMLesson')
      };
    }
  });
}

// =====================================
// BULK IMPORT IM LESSONS
// =====================================

export async function bulkImportIMLessons(lessonsData: unknown) {
  return withDbConnection(async () => {
    try {
      // Validate array of lessons
      const lessonsArray = z.array(RoadmapsLessonInputZodSchema).parse(lessonsData);
      
      console.log('📚 Bulk importing', lessonsArray.length, 'IM lessons');
      
      const results = [];
      const errors = [];
      
      for (const lessonData of lessonsArray) {
        try {
          // Check if lesson already exists
          const existingLesson = await RoadmapsLessonModel.findOne({
            grade: lessonData.grade,
            unit: lessonData.unit,
            section: lessonData.section,
            lesson: lessonData.lesson
          });
          
          if (existingLesson) {
            console.log('⚠️ Updating existing lesson:', lessonData.lessonName);
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
            console.log('✅ Creating new lesson:', lessonData.lessonName);
            const lesson = new RoadmapsLessonModel({
              ...lessonData,
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
          console.error('❌ Error processing lesson:', lessonData.lessonName, lessonError);
          errors.push({
            lessonName: lessonData.lessonName,
            grade: lessonData.grade,
            unit: lessonData.unit,
            section: lessonData.section,
            lesson: lessonData.lesson,
            error: lessonError instanceof Error ? lessonError.message : 'Unknown error'
          });
        }
      }
      
      console.log(`📊 Bulk operation complete: ${results.length} successful, ${errors.length} errors`);
      
      // Revalidate relevant paths
      revalidatePath('/tools/im-lessons');
      
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
      console.error('💥 Error in bulk import IM lessons:', error);
      
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: handleValidationError(error, 'bulkImportIMLessons')
        };
      }
      
      return {
        success: false,
        error: handleServerError(error, 'bulkImportIMLessons')
      };
    }
  });
}

// =====================================
// GET UNIQUE VALUES FOR FILTERS
// =====================================

export async function getIMLessonFilterOptions() {
  return withDbConnection(async () => {
    try {
      const [grades, units, sections] = await Promise.all([
        RoadmapsLessonModel.distinct('grade'),
        RoadmapsLessonModel.distinct('unit'),
        RoadmapsLessonModel.distinct('section')
      ]);
      
      return {
        success: true,
        data: {
          grades: grades.sort(),
          units: units.sort(),
          sections: sections.sort()
        }
      };
    } catch (error) {
      console.error('💥 Error getting filter options:', error);
      return {
        success: false,
        error: handleServerError(error, 'getIMLessonFilterOptions')
      };
    }
  });
}
