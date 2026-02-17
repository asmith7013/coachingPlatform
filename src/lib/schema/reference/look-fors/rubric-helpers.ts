import { Rubric } from "@zod-schema/look-fors/rubric";

/**
 * Formats rubric categories as a comma-separated string
 */
export function formatRubricCategory(rubric: Rubric): string {
  return rubric.category?.join(", ") || "";
}

/**
 * Gets appropriate color class based on rubric score
 */
export function getRubricColorClass(rubric: Rubric): string {
  const score = rubric.score || 0;
  if (score >= 4) return "text-green-600";
  if (score >= 3) return "text-blue-600";
  if (score >= 2) return "text-amber-600";
  return "text-red-600";
}

/**
 * Gets a summary of rubric content
 */
export function getRubricContentSummary(
  rubric: Rubric,
  maxLength: number = 100,
): string {
  if (!rubric.content || !rubric.content.length) return "";

  const combined = rubric.content.join(" | ");
  if (combined.length <= maxLength) {
    return combined;
  }

  return combined.slice(0, maxLength) + "...";
}
