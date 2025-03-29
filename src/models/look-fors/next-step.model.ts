import { getModelForClass, prop, modelOptions } from "@typegoose/typegoose";
import mongoose from "mongoose"; // Required for model cache

@modelOptions({ schemaOptions: { timestamps: true } })
class NextStep {
  @prop({ type: String })
  _id?: string;

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

  @prop({ type: Date })
  createdAt?: Date;

  @prop({ type: Date })
  updatedAt?: Date;
}

export const NextStepModel =
  mongoose.models.NextStep || getModelForClass(NextStep);

export { NextStep };