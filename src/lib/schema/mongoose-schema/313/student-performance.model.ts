import mongoose from "mongoose";
import { standardSchemaOptions } from "../shared-options";

// =====================================
// EMBEDDED SKILL PERFORMANCE SCHEMA
// =====================================

/**
 * Embedded document schema for individual skill performances
 */
const skillPerformanceItemFields = {
  skillCode: { type: String, required: true },
  unit: { type: String, required: true },
  skillName: { type: String, required: true },
  skillGrade: { type: String, required: true },
  standards: { type: String, required: true },
  status: {
    type: String,
    enum: ["Mastered", "Attempted But Not Mastered", "Not Started"],
    required: true
  },
  score: { type: String, required: false },
  lastUpdated: { type: String, required: false }
};

// =====================================
// STUDENT PERFORMANCE SCHEMA
// =====================================

/**
 * Main document schema with embedded skill performances
 */
const studentPerformanceFields = {
  studentId: { type: String, required: true, index: true },
  studentName: { type: String, required: true },
  schoolId: { type: String, required: true, index: true },
  assessmentDate: { type: String, required: true },
  skillPerformances: [skillPerformanceItemFields]
};

const StudentPerformanceSchema = new mongoose.Schema(
  studentPerformanceFields, 
  {
    ...standardSchemaOptions,
    collection: 'studentperformances'
  }
);

// =====================================
// INDEXES FOR QUERY OPTIMIZATION
// =====================================

// Compound indexes for efficient queries
StudentPerformanceSchema.index({ studentId: 1, assessmentDate: -1 });
StudentPerformanceSchema.index({ schoolId: 1, assessmentDate: -1 });
StudentPerformanceSchema.index({ "skillPerformances.skillCode": 1 });
StudentPerformanceSchema.index({ "skillPerformances.status": 1 });

// Force recompilation in development
if (mongoose.models.StudentPerformance) {
  delete mongoose.models.StudentPerformance;
}

export const StudentPerformanceModel = mongoose.model("StudentPerformance", StudentPerformanceSchema);
