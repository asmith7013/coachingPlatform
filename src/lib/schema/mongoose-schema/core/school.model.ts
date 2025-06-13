import mongoose from "mongoose";
import { getModelForClass, prop } from "@typegoose/typegoose";
import { GradeLevels } from "@enums";
// import { connectToDB } from "@data-server/db/connection";
import { getModel } from "@server/db/model-registry";
import { BaseMongooseDocument } from "@mongoose-schema/base-document";

class School extends BaseMongooseDocument {

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
  mongoose.models.School || getModelForClass(School, { schemaOptions: { collection: 'schools' } });

export async function getSchoolModel() {
  return getModel<School>('School', () => getModelForClass(School));
}
