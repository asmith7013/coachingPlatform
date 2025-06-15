// src/lib/schema/mongoose-schema/observations/classroom-observation.model.ts
import mongoose from "mongoose";
import { standardSchemaOptions, standardDocumentFields } from '@mongoose-schema/shared-options';

// ===== CORE OBSERVATION MODEL =====
const classroomObservationFields = {
  cycle: { type: String, default: '' },
  session: { type: String, default: '' },
  date: { type: Date, required: true },
  teacherId: { type: String, default: '', index: true },
  coachId: { type: String, default: '', index: true },
  schoolId: { type: String, default: '', index: true },
  
  // Flat lesson info
  lessonTitle: { type: String, default: '' },
  lessonCourse: { type: String, default: '' },
  lessonUnit: { type: String, default: '' },
  lessonNumber: { type: String, default: '' },
  lessonCurriculum: { type: String, default: '' },
  
  otherContext: { type: String, default: '' },
  coolDown: { type: String, default: '' },
  
  status: { type: String, enum: ['draft', 'in_progress', 'completed', 'reviewed'], default: 'draft', index: true },
  isSharedWithTeacher: { type: Boolean, default: false },
  
  visitId: { type: String, index: true },
  coachingActionPlanId: { type: String, index: true },
  
  ...standardDocumentFields
};

const ClassroomObservationSchema = new mongoose.Schema(classroomObservationFields, {
  ...standardSchemaOptions,
  collection: 'classroomobservations_v2'
});

export const ClassroomObservationModel = mongoose.models.ClassroomObservation || 
  mongoose.model('ClassroomObservation', ClassroomObservationSchema);

// ===== OBSERVATION CRITERIA MODEL =====
const observationCriterionFields = {
  observationId: { type: String, required: true, index: true },
  criterion: { type: String, required: true },
  observed: { type: Boolean, default: false },
  notes: { type: String },
  category: { type: String, index: true },
  sortOrder: { type: Number, default: 0 },
  ...standardDocumentFields
};

const ObservationCriterionSchema = new mongoose.Schema(observationCriterionFields, {
  ...standardSchemaOptions,
  collection: 'observationcriteria'
});

export const ObservationCriterionModel = mongoose.models.ObservationCriterion || 
  mongoose.model('ObservationCriterion', ObservationCriterionSchema);

// ===== FEEDBACK ITEMS MODEL =====
const feedbackItemFields = {
  observationId: { type: String, required: true, index: true },
  type: { type: String, enum: ['glow', 'wonder', 'grow', 'nextSteps'], required: true },
  content: { type: String, required: true },
  sortOrder: { type: Number, default: 0 },
  ...standardDocumentFields
};

const FeedbackItemSchema = new mongoose.Schema(feedbackItemFields, {
  ...standardSchemaOptions,
  collection: 'feedbackitems'
});

export const FeedbackItemModel = mongoose.models.FeedbackItem || 
  mongoose.model('FeedbackItem', FeedbackItemSchema);

// ===== LESSON FLOW STEPS MODEL =====
const lessonFlowStepFields = {
  observationId: { type: String, required: true, index: true },
  activity: { type: String, enum: ['warmUp', 'activity1', 'activity2', 'lessonSynthesis'], required: true },
  stepType: { type: String, enum: ['launch', 'workTime', 'synthesis'], required: true },
  content: { type: String, default: '' },
  sortOrder: { type: Number, default: 0 },
  ...standardDocumentFields
};

const LessonFlowStepSchema = new mongoose.Schema(lessonFlowStepFields, {
  ...standardSchemaOptions,
  collection: 'lessonflowsteps'
});

export const LessonFlowStepModel = mongoose.models.LessonFlowStep || 
  mongoose.model('LessonFlowStep', LessonFlowStepSchema);

// ===== LESSON FLOW NOTES MODEL =====
const lessonFlowNoteFields = {
  observationId: { type: String, required: true, index: true },
  activity: { type: String, enum: ['warmUp', 'activity1', 'activity2', 'lessonSynthesis'], required: true },
  note: { type: String, required: true },
  sortOrder: { type: Number, default: 0 },
  ...standardDocumentFields
};

const LessonFlowNoteSchema = new mongoose.Schema(lessonFlowNoteFields, {
  ...standardSchemaOptions,
  collection: 'lessonflownotes'
});

export const LessonFlowNoteModel = mongoose.models.LessonFlowNote || 
  mongoose.model('LessonFlowNote', LessonFlowNoteSchema);

// ===== LEARNING TARGETS MODEL =====
const learningTargetFields = {
  observationId: { type: String, required: true, index: true },
  target: { type: String, required: true },
  sortOrder: { type: Number, default: 0 },
  ...standardDocumentFields
};

const LearningTargetSchema = new mongoose.Schema(learningTargetFields, {
  ...standardSchemaOptions,
  collection: 'learningtargets'
});

