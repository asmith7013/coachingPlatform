import mongoose from "mongoose";
import { getModelForClass, prop, modelOptions } from "@typegoose/typegoose";
import { GradeLevels } from "@enums";
// import { connectToDB } from "@data-server/db/connection";
import { getModel } from "@server/db/model-registry";
import { BaseMongooseDocument } from "@mongoose-schema/base-document";
import { standardSchemaOptions } from "@server/db/mongoose-transform-helper";

@modelOptions({ 
  schemaOptions: {
    ...standardSchemaOptions,
    collection: 'schools', // Explicit collection name
  } 
})
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


// Keep for backward compatibility
export const SchoolModel =
  mongoose.models.School || getModelForClass(School);

export async function getSchoolModel() {
  return getModel<School>('School', () => getModelForClass(School));
}
