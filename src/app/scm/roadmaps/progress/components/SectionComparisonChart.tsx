"use client";

import React from "react";
import { cn } from "@ui/utils/formatters";
import type { SectionRoadmapData } from "@/app/actions/scm/roadmaps/roadmap-completions";
import { StackedSkillsBarChart, type BarDataItem } from "./StackedSkillsBarChart";

interface SectionComparisonChartProps {
  sections: {
    sectionId: string;
    sectionName: string;
    data: SectionRoadmapData | undefined;
  }[];
  className?: string;
}

/**
 * Calculates average skills mastered for a section
 */
function calculateSectionAverages(data: SectionRoadmapData | undefined) {
  if (!data || data.students.length === 0) {
    return { avgDiagnostic: 0, avgPractice: 0, studentCount: 0 };
  }

  const totalDiagnostic = data.students.reduce(
    (sum, s) => sum + s.masteredFromDiagnostic,
    0
  );
  const totalPractice = data.students.reduce(
    (sum, s) => sum + s.masteredFromPractice,
    0
  );

  return {
    avgDiagnostic: Math.round((totalDiagnostic / data.students.length) * 10) / 10,
    avgPractice: Math.round((totalPractice / data.students.length) * 10) / 10,
    studentCount: data.students.length,
  };
}

export function SectionComparisonChart({
  sections,
  className,
}: SectionComparisonChartProps) {
  // Transform section data to bar chart format
  const data: BarDataItem[] = sections.map((section) => {
    const averages = calculateSectionAverages(section.data);
    return {
      label: section.sectionName,
      diagnosticValue: averages.avgDiagnostic,
      practiceValue: averages.avgPractice,
      tooltipExtra: [`${averages.studentCount} students`],
    };
  });

  return (
    <div className={cn("bg-white rounded-lg shadow p-6 mb-6", className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Section Comparison
      </h3>
      <StackedSkillsBarChart
        data={data}
        yAxisTitle="Avg Skills Mastered"
        diagnosticLabel="Avg Diagnostic Baseline"
        practiceLabel="Avg Skills Mastered (Practice)"
      />
    </div>
  );
}
