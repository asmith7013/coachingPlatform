import { getModel } from "@data-server/db/model-registry";
import { getModelForClass, prop, modelOptions } from "@typegoose/typegoose";
import mongoose from "mongoose";
import { BaseMongooseDocument } from "@mongoose-schema/base-document";

@modelOptions({ schemaOptions: { collection: 'nextsteps' } })
export class NextStep extends BaseMongooseDocument {
  @prop({ type: String, required: true })
  description!: string;

  @prop({ type: String, required: true })
  lookFor!: string;

  @prop({ type: String, required: true })
  teacher!: string;

  @prop({ type: String, required: true })
  school!: string;

  @prop({ type: () => [String], required: true })
  owners!: string[];
}

export const NextStepModel = mongoose.models.NextStep || getModelForClass(NextStep);

export async function getNextStepModel() {
  return getModel<NextStep>('NextStep', () => getModelForClass(NextStep));
}
  