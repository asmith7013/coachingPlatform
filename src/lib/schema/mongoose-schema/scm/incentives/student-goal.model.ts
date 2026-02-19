import mongoose from "mongoose";
import {
  standardSchemaOptions,
  standardDocumentFields,
} from "@mongoose-schema/shared-options";

// =====================================
// STUDENT GOAL MODEL
// =====================================

const unitMultiplierEntrySchema = new mongoose.Schema(
  {
    podsieModuleId: { type: Number, required: true },
    multiplierPercent: { type: Number, required: true, min: 0, max: 200 },
  },
  { _id: false },
);

const studentGoalSchemaFields = {
  podsieGroupId: {
    type: Number,
    required: true,
    index: true,
  },
  podsieStudentProfileId: {
    type: String,
    required: true,
    index: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  studentEmail: {
    type: String,
    required: true,
  },
  goalName: {
    type: String,
    required: true,
    maxlength: 200,
  },
  goalCost: {
    type: Number,
    required: true,
    min: 0,
  },
  goalImageUrl: {
    type: String,
    required: false,
  },
  unitMultipliers: {
    type: [unitMultiplierEntrySchema],
    default: [],
  },
  ...standardDocumentFields,
};

const StudentGoalSchema = new mongoose.Schema(studentGoalSchemaFields, {
  ...standardSchemaOptions,
  collection: "student-goals",
  autoIndex: false,
  id: false,
  _id: true,
});

// One goal per student per group
StudentGoalSchema.index(
  { podsieGroupId: 1, podsieStudentProfileId: 1 },
  { unique: true },
);

// Query all goals for a group
StudentGoalSchema.index({ podsieGroupId: 1 });

// Force delete cached model to ensure schema changes are applied
if (mongoose.models.StudentGoal) {
  delete mongoose.models.StudentGoal;
}

export const StudentGoalModel = mongoose.model(
  "StudentGoal",
  StudentGoalSchema,
);
