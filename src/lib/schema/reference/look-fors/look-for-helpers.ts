import { LookFor, LookForItem } from "../../zod-schema/look-fors/look-for";

/**
 * Gets a summary description of a look-for
 */
export function getLookForDescriptionSummary(
  lookFor: LookFor,
  maxLength: number = 100,
): string {
  if (!lookFor.description) return "";

  if (lookFor.description.length <= maxLength) {
    return lookFor.description;
  }

  return lookFor.description.slice(0, maxLength) + "...";
}

/**
 * Gets the student-facing status as a boolean
 */
export function isStudentFacing(lookFor: LookFor): boolean {
  return lookFor.studentFacing === "Yes";
}

/**
 * Gets display string for a look-for item
 */
export function getLookForItemDisplayString(item: LookForItem): string {
  return `${item.lookForIndex}. ${item.title}`;
}

/**
 * Gets a summary of tags for a look-for item
 */
export function getLookForItemTagsSummary(
  item: LookForItem,
  maxTags: number = 3,
): string {
  if (!item.tags || item.tags.length === 0) return "";

  const visibleTags = item.tags.slice(0, maxTags);
  const remaining = item.tags.length - maxTags;

  return remaining > 0
    ? `${visibleTags.join(", ")} +${remaining} more`
    : visibleTags.join(", ");
}
