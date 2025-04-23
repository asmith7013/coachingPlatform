import links from '@lib/json/alg1-links.json';

export function getUnitURL(
  grade: string,
  unit: string,
  curriculum: 'ILC' | 'Kendall Hunt'
): string | null {
  const normalizedGrade = grade.toLowerCase().trim();
  const parsedUnit = Number(unit);

  // First filter by curriculum to ensure we only look at the correct source
  const curriculumLinks = links.filter(link => link.curriculum === curriculum);

  // Then find the matching grade and unit within that curriculum
  const match = curriculumLinks.find(link => 
    link.subject.toLowerCase().trim() === normalizedGrade &&
    Number(link.unit) === parsedUnit
  );

  return match?.url ?? null;
} 