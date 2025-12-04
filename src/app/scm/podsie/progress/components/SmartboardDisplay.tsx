"use client";

import { useState, useMemo } from "react";
import { PencilIcon, TvIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { SmartboardProgressBar } from "./SmartboardProgressBar";
import { groupAssignmentsByUnitLesson } from "../utils/groupAssignments";
import { formatLessonDisplay } from "@/lib/utils/lesson-display";
import type { LessonType } from "@/lib/utils/lesson-display";

interface LessonConfig {
  unitLessonId: string;
  lessonName: string;
  lessonType?: LessonType;
  lessonTitle?: string;
  grade: string;
  podsieAssignmentId: string;
  totalQuestions: number;
  section?: string;
  unitNumber: number;
  activityType?: 'sidekick' | 'mastery-check';
  hasZearnActivity?: boolean;
}

interface ProgressData {
  studentId: string;
  studentName: string;
  unitCode: string;
  rampUpId: string;
  rampUpName?: string;
  podsieAssignmentId?: string;
  questions: Array<{ questionNumber: number; completed: boolean }>;
  totalQuestions: number;
  completedCount: number;
  percentComplete: number;
  isFullyComplete: boolean;
  lastSyncedAt?: string;
  zearnCompleted?: boolean;
}

interface SmartboardDisplayProps {
  assignments: LessonConfig[];
  progressData: ProgressData[];
  selectedUnit: number;
  selectedSection: string;
  selectedLessonSection: string;
  calculateSummaryStats: (data: ProgressData[]) => {
    avgCompletion: number;
    fullyComplete: number;
    totalStudents: number;
    syncedStudents: number;
  };
  onSyncAll?: () => void;
  syncingAll?: boolean;
}

export function SmartboardDisplay({
  assignments,
  progressData,
  selectedUnit,
  selectedSection,
  selectedLessonSection,
  calculateSummaryStats,
  onSyncAll,
  syncingAll = false,
}: SmartboardDisplayProps) {
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dueDate, setDueDate] = useState<string>(() => {
    // Default to next Friday
    const today = new Date();
    const daysUntilFriday = (5 - today.getDay() + 7) % 7 || 7;
    const nextFriday = new Date(today);
    nextFriday.setDate(today.getDate() + daysUntilFriday);
    return nextFriday.toISOString().split("T")[0];
  });
  const [learningContent, setLearningContent] = useState<string>("");

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Format due date for display
  const formattedDueDate = useMemo(() => {
    const date = new Date(dueDate + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }, [dueDate]);

  // Group lessons with their mastery checks and map progress data
  const assignmentProgress = useMemo(() => {
    console.log('=== GROUPING ASSIGNMENTS (SmartboardDisplay) ===');
    console.log('Total assignments:', assignments.length);

    // Use shared grouping utility
    const groupedAssignments = groupAssignmentsByUnitLesson(assignments);

    console.log('Grouped assignments:', groupedAssignments.length);

    // Map grouped assignments to progress data
    const progressMapped = groupedAssignments.map(({ lesson, masteryCheck }) => {
      // Get lesson progress
      const lessonProgressData = progressData.filter(
        p => p.podsieAssignmentId
          ? p.podsieAssignmentId === lesson.podsieAssignmentId
          : p.rampUpId === lesson.unitLessonId
      );
      const lessonStats = calculateSummaryStats(lessonProgressData);

      // Calculate Zearn progress
      let zearnProgress = null;
      if (lesson.hasZearnActivity && lessonProgressData.length > 0) {
        const zearnCompleted = lessonProgressData.filter(p => p.zearnCompleted).length;
        zearnProgress = Math.round((zearnCompleted / lessonProgressData.length) * 100);
      }

      // Get mastery check progress if exists
      let masteryCheckProgress = null;
      if (masteryCheck) {
        const masteryProgressData = progressData.filter(
          p => p.podsieAssignmentId
            ? p.podsieAssignmentId === masteryCheck.podsieAssignmentId
            : p.rampUpId === masteryCheck.unitLessonId
        );
        const masteryStats = calculateSummaryStats(masteryProgressData);
        masteryCheckProgress = masteryStats.avgCompletion;
      }

      return {
        lesson,
        lessonProgress: lessonStats.avgCompletion,
        zearnProgress,
        masteryCheck,
        masteryCheckProgress,
      };
    });

    console.log('Progress mapped:', progressMapped.map(p => ({
      lesson: `${p.lesson.podsieAssignmentId} (${p.lesson.activityType})`,
      masteryCheck: p.masteryCheck ? `${p.masteryCheck.podsieAssignmentId} (${p.masteryCheck.activityType})` : 'NONE',
      lessonProgress: p.lessonProgress,
      masteryCheckProgress: p.masteryCheckProgress
    })));

    return progressMapped;
  }, [assignments, progressData, calculateSummaryStats]);

  // Parse markdown-like content for display
  const parsedLearningContent = useMemo(() => {
    if (!learningContent.trim()) return [];
    return learningContent
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        // Remove leading "- " or "• " if present
        return line.replace(/^[-•]\s*/, "").trim();
      });
  }, [learningContent]);

  // Calculate overall class goal percentage (average of all assignments)
  const overallPercentage = useMemo(() => {
    if (assignmentProgress.length === 0) return 0;

    const totalCompletion = assignmentProgress.reduce(
      (sum, item) => sum + item.lessonProgress,
      0
    );

    return Math.round(totalCompletion / assignmentProgress.length);
  }, [assignmentProgress]);

  // Format lesson section for display (add "Section" prefix for single letters)
  const formattedLessonSection = useMemo(() => {
    if (!selectedLessonSection) return '';
    // If it's a single letter (A, B, C, D, E, etc), add "Section" prefix
    if (selectedLessonSection.length === 1 && /^[A-Z]$/i.test(selectedLessonSection)) {
      return `Section ${selectedLessonSection}`;
    }
    return selectedLessonSection;
  }, [selectedLessonSection]);

  const smartboardContent = (
    <>
      {/* Smartboard Header */}
      <div className={`bg-indigo-900 rounded-t-xl flex items-center justify-between ${isFullscreen ? "p-8 text-xl" : "p-4"}`}>
        <div className="flex items-center gap-4">
          <div className={`bg-teal-500 text-white rounded-lg font-bold ${isFullscreen ? "px-6 py-3 text-2xl" : "px-4 py-2 text-lg"}`}>
            Mini Goal
          </div>
          <div className={`bg-indigo-700 text-white rounded-lg font-semibold ${isFullscreen ? "px-6 py-3 text-xl" : "px-4 py-2"}`}>
            Unit {selectedUnit}: {formattedLessonSection}
          </div>
          {isEditMode ? (
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={`bg-indigo-600 text-white rounded-lg border border-indigo-400 focus:outline-none focus:ring-2 focus:ring-white ${isFullscreen ? "px-6 py-3 text-xl" : "px-4 py-2"}`}
            />
          ) : (
            <div className={`bg-indigo-600 text-white rounded-lg ${isFullscreen ? "px-6 py-3 text-xl" : "px-4 py-2"}`}>
              By {formattedDueDate}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className={`bg-white text-indigo-900 rounded-lg font-bold ${isFullscreen ? "px-6 py-3 text-xl" : "px-4 py-2"}`}>
            {assignmentProgress.length} Assignment{assignmentProgress.length !== 1 ? "s" : ""}
          </div>
          {onSyncAll && (
            <button
              onClick={onSyncAll}
              disabled={syncingAll}
              className={`bg-indigo-700 hover:bg-indigo-600 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${isFullscreen ? "p-3" : "p-2"}`}
              title="Sync All Assignments"
            >
              <ArrowPathIcon className={`${isFullscreen ? "w-8 h-8" : "w-6 h-6"} text-white ${syncingAll ? 'animate-spin' : ''}`} />
            </button>
          )}
          <button
            onClick={toggleFullscreen}
            className={`bg-indigo-700 hover:bg-indigo-600 rounded-lg transition-colors cursor-pointer ${isFullscreen ? "p-3" : "p-2"}`}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            <TvIcon className={isFullscreen ? "w-8 h-8 text-white" : "w-6 h-6 text-white"} />
          </button>
        </div>
      </div>

      {/* Smartboard Content - Combined Goal and Progress */}
      <div className={`bg-indigo-800 rounded-b-xl flex gap-8 ${isFullscreen ? "p-12 flex-1" : "p-6"}`}>
        {/* Left: Class Goal + Individual Progress */}
        <div className="flex-1 space-y-6">
          {/* Class Goal - Main Progress */}
          <div className="bg-indigo-900/50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-teal-500 text-white px-3 py-1 rounded-lg font-bold text-sm">
                Class Goal
              </div>
              <span className="text-indigo-300 text-sm">Complete All Assignments</span>
            </div>
            <SmartboardProgressBar
              label=""
              percentage={overallPercentage}
              color="teal"
              showLabel={false}
            />
          </div>

          {/* Individual Assignment Progress */}
          <div className="space-y-3 pl-4 pr-32 border-l-2 border-indigo-600">
            {assignmentProgress.map(({ lesson, lessonProgress, zearnProgress, masteryCheck, masteryCheckProgress }) => {
              // Extract lesson number
              const lessonNumber = lesson.unitLessonId.includes('.')
                ? lesson.unitLessonId.split('.')[1]
                : lesson.unitLessonId;

              // Build label using helper function (handles ramp-ups, assessments, and regular lessons)
              const label = formatLessonDisplay(
                lesson.lessonName,
                lessonNumber,
                {
                  showLessonNumber: selectedSection !== 'Ramp Ups' && selectedSection !== 'Unit Assessment',
                  section: lesson.section
                },
                lesson.lessonType,
                lesson.lessonTitle
              );

              // Build segments for split bar
              const segments = [];

              // Determine if we should show Zearn
              // Hide Zearn when there's both a sidekick and mastery check
              const hasSidekickAndMasteryCheck = lesson.activityType === 'sidekick' && masteryCheck && masteryCheckProgress !== null;
              const shouldShowZearn = zearnProgress !== null && !hasSidekickAndMasteryCheck;

              // Add Zearn if present (35%)
              if (shouldShowZearn) {
                segments.push({ percentage: zearnProgress, color: 'purple' as const, widthPercent: 35 });
              }

              // Determine lesson/mastery split
              if (masteryCheck && masteryCheckProgress !== null) {
                // Has both lesson and mastery check: 60% lesson, 40% mastery check
                const lessonWidth = shouldShowZearn ? 39 : 60; // 60% of remaining 65%, or 60% of 100%
                const masteryWidth = shouldShowZearn ? 26 : 40; // 40% of remaining 65%, or 40% of 100%
                segments.push({ percentage: lessonProgress, color: 'blue' as const, widthPercent: lessonWidth });
                segments.push({ percentage: masteryCheckProgress, color: 'green' as const, widthPercent: masteryWidth });
              } else {
                // Only lesson or standalone mastery check
                const barColor = lesson.activityType === 'mastery-check' ? 'green' : 'blue';
                const widthPercent = shouldShowZearn ? 65 : 100;
                segments.push({ percentage: lessonProgress, color: barColor as 'blue' | 'green', widthPercent });
              }

              return (
                <div key={lesson.podsieAssignmentId} className="pl-4">
                  <SmartboardProgressBar
                    label={label}
                    segments={segments}
                    size="split"
                    showLabel={true}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Info Panel */}
        <div className="w-80 bg-indigo-100 rounded-xl p-5 border-4 border-indigo-300">
          <h3 className="text-indigo-900 font-bold text-lg mb-4 text-center">
            What We&apos;re Learning
          </h3>
          {isEditMode ? (
            <div>
              <textarea
                value={learningContent}
                onChange={(e) => setLearningContent(e.target.value)}
                placeholder="Enter learning objectives (one per line)&#10;- Learn equivalent expressions&#10;- Practice combining like terms"
                className="w-full h-40 p-3 border border-indigo-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <p className="text-xs text-indigo-600 mt-2">
                Enter one item per line. Use &quot;-&quot; or just text.
              </p>
            </div>
          ) : parsedLearningContent.length > 0 ? (
            <ul className="space-y-3 text-indigo-900">
              {parsedLearningContent.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold mt-0.5">•</span>
                  <div>{item}</div>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="space-y-3 text-indigo-900">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold mt-0.5">•</span>
                <div>Get ready for our unit about equations</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold mt-0.5">•</span>
                <div>Steps to solve equations</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold mt-0.5">•</span>
                <div>Strategies for making equations simpler (simplifying)</div>
              </li>
            </ul>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="mt-8">
      {/* Edit Mode Toggle */}
      {!isFullscreen && (
        <div className="flex justify-end mb-2">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              isEditMode
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <PencilIcon className="w-4 h-4" />
            {isEditMode ? "Done Editing" : "Edit Display"}
          </button>
        </div>
      )}

      {/* Normal Display */}
      {!isFullscreen && smartboardContent}

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-6">
          <div className="w-full h-full max-w-[94vw] max-h-[94vh] flex flex-col">
            {smartboardContent}
          </div>
        </div>
      )}
    </div>
  );
}
