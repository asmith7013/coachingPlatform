import { getModelForClass, prop, modelOptions } from "@typegoose/typegoose";
import mongoose from "mongoose";
import { getModel } from "@server/db/model-registry";
import { BaseMongooseDocument } from "@mongoose-schema/base-document";
import { DurationValues, ScheduleAssignment } from "@enums";

// Time Slot nested class (matches Zod schema)
@modelOptions({ 
  schemaOptions: { 
    _id: false 
  } 
})
class TimeSlot {
  @prop({ type: String, required: true })
  startTime!: string; // Format: "HH:MM" (24-hour format)
  
  @prop({ type: String, required: true })
  endTime!: string; // Format: "HH:MM" (24-hour format)
  
  @prop({ type: Number })
  periodNum?: number; // Optional period number for bell schedule alignment
}

// Main Planned Visit class
@modelOptions({ 
  schemaOptions: { 
    collection: 'plannedvisits'
  } 
})
export class PlannedVisit extends BaseMongooseDocument {
  // Core assignment data
  @prop({ type: String, required: true })
  teacherId!: string; // Required teacher ID
  
  @prop({ type: () => TimeSlot, required: true })
  timeSlot!: TimeSlot; // Required time slot information
  
  @prop({ type: String, required: true })
  purpose!: string; // Required purpose (coaching-specific or custom)
  
  @prop({ 
    type: String,
    enum: DurationValues,
    required: true 
  })
  duration!: string; // Required duration enum
  
  @prop({ type: Date, required: true })
  date!: Date; // Required date for the planned visit
  
  @prop({ type: String, required: true })
  coach!: string; // Required coach ID who created the plan
  
  // Planning metadata
  @prop({ 
    type: String,
    enum: Object.values(ScheduleAssignment),
    default: ScheduleAssignment.FULL_PERIOD
  })
  assignmentType!: string; // How teacher was assigned to slot
  
  @prop({ type: Boolean, default: false })
  customPurpose!: boolean; // Whether purpose is custom or predefined
  
  // Optional scheduling context
  @prop({ type: String })
  school?: string; // School ID for context
  
  @prop({ type: Number })
  periodNum?: number; // Period number if aligned with bell schedule
  
  @prop({ type: String })
  notes?: string; // Optional planning notes
  
  // Schedule builder state
  @prop({ type: String })
  scheduleId?: string; // Reference to parent schedule if grouped
  
  @prop({ type: Number })
  orderIndex?: number; // Order within the schedule
  
  // Required owners field (following established pattern)
  @prop({ type: () => [String], required: true })
  owners!: string[]; // Array of user IDs who can access this planned visit
}

// Export direct model (following VisitModel pattern)
export const PlannedVisitModel = mongoose.models.PlannedVisit || getModelForClass(PlannedVisit);

// Export model factory function (for advanced use cases)
export async function getPlannedVisitModel() {
  return getModel<PlannedVisit>('PlannedVisit', () => getModelForClass(PlannedVisit));
} 