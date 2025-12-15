"use client";

import { useState, useEffect } from "react";
import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { useToast } from "@/components/core/feedback/Toast";
import type { SchoolsType, AllSectionsType } from "@schema/enum/scm";
import {
  getSectionConfig,
  upsertSectionConfig,
  addAssignmentContent,
  getAssignmentContent
} from "@/app/actions/scm/podsie/section-config";
import {
  fetchAssignmentsForSection,
  PodsieAssignmentInfo
} from "@/app/actions/scm/podsie/podsie-sync";
import { fetchScopeAndSequence } from "@/app/actions/scm/scope-and-sequence/scope-and-sequence";
import type { ScopeAndSequence } from "@zod-schema/scm/scope-and-sequence/scope-and-sequence";
import type { AssignmentContent } from "@zod-schema/scm/podsie/section-config";
import { SchoolSectionSelector } from "./components/SchoolSectionSelector";
import { ExistingAssignmentsList } from "./components/ExistingAssignmentsList";
import { MatchingControls } from "./components/MatchingControls";
import { AssignmentMatchRow } from "./components/AssignmentMatchRow";
import { findBestMatch } from "@/lib/utils/lesson-name-normalization";
import { Spinner } from "@/components/core/feedback/Spinner";

interface AssignmentMatch {
  podsieAssignment: PodsieAssignmentInfo;
  matchedLesson: ScopeAndSequence | null;
  assignmentType: 'sidekick' | 'mastery-check' | 'assessment';
  totalQuestions?: number;
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
  const [savingIndividual, setSavingIndividual] = useState<number | null>(null);
  const { showToast, ToastComponent } = useToast();

