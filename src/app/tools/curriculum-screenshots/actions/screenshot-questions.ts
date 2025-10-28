"use server";

import { z } from "zod";
import { htmlToPng } from "../lib/htmlToPng";
import { handleServerError } from "@error/handlers/server";
import { handleValidationError } from "@error/handlers/validation";
import path from "path";
import fs from "fs/promises";

/**
 * Schema for assessment problem from IM API
 */
const AssessmentProblemSchema = z.object({
  ordinal_title: z.string(),
  slug: z.string(),
  index: z.number(),
  narrative: z.string().optional(),
  statement: z.string(),
  problem_response: z.any(),
  responding_to_student_thinking: z.array(z.any()),
  ancillary_content: z.any(),
  external_notes: z.array(z.any()),
  references: z.array(z.any()),
  standards: z.any(),
});

/**
 * Schema for curriculum API data
 */
const CurriculumDataSchema = z.object({
  data: z.object({
    id: z.number(),
    slug: z.string(),
    category: z.string(),
    title: z.string(),
    version: z.string().optional(),
    ancestors: z.any(),
    student_instructions: z.string().optional(),
    teacher_instructions: z.string().optional(),
    assessment_problems: z.array(AssessmentProblemSchema),
  }),
});

/**
 * Schema for curriculum screenshot request
 */
const CurriculumScreenshotRequestSchema = z.object({
  curriculumData: CurriculumDataSchema,
  prefix: z.string().optional().default("problem"),
});

/**
 * Schema for individual screenshot result
 */
const QuestionScreenshotResultSchema = z.object({
  questionId: z.string(),
  questionTitle: z.string(),
  success: z.boolean(),
  screenshotPath: z.string().optional(),
  error: z.string().optional(),
  processedAt: z.string(),
});

/**
 * Schema for curriculum screenshot response
 */
const CurriculumScreenshotResponseSchema = z.object({
  success: z.boolean(),
  totalRequested: z.number(),
  totalSuccessful: z.number(),
  totalFailed: z.number(),
  results: z.array(QuestionScreenshotResultSchema),
  errors: z.array(z.string()),
  assessmentTitle: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  duration: z.string(),
});

export type AssessmentProblem = z.infer<typeof AssessmentProblemSchema>;
export type CurriculumData = z.infer<typeof CurriculumDataSchema>;
export type CurriculumScreenshotRequest = z.infer<typeof CurriculumScreenshotRequestSchema>;
export type QuestionScreenshotResult = z.infer<typeof QuestionScreenshotResultSchema>;
export type CurriculumScreenshotResponse = z.infer<typeof CurriculumScreenshotResponseSchema>;

/**
 * Server action to screenshot questions from curriculum API output
 */
export async function screenshotCurriculumQuestions(request: unknown) {
  const startTime = new Date().toISOString();

  try {
    // Validate request data
    const validatedRequest = CurriculumScreenshotRequestSchema.parse(request);
    const { curriculumData, prefix } = validatedRequest;
    const problems = curriculumData.data.assessment_problems;

    console.log('📸 Starting curriculum question screenshot generation...');
    console.log(`   Assessment: ${curriculumData.data.title}`);
    console.log(`   Problems: ${problems.length}`);

    // Ensure screenshots directory exists
    const screenshotDir = path.join(process.cwd(), "public", "screenshots");
    await fs.mkdir(screenshotDir, { recursive: true });

    const results: QuestionScreenshotResult[] = [];
    const timestamp = Date.now();

    // Process each problem
    for (let i = 0; i < problems.length; i++) {
      const problem = problems[i];
      const questionId = problem.slug;
      const questionTitle = problem.ordinal_title;

      try {
        console.log(`📝 Processing ${questionTitle} (${i + 1}/${problems.length})...`);

        // Generate filename
        const filename = `${prefix}-${questionId}-${timestamp}.png`;
        const outputPath = path.join(screenshotDir, filename);

        // Convert HTML statement to PNG
        await htmlToPng(problem.statement, outputPath);

        console.log(`✅ Screenshot saved: ${filename}`);

        results.push({
          questionId,
          questionTitle,
          success: true,
          screenshotPath: filename,
          processedAt: new Date().toISOString(),
        });

      } catch (error) {
        console.error(`❌ Failed to screenshot ${questionTitle}:`, error);

        results.push({
          questionId,
          questionTitle,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          processedAt: new Date().toISOString(),
        });
      }
    }

    const endTime = new Date().toISOString();
    const duration = `${Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)}s`;

    // Count successful and failed screenshots
    const successful = results.filter(result => result.success);
    const failed = results.filter(result => !result.success);

    console.log('📊 Screenshot Results:');
    console.log(`   ✅ Successful: ${successful.length}`);
    console.log(`   ❌ Failed: ${failed.length}`);

    const response: CurriculumScreenshotResponse = {
      success: true,
      totalRequested: problems.length,
      totalSuccessful: successful.length,
      totalFailed: failed.length,
      results,
      errors: failed.map(result => result.error).filter(Boolean) as string[],
      assessmentTitle: curriculumData.data.title,
      startTime,
      endTime,
      duration,
    };

    // Validate response structure
    const validatedResponse = CurriculumScreenshotResponseSchema.parse(response);

    return {
      success: true,
      data: validatedResponse,
    };

  } catch (error) {
    const endTime = new Date().toISOString();
    const _duration = `${Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)}s`;

    console.error('Error in screenshotCurriculumQuestions:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: handleValidationError(error),
      };
    }

    return {
      success: false,
      error: handleServerError(error, 'screenshotCurriculumQuestions'),
    };
  }
}
