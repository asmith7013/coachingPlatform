// src/lib/schema/mongoose-schema/313/section-config.model.ts
import mongoose from 'mongoose';
import { standardSchemaOptions, standardDocumentFields } from '@mongoose-schema/shared-options';
import { Schools, AllSections, Teachers313, SpecialPopulations } from '@schema/enum/313';

// =====================================
// SECTION CONFIG MODEL
// =====================================

// Podsie question map subdocument schema
const podsieQuestionMapSchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true },
  questionId: { type: String, required: true },
  isRoot: { type: Boolean, default: true },
  rootQuestionId: { type: String, required: false },
  variantNumber: { type: Number, required: false }
}, { _id: false });

// Podsie activity subdocument schema
const podsieActivitySchema = new mongoose.Schema({
  activityType: {
    type: String,
    enum: ['sidekick', 'mastery-check', 'assessment'],
    required: true
  },
  podsieAssignmentId: { type: String, required: true },
  podsieQuestionMap: { type: [podsieQuestionMapSchema], default: [] },
  totalQuestions: { type: Number, required: false },
  variations: { type: Number, default: 3, min: 0, max: 10 },
  q1HasVariations: { type: Boolean, default: false },
  active: { type: Boolean, default: true }
}, { _id: false });

// Zearn activity subdocument schema
const zearnActivitySchema = new mongoose.Schema({
  zearnLessonId: { type: String, required: false },
  zearnUrl: { type: String, required: false },
  active: { type: Boolean, default: true }
}, { _id: false });

// Day schedule subdocument schema (for bell schedule)
const dayScheduleSchema = new mongoose.Schema({
  meetingCount: { type: Number, required: true, min: 0, max: 10 },
  minutesPerMeeting: { type: Number, required: true, min: 1 }
}, { _id: false });

// Bell schedule subdocument schema
const bellScheduleSchema = new mongoose.Schema({
  monday: { type: dayScheduleSchema, required: false },
  tuesday: { type: dayScheduleSchema, required: false },
  wednesday: { type: dayScheduleSchema, required: false },
  thursday: { type: dayScheduleSchema, required: false },
  friday: { type: dayScheduleSchema, required: false }
}, { _id: false });

// Assignment content subdocument schema
const assignmentContentSchema = new mongoose.Schema({
  // Link to scope-and-sequence
  scopeAndSequenceId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'ScopeAndSequence' },

  // Denormalized fields for display/sorting
  unitLessonId: { type: String, required: true },
  lessonName: { type: String, required: true },
  section: { type: String, required: false },
  grade: { type: String, required: false },

  // Activity configurations
  podsieActivities: { type: [podsieActivitySchema], default: [] },
  zearnActivity: { type: zearnActivitySchema, required: false },

  // Metadata
  active: { type: Boolean, default: true },
  notes: { type: String, required: false }
}, { _id: false });

const sectionConfigFields = {
  // Section metadata
  school: { type: String, required: true, enum: Schools, index: true },
  classSection: { type: String, required: true, enum: AllSections, index: true },
  teacher: { type: String, required: false, enum: Teachers313, index: true },
  gradeLevel: { type: String, required: true, index: true },
  scopeSequenceTag: {
    type: String,
    required: false,
    enum: ['Grade 6', 'Grade 7', 'Grade 8', 'Algebra 1'],
    index: true
  },

  groupId: { type: String, required: false },

  specialPopulations: {
    type: [String],
    enum: SpecialPopulations,
    default: [],
    index: true
  },

  active: { type: Boolean, default: true, index: true },

  // Bell schedule
  bellSchedule: { type: bellScheduleSchema, required: false },

  // Assignment content configurations
  assignmentContent: { type: [assignmentContentSchema], default: [] },

  // Metadata
  notes: { type: String, required: false },

  ...standardDocumentFields
};

const SectionConfigSchema = new mongoose.Schema(sectionConfigFields, {
  ...standardSchemaOptions,
  collection: 'section-configs'
});

// Create indexes for efficient queries
// Unique index: one config per school + classSection
SectionConfigSchema.index(
  { school: 1, classSection: 1 },
  { unique: true }
);

// Query by school (get all sections in a school)
SectionConfigSchema.index({ school: 1, active: 1 });

// Query by teacher (get all sections for a teacher)
SectionConfigSchema.index({ teacher: 1, active: 1 });

// Query by grade level
SectionConfigSchema.index({ gradeLevel: 1, active: 1 });

// Query assignments by unitLessonId (for lookups)
SectionConfigSchema.index({ 'assignmentContent.unitLessonId': 1 });

// Query assignments by scopeAndSequenceId (for joins)
SectionConfigSchema.index({ 'assignmentContent.scopeAndSequenceId': 1 });

// Delete existing model to force schema refresh
// Updated: Added isRoot, rootQuestionId, variantNumber to podsieQuestionMap
if (mongoose.models.SectionConfig) {
  delete mongoose.models.SectionConfig;
}

export const SectionConfigModel = mongoose.model('SectionConfig', SectionConfigSchema);
