"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { SmartboardProgressBar } from "./SmartboardProgressBar";
import { SmartboardHeader } from "./components/SmartboardHeader";
import { LearningContentPanel } from "./components/LearningContentPanel";
import { SmartboardControls } from "./components/SmartboardControls";
import { YoutubeEditor } from "./components/YoutubeEditor";
import { groupAssignmentsByUnitLesson } from "../../utils/groupAssignments";
import { getSchoolForSection } from "../../utils/sectionHelpers";
import { formatLessonDisplay } from "@/lib/utils/lesson-display";
import type { LessonType } from "@/lib/utils/lesson-display";
import { calculateTodayProgress, calculateTodayCompletionRate } from "@/lib/utils/completion-date-helpers";
import { getLearningContent, saveLearningContent } from "@/app/actions/313/learning-content";
import {
  getYoutubeLinks,
  addYoutubeLink,
  removeYoutubeLink,
  setActiveYoutubeUrl,
  copyYoutubeLinksFromSection,
  getSectionOptions,
} from "@/app/actions/313/section-config";
import { SCOPE_SEQUENCE_TAG_OPTIONS, type ScopeSequenceTagType } from "@schema/enum/313";
import type { YoutubeLink } from "@zod-schema/313/podsie/section-config";

// Type guard to validate scopeSequenceTag
function isValidScopeSequenceTag(tag: string): tag is ScopeSequenceTagType {
  return (SCOPE_SEQUENCE_TAG_OPTIONS as readonly string[]).includes(tag);
}

