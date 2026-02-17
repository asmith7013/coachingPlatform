"use server";

import { put } from "@vercel/blob";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { StateTestQuestionModel } from "@mongoose-schema/scm/state-test-question.model";
import type { StateTestQuestion } from "../lib/types";

export async function getExamTitlesForGrade(
  grade: string,
): Promise<{ success: boolean; examTitles?: string[]; error?: string }> {
  return withDbConnection(async () => {
    try {
      const titles = await StateTestQuestionModel.distinct("examTitle", {
        grade,
      });
      return { success: true, examTitles: (titles as string[]).sort() };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to get exam titles"),
      };
    }
  });
}

export async function getQuestionsForExam(
  grade: string,
  examTitle: string,
): Promise<{
  success: boolean;
  questions?: StateTestQuestion[];
  error?: string;
}> {
  return withDbConnection(async () => {
    try {
      const questions = await StateTestQuestionModel.find({ grade, examTitle })
        .sort({ pageIndex: 1 })
        .lean();

      const serialized: StateTestQuestion[] = questions.map((q) => ({
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
        scrapedAt:
          q.scrapedAt instanceof Date
            ? q.scrapedAt.toISOString()
            : String(q.scrapedAt),
        pageIndex: q.pageIndex,
      }));

      return { success: true, questions: serialized };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to get questions for exam"),
      };
    }
  });
}

export async function saveCroppedScreenshot(
  questionId: string,
  imageBase64: string,
  grade: string,
  examYear: string,
): Promise<{ success: boolean; newUrl?: string; error?: string }> {
  console.log(
    `[crop] saveCroppedScreenshot: questionId=${questionId}, grade=${grade}, examYear=${examYear}, base64Length=${imageBase64?.length ?? 0}`,
  );

  if (!imageBase64 || imageBase64.length === 0) {
    return { success: false, error: "Empty image data" };
  }

  // Retry once on failure (handles stale MongoDB connection on first call)
  for (let attempt = 1; attempt <= 2; attempt++) {
    const result = await withDbConnection(async () => {
      try {
        const imageBuffer = Buffer.from(imageBase64, "base64");

        // Include timestamp in path so each save produces a unique URL.
        // Vercel Blob CDN caches at the path level (ignoring query params)
        // with a default TTL of 1 month, so overwriting the same path
        // causes the CDN to serve stale content.
        const timestamp = Date.now();
        const blobPath = `state-test-questions/${examYear}/grade-${grade}/${questionId}-${timestamp}.png`;
        console.log(
          `[crop] Attempt ${attempt}: uploading to ${blobPath} (${imageBuffer.length} bytes)`,
        );
        const blob = await put(blobPath, imageBuffer, {
          access: "public",
          contentType: "image/png",
          cacheControlMaxAge: 60,
        });
        console.log(`[crop] Blob uploaded: ${blob.url}`);

        const updateResult = await StateTestQuestionModel.findOneAndUpdate(
          { questionId },
          { $set: { screenshotUrl: blob.url } },
          { new: true },
        );

        if (!updateResult) {
          console.warn(`[crop] No document found for questionId=${questionId}`);
          return {
            success: false,
            error: `No document found with questionId=${questionId}`,
          };
        }

        console.log(`[crop] Saved ${questionId} successfully`);
        return { success: true, newUrl: blob.url };
      } catch (error) {
        console.error(
          `[crop] Attempt ${attempt} failed for ${questionId}:`,
          error,
        );
        return {
          success: false,
          error: handleServerError(
            error,
            `Failed to save cropped screenshot for ${questionId}`,
          ),
        };
      }
    });

    if (result.success || attempt === 2) {
      return result;
    }

    console.log(`[crop] Retrying ${questionId} after first failure...`);
  }

  // Unreachable, but TypeScript needs it
  return { success: false, error: "Unexpected: exhausted retries" };
}