  // Data states
  const [podsieAssignments, setPodsieAssignments] = useState<PodsieAssignmentInfo[]>([]);
  const [lessons, setLessons] = useState<ScopeAndSequence[]>([]);
  const [matches, setMatches] = useState<AssignmentMatch[]>([]);
  const [existingAssignments, setExistingAssignments] = useState<AssignmentContent[]>([]);

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
        const result = await getAssignmentContent(selectedSchool, selectedSection);
        if (result.success && result.data) {
          setExistingAssignments(result.data);
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
      const result = await fetchAssignmentsForSection(selectedSection, true);

      if (result.success) {
        setPodsieAssignments(result.assignments);

        // Initialize matches
        const initialMatches: AssignmentMatch[] = result.assignments.map(assignment => ({
          podsieAssignment: assignment,
          matchedLesson: null,
          // Auto-detect based on module_name: if it contains "LESSONS", it's a sidekick; otherwise mastery-check
          assignmentType: assignment.moduleName?.includes('LESSONS') ? 'sidekick' : 'mastery-check',
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
        // Check if this assignment already exists in the section config
        const alreadyExists = existingAssignments.some(existing => {
          // Find the activity with matching podsieAssignmentId
          return existing.podsieActivities?.some(
            activity => activity.podsieAssignmentId === String(match.podsieAssignment.assignmentId)
          );
        });
        return !alreadyExists;
      })
    : matches;

  // Auto-match by name similarity using normalization
  const handleAutoMatch = () => {
    setMatches(prev => prev.map(match => {
      // Use the normalization utility to find best match
      const bestMatchResult = findBestMatch(
        match.podsieAssignment.assignmentName,
        lessons,
        0.6 // Lower threshold to be more permissive
      );

      const matchedLesson = bestMatchResult.match || match.matchedLesson;

      // Auto-detect assignment type based on matched lesson's lessonType
      let assignmentType = match.assignmentType;
      if (matchedLesson) {
        if (matchedLesson.lessonType === 'assessment') {
          // Unit assessments
          assignmentType = 'assessment';
        } else if (match.podsieAssignment.moduleName?.includes('LESSONS')) {
          // Sidekick activities (warm-up, activities, cool-down)
          assignmentType = 'sidekick';
        } else {
          // Default to mastery-check for other activities
          assignmentType = 'mastery-check';
        }
      }

      return {
        ...match,
        matchedLesson,
        assignmentType
      };
    }));
    setSuccess('Auto-matched assignments by name similarity');
  };

  // Save individual assignment
  const handleSaveIndividual = async (match: AssignmentMatch) => {
    if (!selectedSchool || !selectedSection) {
      const errorMsg = 'Please select school and section';
      setError(errorMsg);
      showToast({
        title: 'Selection Required',
        description: errorMsg,
        variant: 'error',
        icon: ExclamationTriangleIcon,
      });
      return;
    }

    if (!match.matchedLesson) {
      const errorMsg = 'Please select a lesson first';
      setError(errorMsg);
      showToast({
        title: 'Lesson Required',
        description: errorMsg,
        variant: 'error',
        icon: ExclamationTriangleIcon,
      });
      return;
    }

    try {
      setSavingIndividual(match.podsieAssignment.assignmentId);
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
          assignmentContent: [],
          active: true
        });

        if (!createResult.success) {
          setError(createResult.error || 'Failed to create section config');
          return;
        }
      }

      // Add assignment content - save first N questions as root questions
      console.log('🔍 Preparing to save assignment:', match.matchedLesson.lessonName);
      console.log('  Podsie Assignment ID:', match.podsieAssignment.assignmentId);
      console.log('  Total question IDs from Podsie:', match.podsieAssignment.questionIds.length);

      // Determine total questions (use totalQuestions field if set, otherwise use actual count)
      const totalQuestionsToSave = match.totalQuestions ?? match.podsieAssignment.totalQuestions;

      // Take first N questions as root questions
      const mappedQuestions = match.podsieAssignment.questionIds
        .slice(0, totalQuestionsToSave)
        .map((questionId, index) => ({
          questionNumber: index + 1,
          questionId: String(questionId),
          isRoot: true,
        }));

      console.log('  📊 Saving questions:');
      console.log('    - Total questions to save:', mappedQuestions.length);
      console.log('    - All marked as root questions');
      console.log('  📝 First 5 questions:', mappedQuestions.slice(0, 5));

      const assignmentData: {
        scopeAndSequenceId: string;
        unitLessonId: string;
        lessonName: string;
        section?: string;
        grade?: string;
        activityType: 'sidekick' | 'mastery-check' | 'assessment';
        podsieAssignmentId: string;
        podsieQuestionMap: Array<{ questionNumber: number; questionId: string; isRoot: boolean; rootQuestionId?: string; variantNumber?: number }>;
        totalQuestions: number;
        hasZearnLesson?: boolean;
        active?: boolean;
      } = {
        scopeAndSequenceId: match.matchedLesson.id || match.matchedLesson._id,
        unitLessonId: match.matchedLesson.unitLessonId,
        lessonName: match.matchedLesson.lessonName,
        activityType: match.assignmentType,
        podsieAssignmentId: String(match.podsieAssignment.assignmentId),
        // Use variant mapping to save ALL questions with proper root/variant info
        podsieQuestionMap: mappedQuestions,
        totalQuestions: match.totalQuestions ?? match.podsieAssignment.totalQuestions,
        hasZearnLesson: false,
        active: true
      };

      if (match.matchedLesson.section) assignmentData.section = match.matchedLesson.section;
      if (match.matchedLesson.grade) assignmentData.grade = match.matchedLesson.grade;

      console.log('💾 Calling addAssignmentContent...');
      const result = await addAssignmentContent(
        selectedSchool,
        selectedSection,
        assignmentData
      );

      if (result.success) {
        console.log('✅ Save successful!');
        console.log('  Result:', result);
        const successMsg = `Successfully saved assignment: ${match.matchedLesson.lessonName}`;
        setSuccess(successMsg);
        showToast({
          title: 'Assignment Saved',
          description: successMsg,
          variant: 'success',
          icon: CheckCircleIcon,
        });

        // Reload existing assignments
        console.log('🔄 Reloading assignments to verify...');
        const reloadResult = await getAssignmentContent(selectedSchool, selectedSection);
        if (reloadResult.success && reloadResult.data) {
          console.log('✅ Reload successful, found', reloadResult.data.length, 'assignments');
          setExistingAssignments(reloadResult.data);

          // Find and log the assignment we just saved
          const savedAssignment = reloadResult.data.find(a =>
            a.podsieActivities?.some(act => act.podsieAssignmentId === String(match.podsieAssignment.assignmentId))
          );
          if (savedAssignment) {
            const savedActivity = savedAssignment.podsieActivities?.find(
              act => act.podsieAssignmentId === String(match.podsieAssignment.assignmentId)
            );
            if (savedActivity) {
              console.log('📋 Verified saved question map:');
              console.log('  Total questions:', savedActivity.podsieQuestionMap?.length);
              console.log('  Root questions:', savedActivity.podsieQuestionMap?.filter(q => q.isRoot === true).length);
              console.log('  Variant questions:', savedActivity.podsieQuestionMap?.filter(q => q.isRoot === false).length);
              console.log('  First 3:', savedActivity.podsieQuestionMap?.slice(0, 3));
            }
          }
        }
      } else {
        console.log('❌ Save failed:', result.error);
        const errorMsg = result.error || 'Failed to save assignment';
        setError(errorMsg);
        showToast({
          title: 'Save Failed',
          description: errorMsg,
          variant: 'error',
          icon: ExclamationTriangleIcon,
        });
      }
    } catch (err) {
      console.error('Error saving assignment:', err);
      const errorMsg = 'Failed to save assignment';
      setError(errorMsg);
      showToast({
        title: 'Save Error',
        description: errorMsg,
        variant: 'error',
        icon: ExclamationTriangleIcon,
      });
    } finally {
      setSavingIndividual(null);
    }
  };

