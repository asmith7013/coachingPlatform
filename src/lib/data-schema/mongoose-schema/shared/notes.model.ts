import mongoose from "mongoose";
import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";

@modelOptions({ schemaOptions: { timestamps: true, collection: 'notes' } })
export class Note {
  @prop({ type: String, required: true })
  date!: string;
  
  @prop({ type: String, required: true })
  type!: string;
  
  @prop({ type: String, required: true })
  heading!: string;
  
  @prop({ type: () => [String], required: true })
  subheading!: string[];
}

export const NoteModel = mongoose.models.Note || getModelForClass(Note); 