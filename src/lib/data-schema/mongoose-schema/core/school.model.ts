import mongoose from "mongoose";
import { getModelForClass, prop, modelOptions } from "@typegoose/typegoose";
import { GradeLevels } from "@data-schema/enum";

@modelOptions({ schemaOptions: { timestamps: true } })
class School {

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

  @prop({ type: () => [String], required: true, enum: Object.values(GradeLevels) })
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