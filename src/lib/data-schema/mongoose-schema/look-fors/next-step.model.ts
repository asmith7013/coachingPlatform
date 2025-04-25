import { getModelForClass, prop, modelOptions } from "@typegoose/typegoose";
import mongoose, { Types } from "mongoose"; // Required for model cache

@modelOptions({ schemaOptions: { timestamps: true, collection: 'nextsteps' } })
export class NextStep {
  @prop({ type: Types.ObjectId, required: true })
  _id!: Types.ObjectId;

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