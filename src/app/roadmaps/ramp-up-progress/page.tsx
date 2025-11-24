"use client";

import { useState, useEffect, useMemo } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { CheckCircleIcon as CheckCircleOutlineIcon } from "@heroicons/react/24/outline";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { RoadmapsNav } from "../components/RoadmapsNav";
import { fetchStudents } from "@/app/actions/313/students";
import { Student, RampUpQuestion } from "@zod-schema/313/student";
import {
  fetchRampUpProgress,
  syncSectionRampUpProgress,
  SyncSectionResult,
} from "@/app/actions/313/podsie-sync";
import {
  fetchUnitsWithRampUps,
  fetchRampUpsByUnit,
} from "@/app/actions/313/scope-and-sequence";

// Map section to scopeSequenceTag based on first digit
// 802 = Algebra 1
// 6xx = Grade 6
// 7xx = Grade 7
// 8xx (except 802) = Grade 8
function getScopeTagForSection(section: string): string {
  if (section === "802") {
    return "Algebra 1";
  }
  if (section.startsWith("6")) {
    return "Grade 6";
  }
  if (section.startsWith("7")) {
    return "Grade 7";
  }
  if (section.startsWith("8")) {
    return "Grade 8";
  }
  // Default fallback
  return "Grade 8";
}

interface RampUpConfig {
  _id: string;
  unitNumber: number;
  unitLessonId: string;
  lessonName: string;
  unit: string;
  grade: string;
  scopeSequenceTag: string;
  podsyAssignmentId?: string;
  totalQuestions: number;
}

interface UnitOption {
  unitNumber: number;
  unitName: string;
  grade: string;
  rampUpCount: number;
}

interface ProgressData {
  studentId: string;
  studentName: string;
  unitCode: string;
  rampUpId: string;
  rampUpName?: string;
  questions: RampUpQuestion[];
  totalQuestions: number;
  completedCount: number;
  percentComplete: number;
  isFullyComplete: boolean;
  lastSyncedAt?: string;
}

