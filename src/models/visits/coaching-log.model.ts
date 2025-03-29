import { getModelForClass, prop, modelOptions } from "@typegoose/typegoose";
import mongoose from "mongoose";
import {
  YesNoEnum,
  LengthTypeEnum,
  TeacherLeaderTypeEnum,
} from "../shared";

@modelOptions({ schemaOptions: { timestamps: true } })
export class CoachingLog {
  @prop({ type: String })
  _id?: string;

  @prop({ enum: YesNoEnum, type: String, required: true })
  reasonDone!: YesNoEnum;

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

  @prop({ enum: LengthTypeEnum, type: String, required: true })
  totalDuration!: LengthTypeEnum;

  @prop({ enum: TeacherLeaderTypeEnum, type: String, required: true })
  Solvestouchpoint!: TeacherLeaderTypeEnum;

  @prop({ type: String, required: true })
  PrimaryStrategy!: string;

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