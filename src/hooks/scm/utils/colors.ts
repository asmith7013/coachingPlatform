// Color palette for schools and their sections
// Each school gets a family of colors with distinct shades

export const SCHOOL_COLOR_FAMILIES = {
  IS313: {
    name: 'cool',
    colors: [
      '#0EA5E9', // sky-500 - bright blue
      '#3B82F6', // blue-500 - standard blue
      '#6366F1', // indigo-500 - indigo
      '#8B5CF6', // violet-500 - violet
      '#06B6D4', // cyan-500 - cyan
      '#14B8A6', // teal-500 - teal
      '#2563EB', // blue-600 - darker blue
      '#7C3AED', // violet-600 - darker violet
      '#0891B2', // cyan-600 - darker cyan
    ],
  },
  PS19: {
    name: 'warm',
    colors: [
      '#EF4444', // red-500 - red
      '#F97316', // orange-500 - orange
      '#F59E0B', // amber-500 - amber
      '#DC2626', // red-600 - darker red
      '#EA580C', // orange-600 - darker orange
      '#D97706', // amber-600 - darker amber
      '#FB923C', // orange-400 - lighter orange
      '#FBBF24', // amber-400 - lighter amber
      '#F87171', // red-400 - lighter red
    ],
  },
  X644: {
    name: 'greyscale',
    colors: [
      '#1F2937', // gray-800 - very dark
      '#374151', // gray-700 - dark
      '#4B5563', // gray-600 - medium dark
      '#6B7280', // gray-500 - medium
      '#9CA3AF', // gray-400 - medium light
      '#111827', // gray-900 - darkest
      '#D1D5DB', // gray-300 - light
      '#E5E7EB', // gray-200 - very light
      '#0F172A', // slate-900 - slate dark
    ],
  },
} as const;

export type School = keyof typeof SCHOOL_COLOR_FAMILIES;

/**
 * Get a color for a specific section within a school
 */
export function getSectionColor(school: string, sectionIndex: number): string {
  const schoolKey = school as School;
  const colorFamily = SCHOOL_COLOR_FAMILIES[schoolKey];

  if (!colorFamily) {
    // Fallback to gray if school not found
    return '#6B7280';
  }

  // Cycle through colors if we have more sections than colors
  return colorFamily.colors[sectionIndex % colorFamily.colors.length];
}

/**
 * Get all colors for sections grouped by school
 */
export function getSectionColors(
  sections: Array<{ id: string; school: string; classSection: string }>
): Map<string, string> {
  const colorMap = new Map<string, string>();

  // Group sections by school
  const sectionsBySchool = sections.reduce((acc, section) => {
    if (!acc[section.school]) {
      acc[section.school] = [];
    }
    acc[section.school].push(section);
    return acc;
  }, {} as Record<string, typeof sections>);

  // Assign colors within each school family
  Object.entries(sectionsBySchool).forEach(([school, schoolSections]) => {
    schoolSections.forEach((section, index) => {
      const color = getSectionColor(school, index);
      colorMap.set(section.id, color);
    });
  });

  return colorMap;
}
