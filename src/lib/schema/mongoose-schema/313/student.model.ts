import mongoose from "mongoose";
import { standardSchemaOptions, standardDocumentFields } from '@mongoose-schema/shared-options';

// =====================================
// STUDENT MODEL
// =====================================

const studentActivitySchema = new mongoose.Schema({
  date: { type: String, required: true },
  activityType: { type: String, required: true },
  activityLabel: { type: String, required: true },
  unitId: { type: String, required: false },
  lessonId: { type: String, required: false },
  skillId: { type: String, required: false },
  inquiryQuestion: { type: String, required: false },
  customDetail: { type: String, required: false },
  loggedBy: { type: String, required: false },
  createdAt: { type: String, required: false }
}, { _id: false });

const studentSchemaFields = {
  studentID: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  section: { type: String, required: true, index: true },
  teacher: { type: String, required: false, index: true },
  gradeLevel: { type: String, required: false },
//   subject: { type: String, required: true },
  email: { type: String, required: false },
  active: { type: Boolean, default: true, index: true },
  masteredSkills: { type: [String], default: [], index: true },
  classActivities: { type: [studentActivitySchema], default: [] },
  ...standardDocumentFields
};

const StudentSchema = new mongoose.Schema(studentSchemaFields, {
  ...standardSchemaOptions,
  collection: 'students'
});

// Compound indexes for common queries
StudentSchema.index({ teacher: 1, section: 1, active: 1 });
StudentSchema.index({ firstName: 1, lastName: 1 });
StudentSchema.index({ section: 1, active: 1 });

export const StudentModel = mongoose.models.Student || 
  mongoose.model("Student", StudentSchema); 