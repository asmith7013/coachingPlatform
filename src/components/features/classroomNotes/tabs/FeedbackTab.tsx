"use client";

import React from "react";
import { tv } from "tailwind-variants";
import { Textarea } from "@components/core/fields/Textarea";
import { ClassroomObservationInput } from "@/lib/schema/zod-schema/visits/classroom-observation";

const sectionTitle = tv({
  base: "text-lg font-semibold border-b pb-2 mb-3",
});

const fieldLabel = tv({
  base: "text-sm font-medium text-gray-700 mb-1",
});

interface FeedbackTabProps {
  formData: ClassroomObservationInput;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  onArrayFieldChange: (fieldPath: string, value: string[]) => void;
}

export function FeedbackTab({
  formData,
  onInputChange,
  onArrayFieldChange,
}: FeedbackTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className={sectionTitle()}>Feedback</h3>
        <div className="space-y-4">
          <div>
            <label className={fieldLabel()}>Glow</label>
            <Textarea
              name="glow"
              value={
                (formData.feedback as { glow?: string[] })?.glow?.join("\n") ||
                ""
              }
              onChange={(e) => {
                const lines = e.target.value
                  .split("\n")
                  .filter((line) => line.trim());
                onArrayFieldChange("feedback.glow", lines);
              }}
              placeholder="What went well? (one item per line)"
              rows={3}
            />
          </div>
          <div>
            <label className={fieldLabel()}>Wonder</label>
            <Textarea
              name="wonder"
              value={
                (formData.feedback as { wonder?: string[] })?.wonder?.join(
                  "\n",
                ) || ""
              }
              onChange={(e) => {
                const lines = e.target.value
                  .split("\n")
                  .filter((line) => line.trim());
                onArrayFieldChange("feedback.wonder", lines);
              }}
              placeholder="What questions do you have? (one item per line)"
              rows={3}
            />
          </div>
          <div>
            <label className={fieldLabel()}>Grow</label>
            <Textarea
              name="grow"
              value={
                (formData.feedback as { grow?: string[] })?.grow?.join("\n") ||
                ""
              }
              onChange={(e) => {
                const lines = e.target.value
                  .split("\n")
                  .filter((line) => line.trim());
                onArrayFieldChange("feedback.grow", lines);
              }}
              placeholder="Areas for improvement (one item per line)"
              rows={3}
            />
          </div>
          <div>
            <label className={fieldLabel()}>Next Steps</label>
            <Textarea
              name="nextSteps"
              value={
                (
                  formData.feedback as { nextSteps?: string[] }
                )?.nextSteps?.join("\n") || ""
              }
              onChange={(e) => {
                const lines = e.target.value
                  .split("\n")
                  .filter((line) => line.trim());
                onArrayFieldChange("feedback.nextSteps", lines);
              }}
              placeholder="Recommended next actions (one item per line)"
              rows={3}
            />
          </div>
        </div>
      </div>
      <div>
        <h3 className={sectionTitle()}>Learning Targets & Cool Down</h3>
        <div className="space-y-4">
          <div>
            <label className={fieldLabel()}>
              Learning Goals (Teacher-Facing)
            </label>
            <Textarea
              name="learningTargets"
              value={(formData.learningTargets as string[])?.join("\n") || ""}
              onChange={(e) => {
                const lines = e.target.value
                  .split("\n")
                  .filter((line) => line.trim());
                onArrayFieldChange("learningTargets", lines);
              }}
              placeholder="Learning targets or goals for the lesson (one per line)"
              rows={4}
            />
          </div>
          <div>
            <label className={fieldLabel()}>Cool Down</label>
            <Textarea
              name="coolDown"
              value={formData.coolDown as string}
              onChange={onInputChange}
              placeholder="Cool down activity notes"
              rows={4}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
