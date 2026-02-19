import mongoose from "mongoose";
import {
  standardSchemaOptions,
  standardDocumentFields,
} from "@mongoose-schema/shared-options";

const NoteTagsSchema = new mongoose.Schema(
  {
    skillIds: [{ type: String }],
    actionPlanIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "SkillsHubActionPlan" },
    ],
    actionStepIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "SkillsHubActionStep" },
    ],
  },
  { _id: false },
);

const SkillNoteSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    teacherStaffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    content: { type: String, required: true },
    imageUrls: [{ type: String }],
    tags: { type: NoteTagsSchema, default: {} },
    ...standardDocumentFields,
  },
  {
    ...standardSchemaOptions,
    collection: "skillshub_skill_notes",
  },
);

SkillNoteSchema.index({ teacherStaffId: 1, createdAt: -1 });
SkillNoteSchema.index({ "tags.skillIds": 1 });

export const SkillsHubSkillNote =
  mongoose.models.SkillsHubSkillNote ||
  mongoose.model("SkillsHubSkillNote", SkillNoteSchema);
