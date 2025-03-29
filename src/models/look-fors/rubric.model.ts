import { getModelForClass, prop, modelOptions } from "@typegoose/typegoose";
import mongoose from "mongoose"; // Required for model cache

@modelOptions({ schemaOptions: { timestamps: true } })
class Rubric {
  @prop({ type: Number, required: true })
  score!: number;

  @prop({ type: () => [String], required: true })
  category!: string[];

  @prop({ type: () => [String] })
  content?: string[];

  @prop({ type: String })
  parentId?: string;

  @prop({ type: String })
  collectionId?: string;

  @prop({ type: String })
  hex?: string;
}

@modelOptions({ schemaOptions: { timestamps: true } })
class RubricScore {
  @prop({ type: String, required: true })
  date!: string;

  @prop({ type: Number, required: true })
  score!: number;

  @prop({ type: String, required: true })
  staffId!: string;

  @prop({ type: String, required: true })
  school!: string;

  @prop({ type: () => [String], required: true })
  owners!: string[];

  @prop({ type: Date })
  createdAt?: Date;

  @prop({ type: Date })
  updatedAt?: Date;
}

export const RubricModel =
  mongoose.models.Rubric || getModelForClass(Rubric);

export const RubricScoreModel =
  mongoose.models.RubricScore || getModelForClass(RubricScore);

export { Rubric, RubricScore };