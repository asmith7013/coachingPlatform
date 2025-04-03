'use client';

import { cn } from '@/lib/utils';
import { spacing, textColors, backgroundColors, borderColors, radii } from '@/lib/ui/tokens';

type SelectorProps = {
  selectedGrade: string;
  setSelectedGrade: (grade: string) => void;
  selectedUnit: string;
  setSelectedUnit: (unit: string) => void;
  selectedLesson: string;
  setSelectedLesson: (lesson: string) => void;
  grades: string[];
  units: string[];
  lessons: string[];
};

export function GradeUnitLessonSelector({
  selectedGrade,
  setSelectedGrade,
  selectedUnit,
  setSelectedUnit,
  selectedLesson,
  setSelectedLesson,
  grades,
  units,
  lessons,
}: SelectorProps) {
  // Define the desired order for grades.
  const desiredOrder = ["Grade 6", "Grade 7", "Grade 8", "Algebra 1", "Geometry", "Algebra 2"];
  
  // Sort the provided grades based on the desired order.
  const sortedGrades = [...grades].sort((a, b) => {
    const indexA = desiredOrder.indexOf(a);
    const indexB = desiredOrder.indexOf(b);
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    } else if (indexA !== -1) {
      return -1; // a comes before b
    } else if (indexB !== -1) {
      return 1; // b comes before a
    }
    return a.localeCompare(b); // fallback to alphabetical order
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <select
        value={selectedGrade}
        onChange={(e) => {
          setSelectedGrade(e.target.value);
          setSelectedUnit('');
          setSelectedLesson('');
        }}
        className={cn(
          spacing.sm,
          borderColors.default,
          radii.md,
          backgroundColors.white,
          textColors.primary,
          'font-medium'
        )}
      >
        <option value="">Select Grade/Course</option>
        {sortedGrades.map((grade) => (
          <option key={grade} value={grade}>
            {grade}
          </option>
        ))}
      </select>
      <select
        value={selectedUnit}
        onChange={(e) => {
          setSelectedUnit(e.target.value);
          setSelectedLesson('');
        }}
        disabled={!selectedGrade}
        className={cn(
          spacing.sm,
          borderColors.default,
          radii.md,
          !selectedGrade ? backgroundColors.surfaceHover : backgroundColors.white,
          !selectedGrade ? textColors.muted : textColors.primary,
          'font-medium'
        )}
      >
        <option value="">Select Unit</option>
        {units.map((unit) => (
          <option key={unit} value={unit}>
            Unit {unit}
          </option>
        ))}
      </select>
      <select
        value={selectedLesson}
        onChange={(e) => setSelectedLesson(e.target.value)}
        disabled={!selectedUnit}
        className={cn(
          spacing.sm,
          borderColors.default,
          radii.md,
          !selectedUnit ? backgroundColors.surfaceHover : backgroundColors.white,
          !selectedUnit ? textColors.muted : textColors.primary,
          'font-medium'
        )}
      >
        <option value="">Select Lesson</option>
        {lessons.map((lesson) => (
          <option key={lesson} value={lesson}>
            Lesson {lesson}
          </option>
        ))}
      </select>
    </div>
  );
} 