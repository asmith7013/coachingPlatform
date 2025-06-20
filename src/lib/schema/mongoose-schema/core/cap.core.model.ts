import mongoose from "mongoose";
import { standardSchemaOptions, standardDocumentFields } from '@mongoose-schema/shared-options';

// Define embedded schemas
const WeeklyPlanEmbeddedSchema = new mongoose.Schema({
  date: { type: String, default: '' },
  cycleNumber: { type: String, required: true },
  visitNumber: { type: String, required: true },
  focus: { type: String, default: '' },
  lookFor: { type: String, default: '' },
  coachAction: { type: String, default: '' },
  teacherAction: { type: String, default: '' },
  progressMonitoring: { type: String, default: '' },
  visitId: { type: String, default: '' },
  status: { type: String, default: 'planned' },
  expectedMetrics: [{ type: String }]
}, { _id: false }); // No separate _id for embedded docs

const MetricEmbeddedSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  type: { type: String, default: '' },
  description: { type: String, default: '' },
  collectionMethod: { type: String, required: true },
  baselineValue: { type: String, default: '' },
  targetValue: { type: String, default: '' },
  currentValue: { type: String, default: '' },
  notes: { type: String, default: '' }
}, { _id: false });

const OutcomeEmbeddedSchema = new mongoose.Schema({
  type: { type: String, default: '' },
  description: { type: String, default: '' },
  achieved: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
  metrics: [MetricEmbeddedSchema], // Embedded metrics within outcomes
  evidence: [{
    type: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    content: { type: String, default: '' },
    url: { type: String, default: '' },
    uploadedFile: { type: String, default: '' },
    dateCollected: { type: String, required: true }
  }]
}, { _id: false });

const EvidenceEmbeddedSchema = new mongoose.Schema({
  visitId: { type: String, default: '' },
  type: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  content: { type: String, default: '' },
  url: { type: String, default: '' },
  uploadedFile: { type: String, default: '' },
  dateCollected: { type: String, required: true }
}, { _id: false });

const ImplementationRecordEmbeddedSchema = new mongoose.Schema({
  date: { type: String, default: '' },
  visitId: { type: String, default: '' },
  cycleNumber: { type: String, required: true },
  visitNumber: { type: String, required: true },
  lookForImplemented: { type: String, default: '' },
  glows: [{ type: String }],
  grows: [{ type: String }],
  successMetrics: [{ type: String }],
  nextSteps: [{ type: String }],
  teacherReflection: { type: String, default: '' },
  coachNotes: { type: String, default: '' }
}, { _id: false });

// Main CAP schema with embedded documents
const schemaFields = {
  // Core fields (unchanged)
  title: { type: String, default: '' },
  teachers: [{ type: String }],
  coaches: [{ type: String }],
  school: { type: String, default: '' },
  academicYear: { type: String, default: '2024-2025' },
  
  // Focus fields (unchanged)
  ipgCoreAction: { type: String, default: 'CA1' },
  ipgSubCategory: { type: String, default: 'CA1A' },
  rationale: { type: String, default: '' },
  pdfAttachment: { type: String, default: '' },
  goalDescription: { type: String, default: '' },
  
  // Status fields (unchanged)
  status: { type: String, default: 'draft' },
  startDate: { type: String, required: true },
  endDate: { type: String, default: '' },
  cycleLength: { type: Number, default: 3 },
  
  // Achievement fields (unchanged)
  goalMet: { type: Boolean, default: false },
  impactOnLearning: { type: String, default: '' },
  lessonsLearned: { type: String, default: '' },
  recommendationsForNext: { type: String, default: '' },
  
  // NEW: Embedded documents
  weeklyPlans: [WeeklyPlanEmbeddedSchema],
  outcomes: [OutcomeEmbeddedSchema],
  evidence: [EvidenceEmbeddedSchema],
  implementationRecords: [ImplementationRecordEmbeddedSchema],
  
  // Keep visit references
  relatedVisitsIds: [{ type: String }],
  relatedCyclesIds: [{ type: String }],
  
  ...standardDocumentFields
};

// Create schema with timestamps and standard transform
const CoachingActionPlanSchema = new mongoose.Schema(schemaFields, standardSchemaOptions);

// Add indexes for performance
CoachingActionPlanSchema.index({ title: 1 });
CoachingActionPlanSchema.index({ school: 1 });
CoachingActionPlanSchema.index({ status: 1 });
CoachingActionPlanSchema.index({ startDate: 1 });
CoachingActionPlanSchema.index({ 'weeklyPlans.date': 1 });
CoachingActionPlanSchema.index({ ownerIds: 1 });
CoachingActionPlanSchema.index({ school: 1, academicYear: 1 });
CoachingActionPlanSchema.index({ teachers: 1 });
CoachingActionPlanSchema.index({ coaches: 1 });

// Create model, checking for existing models
export const CoachingActionPlanModel = mongoose.models.CoachingActionPlan || 
  mongoose.model("CoachingActionPlan", CoachingActionPlanSchema);
