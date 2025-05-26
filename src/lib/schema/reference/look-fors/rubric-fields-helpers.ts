import { RubricFields } from "../../zod-schema/look-fors/rubric-fields";

/**
 * Gets a color class based on score
 */
export function getScoreColorClass(rubricFields: RubricFields): string {
  const score = rubricFields.score || 0;
  if (score >= 4) return 'text-green-600';
  if (score >= 3) return 'text-blue-600';
  if (score >= 2) return 'text-amber-600';
  return 'text-red-600';
}

/**
 * Gets the hex color or a default if not provided
 */
export function getRubricHexColor(rubricFields: RubricFields, defaultColor: string = '#808080'): string {
  return rubricFields.hex || defaultColor;
}