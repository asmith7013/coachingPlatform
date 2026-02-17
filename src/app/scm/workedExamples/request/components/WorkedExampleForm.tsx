"use client";

import { RoadmapsSkill } from "@zod-schema/scm/roadmaps/roadmap-skill";
import { SkillSelectionForm } from "./SkillSelectionForm";
import { ImageUpload } from "./ImageUpload";
import { Spinner } from "@/components/core/feedback/Spinner";

interface SkillWithType {
  skill: RoadmapsSkill;
  type: "target" | "essential" | "helpful";
}

interface UploadedImage {
  file: File;
  preview: string;
}

interface WorkedExampleFormProps {
  // Skill selection
  availableSkills: SkillWithType[];
  selectedStrugglingSkills: Set<string>;
  onSkillToggle: (skillNumber: string) => void;

  // Form fields
  strugglingDescription: string;
  onStrugglingDescriptionChange: (value: string) => void;
  mathConcept: string;
  onMathConceptChange: (value: string) => void;
  mathStandard: string;
  onMathStandardChange: (value: string) => void;
  learningGoals: string;
  onLearningGoalsChange: (value: string) => void;
  additionalNotes: string;
  onAdditionalNotesChange: (value: string) => void;

  // Image upload
  uploadedImage: UploadedImage | null;
  preloadedImageUrl?: string | null;
  onImageUpload: (file: File) => void;
  onImageRemove: () => void;

  // Submit
  onSubmit: () => void;
  submitting: boolean;
  isValid: boolean;
}

export function WorkedExampleForm({
  availableSkills,
  selectedStrugglingSkills,
  onSkillToggle,
  strugglingDescription,
  onStrugglingDescriptionChange,
  mathConcept,
  onMathConceptChange,
  mathStandard,
  onMathStandardChange,
  learningGoals,
  onLearningGoalsChange,
  additionalNotes,
  onAdditionalNotesChange,
  uploadedImage,
  preloadedImageUrl,
  onImageUpload,
  onImageRemove,
  onSubmit,
  submitting,
  isValid,
}: WorkedExampleFormProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold mb-6">Submit Worked Example Request</h2>

      {/* Skill Selection */}
      <SkillSelectionForm
        availableSkills={availableSkills}
        selectedSkills={selectedStrugglingSkills}
        onSkillToggle={onSkillToggle}
      />

      {/* Misconception Description */}
      <div className="mb-6">
        <label
          htmlFor="misconception"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Describe the misconception or struggle *
        </label>
        <textarea
          id="misconception"
          value={strugglingDescription}
          onChange={(e) => onStrugglingDescriptionChange(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="What specifically is the student stuck on? Describe the misconception..."
        />
      </div>

      {/* Math Details Row */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label
            htmlFor="mathConcept"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Math Concept *
          </label>
          <input
            id="mathConcept"
            type="text"
            value={mathConcept}
            onChange={(e) => onMathConceptChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Slope & y-Intercept"
          />
        </div>
        <div>
          <label
            htmlFor="mathStandard"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Math Standard *
          </label>
          <input
            id="mathStandard"
            type="text"
            value={mathStandard}
            onChange={(e) => onMathStandardChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 8.EE.B.5"
          />
        </div>
      </div>

      {/* Learning Goals */}
      <div className="mb-6">
        <label
          htmlFor="learningGoals"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Learning Goals (one per line)
        </label>
        <textarea
          id="learningGoals"
          value={learningGoals}
          onChange={(e) => onLearningGoalsChange(e.target.value)}
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Students will be able to..."
        />
      </div>

      {/* Image Upload */}
      <ImageUpload
        uploadedImage={uploadedImage}
        preloadedImageUrl={preloadedImageUrl}
        onImageUpload={onImageUpload}
        onImageRemove={onImageRemove}
      />

      {/* Additional Notes */}
      <div className="mb-6">
        <label
          htmlFor="additionalNotes"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Additional Notes (optional)
        </label>
        <textarea
          id="additionalNotes"
          value={additionalNotes}
          onChange={(e) => onAdditionalNotesChange(e.target.value)}
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Any additional context or notes..."
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={onSubmit}
        disabled={submitting || !isValid}
        className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer transition-colors"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner size="sm" className="border-white/30 border-t-white" />
            Submitting...
          </span>
        ) : (
          "Submit Request"
        )}
      </button>
    </div>
  );
}
