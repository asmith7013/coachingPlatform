"use client";

import { useState } from "react";
import type { WizardStateHook } from "../../hooks/useWizardState";
import { WizardEditFooter } from "../shared/WizardEditFooter";
import { useSlideGeneration } from "./hooks/useSlideGeneration";
import { useAiEdit } from "./hooks/useAiEdit";
import { AnalysisSidebar } from "./sections/AnalysisSidebar";
import { ExitTicketSection } from "./sections/ExitTicketSection";
import { BigIdeaSection } from "./sections/BigIdeaSection";
import { MisconceptionsSection } from "./sections/MisconceptionsSection";
import { InstructionalDesignSection } from "./sections/InstructionalDesignSection";
import { WorkedExampleSection } from "./sections/WorkedExampleSection";
import { PracticeProblemsSection } from "./sections/PracticeProblemsSection";
import { SlideActionButtons } from "./SlideActionButtons";

interface Step2AnalysisProps {
  wizard: WizardStateHook;
}

export function Step2Analysis({ wizard }: Step2AnalysisProps) {
  const {
    state,
    updateBigIdea,
    updateStrategyMoves,
    updateScenario,
    setSlides,
    setLoadingProgress,
    setError,
    nextStep,
    prevStep,
  } = wizard;

  const [editingScenario, setEditingScenario] = useState<number | null>(null);
  const [editingBigIdea, setEditingBigIdea] = useState(false);
  const [editingStrategySteps, setEditingStrategySteps] = useState(false);

  const { problemAnalysis, strategyDefinition, scenarios } = state;

  // Slide generation hook - SSE streaming logic
  const { handleGenerateSlides } = useSlideGeneration({
    state,
    problemAnalysis,
    strategyDefinition,
    scenarios,
    setSlides,
    setLoadingProgress,
    setError,
    nextStep,
  });

  // AI edit hook - editing analysis with AI
  const {
    aiEditPrompt,
    setAiEditPrompt,
    aiEditImages,
    setAiEditImages,
    aiEditError,
    aiEditElapsed,
    isAiEditing,
    handleAiEdit,
  } = useAiEdit({
    problemAnalysis,
    strategyDefinition,
    scenarios,
    setAnalysis: wizard.setAnalysis,
  });

  if (!problemAnalysis || !strategyDefinition || !scenarios) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center py-12">
        <p className="text-gray-600">
          No analysis data available. Please go back and analyze a problem.
        </p>
        <button
          onClick={prevStep}
          className="mt-4 text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Error Message */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {state.error}
        </div>
      )}

      {/* Two Column Layout */}
      <div className="flex gap-6">
        {/* Left Column - Task Image and Learning Targets (30%) */}
        <AnalysisSidebar
          gradeLevel={state.gradeLevel || ""}
          unitNumber={state.unitNumber}
          lessonNumber={state.lessonNumber}
          masteryCheckImage={state.masteryCheckImage}
          learningGoals={state.learningGoals}
        />

        {/* Right Column - Backward Planning Sections (70%) */}
        <div className="w-[70%] space-y-4">
          {/* ① EXIT TICKET ANALYSIS - Source of truth */}
          <ExitTicketSection problemAnalysis={problemAnalysis} />

          {/* ② BIG IDEA - Core mathematical principle */}
          <BigIdeaSection
            strategyDefinition={strategyDefinition}
            editingBigIdea={editingBigIdea}
            setEditingBigIdea={setEditingBigIdea}
            updateBigIdea={updateBigIdea}
          />

          {/* ③ ANTICIPATED MISCONCEPTIONS */}
          <MisconceptionsSection
            problemAnalysis={problemAnalysis}
            numMoves={strategyDefinition.moves.length}
          />

          {/* ④ INSTRUCTIONAL DESIGN - Design Rationale + Strategy Steps */}
          <InstructionalDesignSection
            strategyDefinition={strategyDefinition}
            editingStrategySteps={editingStrategySteps}
            setEditingStrategySteps={setEditingStrategySteps}
            updateStrategyMoves={updateStrategyMoves}
          />

          {/* ⑤ WORKED EXAMPLE - Scenario 1 */}
          {scenarios[0] && (
            <WorkedExampleSection
              scenario={scenarios[0]}
              problemAnalysis={problemAnalysis}
              strategyDefinition={strategyDefinition}
              editingScenario={editingScenario === 0}
              setEditingScenario={(editing) =>
                setEditingScenario(editing ? 0 : null)
              }
              updateScenario={(updated) => updateScenario(0, updated)}
            />
          )}

          {/* ⑥ PRACTICE PROBLEMS - Scenarios 2-3 */}
          <PracticeProblemsSection
            scenarios={scenarios}
            editingScenario={editingScenario}
            setEditingScenario={setEditingScenario}
            updateScenario={updateScenario}
          />
        </div>
      </div>

      {/* Sticky Footer - AI Edit */}
      {!state.isLoading && (
        <WizardEditFooter
          onBack={prevStep}
          aiEdit={{
            prompt: aiEditPrompt,
            setPrompt: setAiEditPrompt,
            images: aiEditImages,
            setImages: setAiEditImages,
            onSubmit: handleAiEdit,
            placeholder:
              "AI Edit: describe corrections or paste an image (e.g., 'The answer should be 42')",
            submitLabel: "Apply",
          }}
          error={aiEditError}
          loading={
            isAiEditing
              ? {
                  theme: "purple",
                  message: `Editing: ${aiEditPrompt}`,
                  elapsed: aiEditElapsed,
                }
              : null
          }
          rightActions={
            <SlideActionButtons
              slideCount={state.slides.length}
              numMoves={strategyDefinition?.moves?.length ?? 3}
              isLoading={state.isLoading}
              nextStep={nextStep}
              handleGenerateSlides={handleGenerateSlides}
            />
          }
        />
      )}
    </div>
  );
}
