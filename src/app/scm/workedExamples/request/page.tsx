"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchRoadmapsSkills, fetchRoadmapsSkillsByNumbers } from "@actions/313/roadmaps-skills";
import { fetchLessonsListByScopeTag, fetchScopeAndSequenceById } from "@actions/313/scope-and-sequence";
import { createWorkedExampleRequest, uploadWorkedExampleImage } from "@actions/313/worked-example-requests";
import { RoadmapsSkill, PracticeProblem } from "@zod-schema/313/curriculum/roadmap-skill";
import { ScopeAndSequence } from "@zod-schema/313/curriculum/scope-and-sequence";
import { Student } from "@zod-schema/313/student/student";
import { SkillDetailWrapper } from "../../roadmaps/components/SkillDetailWrapper";
import { SkillListWithProgress } from "../../roadmaps/components/SkillListWithProgress";
import { StudentFilter } from "../../roadmaps/scope-and-sequence/components/StudentFilter";
import { Alert } from "@/components/core/feedback/Alert";
import { Spinner } from "@/components/core/feedback/Spinner";
import { ToggleSwitch } from "@/components/core/fields/ToggleSwitch";
import { BookOpenIcon, CursorArrowRaysIcon } from "@heroicons/react/24/outline";
import {
  RequestHeader,
  WorkedExampleForm,
  LessonContextCard,
  RequestTypeSelector,
  PracticeProblemQueue,
} from "./components";
import type { RequestType, QueuedPracticeProblem, SkillType } from "./components";

// Lightweight lesson data for list display
interface LessonListItem {
  _id: string;
  unitNumber: number;
  lessonNumber: number;
  unitLessonId: string;
  lessonName: string;
  lessonTitle?: string;
  lessonType?: string;
  unit: string;
  grade: string;
  section?: string;
  scopeSequenceTag: string;
}

// Full lesson data (loaded on demand)
type FullLessonData = ScopeAndSequence;

interface UnitInfo {
  unitNumber: number;
  unitName: string;
}

