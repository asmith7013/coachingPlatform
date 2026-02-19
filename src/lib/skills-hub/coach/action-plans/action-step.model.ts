import mongoose from "mongoose";
import {
  standardSchemaOptions,
  standardDocumentFields,
} from "@mongoose-schema/shared-options";

const ActionStepSchema = new mongoose.Schema(
  {
    actionPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SkillsHubActionPlan",
      required: true,
    },
    description: { type: String, required: true },
    dueDate: { type: Date, default: null },
    evidenceOfCompletion: { type: String, default: null },
    skillIds: [{ type: String }],
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      default: null,
    },
    ...standardDocumentFields,
  },
  {
    ...standardSchemaOptions,
    collection: "skillshub_action_steps",
  },
);

ActionStepSchema.index({ actionPlanId: 1 });

export const SkillsHubActionStep =
  mongoose.models.SkillsHubActionStep ||
  mongoose.model("SkillsHubActionStep", ActionStepSchema);
