"use client";

import React from "react";
import { cn } from "@ui/utils/formatters";
import type { StudentRoadmapData } from "@/app/actions/313/roadmap-completions";

interface RoadmapBarChartProps {
  sectionName: string;
  school: string;
  students: StudentRoadmapData[];
  color: string;
  teacher?: string;
  className?: string;
}

export function RoadmapBarChart({
  sectionName,
  school,
  students,
  color,
  teacher,
  className,
}: RoadmapBarChartProps) {
  // Find the max value for scaling
  const maxValue = Math.max(
    ...students.map((s) => s.masteredFromDiagnostic + s.masteredFromPractice),
    1
  );

  // Calculate average mastered from practice
  const avgPractice = students.length > 0
    ? (students.reduce((sum, s) => sum + s.masteredFromPractice, 0) / students.length).toFixed(1)
    : "0";

  // Chart height based on max value
  const chartHeight = Math.min(400, Math.max(200, maxValue * 3));

  return (
    <div className={cn("bg-white rounded-lg shadow p-6 mb-6", className)}>
      {/* Header - following Card pattern from component-system.md */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: color }}
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {school} - {sectionName}
            </h3>
            {teacher && (
              <p className="text-sm text-gray-500">{teacher}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            {students.length} students
          </p>
          <p className="text-sm font-medium text-emerald-600">
            Avg. {avgPractice} skills mastered (practice)
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-6 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
          <span className="text-gray-600">Mastered from Practice</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-300" />
          <span className="text-gray-600">Diagnostic Baseline</span>
        </div>
      </div>

      {/* Chart container - using overflow pattern from component-system.md */}
      <div className="overflow-x-auto">
        <div
          className="flex items-end gap-1 pt-4"
          style={{
            minWidth: `${students.length * 40}px`,
            height: `${chartHeight + 60}px`,
          }}
        >
          {students.map((student) => {
            const practiceHeight = (student.masteredFromPractice / maxValue) * chartHeight;
            const diagnosticHeight = (student.masteredFromDiagnostic / maxValue) * chartHeight;
            const totalHeight = practiceHeight + diagnosticHeight;

            return (
              <div
                key={student.id}
                className="flex flex-col items-center flex-shrink-0"
                style={{ width: "36px" }}
              >
                {/* Value label */}
                <div className="text-xs text-gray-500 mb-1 h-4">
                  {student.masteredFromPractice > 0 && student.masteredFromPractice}
                </div>

                {/* Stacked bar */}
                <div
                  className="w-full flex flex-col-reverse rounded-t overflow-hidden"
                  style={{ height: `${chartHeight}px` }}
                >
                  {/* Diagnostic baseline (bottom) */}
                  {student.masteredFromDiagnostic > 0 && (
                    <div
                      className="w-full bg-gray-300 transition-all duration-300"
                      style={{ height: `${diagnosticHeight}px` }}
                      title={`Diagnostic: ${student.masteredFromDiagnostic} skills`}
                    />
                  )}
                  {/* Practice mastery (top) */}
                  {student.masteredFromPractice > 0 && (
                    <div
                      className="w-full transition-all duration-300"
                      style={{
                        height: `${practiceHeight}px`,
                        backgroundColor: color,
                      }}
                      title={`Practice: ${student.masteredFromPractice} skills`}
                    />
                  )}
                  {/* Empty space filler */}
                  <div
                    className="w-full flex-1"
                    style={{ height: `${chartHeight - totalHeight}px` }}
                  />
                </div>

                {/* Student name */}
                <div
                  className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-top-left whitespace-nowrap"
                  style={{ width: "80px" }}
                >
                  {student.firstName} {student.lastName.charAt(0)}.
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Y-axis reference - footer pattern */}
      <div className="mt-2 pt-2 border-t border-gray-100">
        <div className="flex justify-between text-xs text-gray-400">
          <span>0 skills</span>
          <span>{Math.round(maxValue / 2)} skills</span>
          <span>{maxValue} skills</span>
        </div>
      </div>
    </div>
  );
}