export const LearningTargetModel = mongoose.models.LearningTarget || 
  mongoose.model('LearningTarget', LearningTargetSchema);

// ===== TIME TRACKING MODEL =====
const observationTimeTrackingFields = {
  observationId: { type: String, required: true, unique: true, index: true },
  classStartTime: { type: String, default: '' },
  classEndTime: { type: String, default: '' },
  observationStartTime: { type: Date },
  observationEndTime: { type: Date },
  stopwatchTime: { type: String, default: '00:00:00' },
  startedWhenMinutes: { type: Number },
  ...standardDocumentFields
};

const ObservationTimeTrackingSchema = new mongoose.Schema(observationTimeTrackingFields, {
  ...standardSchemaOptions,
  collection: 'observationtimetracking'
});

export const ObservationTimeTrackingModel = mongoose.models.ObservationTimeTracking || 
  mongoose.model('ObservationTimeTracking', ObservationTimeTrackingSchema);

// ===== TRANSCRIPT SECTIONS MODEL =====
const transcriptSectionFields = {
  observationId: { type: String, required: true, index: true },
  section: { type: String, enum: ['warmUpLaunch', 'activity1Launch', 'activity2Launch', 'synthesisLaunch'], required: true },
  content: { type: String, default: '' },
  ...standardDocumentFields
};

const TranscriptSectionSchema = new mongoose.Schema(transcriptSectionFields, {
  ...standardSchemaOptions,
  collection: 'transcriptsections'
});

export const TranscriptSectionModel = mongoose.models.TranscriptSection || 
  mongoose.model('TranscriptSection', TranscriptSectionSchema);

// ===== CUSTOM TRANSCRIPT SECTIONS MODEL =====
const customTranscriptSectionFields = {
  observationId: { type: String, required: true, index: true },
  sectionName: { type: String, required: true },
  content: { type: String, default: '' },
  ...standardDocumentFields
};

const CustomTranscriptSectionSchema = new mongoose.Schema(customTranscriptSectionFields, {
  ...standardSchemaOptions,
  collection: 'customtranscriptsections'
});

export const CustomTranscriptSectionModel = mongoose.models.CustomTranscriptSection || 
  mongoose.model('CustomTranscriptSection', CustomTranscriptSectionSchema);

// ===== CONTEXTUAL NOTES MODEL =====
const contextualNoteFields = {
  observationId: { type: String, index: true },
  content: { type: String, required: true },
  noteType: { type: String, enum: ['observation', 'debrief', 'reflection', 'action_item', 'quote', 'question', 'insight', 'concern', 'celebration'], required: true },
  isPrivate: { type: Boolean, default: false },
  followUpRequired: { type: Boolean, default: false },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  visitId: { type: String, index: true },
  coachingActionPlanId: { type: String, index: true },
  sortOrder: { type: Number, default: 0 },
  ...standardDocumentFields
};

const ContextualNoteSchema = new mongoose.Schema(contextualNoteFields, {
  ...standardSchemaOptions,
  collection: 'contextualnotes'
});

export const ContextualNoteModel = mongoose.models.ContextualNote || 
  mongoose.model('ContextualNote', ContextualNoteSchema);

// ===== OBSERVATION TAGS MODEL =====
const observationTagFields = {
  observationId: { type: String, required: true, index: true },
  type: { type: String, enum: ['cycle', 'visit', 'period', 'activity', 'person', 'subject', 'location', 'topic', 'goal', 'priority', 'custom'], required: true },
  value: { type: String, required: true, index: true },
  confidence: { type: String, enum: ['auto', 'manual'], default: 'manual' },
  isEditable: { type: Boolean, default: true },
  color: { type: String },
  icon: { type: String },
  ...standardDocumentFields
};

const ObservationTagSchema = new mongoose.Schema(observationTagFields, {
  ...standardSchemaOptions,
  collection: 'observationtags'
});

export const ObservationTagModel = mongoose.models.ObservationTag || 
  mongoose.model('ObservationTag', ObservationTagSchema);

// ===== OBSERVATION METADATA MODEL =====
const observationMetadataFields = {
  observationId: { type: String, required: true, unique: true, index: true },
  scheduledActivity: { type: String },
  actualActivity: { type: String },
  location: { type: String },
  participants: [{ type: String }],
  sourceType: { type: String, enum: ['manual', 'scheduled', 'detected', 'imported'], default: 'manual' },
  confidence: { type: Number, min: 0, max: 1, default: 1.0 },
  autoTaggingEnabled: { type: Boolean, default: true },
  searchableText: { type: String, default: '' },
  tagSummary: { type: String, default: '' },
  lastTagUpdate: { type: Date },
  ...standardDocumentFields
};

const ObservationMetadataSchema = new mongoose.Schema(observationMetadataFields, {
  ...standardSchemaOptions,
  collection: 'observationmetadata'
});

export const ObservationMetadataModel = mongoose.models.ObservationMetadata || 
  mongoose.model('ObservationMetadata', ObservationMetadataSchema);