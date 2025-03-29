import { getModelForClass, prop, modelOptions } from "@typegoose/typegoose";
import mongoose from "mongoose";

@modelOptions({ schemaOptions: { timestamps: true } })
export class Rubric {
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
export class LookFor {
  @prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  _id?: mongoose.Types.ObjectId;
  @prop({ type: () => [String], required: true })
  schools!: string[];
  @prop({ type: () => [String], required: true })
  teachers!: string[];
  @prop({ type: String, required: true })
  topic!: string;
  @prop({ type: String, required: true })
  description!: string;
  @prop({ type: String, required: true })
  studentFacing!: string;
  @prop({ type: String })
  category?: string;
  @prop({ type: String })
  status?: string;
  @prop({ type: () => [Rubric], required: true })
  rubric!: Rubric[];
  @prop({ type: () => [String], required: true })
  owners!: string[];
  @prop({ type: Date })
  createdAt?: Date;
  @prop({ type: Date })
  updatedAt?: Date;
}

@modelOptions({ schemaOptions: { timestamps: true } })
export class LookForItem {
  @prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  _id!: mongoose.Types.ObjectId;
  @prop({ type: String, required: true })
  originalLookFor!: string;
  @prop({ type: String, required: true })
  title!: string;
  @prop({ type: String, required: true })
  description!: string;
  @prop({ type: () => [String], required: true })
  tags!: string[];
  @prop({ type: Number, required: true })
  lookForIndex!: number;
  @prop({ type: () => [String], required: true })
  teacherIDs!: string[];
  @prop({ type: () => [String], required: true })
  chosenBy!: string[];
  @prop({ type: Boolean, required: true })
  active!: boolean;
}

export const RubricModel = mongoose.models.Rubric || getModelForClass(Rubric);
export const LookForModel = mongoose.models.LookFor || getModelForClass(LookFor);
export const LookForItemModel = mongoose.models.LookForItem || getModelForClass(LookForItem);