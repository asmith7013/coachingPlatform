"use client";

interface TeacherSelectorProps {
  teachers: string[];
  selectedTeacher: string;
  onTeacherChange: (teacher: string) => void;
}

export function TeacherSelector({
  teachers,
  selectedTeacher,
  onTeacherChange,
}: TeacherSelectorProps) {
  // Sort teachers alphabetically (case-insensitive)
  const sortedTeachers = [...teachers].sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase()),
  );

  return (
    <div className="mb-6">
      <label
        htmlFor="teacher-select"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Select Teacher
      </label>
      <select
        id="teacher-select"
        value={selectedTeacher}
        onChange={(e) => onTeacherChange(e.target.value)}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Choose a teacher...</option>
        {sortedTeachers.map((teacher) => (
          <option key={teacher} value={teacher}>
            {teacher}
          </option>
        ))}
      </select>
    </div>
  );
}
