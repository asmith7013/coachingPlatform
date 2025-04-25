import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import mongoose from "mongoose";
import {
  AllowedPurposes,
  EventTypes,
  ModeDone,
  GradeLevels,
  DurationValues,
} from "@data-schema/enum";

@modelOptions({ schemaOptions: { timestamps: true, _id: false } })
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

@modelOptions({ schemaOptions: { timestamps: true, _id: false } })
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

@modelOptions({ schemaOptions: { timestamps: true } })
export class Visit {
  @prop({ required: true })
  date!: string;

  @prop({ required: true })
  school!: string;

  @prop({ required: true })
  coach!: string;

  @prop({ required: true })
  cycleRef!: string;

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
}

export const EventItemModel = mongoose.models.EventItem || getModelForClass(EventItem);
export const SessionLinkModel = mongoose.models.SessionLink || getModelForClass(SessionLink);
export const VisitModel = mongoose.models.Visit || getModelForClass(Visit);