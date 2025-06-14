import mongoose from "mongoose";
import {
  YesNoEnum,
  LengthTypeEnum,
  TeacherLeaderTypeEnum,
} from "@enums";
import { standardSchemaOptions, standardDocumentFields } from '@mongoose-schema/shared-options';

const coachingLogFields = {
  reasonDone: { type: String, enum: Object.values(YesNoEnum), required: true },
  microPLTopic: { type: String },
  microPLDuration: { type: Number },
  modelTopic: { type: String },
  modelDuration: { type: Number },
  adminMeet: { type: Boolean },
  adminMeetDuration: { type: Number },
  NYCDone: { type: Boolean },
  totalDuration: { type: String, enum: Object.values(LengthTypeEnum), required: true },
  solvesTouchpoint: { type: String, enum: Object.values(TeacherLeaderTypeEnum), required: true },
  primaryStrategy: { type: String, required: true },
  solvesSpecificStrategy: { type: String, required: true },
  aiSummary: { type: String },
  ...standardDocumentFields
};

const CoachingLogSchema = new mongoose.Schema(coachingLogFields, {
  ...standardSchemaOptions,
  collection: 'coachinglogs'
});

export const CoachingLogModel = mongoose.models.CoachingLog || 
  mongoose.model("CoachingLog", CoachingLogSchema);

export async function getCoachingLogModel() {
  return CoachingLogModel;
}
