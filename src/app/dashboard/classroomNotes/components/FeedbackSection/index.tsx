import React from "react";
import { tv } from "tailwind-variants";
import { Textarea } from "@/components/core/fields/Textarea";

interface FeedbackSectionProps {
  formData: {
    glow: string;
    wonder: string;
    grow: string;
    nextSteps: string;
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

const FeedbackSection: React.FC<FeedbackSectionProps> = ({
  formData,
  handleInputChange,
}) => {
  return (
    <div>
      <h3 className={sectionTitle()}>Feedback</h3>
      <div className="space-y-4">
        <div>
          <label className={fieldLabel()}>Glow</label>
          <Textarea
            name="glow"
            value={formData.glow}
            onChange={handleInputChange}
            placeholder="What went well?"
            rows={3}
          />
        </div>
        <div>
          <label className={fieldLabel()}>Wonder</label>
          <Textarea
            name="wonder"
            value={formData.wonder}
            onChange={handleInputChange}
            placeholder="What questions do you have?"
            rows={3}
          />
        </div>
        <div>
          <label className={fieldLabel()}>Grow</label>
          <Textarea
            name="grow"
            value={formData.grow}
            onChange={handleInputChange}
            placeholder="Areas for improvement"
            rows={3}
          />
        </div>
        <div>
          <label className={fieldLabel()}>Next Steps</label>
          <Textarea
            name="nextSteps"
            value={formData.nextSteps}
            onChange={handleInputChange}
            placeholder="Recommended next actions"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};

export default FeedbackSection;
