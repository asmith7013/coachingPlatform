import React from "react";
import { tv } from "tailwind-variants";
import ActivitySection from "./ActivitySection";

interface LessonFlowProps {
  formData: {
    warmUp: {
      launch: string;
      workTime: string;
      synthesis: string;
    };
    activity1: {
      launch: string;
      workTime: string;
      synthesis: string;
    };
    activity2: {
      launch: string;
      workTime: string;
      synthesis: string;
    };
    lessonSynthesis: {
      launch: string;
      workTime: string;
      synthesis: string;
    };
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

const LessonFlow: React.FC<LessonFlowProps> = ({
  formData,
  handleInputChange,
}) => {
  return (
    <div>
      <h3 className={sectionTitle()}>Lesson Flow</h3>

      <ActivitySection
        title="Warm Up"
        section="warmUp"
        data={formData.warmUp}
        handleInputChange={handleInputChange}
      />

      <ActivitySection
        title="Activity 1"
        section="activity1"
        data={formData.activity1}
        handleInputChange={handleInputChange}
      />

      <ActivitySection
        title="Activity 2"
        section="activity2"
        data={formData.activity2}
        handleInputChange={handleInputChange}
      />

      <ActivitySection
        title="Lesson Synthesis"
        section="lessonSynthesis"
        data={formData.lessonSynthesis}
        handleInputChange={handleInputChange}
      />
    </div>
  );
};

export default LessonFlow;
