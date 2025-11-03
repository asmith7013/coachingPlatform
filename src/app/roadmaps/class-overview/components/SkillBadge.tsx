"use client";

import { Student } from "@zod-schema/313/student";

interface SkillBadgeProps {
  skillNumber: string;
  skillName: string;
  selectedStudent?: Student | null;
  selectedStudents?: Student[];
  selectedSection?: string;
}

export function SkillBadge({
  skillNumber,
  skillName,
  selectedStudent,
  selectedStudents = [],
  selectedSection
}: SkillBadgeProps) {
  // Single student: show checkmark (empty or filled)
  if (selectedStudent && selectedStudents.length === 1) {
    const isMastered = selectedStudent.masteredSkills?.includes(skillNumber) || false;

    return (
      <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs mr-1 mb-1">
        <span className="text-gray-700">{skillNumber}</span>
        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
          isMastered ? 'bg-green-600' : 'border-2 border-gray-300'
        }`}>
          {isMastered && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
    );
  }

  // Section selected: show progress bar
  if (selectedSection && selectedStudents.length > 1) {
    const masteredCount = selectedStudents.filter(student =>
      student.masteredSkills?.includes(skillNumber)
    ).length;
    const total = selectedStudents.length;
    const percentage = total > 0 ? (masteredCount / total) * 100 : 0;

    return (
      <div className="inline-flex flex-col px-2 py-1 bg-gray-100 rounded text-xs mr-1 mb-1 min-w-[60px]">
        <span className="text-gray-700 mb-1">{skillNumber}</span>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-green-600 h-1.5 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="text-gray-500 text-[10px] mt-0.5">{masteredCount}/{total}</span>
      </div>
    );
  }

  // No student/section selected: just show skill number
  return (
    <div className="inline-flex items-center px-2 py-1 bg-gray-100 rounded text-xs mr-1 mb-1">
      <span className="text-gray-700">{skillNumber}</span>
    </div>
  );
}
