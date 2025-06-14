import mongoose from 'mongoose';
import { standardSchemaOptions, standardDocumentFields } from '@mongoose-schema/shared-options';
import {
  IPGCoreActions,
  IPGSubCategories,
  MetricCollectionMethods,
  VisitStatuses,
  CoachingCycleNumbers,
  VisitNumbers,
  CoachingActionPlanStatuses,
  EvidenceTypes
} from "@enums";

const EvidenceSchema = new mongoose.Schema({
  type: { type: String, enum: Object.values(EvidenceTypes), required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  content: { type: String },
  url: { type: String },
  uploadedFile: { type: String },
  dateCollected: { type: Date, required: true }
}, { _id: false });

const MetricSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  collectionMethod: { type: String, enum: Object.values(MetricCollectionMethods), required: true },
  baselineValue: { type: String },
  targetValue: { type: String, required: true },
  currentValue: { type: String },
  notes: { type: String }
}, { _id: false });

const OutcomeSchema = new mongoose.Schema({
  type: { type: String, required: true },
  description: { type: String, required: true },
  metrics: [MetricSchema],
  evidence: [EvidenceSchema]
}, { _id: false });

const GoalSchema = new mongoose.Schema({
  description: { type: String, required: true },
  teacherOutcomes: [OutcomeSchema],
  studentOutcomes: [OutcomeSchema]
}, { _id: false });

const NeedsAndFocusSchema = new mongoose.Schema({
  ipgCoreAction: { type: String, enum: Object.values(IPGCoreActions), required: true },
  ipgSubCategory: { type: String, enum: Object.values(IPGSubCategories), required: true },
  rationale: { type: String, required: true },
  pdfAttachment: { type: String }
}, { _id: false });

const WeeklyVisitPlanSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  cycleNumber: { type: String, enum: Object.values(CoachingCycleNumbers), required: true },
  visitNumber: { type: String, enum: Object.values(VisitNumbers), required: true },
  focus: { type: String, required: true },
  lookFor: { type: String, required: true },
  coachAction: { type: String, required: true },
  teacherAction: { type: String, required: true },
  progressMonitoring: { type: String, required: true },
  visitId: { type: String },
  status: { type: String, enum: Object.values(VisitStatuses), default: "planned" }
}, { _id: false });

const ImplementationRecordSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  visitId: { type: String },
  cycleNumber: { type: String, enum: Object.values(CoachingCycleNumbers), required: true },
  visitNumber: { type: String, enum: Object.values(VisitNumbers), required: true },
  lookForImplemented: { type: String, required: true },
  glows: [{ type: String }],
  grows: [{ type: String }],
  successMetrics: [{ type: String }],
  nextSteps: [{ type: String }],
  teacherReflection: { type: String },
  coachNotes: { type: String }
}, { _id: false });

const FinalMetricValueSchema = new mongoose.Schema({
  metricId: { type: String, required: true },
  finalValue: { type: String, required: true },
  goalMet: { type: Boolean, required: true }
}, { _id: false });

const OutcomeAnalysisSchema = new mongoose.Schema({
  outcomeId: { type: String, required: true },
  achieved: { type: Boolean, required: true },
  evidence: [EvidenceSchema],
  finalMetricValues: [FinalMetricValueSchema]
}, { _id: false });

const EndOfCycleAnalysisSchema = new mongoose.Schema({
  goalMet: { type: Boolean, required: true },
  teacherOutcomeAnalysis: [OutcomeAnalysisSchema],
  studentOutcomeAnalysis: [OutcomeAnalysisSchema],
  impactOnLearning: { type: String, required: true },
  overallEvidence: [EvidenceSchema],
  lessonsLearned: { type: String },
  recommendationsForNext: { type: String }
}, { _id: false });

const coachingActionPlanFields = {
  title: { type: String, required: true },
  teachers: [{ type: String, required: true }],
  coaches: [{ type: String, required: true }],
  school: { type: String, required: true },
  academicYear: { type: String, required: true },
  needsAndFocus: { type: NeedsAndFocusSchema, required: true },
  goal: { type: GoalSchema, required: true },
  weeklyPlans: [WeeklyVisitPlanSchema],
  implementationRecords: [ImplementationRecordSchema],
  endOfCycleAnalysis: { type: EndOfCycleAnalysisSchema },
  status: { type: String, enum: Object.values(CoachingActionPlanStatuses), default: "draft" },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  cycleLength: { type: Number, default: 3 },
  relatedVisits: [{ type: String }],
  relatedCycles: [{ type: String }],
  ...standardDocumentFields
};

const CoachingActionPlanSchema = new mongoose.Schema(coachingActionPlanFields, {
  ...standardSchemaOptions,
  collection: 'coachingactionplans'
});

export const CoachingActionPlanModel = mongoose.models.CoachingActionPlan || 
  mongoose.model("CoachingActionPlan", CoachingActionPlanSchema); 