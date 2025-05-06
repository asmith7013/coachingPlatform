'use client';

import { Select } from '@/components/core/fields/Select';
// import { Typography } from '@/components/core/typography';

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
  // Define the desired order for grades
  const desiredOrder = ["Grade 6", "Grade 7", "Grade 8", "Algebra 1", "Geometry", "Algebra 2"];
  
  // Sort the provided grades based on the desired order
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

  // Convert grades array to Select options format
  const gradeOptions = sortedGrades.map(grade => ({
    value: grade,
    label: grade
  }));
  
  // Convert units array to Select options format
  const unitOptions = units.map(unit => ({
    value: unit,
    label: `Unit ${unit}`
  }));
  
  // Convert lessons array to Select options format
  const lessonOptions = lessons.map(lesson => ({
    value: lesson,
    label: `Lesson ${lesson}`
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
      <Select
        value={selectedGrade}
        onChange={value => {
          setSelectedGrade(value);
          setSelectedUnit('');
          setSelectedLesson('');
        }}
        options={gradeOptions}
        placeholder="Select Grade/Course"
        radius="md"
      />
      
      <Select
        value={selectedUnit}
        onChange={value => {
          setSelectedUnit(value);
          setSelectedLesson('');
        }}
        options={unitOptions}
        placeholder="Select Unit"
        disabled={!selectedGrade}
        radius="md"
      />
      
      <Select
        value={selectedLesson}
        onChange={value => setSelectedLesson(value)}
        options={lessonOptions}
        placeholder="Select Lesson"
        disabled={!selectedUnit}
        radius="md"
      />
    </div>
  );
}