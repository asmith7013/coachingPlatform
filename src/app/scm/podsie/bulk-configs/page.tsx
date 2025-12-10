"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CheckCircleIcon, ExclamationTriangleIcon, LinkIcon } from "@heroicons/react/24/solid";
import { useToast } from "@/components/core/feedback/Toast";
import { Spinner } from "@/components/core/feedback/Spinner";
import { getAllSectionConfigs } from "@/app/actions/313/section-overview";
import {
  bulkFetchAndMatch,
  saveSingleMatch,
  bulkSaveMatches,
  type BulkMatchResult,
  type AssignmentMatchResult,
  type AvailableLesson,
} from "@/app/actions/313/podsie-sync";
import type { PodsieAssignmentInfo } from "@/app/actions/313/podsie-sync";
import { listQuestionMaps } from "@/app/actions/313/podsie-question-map";
import { getQuestionMapFromCurriculum } from "@/app/actions/313/curriculum-question-map";
import { updatePodsieQuestionMap } from "@/app/actions/313/section-config";
import { fetchPodsieAssignmentQuestions } from "@/app/actions/313/podsie-sync";
import { MultiSectionSelector } from "../bulk-sync/components/MultiSectionSelector";
import { SectionMatchResults } from "./components/SectionMatchResults";

interface SavedQuestionMap {
  assignmentId: string;
  assignmentName: string;
  totalQuestions: number;
  notes?: string;
}

// =====================================
// TYPES
// =====================================

interface SectionOption {
  id: string;
  school: string;
  classSection: string;
  displayName: string;
}

// =====================================
// PAGE COMPONENT
// =====================================

