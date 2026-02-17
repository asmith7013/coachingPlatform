import React from "react";
import { tv } from "tailwind-variants";
import { Textarea } from "@/components/core/fields/Textarea";

interface LearningSectionProps {
  formData: {
    learningTargets: string;
    coolDown: string;
  };
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
}

const sectionTitle = tv({
  base: "text-lg font-semibold border-b pb-2 mb-3",
});

const fieldLabel = tv({
  base: "text-sm font-medium text-gray-700 mb-1",
});

const LearningSection: React.FC<LearningSectionProps> = ({
  formData,
  handleInputChange,
}) => {
  return (
    <div>
      <h3 className={sectionTitle()}>Learning Targets & Cool Down</h3>
      <div className="space-y-4">
        <div>
          <label className={fieldLabel()}>
            Learning Goals (Teacher-Facing)
          </label>
          <Textarea
            name="learningTargets"
            value={formData.learningTargets}
            onChange={handleInputChange}
            placeholder="Learning targets or goals for the lesson"
            rows={4}
          />
        </div>
        <div>
          <label className={fieldLabel()}>Cool Down</label>
          <Textarea
            name="coolDown"
            value={formData.coolDown}
            onChange={handleInputChange}
            placeholder="Cool down activity notes"
            rows={4}
          />
        </div>
      </div>
    </div>
  );
};

export default LearningSection;
