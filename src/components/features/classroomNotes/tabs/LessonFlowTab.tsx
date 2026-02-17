"use client";

import React from "react";
import { tv } from "tailwind-variants";
import { Textarea } from "@components/core/fields/Textarea";
import { ClassroomObservationInput } from "@/lib/schema/zod-schema/visits/classroom-observation";

const sectionTitle = tv({
  base: "text-lg font-semibold border-b pb-2 mb-3",
});

const subsectionTitle = tv({
  base: "text-base font-medium mt-4 mb-2",
});

const activitySection = tv({
  base: "border rounded-md p-3 mt-3 bg-gray-50",
});

const fieldLabel = tv({
  base: "text-sm font-medium text-gray-700 mb-1",
});

interface LessonFlowTabProps {
  formData: ClassroomObservationInput;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
}

export function LessonFlowTab({ formData, onInputChange }: LessonFlowTabProps) {
  // Type assertion to ensure lessonFlow is properly typed
  const lessonFlow = formData.lessonFlow as {
    warmUp: { launch: string; workTime: string; synthesis: string };
    activity1: { launch: string; workTime: string; synthesis: string };
    activity2?: { launch: string; workTime: string; synthesis: string };
    lessonSynthesis: { launch: string; workTime: string; synthesis: string };
  };

  return (
    <div>
      <h3 className={sectionTitle()}>Lesson Flow</h3>
      <div className={activitySection()}>
        <h4 className={subsectionTitle()}>Warm Up</h4>
        <div className="space-y-3">
          <div>
            <label className={fieldLabel()}>Launch</label>
            <Textarea
              name="lessonFlow.warmUp.launch"
              value={lessonFlow.warmUp.launch}
              onChange={onInputChange}
              placeholder="Warm up launch notes"
              rows={2}
            />
          </div>
          <div>
            <label className={fieldLabel()}>Work Time</label>
            <Textarea
              name="lessonFlow.warmUp.workTime"
              value={lessonFlow.warmUp.workTime}
              onChange={onInputChange}
              placeholder="Warm up work time notes"
              rows={2}
            />
          </div>
          <div>
            <label className={fieldLabel()}>Synthesis</label>
            <Textarea
              name="lessonFlow.warmUp.synthesis"
              value={lessonFlow.warmUp.synthesis}
              onChange={onInputChange}
              placeholder="Warm up synthesis notes"
              rows={2}
            />
          </div>
        </div>
      </div>
      <div className={activitySection()}>
        <h4 className={subsectionTitle()}>Activity 1</h4>
        <div className="space-y-3">
          <div>
            <label className={fieldLabel()}>Launch</label>
            <Textarea
              name="lessonFlow.activity1.launch"
              value={lessonFlow.activity1.launch}
              onChange={onInputChange}
              placeholder="Activity 1 launch notes"
              rows={2}
            />
          </div>
          <div>
            <label className={fieldLabel()}>Work Time</label>
            <Textarea
              name="lessonFlow.activity1.workTime"
              value={lessonFlow.activity1.workTime}
              onChange={onInputChange}
              placeholder="Activity 1 work time notes"
              rows={2}
            />
          </div>
          <div>
            <label className={fieldLabel()}>Synthesis</label>
            <Textarea
              name="lessonFlow.activity1.synthesis"
              value={lessonFlow.activity1.synthesis}
              onChange={onInputChange}
              placeholder="Activity 1 synthesis notes"
              rows={2}
            />
          </div>
        </div>
      </div>
      <div className={activitySection()}>
        <h4 className={subsectionTitle()}>Activity 2</h4>
        <div className="space-y-3">
          <div>
            <label className={fieldLabel()}>Launch</label>
            <Textarea
              name="lessonFlow.activity2.launch"
              value={lessonFlow.activity2?.launch || ""}
              onChange={onInputChange}
              placeholder="Activity 2 launch notes"
              rows={2}
            />
          </div>
          <div>
            <label className={fieldLabel()}>Work Time</label>
            <Textarea
              name="lessonFlow.activity2.workTime"
              value={lessonFlow.activity2?.workTime || ""}
              onChange={onInputChange}
              placeholder="Activity 2 work time notes"
              rows={2}
            />
          </div>
          <div>
            <label className={fieldLabel()}>Synthesis</label>
            <Textarea
              name="lessonFlow.activity2.synthesis"
              value={lessonFlow.activity2?.synthesis || ""}
              onChange={onInputChange}
              placeholder="Activity 2 synthesis notes"
              rows={2}
            />
          </div>
        </div>
      </div>
      <div className={activitySection()}>
        <h4 className={subsectionTitle()}>Lesson Synthesis</h4>
        <div className="space-y-3">
          <div>
            <label className={fieldLabel()}>Launch</label>
            <Textarea
              name="lessonFlow.lessonSynthesis.launch"
              value={lessonFlow.lessonSynthesis.launch}
              onChange={onInputChange}
              placeholder="Lesson synthesis launch notes"
              rows={2}
            />
          </div>
          <div>
            <label className={fieldLabel()}>Work Time</label>
            <Textarea
              name="lessonFlow.lessonSynthesis.workTime"
              value={lessonFlow.lessonSynthesis.workTime}
              onChange={onInputChange}
              placeholder="Lesson synthesis work time notes"
              rows={2}
            />
          </div>
          <div>
            <label className={fieldLabel()}>Synthesis</label>
            <Textarea
              name="lessonFlow.lessonSynthesis.synthesis"
              value={lessonFlow.lessonSynthesis.synthesis}
              onChange={onInputChange}
              placeholder="Lesson synthesis notes"
              rows={2}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
