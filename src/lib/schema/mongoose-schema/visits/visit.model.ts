import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import mongoose from "mongoose";
import {
  AllowedPurposes,
  EventTypes,
  ModeDone,
  GradeLevels,
  DurationValues,
} from "@enums";
import { getModel } from "@server/db/model-registry";
import { BaseMongooseDocument } from "@mongoose-schema/base-document";

@modelOptions({ schemaOptions: { _id: false, collection: 'eventitems' } })
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

@modelOptions({ schemaOptions: { _id: false, collection: 'sessionlinks' } })
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

@modelOptions({ schemaOptions: { collection: 'visits' } })
export class Visit extends BaseMongooseDocument {
  @prop({ type: Date, required: true })
  date!: Date;

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

  @prop({ type: Date })
  mondayLastSyncedAt?: Date;

  // Additional fields from Monday data
  @prop()
  siteAddress?: string;

  @prop({ type: Date })
  endDate?: Date;
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

