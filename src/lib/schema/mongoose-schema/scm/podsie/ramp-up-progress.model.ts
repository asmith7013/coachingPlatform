import mongoose from "mongoose";
import {
  standardSchemaOptions,
  standardDocumentFields,
} from "@mongoose-schema/shared-options";

// =====================================
// RAMP-UP PROGRESS MODEL
// =====================================

/**
 * Individual question completion status
 */
const rampUpQuestionSchema = new mongoose.Schema(
  {
    questionNumber: { type: Number, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: String, required: false },
    score: { type: Number, required: false },
  },
  { _id: false },
);

/**
 * Ramp-up progress schema - tracks student progress on ramp-up assessments
 */
const rampUpProgressSchemaFields = {
  // Student reference
  studentId: {
    type: String,
    required: true,
    index: true,
  },
  studentName: {
    type: String,
    required: true,
  },

  // Ramp-up identification
  unitCode: {
    type: String,
    required: true,
    index: true,
  },
  rampUpName: {
    type: String,
    required: false,
  },

  // Question-level progress
  questions: {
    type: [rampUpQuestionSchema],
    default: [],
  },
  totalQuestions: {
    type: Number,
    required: true,
  },

  // Summary fields
  completedCount: {
    type: Number,
    default: 0,
  },
  percentComplete: {
    type: Number,
    default: 0,
  },
  isFullyComplete: {
    type: Boolean,
    default: false,
  },

  // Timestamps
  lastUpdated: {
    type: String,
    required: false,
  },
  firstAttemptDate: {
    type: String,
    required: false,
  },
  completionDate: {
    type: String,
    required: false,
  },

  ...standardDocumentFields,
};

const RampUpProgressSchema = new mongoose.Schema(rampUpProgressSchemaFields, {
  ...standardSchemaOptions,
  collection: "ramp-up-progress",
});

// Compound index for unique student + unit combination
RampUpProgressSchema.index({ studentId: 1, unitCode: 1 }, { unique: true });

// Index for querying by unit (for class-wide views)
RampUpProgressSchema.index({ unitCode: 1, completedCount: -1 });

// Force delete cached model to ensure schema changes are applied
if (mongoose.models.RampUpProgress) {
  delete mongoose.models.RampUpProgress;
}

export const RampUpProgressModel = mongoose.model(
  "RampUpProgress",
  RampUpProgressSchema,
);
