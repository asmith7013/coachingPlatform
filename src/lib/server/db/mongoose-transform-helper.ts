// src/lib/server/db/mongoose-transform-helper.ts
import { Document, SchemaOptions } from 'mongoose';
import { RawMongoDocument } from '@core-types/mongo';

/**
 * Standard transform function for all Mongoose models
 * Returns plain objects suitable for client serialization while preserving Date objects
 */
export function standardMongooseTransform(
  doc: Document, 
  ret: RawMongoDocument
): Record<string, unknown> {
  // Convert _id to string and add id field
  if (ret._id) {
    const idString = ret._id.toString();
    ret.id = idString;
    ret._id = idString;
  }
  
  // Remove __v field
  delete ret.__v;
  
  // Don't break dates!
  return ret;
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

export function isMongoDocument(obj: unknown): boolean {
  return obj !== null && typeof obj === 'object' && '_id' in (obj as object);
}

/**
 * Simple document processor - no longer needed as models handle conversion
 */
export function processMongoDocument<T>(doc: T): T {
  return doc; // Models handle ObjectId conversion via toJSON
} 