export default function WorkedExampleRequestPage() {
  // Lightweight lesson list for dropdowns (loaded once per grade)
  const [lessonsList, setLessonsList] = useState<LessonListItem[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  // Full lesson data (loaded when selected)
  const [selectedLessonFull, setSelectedLessonFull] = useState<FullLessonData | null>(null);
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);

  // Skills data
  const [allSkills, setAllSkills] = useState<RoadmapsSkill[]>([]);
  const [lessonSkills, setLessonSkills] = useState<RoadmapsSkill[]>([]);

  // Filter state
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedUnitNumber, setSelectedUnitNumber] = useState<number | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [selectedSkillColor, setSelectedSkillColor] = useState<'blue' | 'green' | 'orange' | 'purple'>('green');
  const [selectedSkillType, setSelectedSkillType] = useState<SkillType>('target');
  const [contextSkillId, setContextSkillId] = useState<string | null>(null);
  const [contextSkillColor, setContextSkillColor] = useState<'blue' | 'green' | 'orange' | 'purple'>('orange');
  const [contextSkillType, setContextSkillType] = useState<SkillType>('target');
  const [showDescriptions, setShowDescriptions] = useState(true);

  // Request type state
  const [requestType, setRequestType] = useState<RequestType | null>(null);

  // Practice problem queue state (for prerequisite-skill flow)
  const [practiceProblemQueue, setPracticeProblemQueue] = useState<QueuedPracticeProblem[]>([]);
  const [selectedPracticeProblem, setSelectedPracticeProblem] = useState<QueuedPracticeProblem | null>(null);

  // Student filter state
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>("");

  // Form state
  const [selectedStrugglingSkills, setSelectedStrugglingSkills] = useState<Set<string>>(new Set());
  const [strugglingDescription, setStrugglingDescription] = useState("");
  const [mathConcept, setMathConcept] = useState("");
  const [mathStandard, setMathStandard] = useState("");
  const [learningGoals, setLearningGoals] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [uploadedImage, setUploadedImage] = useState<{ file: File; preview: string } | null>(null);
  const [preloadedImageUrl, setPreloadedImageUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Load all skills once on mount (needed for context panel)
  useEffect(() => {
    const loadAllSkills = async () => {
      try {
        const result = await fetchRoadmapsSkills({
          page: 1,
          limit: 10000,
          sortBy: "skillNumber",
          sortOrder: "asc",
          filters: {}
        });

        if (result.success && result.items) {
          setAllSkills(result.items as RoadmapsSkill[]);
        }
      } catch (err) {
        console.error("Error loading skills:", err);
      }
    };

    loadAllSkills();
  }, []);

  // Load lightweight lesson list when grade changes
  useEffect(() => {
    if (!selectedGrade) {
      setLessonsList([]);
      return;
    }

    const loadLessonsList = async () => {
      setIsLoadingList(true);
      try {
        const result = await fetchLessonsListByScopeTag(selectedGrade);
        if (result.success && result.data) {
          setLessonsList(result.data);
        } else {
          setError(result.error || "Failed to load lessons");
        }
      } catch (err) {
        console.error("Error loading lessons list:", err);
        setError("Failed to load lessons");
      } finally {
        setIsLoadingList(false);
      }
    };

    loadLessonsList();
  }, [selectedGrade]);

  // Load full lesson data when a lesson is selected
  useEffect(() => {
    if (!selectedLessonId) {
      setSelectedLessonFull(null);
      setLessonSkills([]);
      setSelectedSkillId(null);
      setContextSkillId(null);
      return;
    }

    const loadFullLesson = async () => {
      setIsLoadingLesson(true);
      try {
        const result = await fetchScopeAndSequenceById(selectedLessonId);
        if (result.success && result.data) {
          const fullLesson = result.data as FullLessonData;
          setSelectedLessonFull(fullLesson);

          // Load lesson skills
          const targetSkillNumbers = fullLesson.targetSkills || [];
          const roadmapSkillNumbers = fullLesson.roadmapSkills || [];
          const allSkillNumbers = [...new Set([...targetSkillNumbers, ...roadmapSkillNumbers])];

          if (allSkillNumbers.length > 0) {
            const skillsResult = await fetchRoadmapsSkillsByNumbers(allSkillNumbers);
            if (skillsResult.success && skillsResult.data) {
              setLessonSkills(skillsResult.data as RoadmapsSkill[]);
            }
          } else {
            setLessonSkills([]);
          }
        } else {
          setError(result.error || "Failed to load lesson details");
        }
      } catch (err) {
        console.error("Error loading lesson:", err);
        setError("Failed to load lesson details");
      } finally {
        setIsLoadingLesson(false);
      }
    };

    loadFullLesson();
  }, [selectedLessonId]);

  // Get unique units from lesson list
  const availableUnits: UnitInfo[] = selectedGrade
    ? Array.from(
        new Map(
          lessonsList.map(lesson => [lesson.unitNumber, { unitNumber: lesson.unitNumber, unitName: lesson.unit }])
        ).values()
      ).sort((a, b) => a.unitNumber - b.unitNumber)
    : [];

  // Get lessons for the selected unit
  const filteredLessons = selectedGrade && selectedUnitNumber !== null
    ? lessonsList.filter(lesson => lesson.unitNumber === selectedUnitNumber)
    : [];

  // Get selected skill and context skill objects
  const selectedSkill = selectedSkillId
    ? lessonSkills.find(s => s._id === selectedSkillId) || allSkills.find(s => s._id === selectedSkillId) || null
    : null;

  const contextSkill = contextSkillId
    ? allSkills.find(s => s._id === contextSkillId) || null
    : null;

  // Get all available skills (target + essential + helpful from selected skill)
  const getAvailableSkillsForSelection = useCallback(() => {
    const skills: Array<{ skill: RoadmapsSkill; type: "target" | "essential" | "helpful" }> = [];

    // Add target skills from lesson
    const targetSkillNumbers = selectedLessonFull?.targetSkills || [];
    targetSkillNumbers.forEach(num => {
      const skill = lessonSkills.find(s => s.skillNumber === num) || allSkills.find(s => s.skillNumber === num);
      if (skill) {
        skills.push({ skill, type: "target" });
      }
    });

    // Add essential and helpful from selected skill
    if (selectedSkill) {
      selectedSkill.essentialSkills?.forEach(es => {
        const skill = allSkills.find(s => s.skillNumber === es.skillNumber);
        if (skill && !skills.find(s => s.skill.skillNumber === skill.skillNumber)) {
          skills.push({ skill, type: "essential" });
        }
      });

      selectedSkill.helpfulSkills?.forEach(hs => {
        const skill = allSkills.find(s => s.skillNumber === hs.skillNumber);
        if (skill && !skills.find(s => s.skill.skillNumber === skill.skillNumber)) {
          skills.push({ skill, type: "helpful" });
        }
      });
    }

    return skills;
  }, [selectedLessonFull, selectedSkill, lessonSkills, allSkills]);

  const resetForm = () => {
    setStrugglingDescription("");
    setMathConcept("");
    setMathStandard("");
    setLearningGoals("");
    setAdditionalNotes("");
    setUploadedImage(null);
    setPreloadedImageUrl(null);
    setSelectedPracticeProblem(null);
    setSubmitSuccess(false);
  };

  const handleGradeChange = (value: string) => {
    setSelectedGrade(value);
    setSelectedUnitNumber(null);
    setSelectedLessonId(null);
    setSelectedLessonFull(null);
    setSelectedStrugglingSkills(new Set());
    resetForm();
  };

  const handleUnitChange = (value: number | null) => {
    setSelectedUnitNumber(value);
    setSelectedLessonId(null);
    setSelectedLessonFull(null);
    setSelectedStrugglingSkills(new Set());
    resetForm();
  };

  const handleLessonChange = (value: string | null) => {
    setSelectedLessonId(value);
    setSelectedStrugglingSkills(new Set());
    setSelectedSkillId(null);
    setContextSkillId(null);
  };

  const handleSkillToggle = (skillNumber: string) => {
    setSelectedStrugglingSkills(prev => {
      const newSet = new Set(prev);
      if (newSet.has(skillNumber)) {
        newSet.delete(skillNumber);
      } else {
        newSet.add(skillNumber);
      }
      return newSet;
    });
  };

  const handleImageUpload = (file: File) => {
    const preview = URL.createObjectURL(file);
    setUploadedImage({ file, preview });
  };

  const handleImageRemove = () => {
    setUploadedImage(null);
  };

  // Queue handlers for practice problem consideration queue
  const handleAddToQueue = useCallback((
    problem: PracticeProblem,
    skillNumber: string,
    skillTitle: string,
    skillType: SkillType
  ) => {
    setPracticeProblemQueue(prev => {
      // Check if already in queue
      const exists = prev.some(
        item => item.skillNumber === skillNumber && item.problemNumber === problem.problemNumber
      );
      if (exists) return prev;

      return [...prev, {
        skillNumber,
        skillTitle,
        problemNumber: problem.problemNumber,
        screenshotUrl: problem.screenshotUrl,
        skillType,
      }];
    });
  }, []);

  const handleRemoveFromQueue = useCallback((item: QueuedPracticeProblem) => {
    setPracticeProblemQueue(prev =>
      prev.filter(p => !(p.skillNumber === item.skillNumber && p.problemNumber === item.problemNumber))
    );
    // If we removed the selected item, deselect it
    if (selectedPracticeProblem?.skillNumber === item.skillNumber &&
        selectedPracticeProblem?.problemNumber === item.problemNumber) {
      setSelectedPracticeProblem(null);
    }
  }, [selectedPracticeProblem]);

  const handleSelectFromQueue = useCallback((item: QueuedPracticeProblem) => {
    setSelectedPracticeProblem(item);

    // Find the skill to auto-fill form fields
    const skill = lessonSkills.find(s => s.skillNumber === item.skillNumber) ||
                  allSkills.find(s => s.skillNumber === item.skillNumber);

    if (skill) {
      // Auto-select this skill as a struggling skill
      setSelectedStrugglingSkills(new Set([skill.skillNumber]));

      // Auto-fill math concept with skill title or description
      setMathConcept(skill.title || "");

      // Auto-fill math standard from skill's standards
      if (skill.standards && skill.standards.length > 0) {
        setMathStandard(skill.standards);
      }

      // Auto-fill learning goals with skill description
      setLearningGoals(skill.description || "");
    }

    // Set the preloaded image URL
    setPreloadedImageUrl(item.screenshotUrl);
    // Clear any manually uploaded image
    setUploadedImage(null);
  }, [lessonSkills, allSkills]);

  const isProblemInQueue = useCallback((skillNumber: string, problemNumber: number | string) => {
    return practiceProblemQueue.some(
      item => item.skillNumber === skillNumber && item.problemNumber === problemNumber
    );
  }, [practiceProblemQueue]);

  const handleSubmit = async () => {
    const hasImage = uploadedImage !== null || preloadedImageUrl !== null;
    if (!selectedLessonFull || !hasImage || selectedStrugglingSkills.size === 0) {
      setError("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let finalImageUrl: string;
      let finalImageFilename: string;

      if (uploadedImage) {
        // Upload the new image
        const imageBuffer = await uploadedImage.file.arrayBuffer();
        const imageResult = await uploadWorkedExampleImage(
          new Uint8Array(imageBuffer),
          uploadedImage.file.name,
          uploadedImage.file.type
        );

        if (!imageResult.success || !imageResult.url) {
          throw new Error(imageResult.error || "Failed to upload image");
        }
        finalImageUrl = imageResult.url;
        finalImageFilename = uploadedImage.file.name;
      } else if (preloadedImageUrl) {
        // Use the preloaded image URL directly
        finalImageUrl = preloadedImageUrl;
        finalImageFilename = `problem-${selectedPracticeProblem?.skillNumber}-${selectedPracticeProblem?.problemNumber}.png`;
      } else {
        throw new Error("No image provided");
      }

      // Create request
      const result = await createWorkedExampleRequest({
        scopeSequenceTag: selectedGrade as "Grade 6" | "Grade 7" | "Grade 8" | "Algebra 1",
        grade: selectedLessonFull.grade,
        unitNumber: selectedLessonFull.unitNumber,
        lessonNumber: selectedLessonFull.lessonNumber,
        lessonName: selectedLessonFull.lessonName,
        scopeAndSequenceId: selectedLessonFull._id,
        section: selectedLessonFull.section as "Ramp Ups" | "A" | "B" | "C" | "D" | "E" | "F" | "Unit Assessment" | undefined,
        roadmapSkills: selectedLessonFull.roadmapSkills || [],
        targetSkills: selectedLessonFull.targetSkills || [],
        strugglingSkillNumbers: Array.from(selectedStrugglingSkills),
        strugglingDescription,
        mathConcept,
        mathStandard,
        learningGoals: learningGoals.split("\n").filter(g => g.trim()),
        sourceImageUrl: finalImageUrl,
        sourceImageFilename: finalImageFilename,
        additionalNotes: additionalNotes || undefined,
        status: "pending",
        requestedBy: "", // Will be set by server action
      });

      if (result.success) {
        setSubmitSuccess(true);
        resetForm();
        setSelectedStrugglingSkills(new Set());
      } else {
        throw new Error(result.error || "Failed to submit request");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid =
    selectedStrugglingSkills.size > 0 &&
    strugglingDescription.length > 0 &&
    mathConcept.length > 0 &&
    mathStandard.length > 0 &&
    (uploadedImage !== null || preloadedImageUrl !== null);

  // Convert units to format expected by RequestHeader
  const unitsForHeader = availableUnits.map(u => ({
    unitNumber: u.unitNumber,
    unitName: u.unitName,
    grade: selectedGrade,
    lessonCount: lessonsList.filter(l => l.unitNumber === u.unitNumber).length
  }));

  // Convert lessons to format expected by RequestHeader (from lightweight list)
  const lessonsForHeader = filteredLessons.map(l => ({
    _id: l._id,
    unitNumber: l.unitNumber,
    lessonNumber: l.lessonNumber,
    unitLessonId: l.unitLessonId,
    lessonName: l.lessonName,
    lessonType: l.lessonType,
    lessonTitle: l.lessonTitle,
    unit: l.unit,
    grade: l.grade,
    section: l.section,
    scopeSequenceTag: l.scopeSequenceTag,
  }));

  const isLoading = isLoadingList || isLoadingLesson;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto p-6" style={{ maxWidth: "1600px" }}>
        {/* Header with Student Filter (only for prerequisite-skill type) */}
        <RequestHeader
          selectedGrade={selectedGrade}
          selectedUnitNumber={selectedUnitNumber}
          selectedLessonId={selectedLessonId}
          units={unitsForHeader}
          lessons={lessonsForHeader}
          onGradeChange={handleGradeChange}
          onUnitChange={handleUnitChange}
          onLessonChange={handleLessonChange}
          studentFilterSlot={requestType === 'prerequisite-skill' ? (
            <StudentFilter
              selectedStudent={selectedStudent}
              onStudentSelect={setSelectedStudent}
              onSectionSelect={setSelectedSection}
              multiSelect={true}
              onStudentsSelect={setSelectedStudents}
              selectedStudents={selectedStudents}
              maxStudents={5}
              scopeSequenceTag={selectedGrade}
            />
          ) : undefined}
        />

        {/* Lesson Context Card (includes Mastery Check Preview) */}
        {selectedLessonFull && !isLoading && (
          <div className="mb-6">
            <LessonContextCard
              lesson={selectedLessonFull}
              skillsSlot={
                selectedLessonFull.roadmapSkills && selectedLessonFull.roadmapSkills.length > 0 ? (
                  <div className="h-full flex flex-col">
                    <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-4 py-3 z-10 flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Roadmap Skills</h4>
                      <ToggleSwitch
                        checked={showDescriptions}
                        onChange={setShowDescriptions}
                        label="Descriptions"
                      />
                    </div>
                    <div className="overflow-y-auto max-h-[340px] p-4">
                      <SkillListWithProgress
                        skillNumbers={selectedLessonFull.roadmapSkills}
                        selectedSection={selectedSection}
                        onSkillClick={(skillNumber, color) => {
                          const skill = lessonSkills.find(s => s.skillNumber === skillNumber) ||
                                       allSkills.find(s => s.skillNumber === skillNumber);
                          if (skill) {
                            setSelectedSkillId(skill._id);
                            setSelectedSkillColor(color);
                            const isTarget = selectedLessonFull?.targetSkills?.includes(skillNumber) || false;
                            setSelectedSkillType(isTarget ? 'target' : 'helpful');
                          }
                        }}
                        skillType="target"
                        showPrerequisites={true}
                        masteredSkills={selectedStudent?.masteredSkills || []}
                        targetSkillNumbers={selectedLessonFull.targetSkills || []}
                        selectedStudents={selectedStudents}
                        showDescriptions={showDescriptions}
                        allSkills={allSkills}
                      />
                    </div>
                  </div>
                ) : undefined
              }
            />
          </div>
        )}

        {/* Request Type Selector - show after lesson is selected */}
        {selectedLessonFull && !isLoading && (
          <RequestTypeSelector
            selectedType={requestType}
            onTypeSelect={setRequestType}
          />
        )}

        {/* Error display */}
        {error && (
          <Alert intent="error" className="mb-6">
            <Alert.Title>Error</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert>
        )}

        {/* Success message */}
        {submitSuccess && (
          <Alert intent="success" className="mb-6">
            <Alert.Title>Request Submitted!</Alert.Title>
            <Alert.Description>
              Your worked example request has been submitted successfully. You will receive an email when it&apos;s ready.
            </Alert.Description>
          </Alert>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center min-h-[200px]">
            <Spinner size="lg" variant="primary" />
          </div>
        )}

        {/* Main content - only show when lesson is fully loaded and request type selected */}
        {selectedLessonId && selectedLessonFull && !isLoading && requestType === 'prerequisite-skill' && (
          <>
            {/* Two Column Layout - Skill Details panels */}
            <div className="flex gap-6 mb-6">
              {/* Left Column: Skill Details */}
              <div className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden transition-all ${
                contextSkillId ? "w-1/2" : "w-full"
              }`}>
                <SkillDetailWrapper
                  skill={selectedSkill}
                  color={selectedSkillColor}
                  skillType={selectedSkillType}
                  onSkillClick={(skillNumber, color) => {
                    const skill = allSkills.find(s => s.skillNumber === skillNumber);
                    if (skill) {
                      setContextSkillId(skill._id);
                      setContextSkillColor(color);
                      // Determine skill type based on color (essential=orange in the old system, helpful=blue)
                      const skillType: SkillType = color === 'orange' ? 'essential' : color === 'purple' ? 'target' : 'helpful';
                      setContextSkillType(skillType);
                    }
                  }}
                  sections={{
                    description: false,
                    standards: false,
                    appearsIn: false,
                    prerequisites: false,
                    video: false,
                    practiceProblems: true,
                    essentialQuestion: true,
                    commonMisconceptions: true,
                    vocabulary: false,
                    modelsAndManipulatives: false,
                  }}
                  onAddProblemToQueue={handleAddToQueue}
                  isProblemInQueue={isProblemInQueue}
                />
              </div>

              {/* Right Column: Context Skill (only when contextSkillId is set) */}
              {contextSkillId && (
                <div className="w-1/2 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden transition-all">
                  <SkillDetailWrapper
                    skill={contextSkill}
                    color={contextSkillColor}
                    skillType={contextSkillType}
                    onSkillClick={(skillNumber, color) => {
                      const skill = allSkills.find(s => s.skillNumber === skillNumber);
                      if (skill) {
                        setContextSkillId(skill._id);
                        setContextSkillColor(color);
                        const skillType: SkillType = color === 'orange' ? 'essential' : color === 'purple' ? 'target' : 'helpful';
                        setContextSkillType(skillType);
                      }
                    }}
                    sections={{
                      description: false,
                      standards: false,
                      appearsIn: false,
                      prerequisites: false,
                      video: false,
                      practiceProblems: true,
                      essentialQuestion: true,
                      commonMisconceptions: true,
                      vocabulary: false,
                      modelsAndManipulatives: false,
                    }}
                    showHeader={true}
                    onClose={() => setContextSkillId(null)}
                    onAddProblemToQueue={handleAddToQueue}
                    isProblemInQueue={isProblemInQueue}
                  />
                </div>
              )}
            </div>

            {/* Practice Problem Consideration Queue */}
            <div className="mb-6">
              <PracticeProblemQueue
                items={practiceProblemQueue}
                selectedItem={selectedPracticeProblem}
                onSelect={handleSelectFromQueue}
                onRemove={handleRemoveFromQueue}
              />
            </div>

            {/* Request Form */}
            <WorkedExampleForm
              availableSkills={getAvailableSkillsForSelection()}
              selectedStrugglingSkills={selectedStrugglingSkills}
              onSkillToggle={handleSkillToggle}
              strugglingDescription={strugglingDescription}
              onStrugglingDescriptionChange={setStrugglingDescription}
              mathConcept={mathConcept}
              onMathConceptChange={setMathConcept}
              mathStandard={mathStandard}
              onMathStandardChange={setMathStandard}
              learningGoals={learningGoals}
              onLearningGoalsChange={setLearningGoals}
              additionalNotes={additionalNotes}
              onAdditionalNotesChange={setAdditionalNotes}
              uploadedImage={uploadedImage}
              preloadedImageUrl={preloadedImageUrl}
              onImageUpload={handleImageUpload}
              onImageRemove={() => {
                handleImageRemove();
                setPreloadedImageUrl(null);
              }}
              onSubmit={handleSubmit}
              submitting={submitting}
              isValid={isFormValid}
            />
          </>
        )}

        {/* Mastery Check flow - simplified view */}
        {selectedLessonId && selectedLessonFull && !isLoading && requestType === 'mastery-check' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mastery Check Request</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Coming soon:</strong> This flow will automatically generate a worked example based on the lesson&apos;s target skills and mastery check content.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Target Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {(selectedLessonFull.targetSkills || []).map(skillNum => {
                    const skill = allSkills.find(s => s.skillNumber === skillNum);
                    return (
                      <span key={skillNum} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        <span className="w-5 h-5 bg-green-600 text-white rounded-full text-xs flex items-center justify-center">
                          {skillNum}
                        </span>
                        {skill?.title || 'Unknown Skill'}
                      </span>
                    );
                  })}
                </div>
              </div>
              {(selectedLessonFull as { masteryCheckPdf?: string }).masteryCheckPdf && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Mastery Check Preview</h4>
                  <a
                    href={(selectedLessonFull as { masteryCheckPdf?: string }).masteryCheckPdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-sm"
                  >
                    View Mastery Check PDF
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Custom flow - manual input */}
        {selectedLessonId && selectedLessonFull && !isLoading && requestType === 'custom' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Worked Example Request</h3>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-800">
                <strong>Coming soon:</strong> Upload your own content and describe what you need for a fully customized worked example.
              </p>
            </div>
            <WorkedExampleForm
              availableSkills={getAvailableSkillsForSelection()}
              selectedStrugglingSkills={selectedStrugglingSkills}
              onSkillToggle={handleSkillToggle}
              strugglingDescription={strugglingDescription}
              onStrugglingDescriptionChange={setStrugglingDescription}
              mathConcept={mathConcept}
              onMathConceptChange={setMathConcept}
              mathStandard={mathStandard}
              onMathStandardChange={setMathStandard}
              learningGoals={learningGoals}
              onLearningGoalsChange={setLearningGoals}
              additionalNotes={additionalNotes}
              onAdditionalNotesChange={setAdditionalNotes}
              uploadedImage={uploadedImage}
              preloadedImageUrl={preloadedImageUrl}
              onImageUpload={handleImageUpload}
              onImageRemove={() => {
                handleImageRemove();
                setPreloadedImageUrl(null);
              }}
              onSubmit={handleSubmit}
              submitting={submitting}
              isValid={isFormValid}
            />
          </div>
        )}

        {/* Prompt to select request type */}
        {selectedLessonId && selectedLessonFull && !isLoading && !requestType && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <CursorArrowRaysIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a Request Type</h3>
            <p className="text-gray-500">
              Choose one of the request types above to continue.
            </p>
          </div>
        )}

        {/* Empty state when no lesson selected */}
        {!selectedLessonId && !isLoading && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a Lesson</h3>
            <p className="text-gray-500">
              Choose a curriculum, unit, and lesson to start planning a worked example.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
