/**
 * Normalize lesson names to standardize format and enable better matching
 * between Podsie assignments and scope-and-sequence lessons
 */

/**
 * Normalize a lesson or assignment name by:
 * - Removing common prefixes like "Lesson X:", "Ramp Up #X:", etc.
 * - Trimming whitespace
 * - Converting to lowercase for comparison
 *
 * @param name - The original lesson/assignment name
 * @returns Object with normalized name and extracted metadata
 */
export function normalizeLessonName(name: string): {
  normalized: string;
  original: string;
  prefix?: string;
  lessonNumber?: number;
  isRampUp: boolean;
  isMasteryCheck: boolean;
} {
  const original = name;
  let normalized = name.trim();
  let prefix: string | undefined;
  let lessonNumber: number | undefined;
  let isRampUp = false;
  let isMasteryCheck = false;

  // Check for ramp-up patterns
  if (/ramp[\s-]?up/i.test(normalized)) {
    isRampUp = true;
  }

  // Check for mastery/assessment patterns
  if (/mastery|assessment|test|quiz/i.test(normalized)) {
    isMasteryCheck = true;
  }

  // Remove "Lesson X:" or "Lesson X -" pattern
  const lessonPattern = /^Lesson\s+(\d+)\s*[:|-]\s*/i;
  const lessonMatch = normalized.match(lessonPattern);
  if (lessonMatch) {
    prefix = lessonMatch[0];
    lessonNumber = parseInt(lessonMatch[1]);
    normalized = normalized.replace(lessonPattern, "").trim();
  }

  // Remove "Ramp Up #X:" or "Ramp Up X:" pattern
  const rampUpPattern = /^Ramp[\s-]?Up\s+#?(\d+)\s*[:|-]\s*/i;
  const rampUpMatch = normalized.match(rampUpPattern);
  if (rampUpMatch) {
    prefix = rampUpMatch[0];
    lessonNumber = parseInt(rampUpMatch[1]);
    isRampUp = true;
    normalized = normalized.replace(rampUpPattern, "").trim();
  }

  // Remove "Unit X Lesson Y:" pattern
  const unitLessonPattern = /^Unit\s+(\d+)\s+Lesson\s+(\d+)\s*[:|-]\s*/i;
  const unitLessonMatch = normalized.match(unitLessonPattern);
  if (unitLessonMatch) {
    prefix = unitLessonMatch[0];
    lessonNumber = parseInt(unitLessonMatch[2]);
    normalized = normalized.replace(unitLessonPattern, "").trim();
  }

  // Remove "Module X:" pattern (Zearn-style)
  const modulePattern = /^Module\s+(\d+)\s*[:|-]\s*/i;
  const moduleMatch = normalized.match(modulePattern);
  if (moduleMatch) {
    prefix = moduleMatch[0];
    normalized = normalized.replace(modulePattern, "").trim();
  }

  // Remove "Section X:" pattern
  const sectionPattern = /^Section\s+[A-F]\s*[:|-]\s*/i;
  const sectionMatch = normalized.match(sectionPattern);
  if (sectionMatch) {
    prefix = sectionMatch[0];
    normalized = normalized.replace(sectionPattern, "").trim();
  }

  // Remove "Part X:" pattern
  const partPattern = /^Part\s+(\d+)\s*[:|-]\s*/i;
  const partMatch = normalized.match(partPattern);
  if (partMatch) {
    prefix = partMatch[0];
    normalized = normalized.replace(partPattern, "").trim();
  }

  // Remove leading/trailing special characters
  normalized = normalized
    .replace(/^[:\-–—\s]+/, "")
    .replace(/[:\-–—\s]+$/, "")
    .trim();

  return {
    normalized: normalized.toLowerCase(),
    original,
    prefix,
    lessonNumber,
    isRampUp,
    isMasteryCheck,
  };
}

/**
 * Calculate similarity score between two normalized lesson names
 * Returns a score from 0 (no match) to 1 (perfect match)
 */
export function calculateNameSimilarity(name1: string, name2: string): number {
  const norm1 = normalizeLessonName(name1).normalized;
  const norm2 = normalizeLessonName(name2).normalized;

  // Exact match
  if (norm1 === norm2) return 1.0;

  // One contains the other
  if (norm1.includes(norm2) || norm2.includes(norm1)) return 0.9;

  // Check word overlap
  const words1 = norm1.split(/\s+/);
  const words2 = norm2.split(/\s+/);
  const commonWords = words1.filter((w) => words2.includes(w));

  if (commonWords.length === 0) return 0;

  // Calculate Jaccard similarity
  const union = new Set([...words1, ...words2]);
  const intersection = commonWords.length;
  return intersection / union.size;
}

/**
 * Find the best matching lesson from a list based on name similarity
 */
export function findBestMatch<T extends { lessonName: string }>(
  targetName: string,
  lessons: T[],
  minSimilarity: number = 0.7,
): { match: T | null; similarity: number } {
  let bestMatch: T | null = null;
  let bestSimilarity = 0;

  for (const lesson of lessons) {
    const similarity = calculateNameSimilarity(targetName, lesson.lessonName);
    if (similarity > bestSimilarity && similarity >= minSimilarity) {
      bestSimilarity = similarity;
      bestMatch = lesson;
    }
  }

  return { match: bestMatch, similarity: bestSimilarity };
}

/**
 * Format a lesson name for display purposes
 * Can optionally include the unit lesson ID prefix
 */
export function formatLessonName(name: string, unitLessonId?: string): string {
  const { normalized, original } = normalizeLessonName(name);

  // If already has a prefix structure, keep original
  if (original !== normalized) {
    return original;
  }

  // Otherwise, add unit lesson ID if provided
  if (unitLessonId) {
    return `Lesson ${unitLessonId}: ${original}`;
  }

  return original;
}
