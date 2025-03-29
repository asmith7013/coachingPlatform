import { getModelForClass, prop, modelOptions } from "@typegoose/typegoose";
import mongoose from "mongoose"; // Import Mongoose

@modelOptions({ 
  schemaOptions: { 
    timestamps: true,
    collection: 'cycles' // Explicitly set collection name
  } 
})
export class Cycle {
  @prop({ type: String })
  _id?: string;

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

  @prop({ type: () => [String], required: true, default: [] })
  lookFors!: string[];

  @prop({ type: () => [String], required: true, default: [] })
  owners!: string[];

  @prop({ type: Date })
  createdAt?: Date;

  @prop({ type: Date })
  updatedAt?: Date;
}

// export const CycleModel = mongoose.models.Cycle || getModelForClass(Cycle);
// Ensure we don't create duplicate models
const existingModel = mongoose.models.Cycle;
export const CycleModel = existingModel || getModelForClass(Cycle);