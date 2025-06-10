import { getModelForClass, prop, modelOptions } from "@typegoose/typegoose";
import mongoose from "mongoose"; 
import { getModel } from "@server/db/model-registry";
import { BaseMongooseDocument } from "@mongoose-schema/base-document";
import { standardSchemaOptions } from "@server/db/mongoose-transform-helper";

// LookForItem remains as a nested class
@modelOptions({ 
  schemaOptions: { 
    _id: false // Nested documents shouldn't have their own _id
  } 
})
class LookForItem {
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

// Main Cycle class now extends BaseMongooseDocument
@modelOptions({ 
  schemaOptions: { 
    ...standardSchemaOptions,
    collection: 'cycles',
  } 
})
class Cycle extends BaseMongooseDocument {
  @prop({ type: Number, required: true })
  cycleNum!: number;

  @prop({ type: String })
  ipgIndicator?: string;

  @prop({ type: String })
  actionPlanURL?: string;

  @prop({ type: String, required: true })
  implementationIndicator!: string;

  @prop({ type: String })
  supportCycle?: string;

  @prop({ type: () => [LookForItem], required: true })
  lookFors!: LookForItem[];
}

// Keep existing model exports for backward compatibility
export const CycleModel = mongoose.models.Cycle || getModelForClass(Cycle);

// Use model registry for async access
export async function getCycleModel() {
  return getModel<Cycle>('Cycle', () => getModelForClass(Cycle));
}