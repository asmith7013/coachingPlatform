import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import mongoose from "mongoose";
import {
  AllowedPurposes,
  EventTypes,
  ModeDone,
  GradeLevels,
  DurationValues,
} from "@enums";
import { getModel } from "@data-server/db/model-registry";

@modelOptions({ schemaOptions: { timestamps: true, _id: false, collection: 'eventitems' } })
export class EventItem {
  @prop({ 
    type: String, 
    enum: Object.values(EventTypes), 
    required: true 
  })
  eventType!: string;

  @prop({ type: () => [String], required: true })
  staff!: string[];

  @prop({ 
    type: String,
    enum: DurationValues,
    required: true 
  })
  duration!: string;
}

@modelOptions({ schemaOptions: { timestamps: true, _id: false, collection: 'sessionlinks' } })
export class SessionLink {
  @prop({ required: true })
  purpose!: string;

  @prop({ required: true })
  title!: string;

  @prop({ required: true })
  url!: string;

  @prop({ type: () => [String], required: true })
  staff!: string[];
}

@modelOptions({ schemaOptions: { timestamps: true, collection: 'visits' } })
export class Visit {
  @prop({ required: true })
  date!: string;

  @prop({ required: true })
  school!: string;

  @prop({ required: true })
  coach!: string;

  @prop({ type: String })
  cycleRef?: string;

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

  @prop({ type: () => [String], required: true })
  owners!: string[];

  // Monday.com integration fields
  @prop()
  mondayItemId?: string;

  @prop()
  mondayBoardId?: string;
  
  @prop()
  mondayItemName?: string;

  @prop()
  mondayLastSyncedAt?: string;

  // Additional fields from Monday data
  @prop()
  siteAddress?: string;

  @prop()
  endDate?: string;
}


export const EventItemModel = mongoose.models.EventItem || getModelForClass(EventItem);
export const SessionLinkModel = mongoose.models.SessionLink || getModelForClass(SessionLink);
export const VisitModel = mongoose.models.Visit || getModelForClass(Visit);

export async function getVisitModel() {
  return getModel<Visit>('Visit', () => getModelForClass(Visit));
}

export async function getEventItemModel() {
  return getModel<EventItem>('EventItem', () => getModelForClass(EventItem));
}

export async function getSessionLinkModel() {
  return getModel<SessionLink>('SessionLink', () => getModelForClass(SessionLink));
}

