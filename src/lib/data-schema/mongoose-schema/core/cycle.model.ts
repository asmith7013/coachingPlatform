import { getModelForClass, prop, modelOptions } from "@typegoose/typegoose";
import mongoose from "mongoose"; // Import Mongoose
import { getModel } from "@data-server/db/model-registry";


@modelOptions({ 
  schemaOptions: { 
    timestamps: true,
    collection: 'cycles' // Explicitly set collection name
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

@modelOptions({ 
  schemaOptions: { 
    timestamps: true,
    collection: 'cycles' // Explicitly set collection name
  } 
})
class Cycle {

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

  @prop({ type: () => [String], required: true })
  owners!: string[];
}

export const CycleModel = mongoose.models.Cycle || getModelForClass(Cycle);

export async function getCycleModel() {
  return getModel<Cycle>('Cycle', () => getModelForClass(Cycle));
}