  // Save all matches to section config
  const handleSaveAll = async () => {
    if (!selectedSchool || !selectedSection) {
      const errorMsg = 'Please select school and section';
      setError(errorMsg);
      showToast({
        title: 'Selection Required',
        description: errorMsg,
        variant: 'error',
        icon: ExclamationTriangleIcon,
      });
      return;
    }

    const validMatches = matches.filter(m => m.matchedLesson !== null);
    if (validMatches.length === 0) {
      const errorMsg = 'No matches to save';
      setError(errorMsg);
      showToast({
        title: 'No Matches',
        description: errorMsg,
        variant: 'error',
        icon: ExclamationTriangleIcon,
      });
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
          assignmentContent: [],
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
        if (!match.matchedLesson) continue;

        // Determine total questions and create question map
        const totalQuestionsToSave = match.totalQuestions ?? match.podsieAssignment.totalQuestions;
        const questionMap = match.podsieAssignment.questionIds
          .slice(0, totalQuestionsToSave)
          .map((questionId, index) => ({
            questionNumber: index + 1,
            questionId: String(questionId),
            isRoot: true,
          }));

        const assignmentData: {
          scopeAndSequenceId: string;
          unitLessonId: string;
          lessonName: string;
          section?: string;
          grade?: string;
          activityType: 'sidekick' | 'mastery-check' | 'assessment';
          podsieAssignmentId: string;
          podsieQuestionMap: Array<{ questionNumber: number; questionId: string; isRoot: boolean; rootQuestionId?: string; variantNumber?: number }>;
          totalQuestions: number;
          hasZearnLesson?: boolean;
          active?: boolean;
        } = {
          scopeAndSequenceId: match.matchedLesson.id || match.matchedLesson._id,
          unitLessonId: match.matchedLesson.unitLessonId,
          lessonName: match.matchedLesson.lessonName,
          activityType: match.assignmentType,
          podsieAssignmentId: String(match.podsieAssignment.assignmentId),
          // Save first N questions as root questions
          podsieQuestionMap: questionMap,
          totalQuestions: totalQuestionsToSave,
          hasZearnLesson: false,
          active: true
        };

        if (match.matchedLesson.section) assignmentData.section = match.matchedLesson.section;
        if (match.matchedLesson.grade) assignmentData.grade = match.matchedLesson.grade;

        const result = await addAssignmentContent(
          selectedSchool,
          selectedSection,
          assignmentData
        );

        if (result.success) {
          successCount++;
        }
      }

      const successMsg = `Successfully saved ${successCount} of ${validMatches.length} assignment${validMatches.length !== 1 ? 's' : ''}`;
      setSuccess(successMsg);
      showToast({
        title: 'Save Complete',
        description: successMsg,
        variant: 'success',
        icon: CheckCircleIcon,
      });

      // Reload existing assignments
      const reloadResult = await getAssignmentContent(selectedSchool, selectedSection);
      if (reloadResult.success && reloadResult.data) {
        setExistingAssignments(reloadResult.data);
      }

      // Clear matches
      setMatches([]);
      setPodsieAssignments([]);
    } catch (err) {
      console.error('Error saving assignments:', err);
      const errorMsg = 'Failed to save assignments';
      setError(errorMsg);
      showToast({
        title: 'Save Error',
        description: errorMsg,
        variant: 'error',
        icon: ExclamationTriangleIcon,
      });
    } finally {
      setSaving(false);
    }
  };

  const matchedCount = matches.filter(m => m.matchedLesson !== null).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto p-6" style={{ maxWidth: "1600px" }}>
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">Section Configuration</h1>
          <p className="text-gray-600">
            Import Podsie assignments and match them with scope-and-sequence lessons
          </p>
        </div>

        {/* School and Section Selection */}
        <SchoolSectionSelector
          selectedSchool={selectedSchool}
          selectedSection={selectedSection}
          onSchoolChange={(school) => {
            setSelectedSchool(school);
            setSelectedSection("");
            setPodsieAssignments([]);
            setMatches([]);
          }}
          onSectionChange={(section) => {
            setSelectedSection(section);
            setPodsieAssignments([]);
            setMatches([]);
          }}
          onFetchPodsie={handleFetchPodsieAssignments}
          fetchingPodsie={fetchingPodsie}
        />

        {/* Existing Assignments */}
        {existingAssignments.length > 0 && (
          <ExistingAssignmentsList assignments={existingAssignments} />
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
            <MatchingControls
              matchedCount={matchedCount}
              totalCount={podsieAssignments.length}
              showUnmatchedOnly={showUnmatchedOnly}
              onToggleUnmatched={setShowUnmatchedOnly}
              onAutoMatch={handleAutoMatch}
              onSaveAll={handleSaveAll}
              saving={saving}
            />

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredMatches.map((match, idx) => {
                // Check if assignment already exists
                const alreadyExists = existingAssignments.some(existing => {
                  return existing.podsieActivities?.some(
                    activity => activity.podsieAssignmentId === String(match.podsieAssignment.assignmentId)
                  );
                });

                // Check if assignment has question mapping
                const existingAssignment = existingAssignments.find(existing => {
                  return existing.podsieActivities?.some(
                    activity => activity.podsieAssignmentId === String(match.podsieAssignment.assignmentId)
                  );
                });

                const existingActivity = existingAssignment?.podsieActivities?.find(
                  activity => activity.podsieAssignmentId === String(match.podsieAssignment.assignmentId)
                );

                const hasQuestionMapping = !!(existingActivity?.podsieQuestionMap &&
                                         existingActivity.podsieQuestionMap.length > 0);

                return (
                  <AssignmentMatchRow
                    key={match.podsieAssignment.assignmentId}
                    index={idx}
                    podsieAssignment={match.podsieAssignment}
                    matchedLesson={match.matchedLesson}
                    assignmentType={match.assignmentType}
                    totalQuestions={match.totalQuestions}
                    lessonsByUnit={lessonsByUnit}
                    alreadyExists={alreadyExists}
                    hasQuestionMapping={hasQuestionMapping}
                    saving={savingIndividual === match.podsieAssignment.assignmentId}
                    onMatchChange={(lessonId) => {
                      const lesson = lessons.find(l => l.id === lessonId);
                      setMatches(prev => prev.map(m =>
                        m.podsieAssignment.assignmentId === match.podsieAssignment.assignmentId
                          ? { ...m, matchedLesson: lesson || null }
                          : m
                      ));
                    }}
                    onTypeChange={(type) => {
                      setMatches(prev => prev.map(m =>
                        m.podsieAssignment.assignmentId === match.podsieAssignment.assignmentId
                          ? { ...m, assignmentType: type }
                          : m
                      ));
                    }}
                    onTotalQuestionsChange={(total) => {
                      setMatches(prev => prev.map(m =>
                        m.podsieAssignment.assignmentId === match.podsieAssignment.assignmentId
                          ? { ...m, totalQuestions: total }
                          : m
                      ));
                    }}
                    onSave={() => handleSaveIndividual(match)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && lessons.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12">
            <div className="flex justify-center items-center min-h-[400px]">
              <Spinner size="lg" variant="primary" />
            </div>
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
      </div>
      <ToastComponent />
    </div>
  );
}
