import { getModelForClass, prop } from "@typegoose/typegoose";
import mongoose from "mongoose";
import { getModel } from "@server/db/model-registry";
import { BaseMongooseDocument } from "@mongoose-schema/base-document";

export class LookFor extends BaseMongooseDocument {
  @prop({ type: Number, required: true })
  lookForIndex!: number;

  @prop({ type: () => [String], required: true })
  schoolIds!: string[];

  @prop({ type: () => [String], required: true })
  teacherIds!: string[];

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

  @prop({ type: () => [String] })
  rubricIds?: string[];
}

export class LookForItem extends BaseMongooseDocument {
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

export const LookForModel =
  mongoose.models.LookFor || getModelForClass(LookFor, { schemaOptions: { collection: 'lookfors' } });
export const LookForItemModel =
  mongoose.models.LookForItem || getModelForClass(LookForItem, { schemaOptions: { collection: 'lookforitems' } });

export async function getLookForModel() {
  return getModel<LookFor>('LookFor', () => getModelForClass(LookFor));
}

export async function getLookForItemModel() {
  return getModel<LookForItem>('LookForItem', () => getModelForClass(LookForItem));
}