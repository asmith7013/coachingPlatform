// src/lib/schema/mongoose-schema/students/lesson-completion.model.ts
import mongoose from 'mongoose';
import { standardSchemaOptions, standardDocumentFields } from '@mongoose-schema/shared-options';
import { 
  SCOPE_SEQUENCE, 
  AttendanceStatus 
} from '@zod-schema/scm/core';

// =====================================
// LESSON COMPLETION MODEL
// =====================================

/**
 * Base completion fields shared by both completion types
 */
const baseCompletionFields = {
  studentIDref: { type: Number, required: true, min: 1 },
  studentName: { type: String, required: true },
  lessonCode: { type: String, required: true, enum: SCOPE_SEQUENCE },
  dateOfCompletion: { type: String, required: true },
  teacher: { type: String, required: true },
  section: { type: String, required: true },
  
  // Core attempt/completion tracking
  attempted: { type: Boolean, required: true, default: true },
  completed: { type: Boolean, required: true },
  
  // Discriminator field for union type
  completionType: { type: String, required: true, enum: ["zearn", "snorkl"] },
  
  ...standardDocumentFields
};

/**
 * Create the base schema with discriminator
 */
const LessonCompletionSchema = new mongoose.Schema(baseCompletionFields, {
  ...standardSchemaOptions,
  collection: 'lesson_completions',
  discriminatorKey: 'completionType'
});

/**
 * Base model for lesson completions
 */
export const LessonCompletionModel = mongoose.models.LessonCompletion || 
  mongoose.model('LessonCompletion', LessonCompletionSchema);

/**
 * Zearn completion discriminator schema
 */
const ZearnCompletionSchema = new mongoose.Schema({
  // Time only recorded if completed successfully  
  timeForCompletion: { type: Number, required: false, min: 1, max: 90 },
});

/**
 * Snorkl completion discriminator schema  
 */
const SnorklCompletionSchema = new mongoose.Schema({
  numberOfAttempts: { type: Number, required: true, min: 1 },
  // Score only recorded if completed successfully
  snorklScore: { type: Number, required: false, min: 1, max: 4 },
});

/**
 * Zearn completion model (discriminator)
 */
export const ZearnCompletionModel = LessonCompletionModel.discriminators?.zearn || 
  LessonCompletionModel.discriminator('zearn', ZearnCompletionSchema);

/**
 * Snorkl completion model (discriminator)
 */
export const SnorklCompletionModel = LessonCompletionModel.discriminators?.snorkl || 
  LessonCompletionModel.discriminator('snorkl', SnorklCompletionSchema);

// =====================================
// STUDENT ROSTER MODEL
// =====================================

const studentRosterFields = {
//   studentID: { type: Number, required: true, unique: true, min: 1 },
  studentName: { type: String, required: true },
  teacher: { type: String, required: true },
  section: { type: String, required: true },
  enrollmentDate: { type: String, required: false },
  active: { type: Boolean, required: true, default: true },
  
  ...standardDocumentFields
};

const StudentRosterSchema = new mongoose.Schema(studentRosterFields, {
  ...standardSchemaOptions,
  collection: 'student_roster'
});

/**
 * Create compound index for efficient queries
 */
StudentRosterSchema.index({ teacher: 1, section: 1, active: 1 });
StudentRosterSchema.index({ studentIDref: 1 }, { unique: true });

export const StudentRosterModel = mongoose.models.StudentRoster || 
  mongoose.model('StudentRoster', StudentRosterSchema);

// =====================================
// DAILY CLASS EVENT MODEL
// =====================================

const dailyClassEventFields = {
  date: { type: String, required: true },
  section: { type: String, required: true },
  teacher: { type: String, required: true },
  studentIDref: { type: Number, required: true, min: 1 },
  
  // Split name fields to match Google Sheets structure
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  
  // Class timing and attendance
  classLengthMin: { type: Number, required: true, min: 1 },
  attendance: { type: String, required: true, enum: Object.values(AttendanceStatus) },
  classMissedMin: { type: Number, required: false, min: 0 },
  
  // Export tracking metadata
  exportDate: { type: String, required: false },
  exportSheet: { type: String, required: false },
  
  // Intervention tracking
  teacherInterventionMin: { type: Number, required: true, default: 0, min: 0, max: 60 },
  interventionNotes: { type: String, required: false },
  behaviorNotes: { type: String, required: false },
  
  ...standardDocumentFields
};

const DailyClassEventSchema = new mongoose.Schema(dailyClassEventFields, {
  ...standardSchemaOptions,
  collection: 'daily_class_events'
});

/**
 * Create compound indexes for efficient queries
 */
DailyClassEventSchema.index({ date: 1, teacher: 1, section: 1 });
DailyClassEventSchema.index({ studentIDref: 1, date: 1 });
DailyClassEventSchema.index({ date: 1, attendance: 1 });

export const DailyClassEventModel = mongoose.models.DailyClassEvent || 
  mongoose.model('DailyClassEvent', DailyClassEventSchema);

