"use client";

import { useState, useMemo } from "react";
import { PencilIcon, TvIcon } from "@heroicons/react/24/outline";
import { SmartboardProgressBar } from "./SmartboardProgressBar";

interface LessonConfig {
  unitLessonId: string;
  lessonName: string;
  grade: string;
  podsieAssignmentId: string;
  totalQuestions: number;
  section?: string;
  unitNumber: number;
  assignmentType?: 'lesson' | 'mastery-check';
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
}

interface SmartboardDisplayProps {
  assignments: LessonConfig[];
  progressData: ProgressData[];
  selectedUnit: number;
  selectedSection: string;
  calculateSummaryStats: (data: ProgressData[]) => {
    avgCompletion: number;
    fullyComplete: number;
    totalStudents: number;
    syncedStudents: number;
  };
}

export function SmartboardDisplay({
  assignments,
  progressData,
  selectedUnit,
  selectedSection: _selectedSection,
  calculateSummaryStats,
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

  // Group lessons with their mastery checks
  const groupedLessons = useMemo(() => {
    const lessonAssignments = assignments.filter(a => a.assignmentType === 'lesson');
    const masteryCheckAssignments = assignments.filter(a => a.assignmentType === 'mastery-check' || !a.assignmentType);

    return lessonAssignments.map(lesson => {
      const masteryCheck = masteryCheckAssignments.find(mc => mc.unitLessonId === lesson.unitLessonId);

      // Calculate stats for lesson
      const lessonProgressData = progressData.filter(
        p => p.podsieAssignmentId
          ? p.podsieAssignmentId === lesson.podsieAssignmentId
          : p.rampUpId === lesson.unitLessonId
      );
      const lessonStats = calculateSummaryStats(lessonProgressData);

      // Calculate stats for mastery check if it exists
      let masteryCheckStats = null;
      if (masteryCheck) {
        const masteryCheckProgressData = progressData.filter(
          p => p.podsieAssignmentId
            ? p.podsieAssignmentId === masteryCheck.podsieAssignmentId
            : p.rampUpId === masteryCheck.unitLessonId
        );
        masteryCheckStats = calculateSummaryStats(masteryCheckProgressData);
      }

      return {
        lesson,
        masteryCheck,
        lessonAvgCompletion: lessonStats.avgCompletion,
        masteryCheckAvgCompletion: masteryCheckStats?.avgCompletion || 0,
      };
    });
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

  // Calculate overall class goal percentage (average of all lesson completions)
  const overallPercentage = groupedLessons.length > 0
    ? Math.round(
        groupedLessons.reduce((sum, g) => sum + g.lessonAvgCompletion, 0) /
          groupedLessons.length
      )
    : 0;

  const smartboardContent = (
    <>
      {/* Smartboard Header */}
      <div className={`bg-indigo-900 rounded-t-xl flex items-center justify-between ${isFullscreen ? "p-8 text-xl" : "p-4"}`}>
        <div className="flex items-center gap-4">
          <div className={`bg-teal-500 text-white rounded-lg font-bold ${isFullscreen ? "px-6 py-3 text-2xl" : "px-4 py-2 text-lg"}`}>
            Mini Goal
          </div>
          <div className={`bg-indigo-700 text-white rounded-lg font-semibold ${isFullscreen ? "px-6 py-3 text-xl" : "px-4 py-2"}`}>
            Unit {selectedUnit} Assignments
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
            {groupedLessons.length} Lesson{groupedLessons.length !== 1 ? "s" : ""}
          </div>
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
              <div className="bg-purple-600 text-white px-3 py-1 rounded-lg font-bold text-sm">
                Class Goal
              </div>
              <span className="text-indigo-300 text-sm">Complete All Assignments</span>
            </div>
            <SmartboardProgressBar
              label=""
              percentage={overallPercentage}
              color="purple"
              showLabel={false}
            />
          </div>

          {/* Individual Assignment Progress - Grouped by Lesson */}
          <div className="space-y-4 pl-4 pr-32 border-l-2 border-indigo-600">
            {groupedLessons.map(({ lesson, masteryCheck, lessonAvgCompletion, masteryCheckAvgCompletion }, index) => {
              return (
                <div key={`${lesson.section}-${lesson.unitLessonId}-${index}`} className="space-y-2">
                  {/* Lesson Progress Bar */}
                  <SmartboardProgressBar
                    label={lesson.lessonName}
                    percentage={lessonAvgCompletion}
                    size="small"
                  />
                  {/* Mastery Check Progress Bar (if exists) */}
                  {masteryCheck && (
                    <div className="pl-4">
                      <SmartboardProgressBar
                        label="Mastery Check"
                        percentage={masteryCheckAvgCompletion}
                        size="small"
                        color="green"
                      />
                    </div>
                  )}
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
              {groupedLessons.map(({ lesson }, index) => (
                <li key={`${lesson.section}-${lesson.unitLessonId}-${index}`} className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold mt-0.5">•</span>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-white bg-indigo-600 px-2 py-0.5 rounded">
                        {lesson.section}
                      </span>
                      <span className="text-xs text-indigo-600">{lesson.unitLessonId}</span>
                    </div>
                    <span className="font-semibold">{lesson.lessonName}</span>
                  </div>
                </li>
              ))}
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
