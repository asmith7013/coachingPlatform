"use client";

import React, { useState, useMemo } from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";
import { Spinner } from "@/components/core/feedback/Spinner";
import { ExistingMatchRow } from "./ExistingMatchRow";
import type { BulkMatchResult, AssignmentMatchResult, ConflictResult, AvailableLesson } from "@/app/actions/313/podsie-sync";
import type { PodsieAssignmentInfo } from "@/app/actions/313/podsie-sync";

interface SavedQuestionMap {
  assignmentId: string;
  assignmentName: string;
  totalQuestions: number;
  notes?: string;
}

interface SectionMatchResultsProps {
  result: BulkMatchResult;
  onSaveMatch: (match: AssignmentMatchResult) => Promise<void>;
  onSaveAllMatches: (matches: AssignmentMatchResult[]) => Promise<void>;
  onManualMatch: (assignment: PodsieAssignmentInfo, lesson: AvailableLesson) => Promise<void>;
  onUpdateQuestionMap?: (podsieAssignmentId: string, questionMapId: string) => Promise<void>;
  savedQuestionMaps?: SavedQuestionMap[];
  savingMatchId: number | null;
  savingAll: boolean;
  updatingMapId?: string | null;
}

/**
 * Display match results for a single section
 */
export function SectionMatchResults({
  result,
  onSaveMatch,
  onSaveAllMatches,
  onManualMatch,
  onUpdateQuestionMap,
  savedQuestionMaps = [],
  savingMatchId,
  savingAll,
  updatingMapId,
}: SectionMatchResultsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    matched: true,
    conflicts: true,
    unmatched: true,
  });

  const toggleSection = (section: 'matched' | 'conflicts' | 'unmatched') => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Filter to new matches only (not already saved)
  const newMatches = result.matches.filter(m => !m.alreadyExists && m.matchedLesson);
  const existingMatches = result.matches.filter(m => m.alreadyExists);

  const hasNewMatches = newMatches.length > 0;
  const hasConflicts = result.conflicts.length > 0;
  const hasUnmatched = result.unmatched.length > 0;

  if (result.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-800">
          <XCircleIcon className="w-5 h-5" />
          <span className="font-medium">
            {result.classSection} ({result.scopeTag})
          </span>
        </div>
        <p className="text-red-600 text-sm mt-2">{result.error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDownIcon className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRightIcon className="w-5 h-5 text-gray-500" />
          )}
          <span className="font-semibold text-gray-900">
            Section {result.classSection}
          </span>
          <span className="text-sm text-gray-500">({result.scopeTag})</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Stats badges */}
          <div className="flex items-center gap-2 text-sm">
            {newMatches.length > 0 && (
              <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded">
                <CheckCircleIcon className="w-4 h-4" />
                {newMatches.length} new
              </span>
            )}
            {existingMatches.length > 0 && (
              <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded">
                {existingMatches.length} existing
              </span>
            )}
            {hasConflicts && (
              <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                <ExclamationTriangleIcon className="w-4 h-4" />
                {result.conflicts.length}
              </span>
            )}
            {hasUnmatched && (
              <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded">
                <XCircleIcon className="w-4 h-4" />
                {result.unmatched.length}
              </span>
            )}
          </div>

          {/* Save All button */}
          {hasNewMatches && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSaveAllMatches(newMatches);
              }}
              disabled={savingAll}
              className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
            >
              {savingAll ? (
                <>
                  <Spinner size="sm" variant="default" />
                  Saving...
                </>
              ) : (
                `Save All (${newMatches.length})`
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* New Matches Section */}
          {newMatches.length > 0 && (
            <CollapsibleSection
              title="New Matches"
              count={newMatches.length}
              icon={<CheckCircleIcon className="w-5 h-5 text-green-500" />}
              isExpanded={expandedSections.matched}
              onToggle={() => toggleSection('matched')}
              bgColor="bg-green-50"
            >
              <div className="space-y-2">
                {newMatches.map((match) => (
                  <MatchRow
                    key={match.podsieAssignment.assignmentId}
                    match={match}
                    onSave={() => onSaveMatch(match)}
                    isSaving={savingMatchId === match.podsieAssignment.assignmentId}
                  />
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Existing Matches Section */}
          {existingMatches.length > 0 && (
            <CollapsibleSection
              title="Already Configured"
              count={existingMatches.length}
              icon={<CheckCircleIcon className="w-5 h-5 text-blue-500" />}
              isExpanded={false}
              onToggle={() => {}}
              bgColor="bg-blue-50"
              defaultCollapsed
            >
              <div className="space-y-2">
                {existingMatches.map((match) => (
                  <ExistingMatchRow
                    key={match.podsieAssignment.assignmentId}
                    match={match}
                    savedQuestionMaps={savedQuestionMaps}
                    onUpdateQuestionMap={onUpdateQuestionMap || (async () => {})}
                    isSaving={updatingMapId === String(match.podsieAssignment.assignmentId)}
                  />
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Conflicts Section */}
          {hasConflicts && (
            <CollapsibleSection
              title="Conflicts"
              count={result.conflicts.length}
              icon={<ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />}
              isExpanded={expandedSections.conflicts}
              onToggle={() => toggleSection('conflicts')}
              bgColor="bg-yellow-50"
            >
              <div className="space-y-2">
                {result.conflicts.map((conflict) => (
                  <ConflictRow key={conflict.podsieAssignment.assignmentId} conflict={conflict} />
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Unmatched Section */}
          {hasUnmatched && (
            <CollapsibleSection
              title="Unmatched Assignments"
              count={result.unmatched.length}
              icon={<XCircleIcon className="w-5 h-5 text-red-500" />}
              isExpanded={expandedSections.unmatched}
              onToggle={() => toggleSection('unmatched')}
              bgColor="bg-red-50"
            >
              <div className="space-y-2">
                {result.unmatched.map((assignment) => (
                  <UnmatchedRow
                    key={assignment.assignmentId}
                    assignment={assignment}
                    availableLessons={result.availableLessons}
                    onManualMatch={onManualMatch}
                    isSaving={savingMatchId === assignment.assignmentId}
                  />
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Empty state */}
          {newMatches.length === 0 && existingMatches.length === 0 && !hasConflicts && !hasUnmatched && (
            <div className="text-center py-8 text-gray-500">
              No assignments found for this section
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =====================================
// HELPER COMPONENTS
// =====================================

interface CollapsibleSectionProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  bgColor: string;
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}

function CollapsibleSection({
  title,
  count,
  icon,
  isExpanded: isExpandedProp,
  onToggle,
  bgColor,
  children,
  defaultCollapsed,
}: CollapsibleSectionProps) {
  const [localExpanded, setLocalExpanded] = useState(!defaultCollapsed);
  const isExpanded = defaultCollapsed ? localExpanded : isExpandedProp;
  const handleToggle = defaultCollapsed ? () => setLocalExpanded(!localExpanded) : onToggle;

  return (
    <div className={`rounded-lg ${bgColor} overflow-hidden`}>
      <div
        className="flex items-center justify-between p-3 cursor-pointer"
        onClick={handleToggle}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDownIcon className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRightIcon className="w-4 h-4 text-gray-500" />
          )}
          {icon}
          <span className="font-medium text-gray-700">{title}</span>
          <span className="text-sm text-gray-500">({count})</span>
        </div>
      </div>
      {isExpanded && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

interface MatchRowProps {
  match: AssignmentMatchResult;
  onSave: () => void;
  isSaving: boolean;
}

function MatchRow({ match, onSave, isSaving }: MatchRowProps) {
  const similarityPercent = Math.round(match.similarity * 100);
  const similarityColor =
    match.similarity >= 0.9 ? 'text-green-600' :
    match.similarity >= 0.7 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 truncate">
            {match.podsieAssignment.assignmentName}
          </span>
          <span className="text-xs text-gray-400">
            ID: {match.podsieAssignment.assignmentId}
          </span>
        </div>
        {match.matchedLesson && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-gray-400">→</span>
            <span className="text-sm text-indigo-600">
              {match.matchedLesson.unitLessonId}: {match.matchedLesson.lessonName}
            </span>
            <span className={`text-xs ${similarityColor}`}>
              ({similarityPercent}%)
            </span>
            <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
              {match.assignmentType}
            </span>
          </div>
        )}
      </div>
      <button
        onClick={onSave}
        disabled={isSaving}
        className="ml-4 px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
      >
        {isSaving ? (
          <>
            <Spinner size="sm" variant="default" />
            Saving
          </>
        ) : (
          'Save'
        )}
      </button>
    </div>
  );
}

interface ConflictRowProps {
  conflict: ConflictResult;
}

function ConflictRow({ conflict }: ConflictRowProps) {
  return (
    <div className="p-3 bg-white rounded border border-yellow-200">
      <div className="font-medium text-gray-900">
        {conflict.podsieAssignment.assignmentName}
      </div>
      <div className="mt-2 text-sm space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Current:</span>
          <span className="text-gray-700">
            {conflict.existingLesson.unitLessonId}: {conflict.existingLesson.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">New match:</span>
          <span className="text-indigo-600">
            {conflict.newMatchedLesson.unitLessonId}: {conflict.newMatchedLesson.name}
          </span>
        </div>
      </div>
      <p className="mt-2 text-xs text-yellow-700">
        This assignment is already matched to a different lesson. Review manually in Section Configs.
      </p>
    </div>
  );
}

interface UnmatchedRowProps {
  assignment: PodsieAssignmentInfo;
  availableLessons: AvailableLesson[];
  onManualMatch: (assignment: PodsieAssignmentInfo, lesson: AvailableLesson) => Promise<void>;
  isSaving: boolean;
}

interface GroupedLessons {
  unitNumber: string;
  grade: string;
  lessons: AvailableLesson[];
}

/**
 * Extract unit number from unitLessonId (e.g., "4.RU1" -> "4", "4.1" -> "4")
 */
function extractUnitNumber(unitLessonId: string): string {
  const match = unitLessonId.match(/^(\d+)\./);
  return match ? match[1] : "0";
}

function UnmatchedRow({ assignment, availableLessons, onManualMatch, isSaving }: UnmatchedRowProps) {
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");

  // Group lessons by unit number
  const groupedLessons = useMemo(() => {
    const groups = new Map<string, GroupedLessons>();

    for (const lesson of availableLessons) {
      const unitNumber = extractUnitNumber(lesson.unitLessonId);
      const grade = lesson.grade || "Unknown";
      const key = `${grade}-${unitNumber}`;

      if (!groups.has(key)) {
        groups.set(key, { unitNumber, grade, lessons: [] });
      }
      groups.get(key)!.lessons.push(lesson);
    }

    // Sort groups by grade then unit number
    return Array.from(groups.values()).sort((a, b) => {
      const gradeCompare = a.grade.localeCompare(b.grade);
      if (gradeCompare !== 0) return gradeCompare;
      return parseInt(a.unitNumber) - parseInt(b.unitNumber);
    });
  }, [availableLessons]);

  const handleSave = () => {
    const lesson = availableLessons.find(l => l.id === selectedLessonId);
    if (lesson) {
      onManualMatch(assignment, lesson);
    }
  };

  return (
    <div className="p-3 bg-white rounded border border-red-200">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="font-medium text-gray-900">{assignment.assignmentName}</div>
          <div className="text-xs text-gray-500 mt-1">
            ID: {assignment.assignmentId} | {assignment.totalQuestions} questions
            {assignment.moduleName && ` | ${assignment.moduleName}`}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <select
          value={selectedLessonId}
          onChange={(e) => setSelectedLessonId(e.target.value)}
          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          disabled={isSaving}
        >
          <option value="">Select a lesson to match...</option>
          {groupedLessons.map((group) => (
            <optgroup key={`${group.grade}-unit-${group.unitNumber}`} label={`Grade ${group.grade} — Unit ${group.unitNumber}`}>
              {group.lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.unitLessonId}: {lesson.lessonName}
                  {lesson.lessonType && ` (${lesson.lessonType})`}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <button
          onClick={handleSave}
          disabled={!selectedLessonId || isSaving}
          className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
        >
          {isSaving ? (
            <>
              <Spinner size="sm" variant="default" />
              Saving
            </>
          ) : (
            'Save'
          )}
        </button>
      </div>
    </div>
  );
}
