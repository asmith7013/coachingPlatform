import { getModel } from "@server/db/model-registry";
import { getModelForClass, prop, modelOptions } from "@typegoose/typegoose";
import mongoose from "mongoose";
import { BaseMongooseDocument } from "@mongoose-schema/base-document";
import { standardSchemaOptions } from "@server/db/mongoose-transform-helper";

@modelOptions({ 
  schemaOptions: { 
    ...standardSchemaOptions,
    collection: 'nextsteps' 
  } 
})
export class NextStep extends BaseMongooseDocument {
  @prop({ type: String, required: true })
  description!: string;

  @prop({ type: String, required: true })
  lookForId!: string;

  @prop({ type: String, required: true })
  teacherId!: string;

  @prop({ type: String, required: true })
  schoolId!: string;
}

export const NextStepModel = mongoose.models.NextStep || getModelForClass(NextStep);

export async function getNextStepModel() {
  return getModel<NextStep>('NextStep', () => getModelForClass(NextStep));
}
  