import { getModelForClass, prop, modelOptions } from "@typegoose/typegoose";
import mongoose from "mongoose";
import {
  YesNoEnum,
  LengthTypeEnum,
  TeacherLeaderTypeEnum,
} from "@enums";
import { getModel } from "@data-server/db/model-registry";
import { BaseMongooseDocument } from "@mongoose-schema/base-document";

@modelOptions({ schemaOptions: { collection: 'coachinglogs' } })
export class CoachingLog extends BaseMongooseDocument {
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
}

export const CoachingLogModel =
  mongoose.models.CoachingLog || getModelForClass(CoachingLog);

export async function getCoachingLogModel() {
  return getModel<CoachingLog>('CoachingLog', () => getModelForClass(CoachingLog));
}
