import { getModelForClass, prop, modelOptions } from "@typegoose/typegoose";
import mongoose, { Types } from "mongoose"; // Required for model cache
import { getModel } from "@data-server/db/model-registry";
@modelOptions({ schemaOptions: { timestamps: true, collection: 'rubrics' } })
export class Rubric {
  @prop({ type: Types.ObjectId, required: true })
  _id!: Types.ObjectId;

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

@modelOptions({ schemaOptions: { timestamps: true, collection: 'rubricscores' } })
export class RubricScore {
  @prop({ type: Types.ObjectId, required: true })
  _id!: Types.ObjectId;

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
}

export const RubricModel =
  mongoose.models.Rubric || getModelForClass(Rubric);

export const RubricScoreModel =
  mongoose.models.RubricScore || getModelForClass(RubricScore);

export async function getRubricModel() {
  return getModel<Rubric>('Rubric', () => getModelForClass(Rubric));
}

export async function getRubricScoreModel() {
  return getModel<RubricScore>('RubricScore', () => getModelForClass(RubricScore));
}