import mongoose from "mongoose";
import { getModelForClass, prop, modelOptions } from "@typegoose/typegoose";
import { AllowedGradeEnum } from "@models/shared/shared-types.model";

@modelOptions({ schemaOptions: { timestamps: true } })
class School {
  // @prop({ type: mongoose.Types.ObjectId, required: true })
  // _id!: mongoose.Types.ObjectId;

  @prop({ type: String, required: true })
  schoolNumber!: string;

  @prop({ type: String, required: true })
  district!: string;

  @prop({ type: String, required: true })
  schoolName!: string;

  @prop({ type: String })
  address?: string;

  @prop({ type: String })
  emoji?: string;

  @prop({ type: () => [String], required: true, enum: AllowedGradeEnum })
  gradeLevelsSupported!: string[];

  @prop({ type: () => [String], required: true })
  staffList!: string[];

  @prop({ type: () => [String], required: true })
  schedules!: string[];

  @prop({ type: () => [String], required: true })
  cycles!: string[];

  @prop({ type: () => [String], required: true })
  owners!: string[];

  @prop({ type: Date })
  createdAt?: Date;

  @prop({ type: Date })
  updatedAt?: Date;
}

export const SchoolModel =
  mongoose.models.School || getModelForClass(School);