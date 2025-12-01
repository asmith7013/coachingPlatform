"use client";

import { useState, useEffect } from "react";
import { ArrowPathIcon, CheckIcon, PlusIcon } from "@heroicons/react/24/outline";
import { RoadmapsNav } from "../components/RoadmapsNav";
import { Schools, AllSections } from "@schema/enum/313";
import type { SchoolsType, AllSectionsType } from "@schema/enum/313";
import {
  getSectionConfig,
  upsertSectionConfig,
  addPodsieAssignment
} from "@/app/actions/313/section-config";
import {
  fetchAssignmentsForSection,
  PodsieAssignmentInfo
} from "@/app/actions/313/podsie-sync";
import { fetchScopeAndSequence, createScopeAndSequence } from "@/app/actions/313/scope-and-sequence";
import type { ScopeAndSequence } from "@zod-schema/313/scope-and-sequence";
import type { PodsieAssignment } from "@zod-schema/313/section-config";
import { SECTION_OPTIONS } from "@zod-schema/313/scope-and-sequence";
import { ManualCreateAssignmentModal } from "./components/ManualCreateAssignmentModal";

interface AssignmentMatch {
  podsieAssignment: PodsieAssignmentInfo;
  matchedLesson: ScopeAndSequence | null;
  isCreatingNew: boolean;
  newLessonData?: {
    unitNumber: number;
    section: string;
    lessonNumber: number;
  };
}

