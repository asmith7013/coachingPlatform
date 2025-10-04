"use server";

import { z } from "zod";
import {
  ProcessedLessonZodSchema,
  type ProcessedLesson
} from '../lib/types';
import { claudeClient } from '@/lib/api/integrations/claude/client';
import { handleServerError } from "@error/handlers/server";
import { handleValidationError } from "@error/handlers/validation";

/**
 * Schema for processing a single lesson
 */
const SingleLessonProcessingZodSchema = z.object({
  htmlContent: z.string().min(1, "HTML content is required"),
  lessonMetadata: z.object({
    url: z.string().url(),
    grade: z.string(),
    unit: z.string(),
    lesson: z.string(),
    lessonNumber: z.number().optional()
  })
});

/**
 * Schema for batch processing multiple lessons
 */
const BatchProcessingRequestZodSchema = z.object({
  lessons: z.array(z.object({
    htmlContent: z.string().min(1, "HTML content is required"),
    lessonMetadata: z.object({
      url: z.string().url(),
      grade: z.string(),
      unit: z.string(),
      lesson: z.string(),
      lessonNumber: z.number().optional()
    })
  })).min(1, "At least one lesson is required")
});

/**
 * Response schema for batch processing
 */
const BatchProcessingResponseZodSchema = z.object({
  success: z.boolean(),
  totalRequested: z.number(),
  totalSuccessful: z.number(),
  totalFailed: z.number(),
  processedLessons: z.array(z.object({
    lessonMetadata: z.object({
      url: z.string().url(),
      grade: z.string(),
      unit: z.string(),
      lesson: z.string(),
      lessonNumber: z.number().optional()
    }),
    result: ProcessedLessonZodSchema.optional(),
    success: z.boolean(),
    error: z.string().optional()
  })),
  startTime: z.string(),
  endTime: z.string(),
  duration: z.string()
});

type BatchProcessingResponse = z.infer<typeof BatchProcessingResponseZodSchema>;

/**
 * Server action to process a single lesson's HTML content with Claude
 * Follows the exact pattern from scraper.ts with proper error handling
 */
export async function processSingleLesson(request: unknown) {
  const startTime = new Date().toISOString();
  
  try {
    // Validate request data
    const validatedRequest = SingleLessonProcessingZodSchema.parse(request);
    const { htmlContent, lessonMetadata } = validatedRequest;
    
    console.log('🤖 Processing single lesson with Claude...');
    console.log('📝 Lesson:', lessonMetadata.url);
    
    // Process with Claude
    const processedMarkdown = await claudeClient.processLessonContent(
      htmlContent, 
      lessonMetadata
    );
    
    // Parse the processed content to extract sections
    const processedLesson = parseProcessedMarkdown(processedMarkdown, lessonMetadata);

    console.log('✅ Single lesson processed successfully');
    
    // Validate response structure
    const validatedResponse = ProcessedLessonZodSchema.parse(processedLesson);
    
    return {
      success: true,
      data: validatedResponse
    };
    
  } catch (error) {
    const endTime = new Date().toISOString();
    const _duration = `${Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)}s`;
    
    console.error('Error in processSingleLesson:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: handleValidationError(error)
      };
    }
    
    return {
      success: false,
      error: handleServerError(error, 'processSingleLesson')
    };
  }
}

/**
 * Server action to process multiple lessons with Claude in batch
 * Follows the exact pattern from scraper.ts with proper error handling
 */
