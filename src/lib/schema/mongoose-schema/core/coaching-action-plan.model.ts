import { getModelForClass, prop, modelOptions } from "@typegoose/typegoose";
import mongoose from "mongoose"; 
import { getModel } from "@server/db/model-registry";
import { BaseMongooseDocument } from "@mongoose-schema/base-document";

// Evidence nested class
@modelOptions({ 
  schemaOptions: { 
    _id: false 
  } 
})
class Evidence {
  @prop({ type: String, required: true })
  type!: string;
  
  @prop({ type: String, required: true })
  description!: string;
  
  @prop({ type: String })
  url?: string;
  
  @prop({ type: Date })
  date?: Date;
}

// Metric nested class
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
  
  @prop({ type: String })
  baselineValue?: string;
  
  @prop({ type: String })
  targetValue?: string;
  
  @prop({ type: String })
  measurementMethod?: string;
}

// Outcome nested class
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

// Goal nested class - aligned with Zod schema
@modelOptions({ 
  schemaOptions: { 
    _id: false 
  } 
})
class Goal {
  @prop({ type: String, required: true })
  description!: string;  // ✅ Changed from 'statement' to match Zod schema
  
  @prop({ type: () => [Outcome], required: true })
  teacherOutcomes!: Outcome[];
  
  @prop({ type: () => [Outcome], required: true })
  studentOutcomes!: Outcome[];
}

// Needs and Focus nested class - aligned with Zod schema (flattened structure)
@modelOptions({ 
  schemaOptions: { 
    _id: false 
  } 
})
class NeedsAndFocus {
  @prop({ type: String, required: true })
  ipgCoreAction!: string;  // ✅ Direct field, matches Zod: ipgCoreAction
  
  @prop({ type: String, required: true })
  ipgSubCategory!: string; // ✅ Direct field, matches Zod: ipgSubCategory
  
  @prop({ type: String, required: true })
  rationale!: string;      // ✅ Direct field, matches Zod: rationale
  
  @prop({ type: String })
  pdfAttachment?: string;  // ✅ Direct field, matches Zod: pdfAttachment
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
  
  @prop({ type: String, required: true })
  cycleNumber!: string;
  
  @prop({ type: String, required: true })
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
  
  @prop({ type: String, default: "planned" })
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
  
  @prop({ type: String, required: true })
  cycleNumber!: string;
  
  @prop({ type: String, required: true })
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

// End of Cycle Analysis nested class
@modelOptions({ 
  schemaOptions: { 
    _id: false 
  } 
})
class EndOfCycleAnalysis {
  @prop({ type: Boolean, required: true })
  goalMet!: boolean;
  
  @prop({ type: String, required: true })
  impactOnLearning!: string;
  
  @prop({ type: () => [Evidence] })
  overallEvidence?: Evidence[];
  
  @prop({ type: String })
  lessonsLearned?: string;
  
  @prop({ type: String })
  recommendationsForNext?: string;
}

// Main Coaching Action Plan class
@modelOptions({ 
  schemaOptions: { 
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

  @prop({ type: String, default: "draft" })
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

  @prop({ type: () => [String], required: true })
  owners!: string[];
}

// Model exports
export const CoachingActionPlanModel = mongoose.models.CoachingActionPlan || getModelForClass(CoachingActionPlan);

// Use model registry for async access
export async function getCoachingActionPlanModel() {
  return getModel<CoachingActionPlan>('CoachingActionPlan', () => getModelForClass(CoachingActionPlan));
} 