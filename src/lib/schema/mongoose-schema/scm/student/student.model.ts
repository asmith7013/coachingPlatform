import mongoose from "mongoose";
import { standardSchemaOptions, standardDocumentFields } from '@mongoose-schema/shared-options';
import { Schools, AllSections, Teachers313 } from '@schema/enum/scm';

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

const skillAttemptSchema = new mongoose.Schema({
  attemptNumber: { type: Number, required: true },
  dateCompleted: { type: String, required: true },
  score: { type: String, required: true },
  passed: { type: Boolean, required: true }
}, { _id: false });

const skillPerformanceSchema = new mongoose.Schema({
  skillCode: { type: String, required: true },
  skillName: { type: String, required: true },
  skillGrade: { type: String, required: false },
  unit: { type: String, required: false },
  standards: { type: String, required: false },
  status: {
    type: String,
    required: true,
    enum: ['Not Started', 'Attempted But Not Mastered', 'Mastered']
  },
  attempts: { type: [skillAttemptSchema], default: [] },
  bestScore: { type: String, required: false },
  attemptCount: { type: Number, default: 0 },
  masteredDate: { type: String, required: false },
  lastAttemptDate: { type: String, required: false },
  // Legacy fields for backward compatibility
  score: { type: String, required: false },
  lastUpdated: { type: String, required: false }
}, { _id: false });

const zearnLessonCompletionSchema = new mongoose.Schema({
  lessonCode: { type: String, required: true },
  completionDate: { type: String, required: true }
}, { _id: false });

const podsieQuestionSchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: String, required: false },
  // AI Analysis scores (from response_payload.aiAnalysis)
  correctScore: { type: Number, required: false, min: 0, max: 1 },        // 0 or 1 (answersCorrect)
  explanationScore: { type: Number, required: false, min: 1, max: 3 }     // 1, 2, or 3 (explanationGrading)
}, { _id: false });

const podsieProgressSchema = new mongoose.Schema({
  // Primary keys (prevents duplicates)
  scopeAndSequenceId: { type: String, required: true },
  podsieAssignmentId: { type: String, required: true },

  // Denormalized fields (from scope-and-sequence)
  unitCode: { type: String, required: true },
  rampUpId: { type: String, required: true },
  rampUpName: { type: String, required: false },

  // Activity type
  activityType: {
    type: String,
    required: false,
    enum: ['sidekick', 'mastery-check', 'ramp-up']
  },

  // Progress data
  questions: { type: [podsieQuestionSchema], default: [] },
  totalQuestions: { type: Number, default: 0 },
  completedCount: { type: Number, default: 0 },
  percentComplete: { type: Number, default: 0 },
  isFullyComplete: { type: Boolean, default: false },
  fullyCompletedDate: { type: String, required: false },
  lastSyncedAt: { type: String, required: false }
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
  school: { type: String, required: true, enum: Schools, index: true },
  section: { type: String, required: true, enum: AllSections, index: true },
  teacher: { type: String, required: false, enum: Teachers313, index: true },
  gradeLevel: { type: String, required: false },
//   subject: { type: String, required: true },
  email: { type: String, required: false },
  active: { type: Boolean, default: true, index: true },
  masteredSkills: { type: [String], default: [], index: true },
  classActivities: { type: [studentActivitySchema], default: [] },
  skillPerformances: { type: [skillPerformanceSchema], default: [] },
  lastAssessmentDate: { type: String, required: false },
  zearnLessons: { type: [zearnLessonCompletionSchema], default: [] },
  podsieProgress: { type: [podsieProgressSchema], default: [] },
  ...standardDocumentFields
};

const StudentSchema = new mongoose.Schema(studentSchemaFields, {
  ...standardSchemaOptions,
  collection: 'students'
});

// Compound indexes for common queries
StudentSchema.index({ school: 1, section: 1, active: 1 });
StudentSchema.index({ teacher: 1, section: 1, active: 1 });
StudentSchema.index({ firstName: 1, lastName: 1 });
StudentSchema.index({ section: 1, active: 1 });

// Force delete cached model to ensure schema changes are applied
if (mongoose.models.Student) {
  delete mongoose.models.Student;
}

export const StudentModel = mongoose.model("Student", StudentSchema); 