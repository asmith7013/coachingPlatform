"use client";

import { useState, useEffect, useMemo } from "react";
import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
// import { PlusIcon } from "@heroicons/react/24/outline";
import { RoadmapsNav } from "../components/RoadmapsNav";
import { useToast } from "@/components/core/feedback/Toast";
import { fetchStudents } from "@/app/actions/313/students";
import { Student, RampUpQuestion } from "@zod-schema/313/student";
import {
  fetchRampUpProgress,
  syncSectionRampUpProgress,
} from "@/app/actions/313/podsie-sync";
import {
  fetchAllUnitsByScopeTag,
  fetchRampUpsByUnit,
} from "@/app/actions/313/scope-and-sequence";
import { SECTION_OPTIONS } from "@zod-schema/313/scope-and-sequence";
import { Sections313, SectionsPS19 } from "@schema/enum/313";
import { getSectionConfig } from "@/app/actions/313/section-config";
import type { PodsieAssignment } from "@zod-schema/313/section-config";
import { AssignmentCard } from "./components/AssignmentCard";
import { SmartboardDisplay } from "./components/SmartboardDisplay";
import { CreateAssignmentModal } from "./components/CreateAssignmentModal";
import { LessonProgressCard } from "./components/LessonProgressCard";

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
  scopeSequenceTag?: string; // Add scope tag to group units
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
  const { showToast, ToastComponent } = useToast();

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
        // Load units - for section 802, load both Grade 8 and Algebra 1 units
        const grade = getGradeForSection(selectedSection);

        if (selectedSection === "802") {
          // Section 802 shows Algebra 1 units with both grade "8" and grade "Algebra 1"
          const [alg1Grade8Result, alg1GradeAlg1Result] = await Promise.all([
            fetchAllUnitsByScopeTag("Algebra 1", "8"),
            fetchAllUnitsByScopeTag("Algebra 1") // No grade filter to get Algebra 1 grade units
          ]);

          const allUnits: UnitOption[] = [];
          if (alg1Grade8Result.success) {
            allUnits.push(...alg1Grade8Result.data.map(u => ({ ...u, scopeSequenceTag: "Algebra 1" })));
          }
          if (alg1GradeAlg1Result.success) {
            // Only add units that aren't already in the list (avoid duplicates)
            const existingUnitNumbers = new Set(allUnits.map(u => u.unitNumber));
            const newUnits = alg1GradeAlg1Result.data
              .filter(u => !existingUnitNumbers.has(u.unitNumber))
              .map(u => ({ ...u, scopeSequenceTag: "Algebra 1" }));
            allUnits.push(...newUnits);
          }

          setUnits(allUnits);
          setSelectedUnit(null);
          setLessons([]);
        } else {
          // For other sections, load units normally
          const unitsResult = await fetchAllUnitsByScopeTag(scopeSequenceTag, grade);
          if (unitsResult.success) {
            setUnits(unitsResult.data);
            setSelectedUnit(null);
            setLessons([]);
          } else {
            setError(unitsResult.error || "Failed to load units");
          }
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
        // For section 802, always use "Algebra 1" scope tag
        const actualScopeTag = selectedSection === "802" ? "Algebra 1" : scopeSequenceTag;
        const result = await fetchRampUpsByUnit(actualScopeTag, selectedUnit);
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
        ) as string[];

        // Sort sections according to the schema-defined order
        const sortedSections = uniqueSections.sort((a, b) => {
          const indexA = SECTION_OPTIONS.indexOf(a as typeof SECTION_OPTIONS[number]);
          const indexB = SECTION_OPTIONS.indexOf(b as typeof SECTION_OPTIONS[number]);

          // If both are in the order array, sort by their position
          if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
          }
          // If only one is in the order array, it comes first
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          // If neither is in the order array, maintain alphabetical order
          return a.localeCompare(b);
        });

        setAvailableSections(sortedSections);

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
  }, [scopeSequenceTag, selectedUnit, selectedLessonSection, sectionConfigAssignments, selectedSection]);

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

      // Show toast notification
      if (result.success) {
        showToast({
          title: 'Sync Successful',
          description: `${assignment.lessonName}: Synced ${result.successfulSyncs} of ${result.totalStudents} students${result.failedSyncs > 0 ? ` (${result.failedSyncs} failed)` : ''}`,
          variant: 'success',
          icon: CheckCircleIcon,
        });

        // Reload progress data - only for the specific assignment that was synced
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
      } else {
        showToast({
          title: 'Sync Failed',
          description: result.error || 'Failed to sync from Podsie',
          variant: 'error',
          icon: ExclamationTriangleIcon,
        });
      }
    } catch (err) {
      console.error("Error syncing:", err);
      showToast({
        title: 'Sync Failed',
        description: 'An unexpected error occurred while syncing',
        variant: 'error',
        icon: ExclamationTriangleIcon,
      });
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
                {/* For section 802, group by grade type */}
                {selectedSection === "802" ? (
                  <>
                    {/* Algebra 1 (Grade 8) Units */}
                    {units.filter(u => u.grade === "8").length > 0 && (
                      <optgroup label="Algebra 1 (Grade 8)">
                        {units
                          .filter(u => u.grade === "8")
                          .map((unit) => (
                            <option key={`alg1-g8-${unit.unitNumber}`} value={unit.unitNumber}>
                              {unit.unitName}
                            </option>
                          ))}
                      </optgroup>
                    )}
                    {/* Algebra 1 (Algebra Grade) Units */}
                    {units.filter(u => u.grade !== "8").length > 0 && (
                      <optgroup label="Algebra 1">
                        {units
                          .filter(u => u.grade !== "8")
                          .map((unit) => (
                            <option key={`alg1-galg1-${unit.unitNumber}`} value={unit.unitNumber}>
                              {unit.unitName}
                            </option>
                          ))}
                      </optgroup>
                    )}
                  </>
                ) : (
                  /* Regular units for other sections */
                  units.map((unit) => (
                    <option key={unit.unitNumber} value={unit.unitNumber}>
                      {unit.unitName}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="lesson-section-filter"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Section of Unit
              </label>
              <select
                id="lesson-section-filter"
                value={selectedLessonSection}
                onChange={(e) => {
                  setSelectedLessonSection(e.target.value);
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

                        {/* Progress Cards Grid (max 5 per row) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
                          {groupedLessons.map(({ lesson, masteryCheck }) => (
                            <LessonProgressCard
                              key={`progress-${lesson.section}-${lesson.unitLessonId}`}
                              lesson={lesson}
                              masteryCheck={masteryCheck}
                              progressData={progressData}
                              calculateSummaryStats={calculateSummaryStats}
                            />
                          ))}
                        </div>

                        {/* Assignment Cards */}
                        <div className="space-y-6">
                          {groupedLessons.map(({ lesson, masteryCheck }) => (
                            <AssignmentCard
                              key={`assignment-${lesson.section}-${lesson.unitLessonId}-${lesson.assignmentType}`}
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

        {/* Toast Notifications */}
        <ToastComponent />
      </div>
    </div>
  );
}
