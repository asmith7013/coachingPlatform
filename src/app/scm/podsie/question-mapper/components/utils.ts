import type { CurriculumData, PodsieQuestionMap } from "./types";

/**
 * Parse course and unit from curriculum path notes
 */
export function parsePathInfo(notes?: string): {
  course: string;
  unit: string;
} {
  if (!notes) return { course: "-", unit: "-" };
  // e.g., "Exported from courses/IM-8th-Grade/modules/Unit-3/assignments/Ramp-Up-2"
  const match = notes.match(/courses\/([^/]+)\/modules\/([^/]+)/);
  if (match) {
    return {
      course: match[1].replace("IM-", "").replace("-", " "),
      unit: match[2].replace("-", " "),
    };
  }
  return { course: "-", unit: "-" };
}

/**
 * Transform curriculum format to internal question map format
 */
export function transformCurriculumToQuestionMap(
  curriculumData: CurriculumData,
): PodsieQuestionMap[] {
  const questionMapArray: PodsieQuestionMap[] = [];

  for (const question of curriculumData.questions) {
    // Add root question
    questionMapArray.push({
      questionNumber: question.questionNumber,
      questionId: question.external_id,
      isRoot: true,
    });

    // Add variations if they exist
    if (question.hasVariations && question.variations.length > 0) {
      for (const variation of question.variations) {
        questionMapArray.push({
          questionNumber: question.questionNumber,
          questionId: variation.external_id,
          isRoot: false,
          rootQuestionId: question.external_id,
          variantNumber: variation.order,
        });
      }
    }
  }

  return questionMapArray;
}
