"use client";

import { useState, useEffect, useMemo } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
// import { PlusIcon } from "@heroicons/react/24/outline";
import { RoadmapsNav } from "../components/RoadmapsNav";
import { fetchStudents } from "@/app/actions/313/students";
import { Student, RampUpQuestion } from "@zod-schema/313/student";
import {
  fetchRampUpProgress,
  syncSectionRampUpProgress,
  SyncSectionResult,
} from "@/app/actions/313/podsie-sync";
import {
  fetchAllUnitsByScopeTag,
  fetchRampUpsByUnit,
} from "@/app/actions/313/scope-and-sequence";
import { Sections313, SectionsPS19 } from "@schema/enum/313";
import { getSectionConfig } from "@/app/actions/313/section-config";
import type { PodsieAssignment } from "@zod-schema/313/section-config";
import { AssignmentCard } from "./components/AssignmentCard";
import { SmartboardDisplay } from "./components/SmartboardDisplay";
import { CreateAssignmentModal } from "./components/CreateAssignmentModal";

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

// Get grade from section
function getGradeForSection(section: string): string {
  if (section === "802") {
    return "8"; // Algebra 1 uses grade 8 in the database
  }
  if (section.startsWith("6")) {
    return "6";
  }
  if (section.startsWith("7")) {
    return "7";
  }
  if (section.startsWith("8")) {
    return "8";
  }
  // Default fallback
  return "8";
}

// Get school for a section
function getSchoolForSection(section: string): "IS313" | "PS19" | "X644" | "Unknown" {
  if (Sections313.includes(section as typeof Sections313[number])) {
    return "IS313";
  }
  if (SectionsPS19.includes(section as typeof SectionsPS19[number])) {
    return "PS19";
  }
  return "Unknown";
}

// Group sections by school
function groupSectionsBySchool(sections: string[]): Array<{ school: string; sections: string[] }> {
  const is313 = sections.filter(s => getSchoolForSection(s) === "IS313").sort();
  const ps19 = sections.filter(s => getSchoolForSection(s) === "PS19").sort();
  const x644 = sections.filter(s => getSchoolForSection(s) === "X644").sort();
  const unknown = sections.filter(s => getSchoolForSection(s) === "Unknown").sort();

  const groups = [];
  if (is313.length > 0) groups.push({ school: "IS313", sections: is313 });
  if (ps19.length > 0) groups.push({ school: "PS19", sections: ps19 });
  if (x644.length > 0) groups.push({ school: "X644", sections: x644 });
  if (unknown.length > 0) groups.push({ school: "Other", sections: unknown });

  return groups;
}

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

interface UnitOption {
  unitNumber: number;
  unitName: string;
  grade: string;
  lessonCount: number;
}

interface ProgressData {
  studentId: string;
  studentName: string;
  unitCode: string;
  rampUpId: string; // This is actually the lesson/assignment ID
  rampUpName?: string; // This is actually the lesson name
  podsieAssignmentId?: string; // Unique Podsie assignment ID to distinguish lesson vs mastery-check
  questions: RampUpQuestion[];
  totalQuestions: number;
  completedCount: number;
  percentComplete: number;
  isFullyComplete: boolean;
  lastSyncedAt?: string;
}

