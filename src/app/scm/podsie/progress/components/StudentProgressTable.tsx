"use client";

import { useState, useMemo } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Legend, LegendGroup, LegendItem } from "@/components/core/feedback/Legend";
import type { ProgressData, LessonConfig } from "../types";
import type { GroupedAssignment } from "../utils/groupAssignments";

interface StudentProgressTableProps {
  groupedAssignments: GroupedAssignment<LessonConfig>[];
  progressData: ProgressData[];
}

interface StudentRow {
  studentId: string;
  studentName: string;
}

export function StudentProgressTable({
  groupedAssignments,
  progressData,
}: StudentProgressTableProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Filter out Ramp Ups from the table
  const filteredAssignments = useMemo(() => {
    return groupedAssignments.filter(({ lesson }) => {
      const parts = lesson.unitLessonId.split(".");
      const lessonPart = parts[1] || parts[0];
      const isRampUp = lessonPart.toUpperCase().startsWith("RU");
      return !isRampUp;
    });
  }, [groupedAssignments]);

  // Get unique students from progress data
  const students = useMemo(() => {
    const studentMap = new Map<string, StudentRow>();
    for (const p of progressData) {
      if (!studentMap.has(p.studentId)) {
        studentMap.set(p.studentId, {
          studentId: p.studentId,
          studentName: p.studentName,
        });
      }
    }
    // Sort by last name
    return Array.from(studentMap.values()).sort((a, b) => {
      const aLastName = a.studentName.split(" ").pop() || "";
      const bLastName = b.studentName.split(" ").pop() || "";
      return aLastName.localeCompare(bLastName);
    });
  }, [progressData]);

  // Build lookup for quick access to progress data
  const progressLookup = useMemo(() => {
    const lookup = new Map<string, ProgressData>();
    for (const p of progressData) {
      // Key: studentId-assignmentId
      const key = `${p.studentId}-${p.podsieAssignmentId}`;
      lookup.set(key, p);
    }
    return lookup;
  }, [progressData]);

  // Helper to get progress for a student and assignment
  const getProgress = (studentId: string, assignmentId: string | undefined) => {
    if (!assignmentId) return null;
    return progressLookup.get(`${studentId}-${assignmentId}`) || null;
  };

  // Calculate pacing status for each student
  // Expected flow: Zearn → Mastery Check for each lesson
  // If Zearn is ahead, student hasn't done MC for completed Zearn lessons
  // If MC is ahead, student skipped Zearn
  const studentPacingStatus = useMemo(() => {
    const statusMap = new Map<string, { type: 'zearn' | 'mastery' | 'onPace'; lessonsAhead: number }>();

    for (const student of students) {
      let highestZearnLesson = 0;
      let highestMasteryLesson = 0;

      for (const { lesson, masteryCheck } of filteredAssignments) {
        // Extract lesson number
        const parts = lesson.unitLessonId.split(".");
        const lessonPart = parts[1] || parts[0];
        const lessonNum = parseInt(lessonPart) || 0;

        // Check Zearn completion
        const lessonProgress = progressLookup.get(`${student.studentId}-${lesson.podsieAssignmentId}`);
        if (lesson.hasZearnActivity && lessonProgress?.zearnCompleted) {
          highestZearnLesson = Math.max(highestZearnLesson, lessonNum);
        }

        // Check Mastery Check completion
        const isMasteryCheckLesson = lesson.activityType === 'mastery-check';
        let masteryCompleted = false;

        if (masteryCheck) {
          const masteryProgress = progressLookup.get(`${student.studentId}-${masteryCheck.podsieAssignmentId}`);
          masteryCompleted = masteryProgress?.isFullyComplete ?? false;
        } else if (isMasteryCheckLesson) {
          masteryCompleted = lessonProgress?.isFullyComplete ?? false;
        }

        if (masteryCompleted) {
          highestMasteryLesson = Math.max(highestMasteryLesson, lessonNum);
        }
      }

      // Compare: Zearn should be equal to, 1, or 2 ahead of MC (since you do Zearn first)
      // diff = 0: just finished MC, about to start next Zearn
      // diff = 1: just finished Zearn, about to do MC
      // diff = 2: finished Zearn, still on pace (1 lesson buffer)
      // diff > 2: ahead on Zearn (hasn't done MC for completed Zearn lessons)
      // diff < 0: MC is ahead of Zearn (student skipped Zearn)
      const diff = highestZearnLesson - highestMasteryLesson;

      if (diff > 2) {
        // Zearn is more than 2 lessons ahead - student needs to do MC
        // diff - 2 because 0-2 is on pace, so 3 means +1 ahead, 4 means +2, etc.
        statusMap.set(student.studentId, { type: 'zearn', lessonsAhead: diff - 2 });
      } else if (diff < -1) {
        // MC is more than 1 lesson ahead of Zearn - student skipped Zearn
        // Math.abs(diff) - 1 because -1 is on pace, so -2 means +1 ahead, -3 means +2, etc.
        statusMap.set(student.studentId, { type: 'mastery', lessonsAhead: Math.abs(diff) - 1 });
      } else {
        // On pace (Zearn is 0, 1, or 2 ahead of MC, or MC is 0 or 1 ahead of Zearn)
        statusMap.set(student.studentId, { type: 'onPace', lessonsAhead: 0 });
      }
    }

    return statusMap;
  }, [students, filteredAssignments, progressLookup]);

  // Format lesson name for column header
  const getLessonColumnName = (lesson: LessonConfig) => {
    // Extract lesson number from unitLessonId (e.g., "8.RU1" -> "RU1", "8.15" -> "L15")
    const parts = lesson.unitLessonId.split(".");
    const lessonPart = parts[1] || parts[0];
    const isRampUp = lessonPart.toUpperCase().startsWith("RU");
    if (isRampUp) {
      return lessonPart.toUpperCase();
    }
    return `L${lessonPart}`;
  };

  // Count how many lessons have mastery checks
  // A lesson "has" a mastery check if:
  // 1. It has a paired masteryCheck object, OR
  // 2. The lesson itself IS a mastery-check (activityType === 'mastery-check')
  const lessonsWithMasteryCheck = filteredAssignments.filter(
    g => g.masteryCheck || g.lesson.activityType === 'mastery-check'
  ).length;

  if (filteredAssignments.length === 0 || students.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
      {/* Accordion Header - matches AssignmentCard style */}
      <div
        className={`${isOpen ? '' : 'cursor-pointer hover:bg-gray-100'} bg-gray-50 border-b border-gray-200 px-6 py-4 ${isOpen ? '' : 'rounded-lg'} transition-colors`}
        onClick={() => !isOpen && setIsOpen(true)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
        >
          {isOpen ? (
            <ChevronDownIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
          ) : (
            <ChevronRightIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
          )}
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 text-lg">
              Student Progress Table
            </h3>
            <p className="text-sm text-gray-500">
              {students.length} students • {filteredAssignments.length} lessons • {lessonsWithMasteryCheck} with mastery checks
            </p>
          </div>
        </button>
      </div>

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="border-separate border-spacing-0 rounded-lg overflow-hidden border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="sticky left-0 bg-gray-50 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 z-10 w-0"
                >
                  Student
                </th>
                {filteredAssignments.map(({ lesson }) => (
                  <th
                    key={lesson.podsieAssignmentId}
                    scope="col"
                    className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap border-r border-gray-200 w-0"
                  >
                    {getLessonColumnName(lesson)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student, index) => {
                const isEvenRow = index % 2 === 0;
                const rowBg = isEvenRow ? "bg-white" : "bg-gray-50";
                const topBorderColor = isEvenRow ? "border-t-white" : "border-t-gray-50";
                const bottomBorderColor = isEvenRow ? "border-b-white" : "border-b-gray-50";
                const pacingStatus = studentPacingStatus.get(student.studentId);
                return (
                <tr key={student.studentId} className={`${rowBg} hover:bg-blue-50`}>
                  <td className={`sticky left-0 ${rowBg} px-4 py-1 text-xs text-gray-900 font-medium whitespace-nowrap border-r border-gray-200 z-10`}>
                    <div className="flex items-center gap-2">
                      {student.studentName}
                      {pacingStatus && pacingStatus.type === 'zearn' && pacingStatus.lessonsAhead > 0 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-800">
                          +{pacingStatus.lessonsAhead} Zearn
                        </span>
                      )}
                      {pacingStatus && pacingStatus.type === 'mastery' && pacingStatus.lessonsAhead > 0 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-800">
                          +{pacingStatus.lessonsAhead} Mastery Check
                        </span>
                      )}
                    </div>
                  </td>
                  {filteredAssignments.map(({ lesson, masteryCheck }) => {
                    const lessonProgress = getProgress(
                      student.studentId,
                      lesson.podsieAssignmentId
                    );
                    const masteryProgress = masteryCheck
                      ? getProgress(
                          student.studentId,
                          masteryCheck.podsieAssignmentId
                        )
                      : null;

                    // Check Zearn completion (from lesson progress)
                    const zearnCompleted = lessonProgress?.zearnCompleted;

                    // Check Mastery Check completion
                    // If there's a paired mastery check, use its progress
                    // If the lesson itself IS a mastery-check (standalone), use lesson progress
                    const isMasteryCheckLesson = lesson.activityType === 'mastery-check';
                    const hasMasteryCheck = masteryCheck || isMasteryCheckLesson;
                    const masteryCompleted = masteryCheck
                      ? masteryProgress?.isFullyComplete
                      : isMasteryCheckLesson
                        ? lessonProgress?.isFullyComplete
                        : false;

                    return (
                      <td
                        key={lesson.podsieAssignmentId}
                        className="p-0 text-center border-r border-gray-200"
                      >
                        <div className="flex flex-col">
                          {/* Zearn (top half) */}
                          <div
                            className={`h-5 border-b border-gray-200 border-t-[3px] ${topBorderColor} ${
                              lesson.hasZearnActivity
                                ? zearnCompleted
                                  ? 'bg-purple-200'
                                  : 'bg-gray-100'
                                : ''
                            }`}
                          />
                          {/* Mastery Check (bottom half) */}
                          <div
                            className={`h-5 border-b-[3px] ${bottomBorderColor} ${
                              hasMasteryCheck
                                ? masteryCompleted
                                  ? 'bg-green-200'
                                  : 'bg-gray-100'
                                : ''
                            }`}
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
              })}
            </tbody>
            </table>
          </div>
          <Legend title="Key">
            <LegendGroup>
              <LegendItem
                icon={<div className="w-4 h-4 bg-purple-200 rounded" />}
                label="Zearn Complete"
              />
              <LegendItem
                icon={<div className="w-4 h-4 bg-green-200 rounded" />}
                label="Mastery Check Complete"
              />
              <LegendItem
                icon={<div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded" />}
                label="Not Complete"
              />
            </LegendGroup>
          </Legend>
        </div>
      )}
    </div>
  );
}
