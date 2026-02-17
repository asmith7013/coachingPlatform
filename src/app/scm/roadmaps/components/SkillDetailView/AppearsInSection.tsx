"use client";

import { useState } from "react";
import { RoadmapsSkill } from "@zod-schema/scm/roadmaps/roadmap-skill";
import { AccordionItem } from "../AccordionItem";

interface AppearsInSectionProps {
  appearsIn: RoadmapsSkill["appearsIn"];
}

type UnitAppearance = {
  unitNumber: number;
  unitTitle: string;
  type: "target" | "essential" | "helpful" | "support";
};

type GradeData = {
  grade: string;
  units: Array<{
    unitNumber: number;
    title: string;
    counts: {
      target: number;
      essential: number;
      helpful: number;
      support: number;
    };
  }>;
  totalCounts: {
    target: number;
    essential: number;
    helpful: number;
    support: number;
  };
};

const getGradeNum = (grade: string) => {
  if (grade.includes("Algebra 1")) return 9;
  const match = grade.match(/(\d+)/);
  return match ? parseInt(match[1]) : 999;
};

const getGradeLabel = (grade: string) => {
  if (grade.includes("Algebra 1")) return "Algebra 1";
  const match = grade.match(/(\d+)/);
  return match ? `Grade ${match[1]}` : grade;
};