export default function RampUpProgressPage() {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null); // Track which lesson is syncing
  const [syncResult, setSyncResult] = useState<SyncSectionResult | null>(null);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [selectedLessonSection, setSelectedLessonSection] = useState<string>("");
  const [sections, setSections] = useState<string[]>([]);
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [lessons, setLessons] = useState<LessonConfig[]>([]);
  const [sectionConfigAssignments, setSectionConfigAssignments] = useState<PodsieAssignment[]>([]);
  const [availableSections, setAvailableSections] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Group sections by school
  const sectionGroups = useMemo(() => groupSectionsBySchool(sections), [sections]);

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

  // Load units and section config when section changes
  useEffect(() => {
    const loadUnitsAndSectionConfig = async () => {
      if (!scopeSequenceTag || !selectedSection) {
        setUnits([]);
        setSelectedUnit(null);
        setLessons([]);
        setSectionConfigAssignments([]);
        return;
      }

      try {
        // Load units - filter by scopeSequenceTag and grade
        const grade = getGradeForSection(selectedSection);
        const unitsResult = await fetchAllUnitsByScopeTag(scopeSequenceTag, grade);
        if (unitsResult.success) {
          setUnits(unitsResult.data);
          // Clear unit selection when section changes
          setSelectedUnit(null);
          setLessons([]);
        } else {
          setError(unitsResult.error || "Failed to load units");
        }

        // Load section config to get Podsie assignments
        const school = getSchoolForSection(selectedSection);
        const configResult = await getSectionConfig(school, selectedSection);
        if (configResult.success && configResult.data) {
          setSectionConfigAssignments(configResult.data.podsieAssignments || []);
        } else {
          setSectionConfigAssignments([]);
        }
      } catch (err) {
        console.error("Error loading units and section config:", err);
        setError("Failed to load data");
      }
    };

    loadUnitsAndSectionConfig();
  }, [scopeSequenceTag, selectedSection]);

  // Build lessons from section-config assignments when unit or lesson section changes
  useEffect(() => {
    const buildLessons = async () => {
      if (!scopeSequenceTag || selectedUnit === null || sectionConfigAssignments.length === 0) {
        setLessons([]);
        setAvailableSections([]);
        return;
      }

      try {
        // Fetch ALL lessons from scope-and-sequence for this unit
        const result = await fetchRampUpsByUnit(scopeSequenceTag, selectedUnit);
        if (!result.success) {
          setError(result.error || "Failed to load lessons");
          return;
        }

        // Extract unique sections from all lessons that have assignments
        const lessonsWithAssignments = result.data.filter(lesson =>
          sectionConfigAssignments.some(a =>
            a.unitLessonId === lesson.unitLessonId &&
            a.lessonName === lesson.lessonName
          )
        );
        const uniqueSections = Array.from(
          new Set(lessonsWithAssignments.map(lesson => lesson.section).filter(Boolean))
        ).sort() as string[];
        setAvailableSections(uniqueSections);

        // Filter lessons by selected section if one is selected
        const filteredLessons = selectedLessonSection
          ? result.data.filter(lesson => lesson.section === selectedLessonSection)
          : result.data;

        // Build LessonConfig from ALL section-config assignments that match this unit
        // We match by unitLessonId only, then create entries for each assignment type
        const lessonConfigs: LessonConfig[] = [];

        // Get all assignments for lessons in the filtered scope-and-sequence results
        const relevantUnitLessonIds = new Set(filteredLessons.map(l => l.unitLessonId));

        sectionConfigAssignments
          .filter(assignment => relevantUnitLessonIds.has(assignment.unitLessonId))
          .forEach(assignment => {
            // Find the corresponding scope-and-sequence lesson (just for section metadata)
            const scopeLesson = filteredLessons.find(l => l.unitLessonId === assignment.unitLessonId);

            lessonConfigs.push({
              unitLessonId: assignment.unitLessonId,
              lessonName: assignment.lessonName,
              grade: scopeSequenceTag.replace("Grade ", "").replace("Algebra 1", "8"),
              podsieAssignmentId: assignment.podsieAssignmentId,
              totalQuestions: assignment.totalQuestions || 10,
              section: scopeLesson?.section,
              unitNumber: selectedUnit,
              assignmentType: assignment.assignmentType || 'mastery-check'
            });
          });

        setLessons(lessonConfigs);
      } catch (err) {
        console.error("Error building lessons:", err);
        setError("Failed to load lessons");
      }
    };

    buildLessons();
  }, [scopeSequenceTag, selectedUnit, selectedLessonSection, sectionConfigAssignments]);

  // Fetch progress data when section and unit are selected
  useEffect(() => {
    const loadProgress = async () => {
      if (!selectedSection || selectedUnit === null || lessons.length === 0) {
        setProgressData([]);
        return;
      }

      try {
        setLoading(true);
        // Get the grade from the first lesson (all lessons in a unit share the same grade)
        const grade = lessons[0]?.grade || "8";
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
  }, [selectedSection, selectedUnit, lessons]);

  // Sync a single assignment from Podsie
  const handleSyncAssignment = async (assignment: LessonConfig, testMode: boolean = false) => {
    if (!selectedSection || !assignment.podsieAssignmentId) return;

    try {
      // Create unique syncing key that includes both unitLessonId and assignmentType
      const syncingKey = `${assignment.unitLessonId}-${assignment.assignmentType || 'default'}`;
      setSyncing(syncingKey);
      setSyncResult(null);
      setError(null);

      const unitCode = `${assignment.grade}.${selectedUnit}`;

      // Debug logging
      console.log('🔄 Syncing assignment:', {
        unitLessonId: assignment.unitLessonId,
        lessonName: assignment.lessonName,
        podsieAssignmentId: assignment.podsieAssignmentId,
        assignmentType: assignment.assignmentType,
        section: selectedSection,
        unitCode,
      });

      const result = await syncSectionRampUpProgress(
        selectedSection,
        assignment.podsieAssignmentId,
        unitCode,
        assignment.unitLessonId,
        assignment.totalQuestions,
        { testMode }
      );

      console.log('✅ Sync result:', result);
      setSyncResult(result);

      // Reload progress data - only for the specific assignment that was synced
      if (result.success) {
        const progressResult = await fetchRampUpProgress(
          selectedSection,
          unitCode,
          assignment.unitLessonId,  // Filter by rampUpId
          assignment.podsieAssignmentId  // Filter by podsieAssignmentId to prevent duplicates
        );
        if (progressResult.success) {
          console.log('📊 Fetched progress data for synced assignment:', {
            totalRecords: progressResult.data.length,
            rampUpId: assignment.unitLessonId,
            sample: progressResult.data.slice(0, 3).map(p => ({
              student: p.studentName,
              rampUpId: p.rampUpId,
              completed: p.completedCount,
              total: p.totalQuestions,
            })),
          });

          // Merge the updated data with existing data
          setProgressData(prevData => {
            // Remove old entries for this specific assignment using podsieAssignmentId
            // This ensures we don't remove data from a different assignment with the same unitLessonId
            const filtered = prevData.filter(p => p.podsieAssignmentId !== assignment.podsieAssignmentId);

            // Filter the newly fetched data to only include this specific assignment
            // (fetchRampUpProgress may return multiple assignments with the same unitLessonId)
            const newData = progressResult.data.filter(p => p.podsieAssignmentId === assignment.podsieAssignmentId);

            // Add the newly synced data
            return [...filtered, ...newData];
          });
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
              <h1 className="text-3xl font-bold mb-2">Podsie Assignment Progress</h1>
              <p className="text-gray-600">
                Track student progress on Podsie assignments by question
              </p>
            </div>
            {/* <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors cursor-pointer"
            >
              <PlusIcon className="w-5 h-5" />
              Create Assignment
            </button> */}
          </div>

          {/* Filters */}
          <div className="grid grid-cols-3 gap-4 mb-6">
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
                  setSelectedLessonSection("");
                  setSyncResult(null);
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !selectedSection
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-300"
                }`}
              >
                <option value="">Select Section</option>
                {sectionGroups.map((group) => (
                  <optgroup key={group.school} label={group.school}>
                    {group.sections.map((section) => (
                      <option key={section} value={section}>
                        {section}
                      </option>
                    ))}
                  </optgroup>
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
                  setSelectedLessonSection("");
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
                    ? "No units available"
                    : "Select Unit"}
                </option>
                {units.map((unit) => (
                  <option key={unit.unitNumber} value={unit.unitNumber}>
                    Unit {unit.unitNumber}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="lesson-section-filter"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Lesson Section
              </label>
              <select
                id="lesson-section-filter"
                value={selectedLessonSection}
                onChange={(e) => {
                  setSelectedLessonSection(e.target.value);
                  setSyncResult(null);
                }}
                disabled={!selectedUnit}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !selectedUnit
                    ? "bg-gray-100 cursor-not-allowed border-gray-300"
                    : selectedLessonSection
                    ? "border-gray-300"
                    : "border-blue-500 ring-2 ring-blue-200"
                }`}
              >
                <option value="">
                  {!selectedUnit
                    ? "Select unit first"
                    : availableSections.length === 0
                    ? "No sections available"
                    : "Select Section"}
                </option>
                {availableSections.map((section) => (
                  <option key={section} value={section}>
                    {section}
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

        {/* Assignment Cards */}
        {selectedSection && selectedUnit !== null && selectedLessonSection ? (
          lessons.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
              <div className="text-gray-400 text-4xl mb-4">📚</div>
              <div className="text-gray-600">
                No assignments found for Unit {selectedUnit}, Section {selectedLessonSection}
              </div>
              <div className="text-gray-500 text-sm mt-2">
                Add Podsie assignments in the Section Config page for this class section
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Group lessons with their mastery checks */}
              {(() => {
                const lessonAssignments = lessons.filter(a => a.assignmentType === 'lesson');
                const masteryCheckAssignments = lessons.filter(a => a.assignmentType === 'mastery-check' || !a.assignmentType);

                // Group by unitLessonId
                const groupedLessons = lessonAssignments.map(lesson => {
                  const masteryCheck = masteryCheckAssignments.find(mc => mc.unitLessonId === lesson.unitLessonId);
                  return { lesson, masteryCheck };
                });

                return (
                  <>
                    {/* Lessons with Mastery Checks */}
                    {groupedLessons.length > 0 && (
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <h2 className="text-2xl font-bold text-gray-900">Lessons</h2>
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {groupedLessons.length} {groupedLessons.length === 1 ? 'Lesson' : 'Lessons'}
                          </span>
                        </div>
                        <div className="space-y-6">
                          {groupedLessons.map(({ lesson, masteryCheck }) => (
                            <AssignmentCard
                              key={`${lesson.section}-${lesson.unitLessonId}-${lesson.assignmentType}`}
                              assignment={lesson}
                              masteryCheckAssignment={masteryCheck}
                              progressData={progressData}
                              syncing={syncing === `${lesson.unitLessonId}-${lesson.assignmentType || 'default'}`}
                              masteryCheckSyncing={masteryCheck ? syncing === `${masteryCheck.unitLessonId}-${masteryCheck.assignmentType || 'default'}` : false}
                              onSync={(testMode) => handleSyncAssignment(lesson, testMode)}
                              onMasteryCheckSync={masteryCheck ? (testMode) => handleSyncAssignment(masteryCheck, testMode) : undefined}
                              calculateSummaryStats={calculateSummaryStats}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
            <div className="text-gray-400 text-4xl mb-4">📊</div>
            <div className="text-gray-600">
              Select a class section, unit, and lesson section to view assignment progress
            </div>
          </div>
        )}

        {/* Smartboard Display */}
        {selectedSection && selectedUnit !== null && selectedLessonSection && lessons.length > 0 && (
          <SmartboardDisplay
            assignments={lessons}
            progressData={progressData}
            selectedUnit={selectedUnit}
            selectedSection={selectedSection}
            calculateSummaryStats={calculateSummaryStats}
          />
        )}

        {/* Create Assignment Modal */}
        {showCreateModal && (
          <CreateAssignmentModal
            scopeSequenceTag={scopeSequenceTag}
            selectedUnit={selectedUnit}
            selectedSection={selectedSection}
            sections={sections}
            onClose={() => setShowCreateModal(false)}
            onSuccess={async () => {
              setShowCreateModal(false);
              // Reload section config to get updated assignments
              if (selectedSection) {
                const school = getSchoolForSection(selectedSection);
                const configResult = await getSectionConfig(school, selectedSection);
                if (configResult.success && configResult.data) {
                  setSectionConfigAssignments(configResult.data.podsieAssignments || []);
                }
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
