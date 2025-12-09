"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchRoadmapsSkills, fetchRoadmapsSkillsByNumbers } from "@actions/313/roadmaps-skills";
import { fetchLessonsListByScopeTag, fetchScopeAndSequenceById } from "@actions/313/scope-and-sequence";
import { createWorkedExampleRequest, uploadWorkedExampleImage } from "@actions/313/worked-example-requests";
import { RoadmapsSkill } from "@zod-schema/313/curriculum/roadmap-skill";
import { ScopeAndSequence } from "@zod-schema/313/curriculum/scope-and-sequence";
import { SkillDetailWrapper } from "../../roadmaps/components/SkillDetailWrapper";
import { Alert } from "@/components/core/feedback/Alert";
import { Spinner } from "@/components/core/feedback/Spinner";
import {
  RequestHeader,
  TargetSkillsList,
  WorkedExampleForm,
  LessonContextCard,
} from "./components";

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
  const [contextSkillId, setContextSkillId] = useState<string | null>(null);

  // Form state
  const [selectedStrugglingSkills, setSelectedStrugglingSkills] = useState<Set<string>>(new Set());
  const [strugglingDescription, setStrugglingDescription] = useState("");
  const [mathConcept, setMathConcept] = useState("");
  const [mathStandard, setMathStandard] = useState("");
  const [learningGoals, setLearningGoals] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [uploadedImage, setUploadedImage] = useState<{ file: File; preview: string } | null>(null);
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
              // Auto-select first target skill
              if (targetSkillNumbers.length > 0) {
                const firstTarget = skillsResult.data.find((s: RoadmapsSkill) =>
                  targetSkillNumbers.includes(s.skillNumber)
                );
                if (firstTarget) {
                  setSelectedSkillId((firstTarget as RoadmapsSkill)._id);
                }
              }
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

  const handleSkillClick = (skillId: string) => {
    setSelectedSkillId(skillId);
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

  const handleSubmit = async () => {
    if (!selectedLessonFull || !uploadedImage || selectedStrugglingSkills.size === 0) {
      setError("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Upload image first
      const imageBuffer = await uploadedImage.file.arrayBuffer();
      const imageResult = await uploadWorkedExampleImage(
        new Uint8Array(imageBuffer),
        uploadedImage.file.name,
        uploadedImage.file.type
      );

      if (!imageResult.success || !imageResult.url) {
        throw new Error(imageResult.error || "Failed to upload image");
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
        sourceImageUrl: imageResult.url,
        sourceImageFilename: uploadedImage.file.name,
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
    uploadedImage !== null;

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
        {/* Header */}
        <RequestHeader
          selectedGrade={selectedGrade}
          selectedUnitNumber={selectedUnitNumber}
          selectedLessonId={selectedLessonId}
          units={unitsForHeader}
          lessons={lessonsForHeader}
          onGradeChange={handleGradeChange}
          onUnitChange={handleUnitChange}
          onLessonChange={handleLessonChange}
        />

        {/* Lesson Context Card - shows context when lesson is selected */}
        {selectedLessonFull && !isLoading && (
          <div className="mb-6">
            <LessonContextCard lesson={selectedLessonFull} />
          </div>
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

        {/* Main content - only show when lesson is fully loaded */}
        {selectedLessonId && selectedLessonFull && !isLoading && (
          <>
            {/* Three Column Layout */}
            <div className="flex gap-6 mb-6">
              {/* Left Column: Target Skills */}
              <TargetSkillsList
                lessonSkills={lessonSkills}
                targetSkillNumbers={selectedLessonFull.targetSkills || []}
                selectedSkillId={selectedSkillId}
                contextSkillId={contextSkillId}
                onSkillClick={handleSkillClick}
              />

              {/* Middle Column: Skill Details */}
              <div className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden transition-all ${
                contextSkillId ? "w-[43.75%]" : "w-3/5"
              }`}>
                <SkillDetailWrapper
                  skill={selectedSkill}
                  color="green"
                  onSkillClick={(skillNumber) => {
                    const skill = allSkills.find(s => s.skillNumber === skillNumber);
                    if (skill) {
                      setContextSkillId(skill._id);
                    }
                  }}
                />
              </div>

              {/* Right Column: Context Skill (only when contextSkillId is set) */}
              {contextSkillId && (
                <div className="w-[43.75%] bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden transition-all">
                  <SkillDetailWrapper
                    skill={contextSkill}
                    color="orange"
                    onSkillClick={(skillNumber) => {
                      const skill = allSkills.find(s => s.skillNumber === skillNumber);
                      if (skill) {
                        setContextSkillId(skill._id);
                      }
                    }}
                    showHeader={true}
                    onClose={() => setContextSkillId(null)}
                  />
                </div>
              )}
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
              onImageUpload={handleImageUpload}
              onImageRemove={handleImageRemove}
              onSubmit={handleSubmit}
              submitting={submitting}
              isValid={isFormValid}
            />
          </>
        )}

        {/* Empty state when no lesson selected */}
        {!selectedLessonId && !isLoading && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 text-4xl mb-4">📚</div>
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
