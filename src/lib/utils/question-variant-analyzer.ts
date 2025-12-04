/**
 * Dynamic Question Variant Analyzer
 *
 * Analyzes questions from Podsie API responses to identify root vs variant questions
 * based on code similarity. This works on any set of questions, not just pre-analyzed ones.
 */

interface QuestionData {
  id: number;
  questionContent: {
    type: string;
    d3Content?: string;
    questionText?: string;
  };
}

interface VariantGroup {
  rootQuestionId: number;
  variants: number[];
}

/**
 * Normalize D3 code by replacing numbers and strings with placeholders
 */
function normalizeCode(code: string): string {
  if (!code) return '';

  return code
    // Replace all numbers with placeholder
    .replace(/\b\d+\.?\d*\b/g, '#NUM#')
    // Replace quoted strings (likely contextual text)
    .replace(/"[^"]*"/g, '"#TEXT#"')
    .replace(/'[^']*'/g, "'#TEXT#'")
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculate similarity ratio between two strings using simple character-level comparison
 */
function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0;
  if (!str1 || !str2) return 0.0;

  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  // Simple Levenshtein-based similarity
  const distance = levenshteinDistance(shorter, longer);
  return (longer.length - distance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Group questions by code similarity and identify root vs variants
 * Root is the FIRST question encountered in the array (preserves assignment order)
 */
function groupQuestionsByVariants(
  questions: QuestionData[],
  similarityThreshold: number = 0.85
): VariantGroup[] {
  const groups: VariantGroup[] = [];
  const processed = new Set<number>();

  // Only process D3 questions with code
  const d3Questions = questions.filter(
    q => q.questionContent.type === 'd3' && q.questionContent.d3Content
  );

  console.log(`🔍 Analyzing ${d3Questions.length} D3 questions for variants...`);

  // Pre-normalize all codes to avoid redundant normalization
  const normalizedCodes = new Map<number, string>();
  for (const question of d3Questions) {
    normalizedCodes.set(question.id, normalizeCode(question.questionContent.d3Content || ''));
  }

  for (const question of d3Questions) {
    if (processed.has(question.id)) continue;

    const normalizedCode = normalizedCodes.get(question.id) || '';

    // Find similar questions (including current question)
    const similarQuestions = [question.id];

    for (const otherQuestion of d3Questions) {
      if (otherQuestion.id === question.id || processed.has(otherQuestion.id)) {
        continue;
      }

      const otherNormalizedCode = normalizedCodes.get(otherQuestion.id) || '';

      // Quick length check before expensive similarity calculation
      const lengthRatio = Math.min(normalizedCode.length, otherNormalizedCode.length) /
                         Math.max(normalizedCode.length, otherNormalizedCode.length);
      if (lengthRatio < 0.7) continue; // Skip if length differs too much

      const similarity = calculateSimilarity(normalizedCode, otherNormalizedCode);

      if (similarity >= similarityThreshold) {
        similarQuestions.push(otherQuestion.id);
        processed.add(otherQuestion.id);
      }
    }

    // The root is the FIRST question encountered (already at index 0)
    // DO NOT sort - preserve the order from the assignment
    const rootId = similarQuestions[0];
    const variants = similarQuestions.slice(1); // All others are variants

    groups.push({
      rootQuestionId: rootId,
      variants
    });

    processed.add(question.id);
  }

  console.log(`✅ Found ${groups.length} variant groups`);
  return groups;
}

/**
 * Analyze questions and create a mapping of questionId -> variant info
 */
export function analyzeQuestionVariants(questions: QuestionData[]) {
  const startTime = Date.now();
  const groups = groupQuestionsByVariants(questions);

  // Create a flat mapping
  const mapping: Record<number, {
    type: 'root' | 'variant';
    rootQuestionId?: number;
    groupId: number;
  }> = {};

  groups.forEach((group, groupIndex) => {
    // Mark root
    mapping[group.rootQuestionId] = {
      type: 'root',
      groupId: groupIndex
    };

    // Mark variants
    group.variants.forEach(variantId => {
      mapping[variantId] = {
        type: 'variant',
        rootQuestionId: group.rootQuestionId,
        groupId: groupIndex
      };
    });
  });

  const duration = Date.now() - startTime;
  console.log(`⏱️ Variant analysis took ${duration}ms`);

  return mapping;
}

/**
 * Map question IDs to their variant info with proper metadata
 * This is the main function to use in section-configs
 */
export function mapQuestionsToVariantInfoDynamic(
  questionIds: (number | string)[],
  allQuestions: QuestionData[]
) {
  console.log(`📊 mapQuestionsToVariantInfoDynamic called with ${questionIds.length} question IDs and ${allQuestions?.length || 0} question objects`);

  // Safety check
  if (!allQuestions || allQuestions.length === 0) {
    console.warn('⚠️ No question data provided, returning basic mapping without variant analysis');
    return questionIds.map((questionId, index) => ({
      questionNumber: index + 1,
      questionId: String(questionId),
      isRoot: true
    }));
  }

  // Analyze the questions to get the mapping
  const mapping = analyzeQuestionVariants(allQuestions);

  // Map each question
  return questionIds.map((questionId, index) => {
    const id = Number(questionId);
    const info = mapping[id];
    const isRoot = !info || info.type === 'root';

    const result: {
      questionNumber: number;
      questionId: string;
      isRoot: boolean;
      rootQuestionId?: string;
      variantNumber?: number;
    } = {
      questionNumber: index + 1,
      questionId: String(questionId),
      isRoot
    };

    if (info?.type === 'variant' && info.rootQuestionId) {
      result.rootQuestionId = String(info.rootQuestionId);

      // Calculate variant number within this question list
      const sameRootVariants = questionIds
        .filter(qid => {
          const qInfo = mapping[Number(qid)];
          return qInfo?.type === 'variant' && qInfo.rootQuestionId === info.rootQuestionId;
        })
        .map(qid => Number(qid))
        .sort((a, b) => a - b);

      result.variantNumber = sameRootVariants.indexOf(id) + 1;
    }

    return result;
  });
}

/**
 * Get statistics about the variant analysis
 */
export function getVariantStats(mapping: ReturnType<typeof analyzeQuestionVariants>) {
  const stats = {
    totalQuestions: Object.keys(mapping).length,
    rootQuestions: 0,
    variantQuestions: 0,
    groups: new Set<number>()
  };

  Object.values(mapping).forEach(info => {
    if (info.type === 'root') {
      stats.rootQuestions++;
    } else {
      stats.variantQuestions++;
    }
    stats.groups.add(info.groupId);
  });

  return {
    ...stats,
    totalGroups: stats.groups.size
  };
}
