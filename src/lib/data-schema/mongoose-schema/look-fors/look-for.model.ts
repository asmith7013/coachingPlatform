import { getModelForClass, prop, modelOptions } from "@typegoose/typegoose";
import mongoose, { Types } from "mongoose";
import { Rubric } from "./rubric.model";
import { getModel } from "@/lib/data-server/db/model-registry";

@modelOptions({ schemaOptions: { timestamps: true, collection: 'lookfors' } })
export class LookFor {
  @prop({ type: Types.ObjectId, required: true })
  _id!: Types.ObjectId;

  @prop({ type: Number, required: true })
  lookForIndex!: number;

  @prop({ type: () => [String], required: true })
  schools!: string[];

  @prop({ type: () => [String], required: true })
  teachers!: string[];

  @prop({ type: String, required: true })
  topic!: string;

  @prop({ type: String, required: true })
  description!: string;

  @prop({ type: String })
  category?: string;

  @prop({ type: String })
  status?: string;

  @prop({ type: Boolean, required: true })
  studentFacing!: boolean;

  @prop({ type: () => [Rubric], required: true })
  rubric!: Rubric[];

  @prop({ type: () => [String], required: true })
  owners!: string[];
}

@modelOptions({ schemaOptions: { timestamps: true, collection: 'lookforitems' } })
export class LookForItem {
  @prop({ type: Types.ObjectId, required: true })
  _id!: Types.ObjectId;

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

export const LookForModel = mongoose.models.LookFor || getModelForClass(LookFor);
export const LookForItemModel = mongoose.models.LookForItem || getModelForClass(LookForItem);

export async function getLookForModel() {
  return getModel<LookFor>('LookFor', () => getModelForClass(LookFor));
}

export async function getLookForItemModel() {
  return getModel<LookForItem>('LookForItem', () => getModelForClass(LookForItem));
}