/**
 * Utility functions for building Podsie question mappings
 */

import type { PodsieQuestionMap } from "@zod-schema/313/podsie/section-config";

/**
 * Build question mapping array from base question IDs and variations count
 *
 * IMPORTANT: Question 1 typically has no variations, only questions 2+ have variations
 *
 * @param baseQuestionIds - Array of base question IDs (root questions) in order
 * @param variations - Number of variations per question for questions 2+ (0 = root only, 3 = root + 3 variants, etc.)
 * @param q1HasVariations - Whether Question 1 has variations (default: false)
 * @returns 2D array where each subarray contains [rootId, variant1Id, variant2Id, ...]
 *
 * @example
 * // For a typical assignment with 3 variations (Q1 has no variations):
 * // baseQuestionIds = [100, 104, 108, 112]  (10 questions total)
 * // variations = 3, q1HasVariations = false
 * // Result: [
 * //   [100],                          // Question 1: No variations
 * //   [104, 105, 106, 107],          // Question 2: Root + 3 variations
 * //   [108, 109, 110, 111],          // Question 3: Root + 3 variations
 * //   [112, 113, 114, 115],          // Question 4: Root + 3 variations
 * // ]
 *
 * @example
 * // For assignment where Q1 also has variations:
 * // baseQuestionIds = [100, 104, 108]  (10 questions total)
 * // variations = 3, q1HasVariations = true
 * // Result: [
 * //   [100, 101, 102, 103],          // Question 1: Root + 3 variations
 * //   [104, 105, 106, 107],          // Question 2: Root + 3 variations
 * //   [108, 109, 110, 111],          // Question 3: Root + 3 variations
 * // ]
 */
export function buildQuestionMapping(
  baseQuestionIds: number[],
  variations: number,
  q1HasVariations: boolean = false
): number[][] {
  if (!baseQuestionIds || baseQuestionIds.length === 0) {
    return [];
  }

  // Validate variations
  if (variations < 0 || variations > 10) {
    console.warn(`Invalid variations count: ${variations}. Using default of 3.`);
    variations = 3;
  }

  const mapping: number[][] = [];

  for (let questionIndex = 0; questionIndex < baseQuestionIds.length; questionIndex++) {
    const baseId = baseQuestionIds[questionIndex];

    if (questionIndex === 0 && !q1HasVariations) {
      // Question 1: No variations (default behavior)
      mapping.push([baseId]);
    } else {
      // Questions 2+ (or Q1 if q1HasVariations is true): Root + N variations
      const questionVariations: number[] = [baseId];

      for (let i = 1; i <= variations; i++) {
        questionVariations.push(baseId + i);
      }

      mapping.push(questionVariations);
    }
  }

  return mapping;
}

/**
 * Calculate total question IDs needed based on base questions and variations
 *
 * IMPORTANT: Question 1 never has variations, only questions 2+ have variations
 *
 * @example
 * // 10 base questions with 3 variations each:
 * // Question 1: 1 ID (no variations)
 * // Questions 2-10: 9 * (1 + 3) = 36 IDs
 * // Total: 1 + 36 = 37 total IDs
 * calculateTotalQuestionIds(10, 3) // returns 37
 */
export function calculateTotalQuestionIds(
  baseQuestionCount: number,
  variations: number
): number {
  if (baseQuestionCount === 0) return 0;
  if (baseQuestionCount === 1) return 1; // Only question 1, no variations

  // Question 1: 1 ID (no variations)
  // Questions 2+: (baseQuestionCount - 1) * (1 + variations) IDs
  return 1 + (baseQuestionCount - 1) * (1 + variations);
}

/**
 * Build enhanced question map with explicit root/variant distinction
 *
 * @param baseQuestionIds - Array of base question IDs (root questions) in order
 * @param variations - Number of variations per question for questions 2+ (0 = root only, 3 = root + 3 variants, etc.)
 * @param q1HasVariations - Whether Question 1 has variations (default: false)
 * @returns Array of PodsieQuestionMap objects with explicit root/variant marking
 *
 * @example
 * // For a typical assignment with 3 variations (Q1 has no variations):
 * // baseQuestionIds = [100, 104, 108]
 * // variations = 3, q1HasVariations = false
 * // Result: [
 * //   { questionNumber: 1, questionId: "100", isRoot: true },
 * //   { questionNumber: 2, questionId: "104", isRoot: true },
 * //   { questionNumber: 2, questionId: "105", isRoot: false, rootQuestionId: "104", variantNumber: 1 },
 * //   { questionNumber: 2, questionId: "106", isRoot: false, rootQuestionId: "104", variantNumber: 2 },
 * //   { questionNumber: 2, questionId: "107", isRoot: false, rootQuestionId: "104", variantNumber: 3 },
 * //   { questionNumber: 3, questionId: "108", isRoot: true },
 * //   { questionNumber: 3, questionId: "109", isRoot: false, rootQuestionId: "108", variantNumber: 1 },
 * //   { questionNumber: 3, questionId: "110", isRoot: false, rootQuestionId: "108", variantNumber: 2 },
 * //   { questionNumber: 3, questionId: "111", isRoot: false, rootQuestionId: "108", variantNumber: 3 },
 * // ]
 */
export function buildEnhancedQuestionMap(
  baseQuestionIds: number[],
  variations: number,
  q1HasVariations: boolean = false
): PodsieQuestionMap[] {
  if (!baseQuestionIds || baseQuestionIds.length === 0) {
    return [];
  }

  // Validate variations
  if (variations < 0 || variations > 10) {
    console.warn(`Invalid variations count: ${variations}. Using default of 3.`);
    variations = 3;
  }

  const questionMap: PodsieQuestionMap[] = [];

  for (let questionIndex = 0; questionIndex < baseQuestionIds.length; questionIndex++) {
    const baseId = baseQuestionIds[questionIndex];
    const questionNumber = questionIndex + 1; // 1-based indexing

    // Add root question
    questionMap.push({
      questionNumber,
      questionId: baseId.toString(),
      isRoot: true,
    });

    // Determine if this question should have variations
    const shouldHaveVariations = questionIndex === 0 ? q1HasVariations : true;

    if (shouldHaveVariations) {
      // Add variant questions
      for (let variantNum = 1; variantNum <= variations; variantNum++) {
        questionMap.push({
          questionNumber,
          questionId: (baseId + variantNum).toString(),
          isRoot: false,
          rootQuestionId: baseId.toString(),
          variantNumber: variantNum,
        });
      }
    }
  }

  return questionMap;
}
