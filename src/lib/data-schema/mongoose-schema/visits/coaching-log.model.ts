import { getModelForClass, prop, modelOptions } from "@typegoose/typegoose";
import mongoose from "mongoose";
import {
  YesNoEnum,
  LengthTypeEnum,
  TeacherLeaderTypeEnum,
} from "@enums";

@modelOptions({ schemaOptions: { timestamps: true, collection: 'coachinglogs' } })
export class CoachingLog {

  @prop({ enum: Object.values(YesNoEnum), type: String, required: true })
  reasonDone!: string;

  @prop({ type: String })
  microPLTopic?: string;

  @prop({ type: Number })
  microPLDuration?: number;

  @prop({ type: String })
  modelTopic?: string;

  @prop({ type: Number })
  modelDuration?: number;

  @prop({ type: Boolean })
  adminMeet?: boolean;

  @prop({ type: Number })
  adminMeetDuration?: number;

  @prop({ type: Boolean })
  NYCDone?: boolean;

  @prop({ enum: Object.values(LengthTypeEnum), type: String, required: true })
  totalDuration!: string;

  @prop({ enum: Object.values(TeacherLeaderTypeEnum), type: String, required: true })
  solvesTouchpoint!: string;

  @prop({ type: String, required: true })
  primaryStrategy!: string;

  @prop({ type: String, required: true })
  solvesSpecificStrategy!: string;

  @prop({ type: String })
  aiSummary?: string;

  @prop({ type: () => [String], required: true })
  owners!: string[];

  @prop({ type: Date })
  createdAt?: Date;

  @prop({ type: Date })
  updatedAt?: Date;
}

export const CoachingLogModel =
  mongoose.models.CoachingLog || getModelForClass(CoachingLog);