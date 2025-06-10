import mongoose from "mongoose";
import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { getModel } from "@server/db/model-registry";
import { BaseMongooseDocument } from "@mongoose-schema/base-document";
import { standardSchemaOptions } from "@server/db/mongoose-transform-helper";

@modelOptions({ 
  schemaOptions: { 
    ...standardSchemaOptions,
    collection: 'notes' 
  } 
})
export class Note extends BaseMongooseDocument {
  @prop({ type: Date, required: true })
  date!: Date;
  
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
