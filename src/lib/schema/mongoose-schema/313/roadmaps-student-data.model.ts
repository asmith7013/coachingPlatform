import mongoose from "mongoose";
import { standardSchemaOptions } from "../shared-options";

// =====================================
// ROADMAPS STUDENT DATA MODEL
// =====================================

/**
 * Schema for roadmaps student data with embedded skill performances
 * Maps to existing roadmaps-student-data collection
 */
const roadmapsStudentDataFields = {
  studentId: { type: String, required: true, index: true },
  studentName: { type: String, required: true },
  schoolId: { type: String, required: true, index: true },
  assessmentDate: { type: String, required: true },
  skillPerformances: [{
    skillCode: { type: String, required: true },
    unit: { type: String, required: false },
    skillName: { type: String, required: false },
    skillGrade: { type: String, required: false },
    standards: { type: String, required: false },
    status: { 
      type: String, 
      enum: ["Demonstrated", "Attempted But Not Passed", "Not Started"],
      required: true 
    },
    score: { type: String, required: false },
    lastUpdated: { type: String, required: false }
  }]
};

const RoadmapsStudentDataSchema = new mongoose.Schema(
  roadmapsStudentDataFields, 
  {
    ...standardSchemaOptions,
    collection: 'roadmaps-student-data'
  }
);

// Create indexes for efficient queries
RoadmapsStudentDataSchema.index({ studentId: 1 });
RoadmapsStudentDataSchema.index({ studentName: 1 });
RoadmapsStudentDataSchema.index({ schoolId: 1 });
RoadmapsStudentDataSchema.index({ "skillPerformances.skillCode": 1 });
RoadmapsStudentDataSchema.index({ "skillPerformances.status": 1 });

// Force recompilation in development
if (mongoose.models.RoadmapsStudentData) {
  delete mongoose.models.RoadmapsStudentData;
}

export const RoadmapsStudentDataModel = mongoose.model("RoadmapsStudentData", RoadmapsStudentDataSchema);