export default function SectionConfigsPage() {
  const [selectedSchool, setSelectedSchool] = useState<SchoolsType | "">("");
  const [selectedSection, setSelectedSection] = useState<AllSectionsType | "">("");
  const [loading, setLoading] = useState(false);
  const [fetchingPodsie, setFetchingPodsie] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showUnmatchedOnly, setShowUnmatchedOnly] = useState(false);
  const [showManualCreateModal, setShowManualCreateModal] = useState(false);

  // Data states
  const [podsieAssignments, setPodsieAssignments] = useState<PodsieAssignmentInfo[]>([]);
  const [lessons, setLessons] = useState<ScopeAndSequence[]>([]);
  const [matches, setMatches] = useState<AssignmentMatch[]>([]);
  const [existingAssignments, setExistingAssignments] = useState<PodsieAssignment[]>([]);

  // Fetch lessons when school/section changes
  useEffect(() => {
    const loadLessons = async () => {
      if (!selectedSchool || !selectedSection) {
        setLessons([]);
        return;
      }

      try {
        setLoading(true);

        // Determine grade and scope tag based on section
        const gradeLevel = selectedSection.startsWith('6') ? '6' :
                          selectedSection.startsWith('7') ? '7' : '8';
        const scopeTag = selectedSection === '802' ? 'Algebra 1' : `Grade ${gradeLevel}`;

        const result = await fetchScopeAndSequence({
          page: 1,
          limit: 1000,
          sortBy: 'unitNumber',
          sortOrder: 'asc',
          filters: {
            grade: gradeLevel,
            scopeSequenceTag: scopeTag
          },
          search: '',
          searchFields: []
        });

        if (result.success && result.items) {
          setLessons(result.items as ScopeAndSequence[]);
        }
      } catch (err) {
        console.error('Error loading lessons:', err);
        setError('Failed to load lessons');
      } finally {
        setLoading(false);
      }
    };

    loadLessons();
  }, [selectedSchool, selectedSection]);

  // Load existing section config
  useEffect(() => {
    const loadSectionConfig = async () => {
      if (!selectedSchool || !selectedSection) {
        setExistingAssignments([]);
        return;
      }

      try {
        const result = await getSectionConfig(selectedSchool, selectedSection);
        if (result.success && result.data && result.data.podsieAssignments) {
          setExistingAssignments(result.data.podsieAssignments as unknown as PodsieAssignment[]);
        } else {
          setExistingAssignments([]);
        }
      } catch (err) {
        console.error('Error loading section config:', err);
      }
    };

    loadSectionConfig();
  }, [selectedSchool, selectedSection]);

  // Fetch Podsie assignments
  const handleFetchPodsieAssignments = async () => {
    if (!selectedSection) {
      setError('Please select a section first');
      return;
    }

    try {
      setFetchingPodsie(true);
      setError(null);
      const result = await fetchAssignmentsForSection(selectedSection);

      if (result.success) {
        setPodsieAssignments(result.assignments);

        // Initialize matches
        const initialMatches: AssignmentMatch[] = result.assignments.map(assignment => ({
          podsieAssignment: assignment,
          matchedLesson: null,
          isCreatingNew: false,
          newLessonData: {
            unitNumber: 1,
            section: "Ramp Ups",
            lessonNumber: 0
          }
        }));
        setMatches(initialMatches);
        setSuccess(`Fetched ${result.assignments.length} assignments from Podsie`);
      } else {
        setError(result.error || 'Failed to fetch Podsie assignments');
      }
    } catch (err) {
      console.error('Error fetching Podsie assignments:', err);
      setError('Failed to fetch Podsie assignments');
    } finally {
      setFetchingPodsie(false);
    }
  };

  // Update a match
  const handleMatchChange = (assignmentId: number, lessonId: string) => {
    setMatches(prev => {
      const currentIndex = prev.findIndex(m => m.podsieAssignment.assignmentId === assignmentId);

      return prev.map((match) => {
        if (match.podsieAssignment.assignmentId === assignmentId) {
          if (lessonId === 'CREATE_NEW') {
            // Find the previous match that has lesson data
            let unitNumber = 1;
            let lessonNumber = 0;
            let section = "Ramp Ups";

            // Look at the previous match in the list
            if (currentIndex > 0) {
              const prevMatch = prev[currentIndex - 1];

              // Check if we should auto-increment (only if entries are consecutive)
              let shouldAutoIncrement = false;
              let prevUnitNumber = 0;
              let prevLessonNumber = 0;
              let prevSection = "Ramp Ups";

              // Get previous lesson data
              if (prevMatch.matchedLesson) {
                prevUnitNumber = prevMatch.matchedLesson.unitNumber;
                prevLessonNumber = prevMatch.matchedLesson.lessonNumber;
                prevSection = prevMatch.matchedLesson.section || "Ramp Ups";
                section = prevSection;
                shouldAutoIncrement = true;
              } else if (prevMatch.isCreatingNew && prevMatch.newLessonData) {
                prevUnitNumber = prevMatch.newLessonData.unitNumber;
                prevLessonNumber = prevMatch.newLessonData.lessonNumber;
                prevSection = prevMatch.newLessonData.section;
                section = prevSection;
                shouldAutoIncrement = true;
              }

              // Only auto-increment for Ramp Ups, not Unit Assessment or other sections
              if (prevSection !== "Ramp Ups") {
                shouldAutoIncrement = false;
              }

              // If we have previous data, check if we should increment
              if (shouldAutoIncrement) {
                // Check if current assignment follows the previous one consecutively
                // by checking if there are 2+ previous entries and comparing the pattern
                let isConsecutive = true;

                if (currentIndex >= 2) {
                  const prevPrevMatch = prev[currentIndex - 2];
                  let prevPrevLessonNumber = 0;

                  if (prevPrevMatch.matchedLesson) {
                    prevPrevLessonNumber = prevPrevMatch.matchedLesson.lessonNumber;
                  } else if (prevPrevMatch.isCreatingNew && prevPrevMatch.newLessonData) {
                    prevPrevLessonNumber = prevPrevMatch.newLessonData.lessonNumber;
                  }

                  // Check if the previous entry was consecutive (incremented by 1)
                  if (prevPrevLessonNumber > 0) {
                    isConsecutive = (prevLessonNumber === prevPrevLessonNumber + 1);
                  }
                }

                if (isConsecutive) {
                  unitNumber = prevUnitNumber;
                  lessonNumber = prevLessonNumber + 1;
                } else {
                  // Not consecutive, use defaults
                  unitNumber = 1;
                  lessonNumber = 0;
                  section = "Ramp Ups";
                }
              }
            }

            return {
              ...match,
              matchedLesson: null,
              isCreatingNew: true,
              newLessonData: {
                unitNumber,
                section,
                lessonNumber
              }
            };
          } else {
            const lesson = lessons.find(l => l.id === lessonId);
            return {
              ...match,
              matchedLesson: lesson || null,
              isCreatingNew: false
            };
          }
        }
        return match;
      });
    });
  };

  // Update new lesson data
  const handleNewLessonDataChange = (assignmentId: number, field: string, value: string | number) => {
    setMatches(prev => prev.map(match => {
      if (match.podsieAssignment.assignmentId === assignmentId) {
        return {
          ...match,
          newLessonData: {
            ...match.newLessonData!,
            [field]: value
          }
        };
      }
      return match;
    }));
  };

  // Group lessons by unit
  const lessonsByUnit = lessons.reduce((acc, lesson) => {
    const unit = lesson.unit || 'Unknown Unit';
    if (!acc[unit]) {
      acc[unit] = [];
    }
    acc[unit].push(lesson);
    return acc;
  }, {} as Record<string, ScopeAndSequence[]>);

  // Filter matches based on toggle
  const filteredMatches = showUnmatchedOnly
    ? matches.filter(match => {
        const alreadyExists = existingAssignments.some(
          existing => existing.podsieAssignmentId === String(match.podsieAssignment.assignmentId)
        );
        return !alreadyExists;
      })
    : matches;

  // Auto-match by name similarity
  const handleAutoMatch = () => {
    setMatches(prev => prev.map(match => {
      // Try to find a lesson with similar name
      const podsieNameLower = match.podsieAssignment.assignmentName.toLowerCase();
      const bestMatch = lessons.find(lesson => {
        const lessonNameLower = lesson.lessonName.toLowerCase();
        return lessonNameLower.includes(podsieNameLower) ||
               podsieNameLower.includes(lessonNameLower);
      });

      return {
        ...match,
        matchedLesson: bestMatch || match.matchedLesson
      };
    }));
    setSuccess('Auto-matched assignments by name similarity');
  };

  // Save all matches to section config
  const handleSaveAll = async () => {
    if (!selectedSchool || !selectedSection) {
      setError('Please select school and section');
      return;
    }

    const validMatches = matches.filter(m => m.matchedLesson !== null || m.isCreatingNew);
    if (validMatches.length === 0) {
      setError('No matches to save');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // First, ensure section config exists
      const configResult = await getSectionConfig(selectedSchool, selectedSection);

      if (!configResult.success || !configResult.data) {
        // Create new section config
        const createResult = await upsertSectionConfig({
          school: selectedSchool,
          classSection: selectedSection,
          gradeLevel: selectedSection.startsWith('6') ? '6' :
                     selectedSection.startsWith('7') ? '7' : '8',
          podsieAssignments: [],
          active: true
        });

        if (!createResult.success) {
          setError(createResult.error || 'Failed to create section config');
          return;
        }
      }

      // Process each match
      let successCount = 0;
      for (const match of validMatches) {
        let lessonToUse = match.matchedLesson;

        // Create new lesson if needed
        if (match.isCreatingNew && match.newLessonData) {
          const gradeLevel = selectedSection.startsWith('6') ? '6' :
                            selectedSection.startsWith('7') ? '7' : '8';

          const unitLessonId = `${match.newLessonData.unitNumber}.${match.newLessonData.lessonNumber}`;
          const scopeTag = selectedSection === '802' ? 'Algebra 1' : `Grade ${gradeLevel}`;

          const newLessonResult = await createScopeAndSequence({
            grade: gradeLevel,
            unit: `Unit ${match.newLessonData.unitNumber}`,
            unitNumber: match.newLessonData.unitNumber,
            unitLessonId,
            lessonNumber: match.newLessonData.lessonNumber,
            lessonName: match.podsieAssignment.assignmentName,
            section: match.newLessonData.section,
            lessonType: match.newLessonData.section === 'Ramp Ups' ? 'ramp-up' : 'lesson',
            scopeSequenceTag: scopeTag,
            roadmapSkills: [],
            targetSkills: [],
            ownerIds: []
          });

          if (newLessonResult.success && newLessonResult.data) {
            lessonToUse = newLessonResult.data as ScopeAndSequence;
          } else if (newLessonResult.error?.includes('E11000 duplicate key error')) {
            // Lesson already exists, try to fetch it
            console.log(`Lesson ${unitLessonId} already exists, fetching existing lesson...`);

            // Find the existing lesson in our loaded lessons
            const existingLesson = lessons.find(l =>
              l.unitLessonId === unitLessonId &&
              l.grade === gradeLevel &&
              l.scopeSequenceTag === scopeTag
            );

            if (existingLesson) {
              lessonToUse = existingLesson;
              console.log(`Using existing lesson: ${existingLesson.lessonName}`);
            } else {
              console.error('Lesson exists in DB but not found in loaded lessons. Try refreshing the page.');
              continue;
            }
          } else {
            console.error('Failed to create lesson:', newLessonResult.error);
            continue;
          }
        }

        if (!lessonToUse) continue;

        const assignment: PodsieAssignment = {
          unitLessonId: lessonToUse.unitLessonId,
          lessonName: lessonToUse.lessonName,
          grade: lessonToUse.grade,
          assignmentType: 'mastery-check', // Default to mastery-check for imported assignments
          podsieAssignmentId: String(match.podsieAssignment.assignmentId),
          podsieQuestionMap: match.podsieAssignment.questionIds.map((questionId: number, idx: number) => ({
            questionNumber: idx + 1,
            questionId: String(questionId)
          })),
          totalQuestions: match.podsieAssignment.totalQuestions,
          active: true
        };

        const result = await addPodsieAssignment(
          selectedSchool,
          selectedSection,
          assignment
        );

        if (result.success) {
          successCount++;
        }
      }

      setSuccess(`Successfully saved ${successCount} of ${validMatches.length} assignments`);

      // Reload existing assignments
      const reloadResult = await getSectionConfig(selectedSchool, selectedSection);
      if (reloadResult.success && reloadResult.data && reloadResult.data.podsieAssignments) {
        setExistingAssignments(reloadResult.data.podsieAssignments as unknown as PodsieAssignment[]);
      }

      // Clear matches
      setMatches([]);
      setPodsieAssignments([]);
    } catch (err) {
      console.error('Error saving assignments:', err);
      setError('Failed to save assignments');
    } finally {
      setSaving(false);
    }
  };

  const matchedCount = matches.filter(m => m.matchedLesson !== null || m.isCreatingNew).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Navigation */}
        <RoadmapsNav />

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">Section Configuration</h1>
          <p className="text-gray-600">
            Import Podsie assignments and match them with scope-and-sequence lessons
          </p>
        </div>

        {/* School and Section Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Select Section</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                School
              </label>
              <select
                value={selectedSchool}
                onChange={(e) => {
                  setSelectedSchool(e.target.value as SchoolsType);
                  setSelectedSection("");
                  setPodsieAssignments([]);
                  setMatches([]);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select School</option>
                {Schools.map(school => (
                  <option key={school} value={school}>{school}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class Section
              </label>
              <select
                value={selectedSection}
                onChange={(e) => {
                  setSelectedSection(e.target.value as AllSectionsType);
                  setPodsieAssignments([]);
                  setMatches([]);
                }}
                disabled={!selectedSchool}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select Section</option>
                {AllSections.map(section => (
                  <option key={section} value={section}>{section}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleFetchPodsieAssignments}
            disabled={!selectedSection || fetchingPodsie}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ArrowPathIcon className={`w-5 h-5 ${fetchingPodsie ? 'animate-spin' : ''}`} />
            {fetchingPodsie ? 'Fetching...' : 'Fetch from Podsie'}
          </button>
        </div>

        {/* Existing Assignments */}
        {existingAssignments.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Existing Assignments ({existingAssignments.length})
              </h2>
              <button
                onClick={() => setShowManualCreateModal(true)}
                disabled={!selectedSchool || !selectedSection}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <PlusIcon className="w-4 h-4" />
                Manual Create
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {existingAssignments.map((assignment, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {assignment.unitLessonId}: {assignment.lessonName}
                    </div>
                    <div className="text-sm text-gray-600">
                      Assignment ID: {assignment.podsieAssignmentId} • {assignment.totalQuestions} questions • {assignment.assignmentType}
                    </div>
                  </div>
                  <CheckIcon className="w-5 h-5 text-green-600" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Assignment Matching */}
        {podsieAssignments.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold">
                  Match Assignments ({matchedCount} / {podsieAssignments.length})
                </h2>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showUnmatchedOnly}
                    onChange={(e) => setShowUnmatchedOnly(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-gray-700">Show unmatched only</span>
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAutoMatch}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg font-medium hover:bg-purple-700 transition-colors cursor-pointer"
                >
                  Auto-Match
                </button>
                <button
                  onClick={handleSaveAll}
                  disabled={matchedCount === 0 || saving}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <PlusIcon className="w-5 h-5" />
                  {saving ? 'Saving...' : `Save All (${matchedCount})`}
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredMatches.map((match, idx) => {
                const alreadyExists = existingAssignments.some(
                  existing => existing.podsieAssignmentId === String(match.podsieAssignment.assignmentId)
                );

                return (
                  <div key={match.podsieAssignment.assignmentId} className={`border rounded-lg p-4 ${
                    alreadyExists ? 'border-green-300 bg-green-50/30' : 'border-gray-200'
                  }`}>
                    {/* Already Exists Indicator */}
                    {alreadyExists && (
                      <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-green-100 border border-green-300 rounded-lg">
                        <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-green-800">
                          Already saved in section config
                        </span>
                      </div>
                    )}

                    {/* Podsie Assignment Info */}
                    <div className="bg-blue-50 p-3 rounded mb-4">
                      <div className="text-sm font-medium text-blue-900 mb-1">
                        Podsie Assignment #{idx + 1}
                      </div>
                      <div className="font-semibold text-gray-900 mb-1">
                        {match.podsieAssignment.assignmentName}
                      </div>
                      <div className="text-sm text-gray-600">
                        ID: {match.podsieAssignment.assignmentId} • {match.podsieAssignment.totalQuestions} questions
                      </div>
                    </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      onClick={() => {
                        if (match.isCreatingNew) {
                          setMatches(prev => prev.map(m =>
                            m.podsieAssignment.assignmentId === match.podsieAssignment.assignmentId
                              ? { ...m, isCreatingNew: false }
                              : m
                          ));
                        }
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                        !match.isCreatingNew
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Match with Existing Lesson
                    </button>
                    <button
                      onClick={() => handleMatchChange(match.podsieAssignment.assignmentId, 'CREATE_NEW')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                        match.isCreatingNew
                          ? 'bg-yellow-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <PlusIcon className="w-4 h-4" />
                      Create New Lesson
                    </button>
                  </div>

                  {/* Match with Existing Lesson */}
                  {!match.isCreatingNew && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Lesson
                      </label>
                      <select
                        value={match.matchedLesson?.id || ''}
                        onChange={(e) => handleMatchChange(match.podsieAssignment.assignmentId, e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          match.matchedLesson
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select a lesson...</option>
                        {Object.entries(lessonsByUnit).map(([unit, unitLessons]) => (
                          <optgroup key={unit} label={unit}>
                            {unitLessons.map(lesson => (
                              <option key={lesson.id} value={lesson.id}>
                                {lesson.unitLessonId}: {lesson.lessonName}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      {match.matchedLesson && (
                        <div className="mt-2 text-sm text-green-700 flex items-center gap-1">
                          <CheckIcon className="w-4 h-4" />
                          Matched: {match.matchedLesson.unitLessonId}
                        </div>
                      )}
                    </div>
                  )}

                  {/* New Lesson Form */}
                  {match.isCreatingNew && match.newLessonData && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">New Lesson Details</h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Unit Number
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={match.newLessonData.unitNumber}
                            onChange={(e) => handleNewLessonDataChange(
                              match.podsieAssignment.assignmentId,
                              'unitNumber',
                              parseInt(e.target.value) || 1
                            )}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Section
                          </label>
                          <select
                            value={match.newLessonData.section}
                            onChange={(e) => handleNewLessonDataChange(
                              match.podsieAssignment.assignmentId,
                              'section',
                              e.target.value
                            )}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {SECTION_OPTIONS.map(section => (
                              <option key={section} value={section}>
                                {section}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Lesson Number
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={match.newLessonData.lessonNumber}
                            onChange={(e) => handleNewLessonDataChange(
                              match.podsieAssignment.assignmentId,
                              'lessonNumber',
                              parseInt(e.target.value) || 0
                            )}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        Will create: <span className="font-mono font-semibold">
                          {match.newLessonData.unitNumber}.{match.newLessonData.lessonNumber}
                        </span> - {match.podsieAssignment.assignmentName}
                      </div>
                    </div>
                  )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && lessons.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-600">Loading lessons...</div>
          </div>
        )}

        {/* Empty State */}
        {!loading && podsieAssignments.length === 0 && selectedSection && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 text-4xl mb-4">📋</div>
            <div className="text-gray-600">
              Click &quot;Fetch from Podsie&quot; to load assignments for {selectedSection}
            </div>
          </div>
        )}

        {/* Manual Create Assignment Modal */}
        {showManualCreateModal && selectedSchool && selectedSection && (
          <ManualCreateAssignmentModal
            school={selectedSchool}
            classSection={selectedSection}
            gradeLevel={selectedSection.startsWith('6') ? '6' : selectedSection.startsWith('7') ? '7' : '8'}
            onClose={() => setShowManualCreateModal(false)}
            onSuccess={async () => {
              setShowManualCreateModal(false);
              setSuccess("Assignment added successfully!");
              // Reload existing assignments
              const result = await getSectionConfig(selectedSchool, selectedSection);
              if (result.success && result.data && result.data.podsieAssignments) {
                setExistingAssignments(result.data.podsieAssignments as unknown as PodsieAssignment[]);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
