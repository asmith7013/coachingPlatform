import { getModelForClass, prop, modelOptions } from "@typegoose/typegoose";
import mongoose from "mongoose";
import { getModel } from "@server/db/model-registry";
import { BaseMongooseDocument } from "@mongoose-schema/base-document";

export class Rubric extends BaseMongooseDocument {
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

@modelOptions({ 
  schemaOptions: { 
    collection: 'rubricscores' 
  } 
})
export class RubricScore extends BaseMongooseDocument {
  @prop({ type: Date, required: true })
  date!: Date;

  @prop({ type: Number, required: true })
  score!: number;

  @prop({ type: String, required: true })
  staffId!: string;

  @prop({ type: String, required: true })
  schoolId!: string;
}

export const RubricModel =
  mongoose.models.Rubric || getModelForClass(Rubric, { schemaOptions: { collection: 'rubrics' } });

export const RubricScoreModel =
  mongoose.models.RubricScore || getModelForClass(RubricScore);

export async function getRubricModel() {
  return getModel<Rubric>('Rubric', () => getModelForClass(Rubric));
}

export async function getRubricScoreModel() {
  return getModel<RubricScore>('RubricScore', () => getModelForClass(RubricScore));
}