export default function BulkConfigsPage() {
  const { showToast, ToastComponent } = useToast();

  // Section selection state
  const [sections, setSections] = useState<SectionOption[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [sectionColors, setSectionColors] = useState<Map<string, string>>(new Map());
  const [loadingSections, setLoadingSections] = useState(true);

  // Matching state
  const [isMatching, setIsMatching] = useState(false);
  const [matchResults, setMatchResults] = useState<BulkMatchResult[]>([]);

  // Saving state
  const [savingMatchId, setSavingMatchId] = useState<number | null>(null);
  const [savingAllSection, setSavingAllSection] = useState<string | null>(null);

  // Error state for initial load
  const [loadError, setLoadError] = useState<string | null>(null);

  // Question maps state
  const [savedQuestionMaps, setSavedQuestionMaps] = useState<SavedQuestionMap[]>([]);
  const [updatingMapId, setUpdatingMapId] = useState<string | null>(null);

  // Load saved question maps on mount
  useEffect(() => {
    const loadQuestionMaps = async () => {
      try {
        const result = await listQuestionMaps();
        if (result.success && result.data) {
          setSavedQuestionMaps(result.data as SavedQuestionMap[]);
        }
      } catch (error) {
        console.error('Error loading question maps:', error);
      }
    };
    loadQuestionMaps();
  }, []);

  // Load sections on mount
  useEffect(() => {
    const loadSections = async () => {
      try {
        setLoadingSections(true);
        setLoadError(null);
        const result = await getAllSectionConfigs();

        if (result.success) {
          const allSections: SectionOption[] = [];
          const colors = new Map<string, string>();

          // Color palette for sections
          const colorPalette = [
            '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
            '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
          ];

          let colorIndex = 0;
          for (const schoolGroup of result.data) {
            for (const section of schoolGroup.sections) {
              const id = `${schoolGroup.school}-${section.classSection}`;
              allSections.push({
                id,
                school: schoolGroup.school,
                classSection: section.classSection,
                displayName: `${section.classSection}${section.teacher ? ` (${section.teacher})` : ''}`,
              });
              colors.set(id, colorPalette[colorIndex % colorPalette.length]);
              colorIndex++;
            }
          }

          setSections(allSections);
          setSectionColors(colors);
          // Select none by default
          setSelectedSections([]);
        } else {
          setLoadError('Failed to load sections');
        }
      } catch (error) {
        console.error('Error loading sections:', error);
        setLoadError('Failed to load sections');
      } finally {
        setLoadingSections(false);
      }
    };

    loadSections();
  }, []);

  // Toggle section selection
  const handleToggleSection = (sectionId: string) => {
    setSelectedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Fetch and match all selected sections
  const handleFetchAndMatch = async () => {
    if (selectedSections.length === 0) {
      showToast({
        title: 'No Sections Selected',
        description: 'Please select at least one section',
        variant: 'error',
        icon: ExclamationTriangleIcon,
      });
      return;
    }

    try {
      setIsMatching(true);
      setMatchResults([]);

      // Build section list from selected IDs
      const sectionsToMatch = selectedSections.map(id => {
        const section = sections.find(s => s.id === id);
        return section ? { school: section.school, classSection: section.classSection } : null;
      }).filter((s): s is { school: string; classSection: string } => s !== null);

      const result = await bulkFetchAndMatch(sectionsToMatch);

      if (result.success) {
        setMatchResults(result.results);

        // Calculate totals for toast
        const totalNew = result.results.reduce((sum, r) =>
          sum + r.matches.filter(m => !m.alreadyExists && m.matchedLesson).length, 0
        );
        const totalUnmatched = result.results.reduce((sum, r) => sum + r.unmatched.length, 0);
        const totalConflicts = result.results.reduce((sum, r) => sum + r.conflicts.length, 0);

        showToast({
          title: 'Matching Complete',
          description: `${totalNew} new matches, ${totalUnmatched} unmatched, ${totalConflicts} conflicts`,
          variant: 'success',
          icon: CheckCircleIcon,
        });
      } else {
        showToast({
          title: 'Matching Failed',
          description: result.error || 'Unknown error',
          variant: 'error',
          icon: ExclamationTriangleIcon,
        });
      }
    } catch (error) {
      console.error('Error fetching and matching:', error);
      showToast({
        title: 'Error',
        description: 'Failed to fetch and match assignments',
        variant: 'error',
        icon: ExclamationTriangleIcon,
      });
    } finally {
      setIsMatching(false);
    }
  };

  // Save a single match
  const handleSaveMatch = useCallback(async (
    school: string,
    classSection: string,
    match: AssignmentMatchResult
  ) => {
    try {
      setSavingMatchId(match.podsieAssignment.assignmentId);

      const result = await saveSingleMatch({ school, classSection, match });

      if (result.success) {
        // Update the match result to show it's now saved
        setMatchResults(prev => prev.map(r => {
          if (r.school === school && r.classSection === classSection) {
            return {
              ...r,
              matches: r.matches.map(m =>
                m.podsieAssignment.assignmentId === match.podsieAssignment.assignmentId
                  ? { ...m, alreadyExists: true }
                  : m
              ),
            };
          }
          return r;
        }));

        showToast({
          title: 'Saved',
          description: `Saved ${match.podsieAssignment.assignmentName}`,
          variant: 'success',
          icon: CheckCircleIcon,
        });
      } else {
        showToast({
          title: 'Save Failed',
          description: result.error || 'Unknown error',
          variant: 'error',
          icon: ExclamationTriangleIcon,
        });
      }
    } catch (error) {
      console.error('Error saving match:', error);
      showToast({
        title: 'Error',
        description: 'Failed to save match',
        variant: 'error',
        icon: ExclamationTriangleIcon,
      });
    } finally {
      setSavingMatchId(null);
    }
  }, [showToast]);

  // Save all matches for a section
  const handleSaveAllMatches = useCallback(async (
    school: string,
    classSection: string,
    matches: AssignmentMatchResult[]
  ) => {
    try {
      setSavingAllSection(classSection);

      const result = await bulkSaveMatches(school, classSection, matches);

      if (result.success || result.saved > 0) {
        // Update all matches to show they're saved
        setMatchResults(prev => prev.map(r => {
          if (r.school === school && r.classSection === classSection) {
            return {
              ...r,
              matches: r.matches.map(m => {
                const wasSaved = matches.some(
                  saved => saved.podsieAssignment.assignmentId === m.podsieAssignment.assignmentId
                );
                return wasSaved ? { ...m, alreadyExists: true } : m;
              }),
            };
          }
          return r;
        }));

        showToast({
          title: 'Bulk Save Complete',
          description: `Saved ${result.saved} assignments${result.failed > 0 ? `, ${result.failed} failed` : ''}`,
          variant: result.failed > 0 ? 'warning' : 'success',
          icon: result.failed > 0 ? ExclamationTriangleIcon : CheckCircleIcon,
        });
      } else {
        showToast({
          title: 'Save Failed',
          description: result.errors.join(', ') || 'Unknown error',
          variant: 'error',
          icon: ExclamationTriangleIcon,
        });
      }
    } catch (error) {
      console.error('Error saving all matches:', error);
      showToast({
        title: 'Error',
        description: 'Failed to save matches',
        variant: 'error',
        icon: ExclamationTriangleIcon,
      });
    } finally {
      setSavingAllSection(null);
    }
  }, [showToast]);

  // Handle updating question map for existing assignment
  const handleUpdateQuestionMap = useCallback(async (
    school: string,
    classSection: string,
    podsieAssignmentId: string,
    questionMapId: string
  ) => {
    try {
      setUpdatingMapId(podsieAssignmentId);

      // Find the selected question map to get the assignment name for matching
      const selectedMap = savedQuestionMaps.find(m => m.assignmentId === questionMapId);
      if (!selectedMap) {
        showToast({
          title: 'Error',
          description: 'Question map not found',
          variant: 'error',
          icon: ExclamationTriangleIcon,
        });
        return;
      }

      // First, fetch the actual Podsie question IDs for this assignment
      const questionsResult = await fetchPodsieAssignmentQuestions(podsieAssignmentId);
      if (!questionsResult.success || questionsResult.questionIds.length === 0) {
        showToast({
          title: 'Error',
          description: questionsResult.error || 'Failed to fetch questions from Podsie',
          variant: 'error',
          icon: ExclamationTriangleIcon,
        });
        return;
      }

      // Get the question map data from curriculum with actual Podsie question IDs
      const curriculumResult = await getQuestionMapFromCurriculum(
        selectedMap.assignmentName,
        questionsResult.questionIds
      );

      if (!curriculumResult.success || !curriculumResult.data) {
        showToast({
          title: 'Error',
          description: curriculumResult.error || 'Failed to get question map from curriculum',
          variant: 'error',
          icon: ExclamationTriangleIcon,
        });
        return;
      }

      // Update the question map in the section config
      const result = await updatePodsieQuestionMap(
        school,
        classSection,
        podsieAssignmentId,
        curriculumResult.data.questionMap
      );

      if (result.success) {
        showToast({
          title: 'Updated',
          description: `Question map updated to "${selectedMap.assignmentName}" (${curriculumResult.data.totalQuestions} questions)`,
          variant: 'success',
          icon: CheckCircleIcon,
        });
      } else {
        showToast({
          title: 'Update Failed',
          description: result.error || 'Unknown error',
          variant: 'error',
          icon: ExclamationTriangleIcon,
        });
      }
    } catch (error) {
      console.error('Error updating question map:', error);
      showToast({
        title: 'Error',
        description: 'Failed to update question map',
        variant: 'error',
        icon: ExclamationTriangleIcon,
      });
    } finally {
      setUpdatingMapId(null);
    }
  }, [savedQuestionMaps, showToast]);

  // Handle manual match from unmatched assignments
  const handleManualMatch = useCallback(async (
    school: string,
    classSection: string,
    assignment: PodsieAssignmentInfo,
    lesson: AvailableLesson
  ) => {
    try {
      setSavingMatchId(assignment.assignmentId);

      // Build a match object from the manual selection
      const match: AssignmentMatchResult = {
        podsieAssignment: assignment,
        matchedLesson: {
          id: lesson.id,
          unitLessonId: lesson.unitLessonId,
          lessonName: lesson.lessonName,
          lessonType: lesson.lessonType,
          section: lesson.section,
          grade: lesson.grade,
        },
        similarity: 1.0, // Manual match = 100% confidence
        assignmentType: lesson.lessonType === 'assessment' ? 'assessment' :
                        assignment.moduleName?.includes('LESSONS') ? 'sidekick' : 'mastery-check',
        alreadyExists: false,
      };

      const result = await saveSingleMatch({ school, classSection, match });

      if (result.success) {
        // Remove from unmatched and add to matches
        setMatchResults(prev => prev.map(r => {
          if (r.school === school && r.classSection === classSection) {
            return {
              ...r,
              unmatched: r.unmatched.filter(u => u.assignmentId !== assignment.assignmentId),
              matches: [...r.matches, { ...match, alreadyExists: true }],
            };
          }
          return r;
        }));

        showToast({
          title: 'Saved',
          description: `Manually matched "${assignment.assignmentName}" to ${lesson.unitLessonId}`,
          variant: 'success',
          icon: CheckCircleIcon,
        });
      } else {
        showToast({
          title: 'Save Failed',
          description: result.error || 'Unknown error',
          variant: 'error',
          icon: ExclamationTriangleIcon,
        });
      }
    } catch (error) {
      console.error('Error saving manual match:', error);
      showToast({
        title: 'Error',
        description: 'Failed to save manual match',
        variant: 'error',
        icon: ExclamationTriangleIcon,
      });
    } finally {
      setSavingMatchId(null);
    }
  }, [showToast]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto p-6" style={{ maxWidth: "1600px" }}>
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">Bulk Section Configs</h1>
          <p className="text-gray-600">
            Auto-match Podsie assignments to scope-and-sequence entries across multiple sections
          </p>
        </div>

        {/* Section Selection */}
        {loadingSections ? (
          <div className="bg-white rounded-lg shadow-sm p-12">
            <div className="flex justify-center items-center">
              <Spinner size="lg" variant="primary" />
            </div>
          </div>
        ) : loadError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{loadError}</p>
          </div>
        ) : (
          <MultiSectionSelector
            sections={sections}
            selectedSections={selectedSections}
            onToggle={handleToggleSection}
            sectionColors={sectionColors}
          />
        )}

        {/* Fetch & Match Button */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedSections.length} section{selectedSections.length !== 1 ? 's' : ''} selected
            </div>
            <button
              onClick={handleFetchAndMatch}
              disabled={isMatching || selectedSections.length === 0}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
            >
              {isMatching ? (
                <>
                  <Spinner size="sm" variant="default" />
                  Fetching & Matching...
                </>
              ) : (
                'Fetch & Match All'
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {matchResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Match Results</h2>
            {matchResults.map((result) => (
              <SectionMatchResults
                key={`${result.school}-${result.classSection}`}
                result={result}
                onSaveMatch={(match) => handleSaveMatch(result.school, result.classSection, match)}
                onSaveAllMatches={(matches) => handleSaveAllMatches(result.school, result.classSection, matches)}
                onManualMatch={(assignment, lesson) => handleManualMatch(result.school, result.classSection, assignment, lesson)}
                onUpdateQuestionMap={(podsieAssignmentId, questionMapId) =>
                  handleUpdateQuestionMap(result.school, result.classSection, podsieAssignmentId, questionMapId)
                }
                savedQuestionMaps={savedQuestionMaps}
                savingMatchId={savingMatchId}
                savingAll={savingAllSection === result.classSection}
                updatingMapId={updatingMapId}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isMatching && matchResults.length === 0 && !loadingSections && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-600">
              Select sections and click &quot;Fetch & Match All&quot; to auto-match Podsie assignments
            </div>
          </div>
        )}
      </div>
      <ToastComponent />
    </div>
  );
}
