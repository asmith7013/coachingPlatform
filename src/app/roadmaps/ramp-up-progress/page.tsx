"use client";

import { useState, useEffect, useMemo } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { CheckCircleIcon as CheckCircleOutlineIcon, PencilIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { ArrowPathIcon, TvIcon } from "@heroicons/react/24/outline";
import { RoadmapsNav } from "../components/RoadmapsNav";
import { fetchStudents } from "@/app/actions/313/students";
import { Student, RampUpQuestion } from "@zod-schema/313/student";
import {
  fetchRampUpProgress,
  syncSectionRampUpProgress,
  SyncSectionResult,
  fetchAssignmentsForSection,
  PodsieAssignmentInfo,
} from "@/app/actions/313/podsie-sync";
import {
  fetchUnitsWithRampUps,
  fetchRampUpsByUnit,
  createScopeAndSequence,
} from "@/app/actions/313/scope-and-sequence";
import { SCOPE_SEQUENCE_TAG_OPTIONS } from "@zod-schema/313/scope-and-sequence";

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
  podsieAssignmentId?: string;
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
  const [showCreateModal, setShowCreateModal] = useState(false);

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
    if (!selectedSection || !rampUp.podsieAssignmentId) return;

    try {
      setSyncing(rampUp._id);
      setSyncResult(null);
      setError(null);

      const unitCode = `${rampUp.grade}.${selectedUnit}`;
      const result = await syncSectionRampUpProgress(
        selectedSection,
        rampUp.podsieAssignmentId,
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
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Ramp-Up Progress</h1>
              <p className="text-gray-600">
                Track student progress on ramp-up assessments by question
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Create Ramp-Up
            </button>
          </div>

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

        {/* Smartboard Display */}
        {selectedSection && selectedUnit !== null && rampUps.length > 0 && (
          <SmartboardDisplay
            rampUps={rampUps}
            progressData={progressData}
            selectedUnit={selectedUnit}
            selectedSection={selectedSection}
            calculateSummaryStats={calculateSummaryStats}
          />
        )}

        {/* Create Ramp-Up Modal */}
        {showCreateModal && (
          <CreateRampUpModal
            scopeSequenceTag={scopeSequenceTag}
            selectedUnit={selectedUnit}
            selectedSection={selectedSection}
            sections={sections}
            onClose={() => setShowCreateModal(false)}
            onSuccess={async () => {
              setShowCreateModal(false);
              // Reload ramp-ups for current unit
              if (selectedUnit !== null && scopeSequenceTag) {
                const rampUpResult = await fetchRampUpsByUnit(scopeSequenceTag, selectedUnit);
                if (rampUpResult.success) {
                  setRampUps(rampUpResult.data);
                }
              }
            }}
          />
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
              {!rampUp.podsieAssignmentId && (
                <span className="text-yellow-600 ml-2">
                  (No Podsie ID configured)
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => onSync(false)}
            disabled={syncing || !rampUp.podsieAssignmentId}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              syncing || !rampUp.podsieAssignmentId
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
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">
                {summaryStats.totalStudents}
              </div>
              <div className="text-xs text-gray-500">Students</div>
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
// SMARTBOARD DISPLAY COMPONENT
// =====================================

interface SmartboardDisplayProps {
  rampUps: RampUpConfig[];
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

function SmartboardDisplay({
  rampUps,
  progressData,
  selectedUnit,
  selectedSection: _selectedSection,
  calculateSummaryStats,
}: SmartboardDisplayProps) {
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [dueDate, setDueDate] = useState<string>(() => {
    // Default to next Friday
    const today = new Date();
    const daysUntilFriday = (5 - today.getDay() + 7) % 7 || 7;
    const nextFriday = new Date(today);
    nextFriday.setDate(today.getDate() + daysUntilFriday);
    return nextFriday.toISOString().split("T")[0];
  });
  const [learningContent, setLearningContent] = useState<string>("");

  // Format due date for display
  const formattedDueDate = useMemo(() => {
    const date = new Date(dueDate + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }, [dueDate]);

  // Calculate stats per ramp-up
  const rampUpStats = useMemo(() => {
    return rampUps.map((rampUp) => {
      const stats = calculateSummaryStats(progressData);
      return {
        rampUp,
        avgCompletion: stats.avgCompletion,
        totalStudents: stats.totalStudents,
        syncedStudents: stats.syncedStudents,
      };
    });
  }, [rampUps, progressData, calculateSummaryStats]);

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

  // Calculate overall class goal percentage
  const overallPercentage = rampUpStats.length > 0
    ? Math.round(
        rampUpStats.reduce((sum, s) => sum + s.avgCompletion, 0) /
          rampUpStats.length
      )
    : 0;

  return (
    <div className="mt-8">
      {/* Edit Mode Toggle */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            isEditMode
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          <PencilIcon className="w-4 h-4" />
          {isEditMode ? "Done Editing" : "Edit Display"}
        </button>
      </div>

      {/* Smartboard Header */}
      <div className="bg-indigo-900 rounded-t-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-teal-500 text-white px-4 py-2 rounded-lg font-bold text-lg">
            Mini Goal
          </div>
          <div className="bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold">
            Unit {selectedUnit}, Ramp-Ups
          </div>
          {isEditMode ? (
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg border border-indigo-400 focus:outline-none focus:ring-2 focus:ring-white"
            />
          ) : (
            <div className="bg-indigo-600 text-white px-4 py-2 rounded-lg">
              By {formattedDueDate}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white text-indigo-900 px-4 py-2 rounded-lg font-bold">
            {rampUps.length} Ramp-Up{rampUps.length !== 1 ? "s" : ""}
          </div>
          <div className="bg-indigo-700 rounded-lg p-2">
            <TvIcon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Smartboard Content - Combined Goal and Progress */}
      <div className="bg-indigo-800 rounded-b-xl p-6 flex gap-8">
        {/* Left: Class Goal + Individual Progress */}
        <div className="flex-1 space-y-6">
          {/* Class Goal - Main Progress */}
          <div className="bg-indigo-900/50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-purple-600 text-white px-3 py-1 rounded-lg font-bold text-sm">
                Class Goal
              </div>
              <span className="text-indigo-300 text-sm">Complete All Ramp-Ups</span>
            </div>
            <SmartboardProgressBar
              label=""
              percentage={overallPercentage}
              color="purple"
              showLabel={false}
            />
          </div>

          {/* Individual Ramp-Up Progress */}
          <div className="space-y-3 pl-4 border-l-2 border-indigo-600">
            {rampUpStats.map(({ rampUp, avgCompletion }, idx) => (
              <SmartboardProgressBar
                key={rampUp._id}
                label={`Ramp-Up ${idx + 1}`}
                sublabel={rampUp.lessonName}
                percentage={avgCompletion}
                size="small"
              />
            ))}
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
              {rampUps.map((rampUp, idx) => (
                <li key={rampUp._id} className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold mt-0.5">•</span>
                  <div>
                    <span className="font-semibold">Ramp-Up {idx + 1}:</span>{" "}
                    {rampUp.lessonName}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// =====================================
// SMARTBOARD PROGRESS BAR COMPONENT
// =====================================

interface SmartboardProgressBarProps {
  label: string;
  sublabel?: string;
  percentage: number;
  color?: "green" | "purple";
  size?: "normal" | "small";
  showLabel?: boolean;
}

function SmartboardProgressBar({
  label,
  sublabel,
  percentage,
  color = "green",
  size = "normal",
  showLabel = true,
}: SmartboardProgressBarProps) {
  const bgColor = color === "purple" ? "bg-purple-600" : "bg-emerald-500";
  const trackColor = color === "purple" ? "bg-purple-200" : "bg-white";
  const isSmall = size === "small";

  return (
    <div className="flex items-center gap-4">
      {showLabel && (
        <div className={isSmall ? "w-28 text-white" : "w-32 text-white"}>
          <div className={isSmall ? "font-semibold text-sm" : "font-bold text-lg"}>{label}</div>
          {sublabel && (
            <div className={`text-indigo-300 truncate ${isSmall ? "text-xs" : "text-xs"}`}>{sublabel}</div>
          )}
        </div>
      )}
      <div className={`flex-1 ${trackColor} rounded-full relative overflow-hidden ${isSmall ? "h-6" : "h-8"}`}>
        <div
          className={`${bgColor} h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
          style={{ width: `${Math.max(percentage, 5)}%` }}
        >
          {percentage >= 20 && (
            <span className={`text-white font-bold ${isSmall ? "text-xs" : "text-sm"}`}>{percentage}%</span>
          )}
        </div>
        {percentage < 20 && (
          <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 font-bold ${isSmall ? "text-xs" : "text-sm"}`}>
            {percentage}%
          </span>
        )}
      </div>
      <div className={isSmall ? "w-12 text-right" : "w-16 text-right"}>
        <span className={`text-white font-bold ${isSmall ? "text-base" : "text-xl"}`}>{percentage}%</span>
      </div>
    </div>
  );
}

// =====================================
// CREATE RAMP-UP MODAL COMPONENT
// =====================================

interface CreateRampUpModalProps {
  scopeSequenceTag: string;
  selectedUnit: number | null;
  selectedSection: string | null;
  sections: string[]; // Class sections like "801", "802" for Podsie fetch
  onClose: () => void;
  onSuccess: () => void;
}

function CreateRampUpModal({
  scopeSequenceTag,
  selectedUnit,
  selectedSection,
  sections,
  onClose,
  onSuccess,
}: CreateRampUpModalProps) {
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [podsieAssignments, setPodsieAssignments] = useState<PodsieAssignmentInfo[]>([]);
  const [podsieSection, setPodsieSection] = useState<string>(selectedSection || ""); // Class section for Podsie fetch

  // Derive grade from scopeSequenceTag
  const getGradeFromTag = (tag: string): string => {
    if (tag === "Algebra 1") return "8";
    if (tag.startsWith("Grade ")) return tag.replace("Grade ", "");
    return "8";
  };

  // Form state with prefilled values
  const [formData, setFormData] = useState({
    grade: getGradeFromTag(scopeSequenceTag),
    unit: selectedUnit ? `Unit ${selectedUnit}` : "",
    unitNumber: selectedUnit || 1,
    lessonNumber: 0, // Ramp-ups use 0 or negative
    unitLessonId: selectedUnit ? `${selectedUnit}.RU1` : "",
    lessonName: "",
    section: "Ramp Ups",
    scopeSequenceTag: scopeSequenceTag || "",
    lessonType: "ramp-up" as const,
    podsieAssignmentId: "",
    totalQuestions: 10,
  });

  // Update unitLessonId when unitNumber changes
  const handleUnitNumberChange = (value: number) => {
    setFormData((prev) => ({
      ...prev,
      unitNumber: value,
      unit: `Unit ${value}`,
      unitLessonId: `${value}.RU1`,
    }));
  };

  // Fetch assignments from Podsie for the current section
  const handleFetchAssignments = async () => {
    if (!podsieSection) {
      setFormError("Please select a class section first");
      return;
    }

    setLoadingAssignments(true);
    setFormError(null);

    try {
      const result = await fetchAssignmentsForSection(podsieSection);
      if (result.success) {
        setPodsieAssignments(result.assignments);
        if (result.assignments.length === 0) {
          setFormError("No assignments found for this section");
        }
      } else {
        setFormError(result.error || "Failed to fetch assignments");
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to fetch assignments");
    } finally {
      setLoadingAssignments(false);
    }
  };

  // Handle selecting an assignment from the dropdown
  const handleSelectAssignment = (assignment: PodsieAssignmentInfo) => {
    setFormData((prev) => ({
      ...prev,
      podsieAssignmentId: String(assignment.assignmentId),
      lessonName: assignment.assignmentName,
      totalQuestions: assignment.totalQuestions,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);

    try {
      const result = await createScopeAndSequence({
        ...formData,
        roadmapSkills: [],
        targetSkills: [],
        ownerIds: [],
      });

      if (result.success) {
        onSuccess();
      } else {
        setFormError(result.error || "Failed to create ramp-up");
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Create New Ramp-Up</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {formError}
              </div>
            )}

            {/* Prefilled/readonly fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scope Sequence Tag
                </label>
                <select
                  value={formData.scopeSequenceTag}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      scopeSequenceTag: e.target.value,
                      grade: getGradeFromTag(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Tag</option>
                  {SCOPE_SEQUENCE_TAG_OPTIONS.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade
                </label>
                <input
                  type="text"
                  value={formData.grade}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, grade: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  placeholder="e.g., 8"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Number *
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.unitNumber}
                  onChange={(e) => handleUnitNumberChange(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Lesson ID *
                </label>
                <input
                  type="text"
                  value={formData.unitLessonId}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, unitLessonId: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 4.RU1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lesson Name *
              </label>
              <input
                type="text"
                value={formData.lessonName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, lessonName: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Ramp-Up 1: Equivalent Expressions"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section
                </label>
                <select
                  value={formData.section}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, section: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Ramp Ups">Ramp Ups</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lesson Number
                </label>
                <input
                  type="number"
                  value={formData.lessonNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lessonNumber: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  placeholder="0 for ramp-ups"
                />
              </div>
            </div>

            {/* Podsie Assignment Section */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-blue-900">
                  Podsie Assignment
                </h4>
              </div>

              {/* Class section selector for Podsie fetch */}
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-blue-900 mb-1">
                    Class Section
                  </label>
                  <select
                    value={podsieSection}
                    onChange={(e) => setPodsieSection(e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select class section...</option>
                    {sections.map((section) => (
                      <option key={section} value={section}>
                        {section}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="pt-6">
                  <button
                    type="button"
                    onClick={handleFetchAssignments}
                    disabled={loadingAssignments || !podsieSection}
                    className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loadingAssignments && (
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    )}
                    {loadingAssignments ? "Fetching..." : "Fetch from Podsie"}
                  </button>
                </div>
              </div>

              {podsieAssignments.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-1">
                    Select Assignment
                  </label>
                  <select
                    onChange={(e) => {
                      const selected = podsieAssignments.find(
                        (a) => String(a.assignmentId) === e.target.value
                      );
                      if (selected) handleSelectAssignment(selected);
                    }}
                    value={formData.podsieAssignmentId}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select an assignment...</option>
                    {podsieAssignments.map((a) => (
                      <option key={a.assignmentId} value={String(a.assignmentId)}>
                        {a.assignmentName} ({a.totalQuestions} questions)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Podsie Assignment ID
                </label>
                <input
                  type="text"
                  value={formData.podsieAssignmentId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      podsieAssignmentId: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="Auto-filled from selection above"
                  readOnly={podsieAssignments.length > 0}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Questions
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.totalQuestions}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      totalQuestions: parseInt(e.target.value) || 10,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  readOnly={podsieAssignments.length > 0}
                />
              </div>
            </div>

            {/* Readonly fields display */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Auto-filled Fields
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Unit:</span> {formData.unit}
                </div>
                <div>
                  <span className="font-medium">Lesson Type:</span> {formData.lessonType}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  saving
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {saving ? "Creating..." : "Create Ramp-Up"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
