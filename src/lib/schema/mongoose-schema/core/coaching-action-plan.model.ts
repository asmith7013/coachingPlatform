import { getModelForClass, prop, modelOptions } from "@typegoose/typegoose";
import mongoose from "mongoose"; 
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
import { getModel } from "@server/db/model-registry";
import { BaseMongooseDocument } from "@mongoose-schema/base-document";
import { standardSchemaOptions } from "@server/db/mongoose-transform-helper";

// =====================================
// NESTED SCHEMA CLASSES
// =====================================

// Evidence nested class - aligned with clean Zod schema
@modelOptions({ 
  schemaOptions: { 
    _id: false 
  } 
})
class Evidence {
  @prop({ 
    type: String, 
    enum: Object.values(EvidenceTypes), 
    required: true 
  })
  type!: string;
  
  @prop({ type: String, required: true })
  title!: string;
  
  @prop({ type: String, required: true })
  description!: string;
  
  @prop({ type: String })
  content?: string;
  
  @prop({ type: String })
  url?: string;
  
  @prop({ type: String })
  uploadedFile?: string;
  
  @prop({ type: Date, required: true })
  dateCollected!: Date;
}

// Metric nested class - aligned with clean Zod schema
@modelOptions({ 
  schemaOptions: { 
    _id: false 
  } 
})
class Metric {
  @prop({ type: String, required: true })
  name!: string;
  
  @prop({ type: String, required: true })
  type!: string;
  
  @prop({ type: String, required: true })
  description!: string;
  
  @prop({ 
    type: String, 
    enum: Object.values(MetricCollectionMethods), 
    required: true 
  })
  collectionMethod!: string;
  
  @prop({ type: String })
  baselineValue?: string;
  
  @prop({ type: String, required: true })
  targetValue!: string;
  
  @prop({ type: String })
  currentValue?: string;
  
  @prop({ type: String })
  notes?: string;
}

// Outcome nested class - aligned with clean Zod schema
@modelOptions({ 
  schemaOptions: { 
    _id: false 
  } 
})
class Outcome {
  @prop({ type: String, required: true })
  type!: string;
  
  @prop({ type: String, required: true })
  description!: string;
  
  @prop({ type: () => [Metric], required: true })
  metrics!: Metric[];
  
  @prop({ type: () => [Evidence] })
  evidence?: Evidence[];
}

// Goal nested class - aligned with clean Zod schema
@modelOptions({ 
  schemaOptions: { 
    _id: false 
  } 
})
class Goal {
  @prop({ type: String, required: true })
  description!: string;
  
  @prop({ type: () => [Outcome], required: true })
  teacherOutcomes!: Outcome[];
  
  @prop({ type: () => [Outcome], required: true })
  studentOutcomes!: Outcome[];
}

// Needs and Focus nested class - aligned with clean Zod schema
@modelOptions({ 
  schemaOptions: { 
    _id: false 
  } 
})
class NeedsAndFocus {
  @prop({ 
    type: String, 
    enum: Object.values(IPGCoreActions), 
    required: true 
  })
  ipgCoreAction!: string;
  
  @prop({ 
    type: String, 
    enum: Object.values(IPGSubCategories), 
    required: true 
  })
  ipgSubCategory!: string;
  
  @prop({ type: String, required: true })
  rationale!: string;
  
  @prop({ type: String })
  pdfAttachment?: string;
}

// Weekly Visit Plan nested class
@modelOptions({ 
  schemaOptions: { 
    _id: false 
  } 
})
class WeeklyVisitPlan {
  @prop({ type: Date, required: true })
  date!: Date;
  
  @prop({ 
    type: String, 
    enum: Object.values(CoachingCycleNumbers), 
    required: true 
  })
  cycleNumber!: string;
  
  @prop({ 
    type: String, 
    enum: Object.values(VisitNumbers), 
    required: true 
  })
  visitNumber!: string;
  
  @prop({ type: String, required: true })
  focus!: string;
  
  @prop({ type: String, required: true })
  lookFor!: string;
  
  @prop({ type: String, required: true })
  coachAction!: string;
  
  @prop({ type: String, required: true })
  teacherAction!: string;
  
  @prop({ type: String, required: true })
  progressMonitoring!: string;
  
  @prop({ type: String })
  visitId?: string;
  
  @prop({ 
    type: String, 
    enum: Object.values(VisitStatuses), 
    default: "planned" 
  })
  status!: string;
}

// Implementation Record nested class
@modelOptions({ 
  schemaOptions: { 
    _id: false 
  } 
})
class ImplementationRecord {
  @prop({ type: Date, required: true })
  date!: Date;
  
  @prop({ type: String })
  visitId?: string;
  
