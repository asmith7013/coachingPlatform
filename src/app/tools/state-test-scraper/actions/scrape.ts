'use server';

import { withDbConnection } from '@server/db/ensure-connection';
import { handleServerError } from '@error/handlers/server';
import { StateTestScraper } from '../lib/scraper';
import { StateTestQuestionModel } from '@mongoose-schema/scm/state-test-question.model';
import type { StateTestQuestion } from '../lib/types';

export interface ScrapeResult {
  success: boolean;
  count?: number;
  error?: string;
  questions?: StateTestQuestion[];
}

export async function scrapeStateTestPage(
  url: string,
  grade: string,
  examYear: string,
  examTitle: string
): Promise<ScrapeResult> {
  const email = process.env.PROBLEM_ATTIC_EMAIL;
  const password = process.env.PROBLEM_ATTIC_PASSWORD;

  if (!email || !password) {
    return {
      success: false,
      error: 'Missing PROBLEM_ATTIC_EMAIL or PROBLEM_ATTIC_PASSWORD environment variables',
    };
  }

  if (!grade || !['6', '7', '8', 'alg1'].includes(grade)) {
    return {
      success: false,
      error: 'Grade must be 6, 7, 8, or alg1',
    };
  }

  const scraper = new StateTestScraper({
    email,
    password,
    headless: true,
  });

  try {
    await scraper.initialize();
    await scraper.login();
    const questions = await scraper.scrapePage(url, grade, examYear, examTitle);

    // Save to database
    await withDbConnection(async () => {
      for (const question of questions) {
        await StateTestQuestionModel.findOneAndUpdate(
          { questionId: question.questionId },
          question,
          { upsert: true, new: true }
        );
      }
    });

    return {
      success: true,
      count: questions.length,
      questions,
    };
  } catch (error) {
    return {
      success: false,
      error: handleServerError(error, 'Failed to scrape state test questions'),
    };
  } finally {
    await scraper.close();
  }
}

export async function getStateTestQuestions(filters?: {
  grade?: string;
  examYear?: string;
  standard?: string;
}): Promise<{ success: boolean; questions?: StateTestQuestion[]; error?: string }> {
  return withDbConnection(async () => {
    try {
      const query: Record<string, string> = {};
      if (filters?.grade) query.grade = filters.grade;
      if (filters?.examYear) query.examYear = filters.examYear;
      if (filters?.standard) query.standard = filters.standard;

      const questions = await StateTestQuestionModel.find(query)
        .sort({ pageIndex: 1 })
        .lean();

      // Convert to plain objects for client serialization
      const serializedQuestions: StateTestQuestion[] = questions.map((q) => ({
        questionId: q.questionId,
        standard: q.standard,
        secondaryStandard: q.secondaryStandard || undefined,
        examYear: q.examYear,
        examTitle: q.examTitle,
        grade: q.grade,
        screenshotUrl: q.screenshotUrl,
        questionType: q.questionType,
        responseType: q.responseType || undefined,
        points: q.points || undefined,
        answer: q.answer || undefined,
        questionNumber: q.questionNumber || undefined,
        sourceUrl: q.sourceUrl,
        scrapedAt: q.scrapedAt instanceof Date ? q.scrapedAt.toISOString() : String(q.scrapedAt),
        pageIndex: q.pageIndex,
      }));

      return {
        success: true,
        questions: serializedQuestions,
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, 'Failed to get state test questions'),
      };
    }
  });
}

/**
 * Update a single state test question
 */
export async function updateStateTestQuestion(
  questionId: string,
  updates: {
    secondaryStandard?: string;
    responseType?: 'multipleChoice' | 'constructedResponse';
    points?: number;
    answer?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  return withDbConnection(async () => {
    try {
      const result = await StateTestQuestionModel.findOneAndUpdate(
        { questionId },
        { $set: updates },
        { new: true }
      );

      if (!result) {
        return {
          success: false,
          error: `Question ${questionId} not found`,
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, 'Failed to update state test question'),
      };
    }
  });
}

/**
 * Bulk update multiple state test questions
 */
export async function bulkUpdateStateTestQuestions(
  updates: Array<{
    questionId: string;
    secondaryStandard?: string;
    responseType?: 'multipleChoice' | 'constructedResponse';
    points?: number;
    answer?: string;
    questionNumber?: number;
  }>
): Promise<{ success: boolean; updatedCount: number; errors: string[] }> {
  return withDbConnection(async () => {
    const errors: string[] = [];
    let updatedCount = 0;

    for (const update of updates) {
      try {
        const { questionId, ...fields } = update;
        // Only update if there are actual fields to update
        const updateFields: Record<string, unknown> = {};
        if (fields.secondaryStandard !== undefined) updateFields.secondaryStandard = fields.secondaryStandard;
        if (fields.responseType !== undefined) updateFields.responseType = fields.responseType;
        if (fields.points !== undefined) updateFields.points = fields.points;
        if (fields.answer !== undefined) updateFields.answer = fields.answer;
        if (fields.questionNumber !== undefined) updateFields.questionNumber = fields.questionNumber;

        if (Object.keys(updateFields).length === 0) continue;

        const result = await StateTestQuestionModel.findOneAndUpdate(
          { questionId },
          { $set: updateFields },
          { new: true }
        );

        if (result) {
          updatedCount++;
        } else {
          errors.push(`Question ${questionId} not found`);
        }
      } catch (error) {
        errors.push(`Failed to update ${update.questionId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      success: errors.length === 0,
      updatedCount,
      errors,
    };
  });
}

export async function getStateTestStats(): Promise<{
  success: boolean;
  stats?: {
    total: number;
    byGrade: Record<string, number>;
    byYear: Record<string, number>;
  };
  error?: string;
}> {
  return withDbConnection(async () => {
    try {
      const [total, byGrade, byYear] = await Promise.all([
        StateTestQuestionModel.countDocuments(),
        StateTestQuestionModel.aggregate([
          { $group: { _id: '$grade', count: { $sum: 1 } } },
        ]),
        StateTestQuestionModel.aggregate([
          { $group: { _id: '$examYear', count: { $sum: 1 } } },
        ]),
      ]);

      const toRecord = (arr: { _id: string; count: number }[]) =>
        Object.fromEntries(arr.map((item) => [item._id, item.count]));

      return {
        success: true,
        stats: {
          total,
          byGrade: toRecord(byGrade),
          byYear: toRecord(byYear),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, 'Failed to get state test stats'),
      };
    }
  });
}
