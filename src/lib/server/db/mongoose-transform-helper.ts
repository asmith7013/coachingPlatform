// src/lib/server/db/mongoose-transform-helper.ts
import { Document, SchemaOptions } from 'mongoose';
import { BaseDocument } from '@core-types/document';
import { RawMongoDocument } from '@core-types/mongo';

/**
 * Standard transform function for all Mongoose models
 * Converts ObjectId to string and adds id field
 */
export function standardMongooseTransform(
  doc: Document, 
  ret: RawMongoDocument
): BaseDocument {
  // Convert _id to string and add id field
  if (ret._id) {
    const idString = ret._id.toString();
    ret.id = idString;
    ret._id = idString;
  }
  
  // Remove __v field (Mongoose version key)
  delete ret.__v;
  
  return ret as BaseDocument;
}

/**
 * Standard schema options that all models should use
 */
export const standardSchemaOptions: SchemaOptions = {
  timestamps: true,
  toJSON: { 
    transform: standardMongooseTransform
  },
  toObject: { 
    transform: standardMongooseTransform
  }
};

/**
 * Helper for creating schema options with custom collection name
 */
export function createSchemaOptions(
  collectionName: string, 
  additionalOptions: Partial<SchemaOptions> = {}
): SchemaOptions {
  return {
    ...standardSchemaOptions,
    collection: collectionName,
    ...additionalOptions
  };
}