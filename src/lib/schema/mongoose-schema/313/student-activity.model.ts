import mongoose from "mongoose";
import { standardSchemaOptions, standardDocumentFields } from '@mongoose-schema/shared-options';

// =====================================
// STUDENT ACTIVITY MODEL (Standalone Collection)
// =====================================

const studentActivityFields = {
  // Student reference
  studentId: {
    type: String,
    required: true,
    index: true
  },
  studentName: {
    type: String,
    required: true,
    index: true
  },
  section: {
    type: String,
    required: true,
    index: true
  },
  gradeLevel: {
    type: String,
    required: true,
    index: true
  },

  // Activity metadata
  date: {
    type: String,
    required: true,
    index: true
  },
  activityType: {
    type: String,
    required: true,
    index: true
  },
  activityLabel: {
    type: String,
    required: true
  },

  // Unit context
  unitId: {
    type: String,
    required: false,
    index: true
  },
  unitNumber: {
    type: Number,
    required: false,
    index: true
  },

  // Detail fields
  lessonId: {
    type: String,
    required: false
  },
  skillId: {
    type: String,
    required: false
  },
  inquiryQuestion: {
    type: String,
    required: false
  },
  customDetail: {
    type: String,
    required: false
  },

  // Logging metadata
  loggedBy: {
    type: String,
    required: false
  },
  loggedAt: {
    type: String,
    required: false,
    index: true
  },

  ...standardDocumentFields
};

const StudentActivitySchema = new mongoose.Schema(
  studentActivityFields,
  {
    ...standardSchemaOptions,
    collection: 'student-activities'
  }
);

// Compound indexes for common queries
StudentActivitySchema.index({ studentId: 1, date: -1 });
StudentActivitySchema.index({ section: 1, date: -1 });
StudentActivitySchema.index({ gradeLevel: 1, activityType: 1, date: -1 });
StudentActivitySchema.index({ unitId: 1, activityType: 1 });
StudentActivitySchema.index({ date: -1, section: 1 });

export const StudentActivityModel = mongoose.models.StudentActivity ||
  mongoose.model("StudentActivity", StudentActivitySchema);
