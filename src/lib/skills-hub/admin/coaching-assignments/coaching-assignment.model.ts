import mongoose from "mongoose";
import {
  standardSchemaOptions,
  standardDocumentFields,
} from "@mongoose-schema/shared-options";

const CoachTeacherAssignmentSchema = new mongoose.Schema(
  {
    coachStaffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NYCPSStaff",
      required: true,
    },
    teacherStaffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NYCPSStaff",
      required: true,
    },
    schoolId: {
      type: String,
      default: null,
    },
    assignedAt: { type: Date, default: Date.now },
    removedAt: { type: Date, default: null },
    ...standardDocumentFields,
  },
  {
    ...standardSchemaOptions,
    collection: "skillshub_coach_teacher_assignments",
  },
);

CoachTeacherAssignmentSchema.index(
  { coachStaffId: 1, teacherStaffId: 1 },
  { unique: true },
);
CoachTeacherAssignmentSchema.index({ coachStaffId: 1 });
CoachTeacherAssignmentSchema.index({ teacherStaffId: 1 });

export const SkillsHubCoachTeacherAssignment =
  mongoose.models.SkillsHubCoachTeacherAssignment ||
  mongoose.model(
    "SkillsHubCoachTeacherAssignment",
    CoachTeacherAssignmentSchema,
  );
