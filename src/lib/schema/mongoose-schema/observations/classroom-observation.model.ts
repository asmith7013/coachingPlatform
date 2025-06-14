import mongoose from "mongoose";
import { standardSchemaOptions, standardDocumentFields } from '@mongoose-schema/shared-options';

const CriterionObservationSchema = new mongoose.Schema({
  criterion: { type: String, required: true },
  observed: { type: Boolean, default: false },
  notes: { type: String },
  category: { type: String }
}, { _id: false });

const ProgressMonitoringSchema = new mongoose.Schema({
  observedCriteria: { type: [CriterionObservationSchema], default: [] },
  overallNotes: { type: String, default: '' }
}, { _id: false });

const ActivitySectionSchema = new mongoose.Schema({
  launch: { type: String, default: '' },
  workTime: { type: String, default: '' },
  synthesis: { type: String, default: '' },
  notes: { type: [String], default: [] }
}, { _id: false });

const LessonFlowSchema = new mongoose.Schema({
  warmUp: { type: ActivitySectionSchema, default: {} },
  activity1: { type: ActivitySectionSchema, default: {} },
  activity2: { type: ActivitySectionSchema },
  lessonSynthesis: { type: ActivitySectionSchema, default: {} }
}, { _id: false });

const LessonSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  course: { type: String, default: '' },
  unit: { type: String, default: '' },
  lessonNumber: { type: String, default: '' },
  curriculum: { type: String, default: '' }
}, { _id: false });

const FeedbackSchema = new mongoose.Schema({
  glow: { type: [String], default: [] },
  wonder: { type: [String], default: [] },
  grow: { type: [String], default: [] },
  nextSteps: { type: [String], default: [] }
}, { _id: false });

const TimeTrackingSchema = new mongoose.Schema({
  classStartTime: { type: String, default: '' },
  classEndTime: { type: String, default: '' },
  observationStartTime: { type: Date },
  observationEndTime: { type: Date },
  stopwatchTime: { type: String, default: '00:00:00' },
  startedWhenMinutes: { type: Number }
}, { _id: false });

const TranscriptSectionSchema = new mongoose.Schema({
  warmUpLaunch: { type: String, default: '' },
  activity1Launch: { type: String, default: '' },
  activity2Launch: { type: String, default: '' },
  synthesisLaunch: { type: String, default: '' },
  customSections: { type: Object, default: {} }
}, { _id: false });

const classroomObservationFields = {
  cycle: { type: String, default: '' },
  session: { type: String, default: '' },
  date: { type: Date, required: true },
  teacherId: { type: String, default: '' },
  coachId: { type: String, default: '' },
  schoolId: { type: String, default: '' },
  lesson: { type: LessonSchema, default: {} },
  otherContext: { type: String, default: '' },
  learningTargets: { type: [String], default: [] },
  coolDown: { type: String, default: '' },
  feedback: { type: FeedbackSchema, default: {} },
  lessonFlow: { type: LessonFlowSchema, default: {} },
  progressMonitoring: { type: ProgressMonitoringSchema, default: {} },
  timeTracking: { type: TimeTrackingSchema, default: {} },
  transcripts: { type: TranscriptSectionSchema, default: {} },
  contextualNotes: { type: [String], default: [] },
  tagging: { type: Object, required: true },
  status: { type: String, enum: ['draft', 'in_progress', 'completed', 'reviewed'], default: 'draft' },
  isSharedWithTeacher: { type: Boolean, default: false },
  visitId: { type: String },
  coachingActionPlanId: { type: String },
  ...standardDocumentFields
};

const ClassroomObservationSchema = new mongoose.Schema(classroomObservationFields, {
  ...standardSchemaOptions,
  collection: 'classroomobservations'
});

export const ClassroomObservationModel =
  mongoose.models.ClassroomObservation || mongoose.model('ClassroomObservation', ClassroomObservationSchema);

export async function getClassroomObservationModel() {
  return ClassroomObservationModel;
} 