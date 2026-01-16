'use server';

import { put } from '@vercel/blob';
import { withDbConnection } from '@server/db/ensure-connection';
import { StateTestQuestionModel } from '@mongoose-schema/scm/state-test-question.model';
import * as fs from 'fs/promises';
import * as path from 'path';

interface ReplaceResult {
  success: boolean;
  replaced: number;
  total: number;
  errors: string[];
}

export type YearResult = {
  grade6: ReplaceResult;
  grade7: ReplaceResult;
  grade8: ReplaceResult;
};

/**
 * Replace state test screenshots for a specific year with new images from local folders.
 * Files are matched to questions by sorting both by timestamp (files) and pageIndex (questions).
 */
export async function replaceScreenshotsForYear(year: string): Promise<YearResult> {
  const basePath = '/Users/alexsmith/Documents/state-exam';

  const grade6 = await replaceScreenshotsForGrade(path.join(basePath, `${year} 6`), '6', year);
  const grade7 = await replaceScreenshotsForGrade(path.join(basePath, `${year} 7`), '7', year);
  const grade8 = await replaceScreenshotsForGrade(path.join(basePath, `${year} 8`), '8', year);

  return { grade6, grade7, grade8 };
}

/**
 * Replace all state test screenshots for 2023, 2024, and 2025.
 */
export async function replaceAllScreenshots(): Promise<{
  '2023': YearResult;
  '2024': YearResult;
  '2025': YearResult;
}> {
  const result2023 = await replaceScreenshotsForYear('2023');
  const result2024 = await replaceScreenshotsForYear('2024');
  const result2025 = await replaceScreenshotsForYear('2025');

  return {
    '2023': result2023,
    '2024': result2024,
    '2025': result2025,
  };
}

async function replaceScreenshotsForGrade(
  folderPath: string,
  grade: string,
  year: string
): Promise<ReplaceResult> {
  const errors: string[] = [];
  let replaced = 0;

  try {
    return await withDbConnection(async () => {
      // 1. Get all PNG files sorted by modification time (oldest first)
      console.log(`\n📂 Reading files from: ${folderPath}`);
      let files: string[];
      try {
        files = await fs.readdir(folderPath);
      } catch (err) {
        const error = `Failed to read folder ${folderPath}: ${err instanceof Error ? err.message : 'Unknown error'}`;
        console.error(`❌ ${error}`);
        return { success: false, replaced: 0, total: 0, errors: [error] };
      }
      const pngFiles = files.filter((f) => f.toLowerCase().endsWith('.png'));

    const fileStats = await Promise.all(
      pngFiles.map(async (f) => ({
        name: f,
        mtime: (await fs.stat(path.join(folderPath, f))).mtime,
      }))
    );

    // Sort by modification time, oldest first (first screenshot = first question)
    fileStats.sort((a, b) => a.mtime.getTime() - b.mtime.getTime());
    const sortedFiles = fileStats.map((f) => f.name);

    console.log(`📊 Found ${sortedFiles.length} PNG files`);

    // 2. Get questions from MongoDB sorted by pageIndex
    console.log(`🔍 Querying MongoDB for grade ${grade}, year ${year}...`);
    const questions = await StateTestQuestionModel.find({ grade, examYear: year })
      .sort({ pageIndex: 1 })
      .lean();

    console.log(`📊 Found ${questions.length} questions in database`);

    // 3. Verify counts match
    if (sortedFiles.length !== questions.length) {
      const error = `Count mismatch: ${sortedFiles.length} files vs ${questions.length} questions`;
      console.error(`❌ ${error}`);
      return {
        success: false,
        replaced: 0,
        total: questions.length,
        errors: [error],
      };
    }

    console.log(`✅ Counts match! Starting upload...\n`);

    // 4. Upload each file to Vercel Blob
    for (let i = 0; i < sortedFiles.length; i++) {
      const file = sortedFiles[i];
      const question = questions[i];

      try {
        const filePath = path.join(folderPath, file);
        const fileBuffer = await fs.readFile(filePath);

        const blobPath = `state-test-questions/${year}/grade-${grade}/${question.questionId}.png`;

        await put(blobPath, fileBuffer, {
          access: 'public',
          contentType: 'image/png',
          allowOverwrite: true,
        });

        replaced++;
        console.log(
          `✓ [${i + 1}/${sortedFiles.length}] Uploaded: ${question.questionId} (pageIndex: ${question.pageIndex})`
        );
      } catch (error) {
        const errorMsg = `Failed to upload ${file} for question ${question.questionId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`✗ [${i + 1}/${sortedFiles.length}] ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    console.log(`\n📈 Grade ${grade} complete: ${replaced}/${sortedFiles.length} successful`);

      return {
        success: errors.length === 0,
        replaced,
        total: questions.length,
        errors,
      };
    });
  } catch (err) {
    const error = `Unexpected error for grade ${grade}, year ${year}: ${err instanceof Error ? err.message : 'Unknown error'}`;
    console.error(`❌ ${error}`);
    return { success: false, replaced, total: 0, errors: [error] };
  }
}
