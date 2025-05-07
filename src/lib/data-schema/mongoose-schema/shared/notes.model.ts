import mongoose from "mongoose";
import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { getModel } from "@data-server/db/model-registry";

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

export async function getNoteModel() {
  return getModel<Note>('Note', () => getModelForClass(Note));
}