export function AppearsInSection({ appearsIn }: AppearsInSectionProps) {
  const [expandedGrades, setExpandedGrades] = useState<Set<string>>(new Set());

  const toggleGrade = (grade: string) => {
    const newExpanded = new Set(expandedGrades);
    if (newExpanded.has(grade)) {
      newExpanded.delete(grade);
    } else {
      newExpanded.add(grade);
    }
    setExpandedGrades(newExpanded);
  };

  if (!appearsIn) return null;

  const hasContent =
    appearsIn.asTarget?.length > 0 ||
    appearsIn.asEssential?.length > 0 ||
    appearsIn.asHelpful?.length > 0 ||
    appearsIn.asSupport?.length > 0;

  if (!hasContent) return null;

  // Find the first target skill (where skill is introduced)
  const firstTargetUnit =
    appearsIn.asTarget && appearsIn.asTarget.length > 0
      ? appearsIn.asTarget.sort((a, b) => {
          const gradeA = getGradeNum(a.grade);
          const gradeB = getGradeNum(b.grade);
          return gradeA !== gradeB
            ? gradeA - gradeB
            : a.unitNumber - b.unitNumber;
        })[0]
      : null;

  // Build grade data
  const gradeMap = new Map<string, UnitAppearance[]>();

  // Add target units
  appearsIn.asTarget?.forEach((unit) => {
    const appearances = gradeMap.get(unit.grade) || [];
    appearances.push({
      unitNumber: unit.unitNumber,
      unitTitle: unit.unitTitle,
      type: "target",
    });
    gradeMap.set(unit.grade, appearances);
  });

  // Add essential skill units
  appearsIn.asEssential?.forEach((relatedSkill) => {
    relatedSkill.units.forEach((unit) => {
      const appearances = gradeMap.get(unit.grade) || [];
      appearances.push({
        unitNumber: unit.unitNumber,
        unitTitle: unit.unitTitle,
        type: "essential",
      });
      gradeMap.set(unit.grade, appearances);
    });
  });

  // Add helpful skill units
  appearsIn.asHelpful?.forEach((relatedSkill) => {
    relatedSkill.units.forEach((unit) => {
      const appearances = gradeMap.get(unit.grade) || [];
      appearances.push({
        unitNumber: unit.unitNumber,
        unitTitle: unit.unitTitle,
        type: "helpful",
      });
      gradeMap.set(unit.grade, appearances);
    });
  });

  // Add support units
  appearsIn.asSupport?.forEach((unit) => {
    const appearances = gradeMap.get(unit.grade) || [];
    appearances.push({
      unitNumber: unit.unitNumber,
      unitTitle: unit.unitTitle,
      type: "support",
    });
    gradeMap.set(unit.grade, appearances);
  });

  // Sort grades and build grade data list
  const sortedGrades = Array.from(gradeMap.keys()).sort(
    (a, b) => getGradeNum(a) - getGradeNum(b),
  );

  const gradeDataList: GradeData[] = sortedGrades.map((grade) => {
    const appearances = gradeMap.get(grade)!;
    const unitMap = new Map<
      number,
      {
        title: string;
        counts: {
          target: number;
          essential: number;
          helpful: number;
          support: number;
        };
      }
    >();

    appearances.forEach((appearance) => {
      const existing = unitMap.get(appearance.unitNumber);
      if (existing) {
        existing.counts[appearance.type]++;
      } else {
        unitMap.set(appearance.unitNumber, {
          title: appearance.unitTitle,
          counts: {
            target: appearance.type === "target" ? 1 : 0,
            essential: appearance.type === "essential" ? 1 : 0,
            helpful: appearance.type === "helpful" ? 1 : 0,
            support: appearance.type === "support" ? 1 : 0,
          },
        });
      }
    });

    const totalCounts = { target: 0, essential: 0, helpful: 0, support: 0 };
    unitMap.forEach((unitData) => {
      totalCounts.target += unitData.counts.target;
      totalCounts.essential += unitData.counts.essential;
      totalCounts.helpful += unitData.counts.helpful;
      totalCounts.support += unitData.counts.support;
    });

    const sortedUnits = Array.from(unitMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([unitNumber, unitData]) => ({
        unitNumber,
        title: unitData.title,
        counts: unitData.counts,
      }));

    return { grade, units: sortedUnits, totalCounts };
  });

  return (
    <div className="border-b border-gray-200 py-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700">Appears In</h4>
        <div className="flex items-center gap-3 text-[9px]">
          <span className="inline-flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded bg-skill-target"></span>
            <span className="text-gray-600">Target</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded bg-skill-essential"></span>
            <span className="text-gray-600">Essential</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded bg-skill-helpful"></span>
            <span className="text-gray-600">Helpful</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded bg-skill-support"></span>
            <span className="text-gray-600">Support</span>
          </span>
        </div>
      </div>

      {firstTargetUnit && (
        <div className="text-xs text-gray-700 mb-3">
          <span className="font-semibold">Introduced in: </span>
          <span>
            {firstTargetUnit.grade.includes("Algebra 1")
              ? "Algebra 1"
              : `Grade ${firstTargetUnit.grade.match(/(\d+)/)?.[1] || firstTargetUnit.grade}`}
            , Unit {firstTargetUnit.unitNumber}:{" "}
            {firstTargetUnit.unitTitle.replace(/^\d+\s*-\s*/, "")}
          </span>
        </div>
      )}

      <div className="space-y-2">
        {gradeDataList.map((gradeData) => {
          const unitCount = gradeData.units.length;
          const titleContent = (
            <>
              <span>{getGradeLabel(gradeData.grade)}</span>
              <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-medium bg-gray-200 text-gray-700 ml-2">
                {unitCount} {unitCount === 1 ? "Unit" : "Units"}
              </span>
              {gradeData.totalCounts.target > 0 && (
                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-medium bg-skill-target text-white ml-2">
                  {gradeData.totalCounts.target}
                </span>
              )}
              {gradeData.totalCounts.essential > 0 && (
                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-medium bg-skill-essential text-white ml-2">
                  {gradeData.totalCounts.essential}
                </span>
              )}
              {gradeData.totalCounts.helpful > 0 && (
                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-medium bg-skill-helpful text-white ml-2">
                  {gradeData.totalCounts.helpful}
                </span>
              )}
              {gradeData.totalCounts.support > 0 && (
                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-medium bg-skill-support text-white ml-2">
                  {gradeData.totalCounts.support}
                </span>
              )}
            </>
          );

          const contentHtml = (
            <div className="flex flex-wrap gap-2 pt-2">
              {gradeData.units.map((unit) => {
                const cleanTitle = unit.title.replace(/^\d+\s*-\s*/, "");
                return (
                  <div
                    key={unit.unitNumber}
                    className="bg-gray-100 border border-gray-300 rounded p-1.5 inline-block"
                  >
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <div className="text-[10px] font-semibold text-gray-700">
                        Unit {unit.unitNumber}
                      </div>
                      <div className="flex gap-0.5">
                        {unit.counts.target > 0 && (
                          <span className="inline-block px-1 py-0.5 rounded text-[9px] font-medium bg-skill-target text-white">
                            {unit.counts.target}
                          </span>
                        )}
                        {unit.counts.essential > 0 && (
                          <span className="inline-block px-1 py-0.5 rounded text-[9px] font-medium bg-skill-essential text-white">
                            {unit.counts.essential}
                          </span>
                        )}
                        {unit.counts.helpful > 0 && (
                          <span className="inline-block px-1 py-0.5 rounded text-[9px] font-medium bg-skill-helpful text-white">
                            {unit.counts.helpful}
                          </span>
                        )}
                        {unit.counts.support > 0 && (
                          <span className="inline-block px-1 py-0.5 rounded text-[9px] font-medium bg-skill-support text-white">
                            {unit.counts.support}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-[9px] text-gray-600">{cleanTitle}</div>
                  </div>
                );
              })}
            </div>
          );

          return (
            <AccordionItem
              key={gradeData.grade}
              title={titleContent}
              content={contentHtml}
              isExpanded={expandedGrades.has(gradeData.grade)}
              onToggle={() => toggleGrade(gradeData.grade)}
              showTitleBadge={false}
            />
          );
        })}
      </div>
    </div>
  );
}
