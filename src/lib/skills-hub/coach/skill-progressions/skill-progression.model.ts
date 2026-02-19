import mongoose from "mongoose";
import {
  standardSchemaOptions,
  standardDocumentFields,
} from "@mongoose-schema/shared-options";

const SkillProgressionSchema = new mongoose.Schema(
  {
    teacherStaffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NYCPSStaff",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NYCPSStaff",
      required: true,
    },
    title: { type: String, required: true },
    skillIds: [{ type: String }],
    why: { type: String },
    actionStep: { type: String },
    status: {
      type: String,
      enum: ["open", "closed", "archived"],
      default: "open",
    },
    closedAt: { type: Date, default: null },
    ...standardDocumentFields,
  },
  {
    ...standardSchemaOptions,
    collection: "skillshub_action_plans",
  },
);

SkillProgressionSchema.index({ teacherStaffId: 1, status: 1 });
SkillProgressionSchema.index({ createdBy: 1 });

export const SkillsHubActionPlan =
  mongoose.models.SkillsHubActionPlan ||
  mongoose.model("SkillsHubActionPlan", SkillProgressionSchema);