  @prop({ 
    type: String, 
    enum: Object.values(CoachingCycleNumbers), 
    required: true 
  })
  cycleNumber!: string;
  
  @prop({ 
    type: String, 
    enum: Object.values(VisitNumbers), 
    required: true 
  })
  visitNumber!: string;
  
  @prop({ type: String, required: true })
  lookForImplemented!: string;
  
  @prop({ type: () => [String], required: true })
  glows!: string[];
  
  @prop({ type: () => [String], required: true })
  grows!: string[];
  
  @prop({ type: () => [String], required: true })
  successMetrics!: string[];
  
  @prop({ type: () => [String], required: true })
  nextSteps!: string[];
  
  @prop({ type: String })
  teacherReflection?: string;
  
  @prop({ type: String })
  coachNotes?: string;
}

// Metric Value nested class for analysis
@modelOptions({ 
  schemaOptions: { 
    _id: false 
  } 
})
class FinalMetricValue {
  @prop({ type: String, required: true })
  metricId!: string;
  
  @prop({ type: String, required: true })
  finalValue!: string;
  
  @prop({ type: Boolean, required: true })
  goalMet!: boolean;
}

// Outcome Analysis nested class
@modelOptions({ 
  schemaOptions: { 
    _id: false 
  } 
})
class OutcomeAnalysis {
  @prop({ type: String, required: true })
  outcomeId!: string;
  
  @prop({ type: Boolean, required: true })
  achieved!: boolean;
  
  @prop({ type: () => [Evidence], required: true })
  evidence!: Evidence[];
  
  @prop({ type: () => [FinalMetricValue], required: true })
  finalMetricValues!: FinalMetricValue[];
}

// End of Cycle Analysis nested class - aligned with clean Zod schema
@modelOptions({ 
  schemaOptions: { 
    _id: false 
  } 
})
class EndOfCycleAnalysis {
  @prop({ type: Boolean, required: true })
  goalMet!: boolean;
  
  @prop({ type: () => [OutcomeAnalysis], required: true })
  teacherOutcomeAnalysis!: OutcomeAnalysis[];
  
  @prop({ type: () => [OutcomeAnalysis], required: true })
  studentOutcomeAnalysis!: OutcomeAnalysis[];
  
  @prop({ type: String, required: true })
  impactOnLearning!: string;
  
  @prop({ type: () => [Evidence], required: true })
  overallEvidence!: Evidence[];
  
  @prop({ type: String })
  lessonsLearned?: string;
  
  @prop({ type: String })
  recommendationsForNext?: string;
}

// =====================================
// MAIN COACHING ACTION PLAN CLASS
// =====================================

// Main Coaching Action Plan class - follows established patterns
@modelOptions({ 
  schemaOptions: { 
    ...standardSchemaOptions,
    collection: 'coachingactionplans'
  } 
})
class CoachingActionPlan extends BaseMongooseDocument {
  @prop({ type: String, required: true })
  title!: string;

  @prop({ type: () => [String], required: true })
  teachers!: string[];

  @prop({ type: () => [String], required: true })
  coaches!: string[];

  @prop({ type: String, required: true })
  school!: string;

  @prop({ type: String, required: true })
  academicYear!: string;

  @prop({ type: () => NeedsAndFocus, required: true })
  needsAndFocus!: NeedsAndFocus;

  @prop({ type: () => Goal, required: true })
  goal!: Goal;

  @prop({ type: () => [WeeklyVisitPlan], required: true })
  weeklyPlans!: WeeklyVisitPlan[];

  @prop({ type: () => [ImplementationRecord] })
  implementationRecords?: ImplementationRecord[];

  @prop({ type: () => EndOfCycleAnalysis })
  endOfCycleAnalysis?: EndOfCycleAnalysis;

  @prop({ 
    type: String, 
    enum: Object.values(CoachingActionPlanStatuses), 
    default: "draft" 
  })
  status!: string;

  @prop({ type: Date, required: true })
  startDate!: Date;

  @prop({ type: Date })
  endDate?: Date;

  @prop({ type: Number, default: 3 })
  cycleLength!: number;

  @prop({ type: () => [String] })
  relatedVisits?: string[];

  @prop({ type: () => [String] })
  relatedCycles?: string[];
}

// =====================================
// MODEL EXPORTS
// =====================================

// Model exports - following established patterns
export const CoachingActionPlanModel = mongoose.models.CoachingActionPlan || getModelForClass(CoachingActionPlan);

// Use model registry for async access - following established patterns
export async function getCoachingActionPlanModel() {
  return getModel<CoachingActionPlan>('CoachingActionPlan', () => getModelForClass(CoachingActionPlan));
} 