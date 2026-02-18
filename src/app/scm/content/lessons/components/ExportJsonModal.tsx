"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Spinner } from "@/components/core/feedback/Spinner";
import {
  fetchLessonsWithUnitOrder,
  fetchMultipleGradesData,
  type UnitWithLessons,
} from "../actions";
import type { ScopeSequenceTag } from "@zod-schema/scm/scope-and-sequence/scope-and-sequence";

interface ExportJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableGrades: ScopeSequenceTag[];
  selectedGrade: ScopeSequenceTag | "";
  currentUnits: UnitWithLessons[];
  currentSkillMap: Record<string, string>;
}

interface ExportedLesson {
  unitLessonId: string;
  lessonNumber: number;
  lessonName: string;
  lessonTitle?: string;
  lessonType?: string;
  section?: string;
  standards: { code: string; text: string; context?: string }[];
  learningTargets: string[];
  roadmapSkills: { skillNumber: string; title: string }[];
}

interface ExportedUnit {
  order: number;
  unitNumber: number;
  unitName: string;
  grade: string;
  lessons: ExportedLesson[];
}

interface ExportedCurriculum {
  scopeSequenceTag: string;
  units: ExportedUnit[];
}

function buildExportData(
  units: UnitWithLessons[],
  skillMap: Record<string, string>,
): ExportedUnit[] {
  return units.map((unit) => ({
    order: unit.order,
    unitNumber: unit.unitNumber,
    unitName: unit.unitName,
    grade: unit.grade,
    lessons: unit.lessons.map((lesson) => ({
      unitLessonId: lesson.unitLessonId,
      lessonNumber: lesson.lessonNumber,
      lessonName: lesson.lessonName,
      lessonTitle: lesson.lessonTitle,
      lessonType: lesson.lessonType,
      section: lesson.section,
      standards: lesson.standards.map((s) => ({
        code: s.code,
        text: s.text,
        context: s.context,
      })),
      learningTargets: lesson.learningTargets,
      roadmapSkills: lesson.roadmapSkills.map((skillNum) => ({
        skillNumber: skillNum,
        title: skillMap[skillNum] || "",
      })),
    })),
  }));
}

function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function ExportJsonModal({
  isOpen,
  onClose,
  availableGrades,
  selectedGrade,
  currentUnits,
  currentSkillMap,
}: ExportJsonModalProps) {
  const [checkedGrades, setCheckedGrades] = useState<Set<ScopeSequenceTag>>(
    new Set(),
  );
  const [exporting, setExporting] = useState(false);

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setCheckedGrades(selectedGrade ? new Set([selectedGrade]) : new Set());
    }
  }, [isOpen, selectedGrade]);

  const toggleGrade = useCallback((grade: ScopeSequenceTag) => {
    setCheckedGrades((prev) => {
      const next = new Set(prev);
      if (next.has(grade)) {
        next.delete(grade);
      } else {
        next.add(grade);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setCheckedGrades(new Set(availableGrades));
  }, [availableGrades]);

  const deselectAll = useCallback(() => {
    setCheckedGrades(new Set());
  }, []);

  const handleExport = useCallback(async () => {
    if (checkedGrades.size === 0) return;

    setExporting(true);
    try {
      const gradesToExport = Array.from(checkedGrades);
      const curricula: ExportedCurriculum[] = [];

      // Check which grades we already have loaded
      const needToFetch = gradesToExport.filter((g) => g !== selectedGrade);
      const alreadyLoaded = gradesToExport.filter((g) => g === selectedGrade);

      // Add already-loaded grade
      if (alreadyLoaded.length > 0 && currentUnits.length > 0) {
        curricula.push({
          scopeSequenceTag: selectedGrade,
          units: buildExportData(currentUnits, currentSkillMap),
        });
      }

      // Fetch remaining grades
      if (needToFetch.length > 0) {
        const result = await fetchMultipleGradesData(needToFetch);
        if (result.success && result.data) {
          for (const item of result.data) {
            curricula.push({
              scopeSequenceTag: item.tag,
              units: buildExportData(item.units, item.skillMap),
            });
          }
        }
      }

      // If selectedGrade wasn't loaded yet (no units), fetch it too
      if (alreadyLoaded.length > 0 && currentUnits.length === 0) {
        const result = await fetchLessonsWithUnitOrder(
          selectedGrade as ScopeSequenceTag,
        );
        if (result.success && result.data) {
          curricula.push({
            scopeSequenceTag: selectedGrade,
            units: buildExportData(result.data.units, result.data.skillMap),
          });
        }
      }

      // Sort curricula by tag name
      curricula.sort((a, b) =>
        a.scopeSequenceTag.localeCompare(b.scopeSequenceTag),
      );

      const exportPayload = {
        exportedAt: new Date().toISOString(),
        curricula,
      };

      const dateStr = new Date().toISOString().slice(0, 10);
      const tagPart =
        curricula.length === 1 ? curricula[0].scopeSequenceTag : "all";
      downloadJson(
        exportPayload,
        `scope-and-sequence-${tagPart}-${dateStr}.json`,
      );
      onClose();
    } finally {
      setExporting(false);
    }
  }, [checkedGrades, selectedGrade, currentUnits, currentSkillMap, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Export Scope & Sequence
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Select which curricula to include in the export.
        </p>

        {/* Select All / Deselect All */}
        <div className="flex gap-3 mb-3">
          <button
            type="button"
            onClick={selectAll}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={deselectAll}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Deselect All
          </button>
        </div>

        {/* Checkbox list */}
        <div className="space-y-2 max-h-60 overflow-y-auto mb-6">
          {availableGrades.map((grade) => (
            <label
              key={grade}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={checkedGrades.has(grade)}
                onChange={() => toggleGrade(grade)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">{grade}</span>
            </label>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={checkedGrades.size === 0 || exporting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
          >
            {exporting && <Spinner size="xs" variant="default" />}
            {exporting
              ? "Exporting..."
              : `Download JSON (${checkedGrades.size})`}
          </button>
        </div>
      </div>
    </div>
  );
}
