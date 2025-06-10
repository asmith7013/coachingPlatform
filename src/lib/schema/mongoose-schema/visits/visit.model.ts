import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import mongoose from "mongoose";
import {
  AllowedPurposes,
  SessionPurposes,
  ModeDone,
  GradeLevels,
  DurationValues,
  ScheduleAssignment,
} from "@enums";
import { getModel } from "@server/db/model-registry";
import { BaseMongooseDocument } from "@mongoose-schema/base-document";
import { standardSchemaOptions } from "@server/db/mongoose-transform-helper";

// Time Slot nested class (matches TimeSlotZodSchema)
@modelOptions({ 
  schemaOptions: { 
    _id: false 
  } 
})
export class TimeSlot {
  @prop({ type: String, required: true })
  startTime!: string; // Format: "HH:MM" (24-hour format)
  
  @prop({ type: String, required: true })
  endTime!: string; // Format: "HH:MM" (24-hour format)
  
  @prop({ type: Number })
  periodNum?: number; // Optional period number for bell schedule alignment
}

@modelOptions({ schemaOptions: { _id: false, collection: 'eventitems' } })
export class EventItem {
  // Existing fields
  @prop({ 
    type: String, 
    enum: Object.values(SessionPurposes), 
    required: true 
  })
  eventType!: string;

  @prop({ type: () => [String], required: true })
  staffIds!: string[];

  @prop({ 
    type: String,
    enum: DurationValues,
    required: true 
  })
  duration!: string;

  // NEW: Scheduling fields from enhanced Zod schema
  @prop({ type: () => TimeSlot })
  timeSlot?: TimeSlot; // Time slot for this specific event

  @prop({ 
    type: String,
    enum: Object.values(SessionPurposes)
  })
  purpose?: string; // Specific purpose for this event

  @prop({ type: Number })
  periodNumber?: number; // Period number if relevant

  @prop({ 
    type: String,
    enum: Object.values(ScheduleAssignment)
  })
  portion?: string; // Full/first_half/second_half

  @prop({ type: Number })
  orderIndex?: number; // Order within the visit schedule

  @prop({ type: String })
  notes?: string; // Event-specific notes
}

@modelOptions({ schemaOptions: { _id: false, collection: 'sessionlinks' } })
export class SessionLink {
  @prop({ required: true })
  purpose!: string;

  @prop({ required: true })
  title!: string;

  @prop({ required: true })
  url!: string;

  @prop({ type: () => [String], required: true })
  staffIds!: string[];
}

@modelOptions({ 
  schemaOptions: { 
    ...standardSchemaOptions,
    collection: 'visits' 
  } 
})
export class Visit extends BaseMongooseDocument {
  @prop({ type: Date, required: true })
  date!: Date;

  @prop({ required: true })
  schoolId!: string;

  @prop({ required: true })
  coachId!: string;

  @prop({ type: String })
  cycleId?: string;

  @prop({ 
    type: String,
    enum: Object.values(AllowedPurposes) 
  })
  allowedPurpose?: string;

  @prop({ 
    type: String,
    enum: Object.values(ModeDone) 
  })
  modeDone?: string;

  @prop({ 
    type: [String], 
    enum: Object.values(GradeLevels), 
    default: [] 
  })
  gradeLevelsSupported!: string[];

  @prop({ type: () => [EventItem] })
  events?: EventItem[];

  @prop({ type: () => [SessionLink] })
  sessionLinks?: SessionLink[];

  // NEW: Planned schedule integration field from Zod schema
  @prop({ type: String })
  plannedScheduleId?: string; // Reference to PlannedVisit for schedule builder integration

  // Monday.com integration fields
  @prop()
  mondayItemId?: string;

  @prop()
  mondayBoardId?: string;
  
  @prop()
  mondayItemName?: string;

  @prop({ type: Date })
  mondayLastSyncedAt?: Date;

  // Additional fields from Monday data
  @prop()
  siteAddress?: string;

  @prop({ type: Date })
  endDate?: Date;
}

export const TimeSlotModel = mongoose.models.TimeSlot || getModelForClass(TimeSlot);
export const EventItemModel = mongoose.models.EventItem || getModelForClass(EventItem);
export const SessionLinkModel = mongoose.models.SessionLink || getModelForClass(SessionLink);
export const VisitModel = mongoose.models.Visit || getModelForClass(Visit);

export async function getTimeSlotModel() {
  return getModel<TimeSlot>('TimeSlot', () => getModelForClass(TimeSlot));
}

export async function getVisitModel() {
  return getModel<Visit>('Visit', () => getModelForClass(Visit));
}

export async function getEventItemModel() {
  return getModel<EventItem>('EventItem', () => getModelForClass(EventItem));
}

export async function getSessionLinkModel() {
  return getModel<SessionLink>('SessionLink', () => getModelForClass(SessionLink));
}