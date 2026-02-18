/**
 * Generates IM360 lesson URL for Illustrative Mathematics curriculum
 */

interface IM360UrlParams {
  gradeLevel: string;
  unitNumber: number;
  lessonNumber: number;
  section: string;
}

export function getIM360Url({
  gradeLevel,
  unitNumber,
  lessonNumber,
  section,
}: IM360UrlParams): string {
  // Extract grade number if it's in format like "Grade 7"
  const gradeNum = gradeLevel.match(/\d+/)?.[0] || gradeLevel;

  // Determine if this is Algebra 1
  const isAlgebra1 =
    gradeNum === "9" || gradeLevel.toLowerCase().includes("algebra");

  // Build URL based on course type
  let baseUrl = "";
  if (isAlgebra1) {
    baseUrl = "https://accessim.org/9-12-aga/algebra-1";
  } else if (["6", "7", "8"].includes(gradeNum)) {
    baseUrl = `https://accessim.org/6-8/grade-${gradeNum}`;
  }

  const unit = `unit-${unitNumber}`;

  // Format section for URL (e.g., "A" -> "section-a", "Section A" -> "section-a")
  const sectionMatch =
    section.match(/Section ([A-Z])/i) || section.match(/^([A-Z])$/i);
  const sectionPath = sectionMatch
    ? `section-${sectionMatch[1].toLowerCase()}`
    : `section-${section.toLowerCase()}`;

  const lessonPath = `lesson-${lessonNumber}`;

  return `${baseUrl}/${unit}/${sectionPath}/${lessonPath}/preparation?a=teacher`;
}
