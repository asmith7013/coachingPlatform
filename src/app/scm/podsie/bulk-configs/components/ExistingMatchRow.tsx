"use client";

import { useState, useEffect, useMemo } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { Spinner } from "@/components/core/feedback/Spinner";
import { findBestMatch } from "@/lib/utils/lesson-name-normalization";
import type { AssignmentMatchResult } from "@/app/actions/scm/podsie/podsie-sync";

interface SavedQuestionMap {
  assignmentId: string;
  assignmentName: string;
  totalQuestions: number;
  notes?: string;
}

interface GroupedMaps {
  unit: string;
  course: string;
  maps: SavedQuestionMap[];
}

/**
 * Parse course and unit from notes path
 * e.g., "Exported from courses/IM-8th-Grade/modules/Unit-3/assignments/Ramp-Up-2"
 */
function parseUnitFromNotes(notes?: string): { course: string; unit: string } {
  if (!notes) return { course: "Unknown", unit: "Unknown" };
  const match = notes.match(/courses\/([^/]+)\/modules\/([^/]+)/);
  if (match) {
    return {
      course: match[1].replace("IM-", "").replace(/-/g, " "),
      unit: match[2].replace(/-/g, " "),
    };
  }
  return { course: "Unknown", unit: "Unknown" };
}

interface ExistingMatchRowProps {
  match: AssignmentMatchResult;
  savedQuestionMaps: SavedQuestionMap[];
  onUpdateQuestionMap: (
    podsieAssignmentId: string,
    questionMapId: string,
  ) => Promise<void>;
  isSaving: boolean;
}

const ACTIVITY_TYPE_COLORS = {
  sidekick: "bg-purple-100 text-purple-700",
  "mastery-check": "bg-blue-100 text-blue-700",
  assessment: "bg-orange-100 text-orange-700",
};

const ACTIVITY_TYPE_LABELS = {
  sidekick: "Sidekick",
  "mastery-check": "Mastery Check",
  assessment: "Assessment",
};

export function ExistingMatchRow({
  match,
  savedQuestionMaps,
  onUpdateQuestionMap,
  isSaving,
}: ExistingMatchRowProps) {
  const [selectedMapId, setSelectedMapId] = useState<string>("");
  const [predictedMapId, setPredictedMapId] = useState<string>("");

  // Group question maps by course and unit
  const groupedMaps = useMemo(() => {
    const groups = new Map<string, GroupedMaps>();

    for (const qMap of savedQuestionMaps) {
      const { course, unit } = parseUnitFromNotes(qMap.notes);
      const key = `${course}|${unit}`;

      if (!groups.has(key)) {
        groups.set(key, { course, unit, maps: [] });
      }
      groups.get(key)!.maps.push(qMap);
    }

    // Sort groups by course then unit
    return Array.from(groups.values()).sort((a, b) => {
      const courseCompare = a.course.localeCompare(b.course);
      if (courseCompare !== 0) return courseCompare;
      return a.unit.localeCompare(b.unit);
    });
  }, [savedQuestionMaps]);

  // Find best matching question map on mount
  useEffect(() => {
    if (savedQuestionMaps.length > 0) {
      // Use the same matching logic to find best match
      const mapItems = savedQuestionMaps.map((m) => ({
        id: m.assignmentId,
        lessonName: m.assignmentName,
        unitLessonId: m.assignmentId,
      }));

      const bestMatch = findBestMatch(
        match.podsieAssignment.assignmentName,
        mapItems,
        0.5,
      );

      if (bestMatch.match) {
        setPredictedMapId(bestMatch.match.id);
        setSelectedMapId(bestMatch.match.id);
      }
    }
  }, [match.podsieAssignment.assignmentName, savedQuestionMaps]);

  const handleSave = () => {
    if (selectedMapId) {
      onUpdateQuestionMap(
        String(match.podsieAssignment.assignmentId),
        selectedMapId,
      );
    }
  };

  const selectedMap = savedQuestionMaps.find(
    (m) => m.assignmentId === selectedMapId,
  );
  const isPredicted = selectedMapId === predictedMapId && predictedMapId !== "";

  return (
    <div className="p-3 bg-white rounded border border-gray-200">
      {/* Assignment Info Row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="font-medium text-gray-900 truncate">
            {match.podsieAssignment.assignmentName}
          </span>
          <span className="text-xs text-gray-400">
            ID: {match.podsieAssignment.assignmentId}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${ACTIVITY_TYPE_COLORS[match.assignmentType]}`}
          >
            {ACTIVITY_TYPE_LABELS[match.assignmentType]}
          </span>
        </div>
        {/* Existing Scope & Sequence Match Info - aligned right */}
        {match.existingLesson && (
          <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap ml-2">
            Scope &amp; Sequence: {match.existingLesson.unitLessonId} —{" "}
            {match.existingLesson.lessonName}
          </span>
        )}
      </div>

      {/* Question Map Selection Row */}
      <div className="flex items-center gap-2 mt-2">
        <select
          value={selectedMapId}
          onChange={(e) => setSelectedMapId(e.target.value)}
          disabled={isSaving}
          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Select question map...</option>
          {groupedMaps.map((group) => (
            <optgroup
              key={`${group.course}-${group.unit}`}
              label={`${group.course} — ${group.unit}`}
            >
              {group.maps.map((qMap) => (
                <option key={qMap.assignmentId} value={qMap.assignmentId}>
                  {qMap.assignmentName} ({qMap.totalQuestions} Qs)
                  {qMap.assignmentId === predictedMapId ? " ★" : ""}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        {isPredicted && selectedMap && (
          <span className="text-xs text-green-600 whitespace-nowrap">
            Auto-matched
          </span>
        )}

        <button
          onClick={handleSave}
          disabled={!selectedMapId || isSaving}
          className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
        >
          {isSaving ? (
            <>
              <Spinner size="sm" variant="default" />
              Saving
            </>
          ) : (
            <>
              <CheckCircleIcon className="w-4 h-4" />
              Update Map
            </>
          )}
        </button>
      </div>

      {/* Info about selected map */}
      {selectedMap && (
        <div className="mt-2 text-xs text-gray-500">
          {selectedMap.notes && (
            <span className="text-gray-400">
              Source: {selectedMap.notes.replace("Exported from ", "")}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
