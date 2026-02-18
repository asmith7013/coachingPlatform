import mongoose from "mongoose";
import {
  standardSchemaOptions,
  standardDocumentFields,
} from "@mongoose-schema/shared-options";

const TeacherSkillStatusSchema = new mongoose.Schema(
  {
    teacherStaffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NYCPSStaff",
      required: true,
    },
    skillId: { type: String, required: true },
    status: {
      type: String,
      enum: ["not_started", "active", "developing", "proficient"],
      default: "not_started",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NYCPSStaff",
      default: null,
    },
    ...standardDocumentFields,
  },
  {
    ...standardSchemaOptions,
    collection: "skillshub_teacher_skill_statuses",
  },
);

TeacherSkillStatusSchema.index(
  { teacherStaffId: 1, skillId: 1 },
  { unique: true },
);
TeacherSkillStatusSchema.index({ teacherStaffId: 1, status: 1 });

export const SkillsHubTeacherSkillStatus =
  mongoose.models.SkillsHubTeacherSkillStatus ||
  mongoose.model("SkillsHubTeacherSkillStatus", TeacherSkillStatusSchema);