export default function RampUpProgressPage() {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null); // Track which ramp-up is syncing
  const [syncResult, setSyncResult] = useState<SyncSectionResult | null>(null);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [sections, setSections] = useState<string[]>([]);
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [rampUps, setRampUps] = useState<RampUpConfig[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Derive scopeSequenceTag from section
  const scopeSequenceTag = useMemo(() => {
    return selectedSection ? getScopeTagForSection(selectedSection) : "";
  }, [selectedSection]);

  // Load sections on mount
  useEffect(() => {
    const loadSections = async () => {
      try {
        setLoading(true);
        const result = await fetchStudents({
          page: 1,
          limit: 1000,
          sortBy: "lastName",
          sortOrder: "asc",
          filters: { active: true },
          search: "",
          searchFields: [],
        });

        if (result.success && result.items) {
          const allStudents = result.items as Student[];
          const uniqueSections = Array.from(
            new Set(allStudents.map((s) => s.section))
          ).sort();
          setSections(uniqueSections);
        }
      } catch (err) {
        console.error("Error loading sections:", err);
        setError("Failed to load sections");
      } finally {
        setLoading(false);
      }
    };

    loadSections();
  }, []);

  // Load units when section changes (via scopeSequenceTag)
  useEffect(() => {
    const loadUnits = async () => {
      if (!scopeSequenceTag) {
        setUnits([]);
        setSelectedUnit(null);
        setRampUps([]);
        return;
      }

      try {
        const result = await fetchUnitsWithRampUps(scopeSequenceTag);
        if (result.success) {
          setUnits(result.data);
          // Clear unit selection when section changes
          setSelectedUnit(null);
          setRampUps([]);
        } else {
          setError(result.error || "Failed to load units");
        }
      } catch (err) {
        console.error("Error loading units:", err);
        setError("Failed to load units");
      }
    };

    loadUnits();
  }, [scopeSequenceTag]);

  // Load ramp-ups when unit changes
  useEffect(() => {
    const loadRampUps = async () => {
      if (!scopeSequenceTag || selectedUnit === null) {
        setRampUps([]);
        return;
      }

      try {
        const result = await fetchRampUpsByUnit(scopeSequenceTag, selectedUnit);
        if (result.success) {
          setRampUps(result.data);
        } else {
          setError(result.error || "Failed to load ramp-ups");
        }
      } catch (err) {
        console.error("Error loading ramp-ups:", err);
        setError("Failed to load ramp-ups");
      }
    };

    loadRampUps();
  }, [scopeSequenceTag, selectedUnit]);

  // Fetch progress data when section and unit are selected
  useEffect(() => {
    const loadProgress = async () => {
      if (!selectedSection || selectedUnit === null || rampUps.length === 0) {
        setProgressData([]);
        return;
      }

      try {
        setLoading(true);
        // Get the grade from the first ramp-up (all ramp-ups in a unit share the same grade)
        const grade = rampUps[0]?.grade || "8";
        const unitCode = `${grade}.${selectedUnit}`;
        const result = await fetchRampUpProgress(selectedSection, unitCode);

        if (result.success) {
          setProgressData(result.data);
        } else {
          setError(result.error || "Failed to load progress");
        }
      } catch (err) {
        console.error("Error loading progress:", err);
        setError("Failed to load progress");
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [selectedSection, selectedUnit, rampUps]);

  // Sync a single ramp-up from Podsie
  const handleSyncRampUp = async (rampUp: RampUpConfig, testMode: boolean = false) => {
    if (!selectedSection || !rampUp.podsyAssignmentId) return;

    try {
      setSyncing(rampUp._id);
      setSyncResult(null);
      setError(null);

      const unitCode = `${rampUp.grade}.${selectedUnit}`;
      const result = await syncSectionRampUpProgress(
        selectedSection,
        rampUp.podsyAssignmentId,
        unitCode,
        rampUp.unitLessonId,
        rampUp.totalQuestions,
        { testMode }
      );

      setSyncResult(result);

      // Reload progress data
      if (result.success) {
        const progressResult = await fetchRampUpProgress(
          selectedSection,
          unitCode
        );
        if (progressResult.success) {
          setProgressData(progressResult.data);
        }
      }
    } catch (err) {
      console.error("Error syncing:", err);
      setError("Failed to sync from Podsie");
    } finally {
      setSyncing(null);
    }
  };

  // Calculate summary stats for progress data
  const calculateSummaryStats = (data: ProgressData[]) => {
    const studentsWithProgress = data.filter((p) => p.totalQuestions > 0);
    if (studentsWithProgress.length === 0) {
      return {
        avgCompletion: 0,
        fullyComplete: 0,
        totalStudents: data.length,
        syncedStudents: 0,
      };
    }

    const avgCompletion = Math.round(
      studentsWithProgress.reduce((sum, p) => sum + p.percentComplete, 0) /
        studentsWithProgress.length
    );
    const fullyComplete = studentsWithProgress.filter(
      (p) => p.isFullyComplete
    ).length;

    return {
      avgCompletion,
      fullyComplete,
      totalStudents: data.length,
      syncedStudents: studentsWithProgress.length,
    };
  };

  if (loading && sections.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-gray-600">Loading...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Navigation */}
        <RoadmapsNav />

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">Ramp-Up Progress</h1>
          <p className="text-gray-600 mb-4">
            Track student progress on ramp-up assessments by question
          </p>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label
                htmlFor="section-filter"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Class Section
              </label>
              <select
                id="section-filter"
                value={selectedSection}
                onChange={(e) => {
                  setSelectedSection(e.target.value);
                  setSelectedUnit(null);
                  setSyncResult(null);
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !selectedSection
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-300"
                }`}
              >
                <option value="">Select Section</option>
                {sections.map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="unit-filter"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Unit
              </label>
              <select
                id="unit-filter"
                value={selectedUnit ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedUnit(val ? parseInt(val, 10) : null);
                  setSyncResult(null);
                }}
                disabled={!selectedSection || units.length === 0}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  selectedSection && selectedUnit === null && units.length > 0
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-300"
                } ${!selectedSection || units.length === 0 ? "bg-gray-100 cursor-not-allowed" : ""}`}
              >
                <option value="">
                  {!selectedSection
                    ? "Select section first"
                    : units.length === 0
                    ? "No ramp-ups available"
                    : "Select Unit"}
                </option>
                {units.map((unit) => (
                  <option key={unit.unitNumber} value={unit.unitNumber}>
                    Unit {unit.unitNumber} ({unit.rampUpCount} ramp-up
                    {unit.rampUpCount !== 1 ? "s" : ""})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sync Result */}
          {syncResult && (
            <div
              className={`p-4 rounded-lg mb-4 ${
                syncResult.success
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex items-center gap-2">
                {syncResult.success ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                ) : (
                  <span className="text-red-600">⚠️</span>
                )}
                <span
                  className={
                    syncResult.success ? "text-green-800" : "text-red-800"
                  }
                >
                  {syncResult.success
                    ? `Synced ${syncResult.successfulSyncs} of ${syncResult.totalStudents} students`
                    : syncResult.error || "Sync failed"}
                </span>
              </div>
              {syncResult.failedSyncs > 0 && (
                <div className="mt-2 text-sm text-yellow-700">
                  {syncResult.failedSyncs} students failed to sync (may not have
                  email or no Podsie data)
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 rounded-lg mb-4 bg-red-50 border border-red-200">
              <span className="text-red-800">{error}</span>
            </div>
          )}
        </div>

        {/* Preview Section - Per-Question Progress Bars */}
        {selectedSection && selectedUnit !== null && rampUps.length > 0 && progressData.length > 0 && (
          <RampUpProgressPreview rampUps={rampUps} progressData={progressData} />
        )}

        {/* Ramp-Up Cards */}
        {selectedSection && selectedUnit !== null ? (
          rampUps.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
              <div className="text-gray-400 text-4xl mb-4">📚</div>
              <div className="text-gray-600">
                No ramp-ups found for Unit {selectedUnit}
              </div>
              <div className="text-gray-500 text-sm mt-2">
                Add ramp-up entries to the scope-and-sequence collection with
                lessonType: &quot;ramp-up&quot; and scopeSequenceTag: &quot;{scopeSequenceTag}&quot;
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {rampUps.map((rampUp) => (
                <RampUpCard
                  key={rampUp._id}
                  rampUp={rampUp}
                  progressData={progressData}
                  syncing={syncing === rampUp._id}
                  onSync={(testMode) => handleSyncRampUp(rampUp, testMode)}
                  calculateSummaryStats={calculateSummaryStats}
                />
              ))}
            </div>
          )
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
            <div className="text-gray-400 text-4xl mb-4">📊</div>
            <div className="text-gray-600">
              Select a class section and unit to view ramp-up progress
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================
// RAMP-UP CARD COMPONENT
// =====================================

interface RampUpCardProps {
  rampUp: RampUpConfig;
  progressData: ProgressData[];
  syncing: boolean;
  onSync: (testMode: boolean) => void;
  calculateSummaryStats: (data: ProgressData[]) => {
    avgCompletion: number;
    fullyComplete: number;
    totalStudents: number;
    syncedStudents: number;
  };
}

function RampUpCard({
  rampUp,
  progressData,
  syncing,
  onSync,
  calculateSummaryStats,
}: RampUpCardProps) {
  const summaryStats = useMemo(
    () => calculateSummaryStats(progressData),
    [progressData, calculateSummaryStats]
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {rampUp.lessonName}
            </h3>
            <p className="text-sm text-gray-500">
              {rampUp.unitLessonId} • {rampUp.totalQuestions} questions
              {!rampUp.podsyAssignmentId && (
                <span className="text-yellow-600 ml-2">
                  (No Podsie ID configured)
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => onSync(false)}
            disabled={syncing || !rampUp.podsyAssignmentId}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              syncing || !rampUp.podsyAssignmentId
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            <ArrowPathIcon
              className={`w-5 h-5 ${syncing ? "animate-spin" : ""}`}
            />
            {syncing ? "Syncing..." : "Sync from Podsie"}
          </button>
        </div>

        {/* Summary Stats */}
        {progressData.length > 0 && (
          <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">
                {summaryStats.totalStudents}
              </div>
              <div className="text-xs text-gray-500">Students</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">
                {summaryStats.syncedStudents}
              </div>
              <div className="text-xs text-gray-500">Synced</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">
                {summaryStats.avgCompletion}%
              </div>
              <div className="text-xs text-gray-500">Avg Completion</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">
                {summaryStats.fullyComplete}
              </div>
              <div className="text-xs text-gray-500">Fully Complete</div>
            </div>
          </div>
        )}
      </div>

      {/* Progress Table */}
      <RampUpProgressTable
        progressData={progressData}
        totalQuestions={rampUp.totalQuestions}
      />
    </div>
  );
}

// =====================================
// RAMP-UP PROGRESS TABLE COMPONENT
// =====================================

interface RampUpProgressTableProps {
  progressData: ProgressData[];
  totalQuestions: number;
}

function RampUpProgressTable({
  progressData,
  totalQuestions,
}: RampUpProgressTableProps) {
  // Generate question column headers
  const questionColumns = Array.from(
    { length: totalQuestions },
    (_, i) => i + 1
  );

  // Calculate per-question completion rates (only for synced students)
  const questionStats = useMemo(() => {
    const syncedStudents = progressData.filter((p) => p.totalQuestions > 0);
    return questionColumns.map((qNum) => {
      const completed = syncedStudents.filter((p) =>
        p.questions.find((q) => q.questionNumber === qNum && q.completed)
      ).length;
      return {
        questionNumber: qNum,
        completed,
        total: syncedStudents.length,
        percent:
          syncedStudents.length > 0
            ? Math.round((completed / syncedStudents.length) * 100)
            : 0,
      };
    });
  }, [progressData, questionColumns]);

  if (progressData.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-400 text-2xl mb-2">👥</div>
        <div className="text-gray-600">No students found in this section</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          {/* Question Headers */}
          <tr className="bg-gray-100 border-b border-gray-200">
            <th className="sticky left-0 bg-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-900 min-w-[200px] z-10">
              Student
            </th>
            {questionColumns.map((qNum) => (
              <th
                key={qNum}
                className="px-3 py-3 text-center text-sm font-semibold text-gray-700 min-w-[50px]"
              >
                Q{qNum}
              </th>
            ))}
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 min-w-[80px]">
              Total
            </th>
          </tr>

          {/* Class Completion Row */}
          <tr className="bg-blue-50 border-b border-gray-200">
            <td className="sticky left-0 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-800 z-10">
              Class Completion
            </td>
            {questionStats.map((stat) => (
              <td
                key={stat.questionNumber}
                className="px-3 py-2 text-center text-xs font-medium text-blue-700"
              >
                {stat.percent}%
              </td>
            ))}
            <td className="px-4 py-2 text-center text-sm font-bold text-blue-800">
              {(() => {
                const synced = progressData.filter((p) => p.totalQuestions > 0);
                return synced.length > 0
                  ? Math.round(
                      synced.reduce((sum, p) => sum + p.percentComplete, 0) /
                        synced.length
                    )
                  : 0;
              })()}
              %
            </td>
          </tr>
        </thead>

        <tbody>
          {progressData.map((progress, idx) => {
            const hasSynced = progress.totalQuestions > 0;

            return (
              <tr
                key={progress.studentId}
                className={`border-b border-gray-100 hover:bg-gray-50 ${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                }`}
              >
                {/* Student Name */}
                <td className="sticky left-0 bg-inherit px-4 py-3 text-sm font-medium text-gray-900 z-10">
                  <div className="flex items-center gap-2">
                    {progress.isFullyComplete && (
                      <span
                        className="text-green-600"
                        title="All questions complete"
                      >
                        ★
                      </span>
                    )}
                    <span className={!hasSynced ? "text-gray-400" : ""}>
                      {progress.studentName}
                    </span>
                    {!hasSynced && (
                      <span className="text-xs text-gray-400 italic">
                        (not synced)
                      </span>
                    )}
                  </div>
                </td>

                {/* Question Checkmarks */}
                {questionColumns.map((qNum) => {
                  if (!hasSynced) {
                    return (
                      <td key={qNum} className="px-3 py-3 text-center">
                        <span className="text-gray-300">—</span>
                      </td>
                    );
                  }

                  const question = progress.questions.find(
                    (q) => q.questionNumber === qNum
                  );
                  const isCompleted = question?.completed ?? false;

                  return (
                    <td key={qNum} className="px-3 py-3 text-center">
                      {isCompleted ? (
                        <CheckCircleIcon
                          className="w-5 h-5 text-green-600 mx-auto"
                          title={`Question ${qNum} completed`}
                        />
                      ) : (
                        <CheckCircleOutlineIcon
                          className="w-5 h-5 text-gray-300 mx-auto"
                          title={`Question ${qNum} not completed`}
                        />
                      )}
                    </td>
                  );
                })}

                {/* Total Column */}
                <td className="px-4 py-3 text-center">
                  {hasSynced ? (
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        progress.isFullyComplete
                          ? "bg-green-100 text-green-800"
                          : progress.percentComplete >= 50
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {progress.completedCount}/{progress.totalQuestions}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// =====================================
// RAMP-UP PROGRESS PREVIEW COMPONENT
// =====================================

interface RampUpProgressPreviewProps {
  rampUps: RampUpConfig[];
  progressData: ProgressData[];
}

function RampUpProgressPreview({ rampUps, progressData }: RampUpProgressPreviewProps) {
  // Get synced students only
  const syncedStudents = progressData.filter((p) => p.totalQuestions > 0);
  const totalSyncedStudents = syncedStudents.length;

  // For each ramp-up, calculate per-question completion rates
  const rampUpStats = useMemo(() => {
    return rampUps.map((rampUp) => {
      // Get max questions for this ramp-up
      const totalQuestions = rampUp.totalQuestions;
      const questionColumns = Array.from({ length: totalQuestions }, (_, i) => i + 1);

      // Calculate stats for each question
      const questionStats = questionColumns.map((qNum) => {
        const completed = syncedStudents.filter((p) =>
          p.questions.find((q) => q.questionNumber === qNum && q.completed)
        ).length;
        return {
          questionNumber: qNum,
          completed,
          total: totalSyncedStudents,
          percent: totalSyncedStudents > 0 ? Math.round((completed / totalSyncedStudents) * 100) : 0,
        };
      });

      // Calculate overall completion
      const avgCompletion =
        syncedStudents.length > 0
          ? Math.round(
              syncedStudents.reduce((sum, p) => sum + p.percentComplete, 0) / syncedStudents.length
            )
          : 0;

      return {
        rampUp,
        questionStats,
        avgCompletion,
      };
    });
  }, [rampUps, syncedStudents, totalSyncedStudents]);

  if (totalSyncedStudents === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Class Progress Overview</h2>
        <p className="text-sm text-gray-500">{totalSyncedStudents} students synced</p>
      </div>

      <div className="p-6 space-y-6">
        {rampUpStats.map(({ rampUp, questionStats, avgCompletion }) => (
          <div key={rampUp._id}>
            {/* Ramp-Up Header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-medium text-gray-900">{rampUp.lessonName}</span>
                <span className="text-gray-500 text-sm ml-2">({rampUp.unitLessonId})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${avgCompletion}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-700 w-12 text-right">
                  {avgCompletion}%
                </span>
              </div>
            </div>

            {/* Per-Question Progress Bars */}
            <div className="flex flex-wrap gap-2">
              {questionStats.map((stat) => (
                <QuestionProgressBar
                  key={stat.questionNumber}
                  questionNumber={stat.questionNumber}
                  completed={stat.completed}
                  total={stat.total}
                  percent={stat.percent}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =====================================
// QUESTION PROGRESS BAR COMPONENT
// =====================================

interface QuestionProgressBarProps {
  questionNumber: number;
  completed: number;
  total: number;
  percent: number;
}

function QuestionProgressBar({ questionNumber, completed, total, percent }: QuestionProgressBarProps) {
  // Color based on completion percentage
  const getBarColor = (pct: number) => {
    if (pct >= 80) return "bg-green-500";
    if (pct >= 50) return "bg-yellow-500";
    if (pct >= 20) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="flex flex-col items-center gap-1 min-w-[60px]">
      {/* Question Badge */}
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white text-xs font-bold">
        Q{questionNumber}
      </span>
      {/* Progress Bar */}
      <div className="w-14 bg-gray-200 rounded-full h-1.5">
        <div
          className={`${getBarColor(percent)} h-1.5 rounded-full transition-all`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {/* Percentage */}
      <span className="text-[9px] font-bold text-gray-500">
        {percent}%
      </span>
      {/* Count */}
      <span className="text-[8px] text-gray-400">
        {completed}/{total}
      </span>
    </div>
  );
}
