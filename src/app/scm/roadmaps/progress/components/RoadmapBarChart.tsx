"use client";

import React from "react";
import type { StudentRoadmapData } from "@/app/actions/313/roadmap-completions";
import { StackedSkillsBarChart, type BarDataItem } from "./StackedSkillsBarChart";

interface RoadmapBarChartProps {
  sectionName: string;
  school: string;
  students: StudentRoadmapData[];
  color: string;
  teacher?: string;
  className?: string;
}

export function RoadmapBarChart({
  students,
  className,
}: RoadmapBarChartProps) {
  // Sort students alphabetically by first name
  const sortedStudents = [...students].sort((a, b) =>
    a.firstName.localeCompare(b.firstName)
  );

  // Transform student data to bar chart format
  const data: BarDataItem[] = sortedStudents.map((s) => ({
    label: `${s.firstName} ${s.lastName.charAt(0)}.`,
    diagnosticValue: s.masteredFromDiagnostic,
    practiceValue: s.masteredFromPractice,
    attemptedCount: s.masteredFromPractice + s.attemptedNotMastered,
    tooltipTitle: `${s.firstName} ${s.lastName}`,
    tooltipExtra: [`${s.masteredFromPractice + s.attemptedNotMastered} skills attempted`],
  }));

  return (
    <StackedSkillsBarChart
      data={data}
      yAxisTitle="Skills Mastered"
      className={className}
    />
  );
}
