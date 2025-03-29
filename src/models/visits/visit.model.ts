import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import mongoose from "mongoose";
import {
  AllowedPurposeEnum,
  DurationTypesEnum,
  EventTypesEnum,
  SettingTypesEnum,
  AllowedGradeEnum,
} from "../shared/shared-types.model";

@modelOptions({ schemaOptions: { timestamps: true } })
export class EventItem {
  @prop({ enum: EventTypesEnum, required: true })
  type!: EventTypesEnum;

  @prop({ type: () => [String], required: true })
  staff!: string[];

  @prop({ enum: DurationTypesEnum, required: true })
  duration!: DurationTypesEnum;
}

@modelOptions({ schemaOptions: { timestamps: true } })
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
  @prop()
  _id?: string;

  @prop({ required: true })
  date!: string;

  @prop({ required: true })
  school!: string;

  @prop({ required: true })
  coach!: string;

  @prop({ required: true })
  cycleRef!: string;

  @prop({ enum: AllowedPurposeEnum })
  purpose?: AllowedPurposeEnum;

  @prop({ enum: SettingTypesEnum })
  modeDone?: SettingTypesEnum;

  @prop({ type: () => [String], enum: AllowedGradeEnum, default: [] })
  gradeLevelsSupported!: AllowedGradeEnum[];

  @prop({ type: () => [EventItem] })
  events?: EventItem[];

  @prop({ type: () => [SessionLink] })
  sessionLinks?: SessionLink[];

  @prop({ type: () => [String], required: true })
  owners!: string[];

  @prop()
  createdAt?: Date;

  @prop()
  updatedAt?: Date;
}

export const EventItemModel = mongoose.models.EventItem || getModelForClass(EventItem);
export const SessionLinkModel = mongoose.models.SessionLink || getModelForClass(SessionLink);
export const VisitModel = mongoose.models.Visit || getModelForClass(Visit);