export async function processBatchLessons(request: unknown) {
  const startTime = new Date().toISOString();
  
  try {
    // Validate request data
    const validatedRequest = BatchProcessingRequestZodSchema.parse(request);
    const { lessons } = validatedRequest;
    
    console.log('🚀 Starting batch processing with Claude...');
    console.log('📊 Total lessons to process:', lessons.length);
    
    const processedLessons = [];
    
    // Process lessons sequentially to avoid rate limits
    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      console.log(`🤖 Processing lesson ${i + 1}/${lessons.length}: ${lesson.lessonMetadata.url}`);
      
      try {
        // Process with Claude
        const processedMarkdown = await claudeClient.processLessonContent(
          lesson.htmlContent,
          lesson.lessonMetadata
        );
        
        // Parse the processed content
        const processedLesson = parseProcessedMarkdown(processedMarkdown, lesson.lessonMetadata);
        
        processedLessons.push({
          lessonMetadata: lesson.lessonMetadata,
          result: processedLesson,
          success: true,
          error: undefined
        });
        
        console.log(`✅ Lesson ${i + 1} processed successfully`);
        
        // Add delay between requests to avoid rate limits
        if (i < lessons.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (lessonError) {
        console.error(`❌ Failed to process lesson ${i + 1}:`, lessonError);
        
        processedLessons.push({
          lessonMetadata: lesson.lessonMetadata,
          result: undefined,
          success: false,
          error: lessonError instanceof Error ? lessonError.message : 'Unknown error'
        });
      }
    }
    
    const endTime = new Date().toISOString();
    const duration = `${Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)}s`;
    
    // Count successful and failed processing
    const successful = processedLessons.filter(lesson => lesson.success);
    const failed = processedLessons.filter(lesson => !lesson.success);
    
    console.log('📊 Processing Results:');
    console.log(`   ✅ Successful: ${successful.length}`);
    console.log(`   ❌ Failed: ${failed.length}`);
    console.log(`   ⏱️ Duration: ${duration}`);
    
    const response: BatchProcessingResponse = {
      success: true,
      totalRequested: lessons.length,
      totalSuccessful: successful.length,
      totalFailed: failed.length,
      processedLessons,
      startTime,
      endTime,
      duration
    };
    
    // Validate response structure
    const validatedResponse = BatchProcessingResponseZodSchema.parse(response);
    
    return {
      success: true,
      data: validatedResponse
    };
    
  } catch (error) {
    const endTime = new Date().toISOString();
    const _duration = `${Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)}s`;
    
    console.error('Error in processBatchLessons:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: handleValidationError(error)
      };
    }
    
    return {
      success: false,
      error: handleServerError(error, 'processBatchLessons')
    };
  }
}

/**
 * Parse processed markdown from Claude into structured sections
 */
function parseProcessedMarkdown(
  markdown: string, 
  lessonMetadata: {
    url: string;
    grade: string;
    unit: string;
    lesson: string;
    lessonNumber?: number;
  }
): ProcessedLesson {
  const needsReview: string[] = [];
  
  // Extract title (look for ## Lesson [Number])
  const titleMatch = markdown.match(/##\s*Lesson\s*\d+/i);
  const title = titleMatch ? titleMatch[0].trim() : `Lesson ${lessonMetadata.lesson}`;
  
  // Extract lesson URL line
  const urlMatch = markdown.match(/\*\*Lesson URL:\*\*\s*\[([^\]]+)\]\(([^)]+)\)/);
  const lessonUrl = urlMatch ? urlMatch[2] : lessonMetadata.url;
  
  // Extract Canvas section
  const canvasMatch = markdown.match(/\*\*Canvas\*\*:?\s*([\s\S]*?)(?=\*\*Question Text\*\*|$)/i);
  const canvas = canvasMatch ? canvasMatch[1].trim() : '';

  // Extract Question Text section
  const questionMatch = markdown.match(/\*\*Question Text\*\*:?\s*([\s\S]*?)(?=\*\*Acceptance Criteria\*\*|$)/i);
  const questionText = questionMatch ? questionMatch[1].trim() : '';

  // Extract Acceptance Criteria section
  const criteriaMatch = markdown.match(/\*\*Acceptance Criteria\*\*:?\s*([\s\S]*?)$/i);
  const acceptanceCriteria = criteriaMatch ? criteriaMatch[1].trim() : '';
  
  // Check for review flags
  const reviewMatches = markdown.match(/\[NEEDS MANUAL REVIEW[^\]]*\]/g);
  if (reviewMatches) {
    needsReview.push(...reviewMatches);
  }
  
  return {
    title,
    lessonUrl,
    canvas,
    questionText,
    acceptanceCriteria,
    fullMarkdown: markdown,
    needsReview,
    processedAt: new Date().toISOString()
  };
}