// Extract YouTube video ID from various URL formats
function extractYoutubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com|youtubeeducation\.com)\/watch\?v=([^&\n?#]+)/,
    /youtu\.be\/([^&\n?#]+)/,
    /(?:youtube\.com|youtubeeducation\.com)\/embed\/([^&\n?#]+)/,
    /(?:youtube\.com|youtubeeducation\.com)\/v\/([^&\n?#]+)/,
    /(?:youtube\.com|youtubeeducation\.com)\/shorts\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

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
  activityType?: 'sidekick' | 'mastery-check' | 'assessment';
  hasZearnActivity?: boolean;
}

interface ProgressData {
  studentId: string;
  studentName: string;
  unitCode: string;
  rampUpId: string;
  rampUpName?: string;
  podsieAssignmentId?: string;
  questions: Array<{
    questionNumber: number;
    completed: boolean;
    completedAt?: string;
  }>;
  totalQuestions: number;
  completedCount: number;
  percentComplete: number;
  isFullyComplete: boolean;
  lastSyncedAt?: string;
  zearnCompleted?: boolean;
  zearnCompletionDate?: string;
}

interface SmartboardDisplayProps {
  assignments: LessonConfig[];
  progressData: ProgressData[];
  selectedUnit: number;
  selectedSection: string;
  selectedLessonSection: string;
  scopeSequenceTag: string;
  grade: string;
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
  scopeSequenceTag,
  grade,
  calculateSummaryStats,
  onSyncAll,
  syncingAll = false,
}: SmartboardDisplayProps) {
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDailyProgress, setShowDailyProgress] = useState(true);
  const [showSidekick, setShowSidekick] = useState(false);
  const [dueDate, setDueDate] = useState<string>(() => {
    // Default to next Friday
    const today = new Date();
    const daysUntilFriday = (5 - today.getDay() + 7) % 7 || 7;
    const nextFriday = new Date(today);
    nextFriday.setDate(today.getDate() + daysUntilFriday);
    return nextFriday.toISOString().split("T")[0];
  });
  const [learningContent, setLearningContent] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loadedContent, setLoadedContent] = useState<string>("");

  // YouTube state
  const [youtubeLinks, setYoutubeLinks] = useState<YoutubeLink[]>([]);
  const [activeYoutubeUrl, setActiveYoutubeUrlState] = useState<string | undefined>();
  const [availableSections, setAvailableSections] = useState<Array<{ school: string; classSection: string }>>([]);

  // Derive school from selected section
  const school = useMemo(() => getSchoolForSection(selectedSection), [selectedSection]);

  // Load YouTube links when section changes
  useEffect(() => {
    const loadYoutubeLinks = async () => {
      if (!selectedSection || school === "Unknown") return;

      try {
        const result = await getYoutubeLinks(school, selectedSection);
        if (result.success && result.data) {
          setYoutubeLinks(result.data.youtubeLinks);
          setActiveYoutubeUrlState(result.data.activeYoutubeUrl);
        }
      } catch (error) {
        console.error("Error loading YouTube links:", error);
      }
    };

    loadYoutubeLinks();
  }, [school, selectedSection]);

  // Load available sections for copy feature
  useEffect(() => {
    const loadSections = async () => {
      try {
        const result = await getSectionOptions();
        if (result.success && result.data) {
          setAvailableSections(result.data.map(s => ({ school: s.school, classSection: s.classSection })));
        }
      } catch (error) {
        console.error("Error loading sections:", error);
      }
    };

    loadSections();
  }, []);

  // YouTube handlers
  const handleAddYoutubeLink = useCallback(async (link: YoutubeLink) => {
    if (school === "Unknown") return;

    try {
      const result = await addYoutubeLink(school, selectedSection, link);
      if (result.success && result.data) {
        setYoutubeLinks(result.data);
      }
    } catch (error) {
      console.error("Error adding YouTube link:", error);
    }
  }, [school, selectedSection]);

  const handleRemoveYoutubeLink = useCallback(async (url: string) => {
    if (school === "Unknown") return;

    try {
      const result = await removeYoutubeLink(school, selectedSection, url);
      if (result.success && result.data) {
        setYoutubeLinks(result.data);
        // Clear active if it was the removed one
        if (activeYoutubeUrl === url) {
          setActiveYoutubeUrlState(undefined);
        }
      }
    } catch (error) {
      console.error("Error removing YouTube link:", error);
    }
  }, [school, selectedSection, activeYoutubeUrl]);

  const handleSetActiveYoutubeUrl = useCallback(async (url: string | null) => {
    if (school === "Unknown") return;

    try {
      const result = await setActiveYoutubeUrl(school, selectedSection, url);
      if (result.success) {
        setActiveYoutubeUrlState(url || undefined);
      }
    } catch (error) {
      console.error("Error setting active YouTube URL:", error);
    }
  }, [school, selectedSection]);

  const handleCopyYoutubeLinks = useCallback(async (sourceSchool: string, sourceClassSection: string) => {
    if (school === "Unknown") return;

    try {
      const result = await copyYoutubeLinksFromSection(school, selectedSection, sourceSchool, sourceClassSection);
      if (result.success && result.data) {
        setYoutubeLinks(result.data);
      }
    } catch (error) {
      console.error("Error copying YouTube links:", error);
    }
  }, [school, selectedSection]);

  // Get the active video title for display
  const activeVideoTitle = useMemo(() => {
    if (!activeYoutubeUrl) return undefined;
    const link = youtubeLinks.find(l => l.url === activeYoutubeUrl);
    return link?.title;
  }, [activeYoutubeUrl, youtubeLinks]);

  // Load learning content when unit/section changes
  useEffect(() => {
    const loadContent = async () => {
      if (!scopeSequenceTag || !grade || !selectedUnit || !selectedLessonSection || !isValidScopeSequenceTag(scopeSequenceTag)) {
        return;
      }

      try {
        const result = await getLearningContent({
          scopeSequenceTag: scopeSequenceTag,
          grade,
          unit: selectedUnit,
          lessonSection: selectedLessonSection,
        });

        if (result.success && result.data) {
          setLearningContent(result.data.content);
          setLoadedContent(result.data.content);
        } else {
          setLearningContent("");
          setLoadedContent("");
        }
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error("Error loading learning content:", error);
      }
    };

    loadContent();
  }, [scopeSequenceTag, grade, selectedUnit, selectedLessonSection]);

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(learningContent !== loadedContent);
  }, [learningContent, loadedContent]);

  // Save learning content
  const handleSave = useCallback(async () => {
    if (!scopeSequenceTag || !grade || !selectedUnit || !selectedLessonSection || !isValidScopeSequenceTag(scopeSequenceTag)) {
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveLearningContent(
        {
          scopeSequenceTag: scopeSequenceTag,
          grade,
          unit: selectedUnit,
          lessonSection: selectedLessonSection,
        },
        learningContent
      );

      if (result.success) {
        setLoadedContent(learningContent);
        setHasUnsavedChanges(false);
      } else {
        console.error("Error saving learning content:", result.error);
      }
    } catch (error) {
      console.error("Error saving learning content:", error);
    } finally {
      setIsSaving(false);
    }
  }, [scopeSequenceTag, grade, selectedUnit, selectedLessonSection, learningContent]);

  // Handle exiting edit mode - save if there are unsaved changes
  const handleToggleEditMode = useCallback(async () => {
    if (isEditMode && hasUnsavedChanges) {
      await handleSave();
    }
    setIsEditMode(!isEditMode);
  }, [isEditMode, hasUnsavedChanges, handleSave]);

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
    const groupedAssignments = groupAssignmentsByUnitLesson(assignments);

    return groupedAssignments.map(({ lesson, masteryCheck }) => {
      // Get lesson progress
      const lessonProgressData = progressData.filter(
        p => p.podsieAssignmentId
          ? p.podsieAssignmentId === lesson.podsieAssignmentId
          : p.rampUpId === lesson.unitLessonId
      );
      const lessonStats = calculateSummaryStats(lessonProgressData);

      // Calculate today's lesson progress
      const lessonTodayProgress = calculateTodayProgress(
        lessonProgressData,
        (student) => student.questions,
        (student) => student.totalQuestions
      );

      // Calculate Zearn progress
      let zearnProgress = null;
      let zearnTodayProgress = 0;
      if (lesson.hasZearnActivity && lessonProgressData.length > 0) {
        const zearnCompleted = lessonProgressData.filter(p => p.zearnCompleted).length;
        zearnProgress = Math.round((zearnCompleted / lessonProgressData.length) * 100);
        zearnTodayProgress = calculateTodayCompletionRate(
          lessonProgressData,
          (student) => student.zearnCompleted ?? false,
          (student) => student.zearnCompletionDate
        );
      }

      // Get mastery check progress if exists
      let masteryCheckProgress = null;
      let masteryCheckTodayProgress = 0;
      if (masteryCheck) {
        const masteryProgressData = progressData.filter(
          p => p.podsieAssignmentId
            ? p.podsieAssignmentId === masteryCheck.podsieAssignmentId
            : p.rampUpId === masteryCheck.unitLessonId
        );
        const masteryStats = calculateSummaryStats(masteryProgressData);
        masteryCheckProgress = masteryStats.avgCompletion;
        masteryCheckTodayProgress = calculateTodayProgress(
          masteryProgressData,
          (student) => student.questions,
          (student) => student.totalQuestions
        );
      }

      return {
        lesson,
        lessonProgress: lessonStats.avgCompletion,
        lessonTodayProgress,
        zearnProgress,
        zearnTodayProgress,
        masteryCheck,
        masteryCheckProgress,
        masteryCheckTodayProgress,
      };
    });
  }, [assignments, progressData, calculateSummaryStats]);

  // Parse markdown-like content for display
  const parsedLearningContent = useMemo(() => {
    if (!learningContent.trim()) return [];
    return learningContent
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => line.replace(/^[-•]\s*/, "").trim());
  }, [learningContent]);

  // Calculate overall class goal percentage
  const overallPercentage = useMemo(() => {
    if (assignmentProgress.length === 0) return 0;

    const totalCompletion = assignmentProgress.reduce(
      (sum, item) => {
        const hasSidekickAndMasteryCheck = item.lesson.activityType === 'sidekick' && item.masteryCheck && item.masteryCheckProgress !== null;

        if (!showSidekick && hasSidekickAndMasteryCheck) {
          const zearn = item.zearnProgress ?? 0;
          const mastery = item.masteryCheckProgress ?? 0;
          return sum + (zearn * 0.35 + mastery * 0.65);
        }
        return sum + item.lessonProgress;
      },
      0
    );

    return Math.round(totalCompletion / assignmentProgress.length);
  }, [assignmentProgress, showSidekick]);

  // Calculate overall today's progress
  const overallTodayPercentage = useMemo(() => {
    if (assignmentProgress.length === 0) return 0;

    const totalTodayCompletion = assignmentProgress.reduce(
      (sum, item) => {
        const hasSidekickAndMasteryCheck = item.lesson.activityType === 'sidekick' && item.masteryCheck && item.masteryCheckProgress !== null;

        if (!showSidekick && hasSidekickAndMasteryCheck) {
          const zearnToday = item.zearnTodayProgress ?? 0;
          const masteryToday = item.masteryCheckTodayProgress ?? 0;
          return sum + (zearnToday * 0.35 + masteryToday * 0.65);
        }
        return sum + item.lessonTodayProgress;
      },
      0
    );

    return Math.round(totalTodayCompletion / assignmentProgress.length);
  }, [assignmentProgress, showSidekick]);

  // Format lesson section for display
  const formattedLessonSection = useMemo(() => {
    if (!selectedLessonSection) return '';
    if (selectedLessonSection.length === 1 && /^[A-Z]$/i.test(selectedLessonSection)) {
      return `Section ${selectedLessonSection}`;
    }
    return selectedLessonSection;
  }, [selectedLessonSection]);

  // Build progress bar segments for an assignment
  const buildSegments = (
    lesson: LessonConfig,
    lessonProgress: number,
    lessonTodayProgress: number,
    zearnProgress: number | null,
    zearnTodayProgress: number,
    masteryCheck: LessonConfig | null,
    masteryCheckProgress: number | null,
    masteryCheckTodayProgress: number
  ) => {
    const segments = [];
    const hasSidekickAndMasteryCheck = lesson.activityType === 'sidekick' && masteryCheck && masteryCheckProgress !== null;
    const shouldShowZearn = zearnProgress !== null && (!showSidekick || !hasSidekickAndMasteryCheck);
    const shouldShowSidekickBar = showSidekick || !hasSidekickAndMasteryCheck;

    if (shouldShowZearn) {
      segments.push({
        percentage: zearnProgress,
        todayPercentage: showDailyProgress ? zearnTodayProgress : undefined,
        color: 'purple' as const,
        widthPercent: 35
      });
    }

    if (masteryCheck && masteryCheckProgress !== null) {
      if (shouldShowSidekickBar) {
        const lessonWidth = shouldShowZearn ? 39 : 60;
        const masteryWidth = shouldShowZearn ? 26 : 40;
        segments.push({
          percentage: lessonProgress,
          todayPercentage: showDailyProgress ? lessonTodayProgress : undefined,
          color: 'blue' as const,
          widthPercent: lessonWidth
        });
        segments.push({
          percentage: masteryCheckProgress,
          todayPercentage: showDailyProgress ? masteryCheckTodayProgress : undefined,
          color: 'green' as const,
          widthPercent: masteryWidth
        });
      } else {
        const masteryWidth = shouldShowZearn ? 65 : 100;
        segments.push({
          percentage: masteryCheckProgress,
          todayPercentage: showDailyProgress ? masteryCheckTodayProgress : undefined,
          color: 'green' as const,
          widthPercent: masteryWidth
        });
      }
    } else {
      const barColor = lesson.activityType === 'mastery-check' ? 'green' : 'blue';
      const widthPercent = shouldShowZearn ? 65 : 100;
      segments.push({
        percentage: lessonProgress,
        todayPercentage: showDailyProgress ? lessonTodayProgress : undefined,
        color: barColor as 'blue' | 'green',
        widthPercent
      });
    }

    return segments;
  };

  // State for showing video player
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  const smartboardContent = (
    <>
      <SmartboardHeader
        selectedUnit={selectedUnit}
        formattedLessonSection={formattedLessonSection}
        formattedDueDate={formattedDueDate}
        dueDate={dueDate}
        onDueDateChange={setDueDate}
        assignmentCount={assignmentProgress.length}
        isEditMode={isEditMode}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        onSyncAll={onSyncAll}
        syncingAll={syncingAll}
        activeYoutubeUrl={activeYoutubeUrl}
        activeVideoTitle={activeVideoTitle}
        onPlayVideo={() => setShowVideoPlayer(true)}
      />

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
              <span className="text-indigo-300 text-sm">Complete Unit {selectedUnit}: {formattedLessonSection}</span>
            </div>
            <SmartboardProgressBar
              label=""
              percentage={overallPercentage}
              todayPercentage={showDailyProgress ? overallTodayPercentage : undefined}
              color="teal"
              showLabel={false}
            />
          </div>

          {/* Individual Assignment Progress */}
          <div className="space-y-3 pl-4 pr-32 border-l-2 border-indigo-600">
            {assignmentProgress.map(({ lesson, lessonProgress, lessonTodayProgress, zearnProgress, zearnTodayProgress, masteryCheck, masteryCheckProgress, masteryCheckTodayProgress }) => {
              const lessonNumber = lesson.unitLessonId.includes('.')
                ? lesson.unitLessonId.split('.')[1]
                : lesson.unitLessonId;

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

              const segments = buildSegments(
                lesson,
                lessonProgress,
                lessonTodayProgress,
                zearnProgress,
                zearnTodayProgress,
                masteryCheck,
                masteryCheckProgress,
                masteryCheckTodayProgress
              );

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
        <div className="flex flex-col gap-4">
          <LearningContentPanel
            isEditMode={isEditMode}
            learningContent={learningContent}
            onLearningContentChange={setLearningContent}
            parsedLearningContent={parsedLearningContent}
          />

          {/* YouTube Editor (Edit Mode Only) */}
          {isEditMode && (
            <div className="bg-indigo-900/50 rounded-xl p-4">
              <h3 className={`font-semibold text-white mb-3 ${isFullscreen ? "text-xl" : "text-base"}`}>
                Video
              </h3>
              <YoutubeEditor
                youtubeLinks={youtubeLinks}
                activeYoutubeUrl={activeYoutubeUrl}
                sections={availableSections}
                currentSection={selectedSection}
                onSelectVideo={handleSetActiveYoutubeUrl}
                onAddLink={handleAddYoutubeLink}
                onRemoveLink={handleRemoveYoutubeLink}
                onCopyFromSection={handleCopyYoutubeLinks}
                isFullscreen={isFullscreen}
              />
            </div>
          )}
        </div>
      </div>

      {/* YouTube Player - Bottom Right (triggered by header button) */}
      {showVideoPlayer && activeYoutubeUrl && (
        <div className={`absolute ${isFullscreen ? "bottom-8 right-8" : "bottom-4 right-4"}`}>
          <div
            className={`
              bg-black rounded shadow-2xl overflow-hidden
              ${isFullscreen ? "w-[280px] h-[175px]" : "w-[200px] h-[125px]"}
            `}
          >
            {/* Header with close button */}
            <div className="flex items-center justify-between bg-gray-900 px-2 py-1">
              <span className="text-white text-[10px] font-medium truncate flex-1 mr-2">
                {activeVideoTitle || "Video"}
              </span>
              <button
                onClick={() => setShowVideoPlayer(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                title="Close video"
              >
                <span className="text-xs">✕</span>
              </button>
            </div>
            {/* Embedded player */}
            <iframe
              src={`https://www.youtube.com/embed/${extractYoutubeVideoId(activeYoutubeUrl)}?autoplay=1`}
              title={activeVideoTitle || "YouTube video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-[calc(100%-24px)]"
            />
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="mt-8">
      {/* Controls */}
      {!isFullscreen && (
        <SmartboardControls
          showDailyProgress={showDailyProgress}
          onShowDailyProgressChange={setShowDailyProgress}
          showSidekick={showSidekick}
          onShowSidekickChange={setShowSidekick}
          isEditMode={isEditMode}
          hasUnsavedChanges={hasUnsavedChanges}
          isSaving={isSaving}
          onSave={handleSave}
          onToggleEditMode={handleToggleEditMode}
        />
      )}

      {/* Normal Display */}
      {!isFullscreen && (
        <div className="relative">
          {smartboardContent}
        </div>
      )}

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-6">
          <div className="w-full h-full max-w-[94vw] max-h-[94vh] flex flex-col relative">
            {smartboardContent}
          </div>
        </div>
      )}
    </div>
  );
}
