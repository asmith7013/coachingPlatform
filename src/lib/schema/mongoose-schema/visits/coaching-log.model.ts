import mongoose from "mongoose";
import {
  YesNoEnum,
  LengthTypeEnum,
  TeacherLeaderTypeEnum,
  TeacherSupportTypes,
  GradeLevels,
} from "@enums";
import { standardSchemaOptions, standardDocumentFields } from '@mongoose-schema/shared-options';

const coachingLogFields = {
  coachingActionPlanId: { type: String, required: true },
  visitId: { type: String, required: false },
  reasonDone: { type: String, enum: Object.values(YesNoEnum), required: true },
  microPLTopic: { type: String },
  microPLDuration: { type: Number },
  modelTopic: { type: String },
  modelDuration: { type: Number },
  
  // Travel Duration Fields
  schoolTravelDuration: { type: Number, default: 76 },
  finalTravelDuration: { type: Number, default: 76 },
  
  adminMeet: { type: Boolean },
  adminMeetDuration: { type: Number },
  NYCDone: { type: Boolean },
  totalDuration: { type: String, enum: Object.values(LengthTypeEnum), required: true },
  solvesTouchpoint: { type: String, enum: Object.values(TeacherLeaderTypeEnum), required: true },
  
  // NEW fields
  isContractor: { type: Boolean, default: true },
  teachersSupportedNumber: { type: Number, default: 1 },
  gradeLevelsSupported: [{ type: String, enum: Object.values(GradeLevels), default: [] }],
  teachersSupportedTypes: [{ type: String, enum: Object.values(TeacherSupportTypes), default: [] }],
  
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
