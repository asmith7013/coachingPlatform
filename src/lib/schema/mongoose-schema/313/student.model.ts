import mongoose from "mongoose";
import { standardSchemaOptions, standardDocumentFields } from '@mongoose-schema/shared-options';

// =====================================
// STUDENT MODEL
// =====================================

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
  teacher: { type: String, required: true, index: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  gradeLevel: { type: String, required: false },
//   subject: { type: String, required: true },
  email: { type: String, required: false },
  active: { type: Boolean, default: true, index: true },
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