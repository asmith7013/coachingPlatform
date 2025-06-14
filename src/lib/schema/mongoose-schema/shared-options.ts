import { SchemaOptions } from 'mongoose';
import mongoose from 'mongoose';

/**
 * SINGLE SOURCE transform function for ALL Mongoose documents
 * Converts ObjectIds to strings and handles dates consistently, recursively
 */
export function standardTransform(_: unknown, ret: Record<string, unknown>): Record<string, unknown> {
  // Debug: Log when transform is called
  // console.log('🔄 Transform called for document with _id:', ret._id);
  
  function transformValue(value: unknown): unknown {
    if (value === null || value === undefined) return value;

    // ObjectId detection - check for actual ObjectId instances
    if (value && typeof value === 'object' && value.constructor) {
      // More robust ObjectId detection
      if (value.constructor.name === 'ObjectId' || 
          value instanceof mongoose.Types.ObjectId ||
          (value as { _bsontype?: string })._bsontype === 'ObjectId') {
        // console.log('🔧 Converting ObjectId to string:', value);
        return value.toString();
      }
    }

    // Date
    if (value instanceof Date) {
      // console.log('📅 Converting Date to ISO string:', value);
      return value.toISOString();
    }

    // Array (recursive)
    if (Array.isArray(value)) {
      return value.map(transformValue);
    }

    // Plain object (recursive, but skip Buffer, Map, etc.)
    if (typeof value === 'object' && value.constructor && value.constructor.name === 'Object') {
      return standardTransform(null, value as Record<string, unknown>);
    }

    return value;
  }

  const result: Record<string, unknown> = { ...ret };

  // Convert _id to string and add id field
  if (result._id) {
    const transformedId = transformValue(result._id);
    // console.log('🆔 Transformed _id from:', result._id, 'to:', transformedId);
    result._id = transformedId;
    result.id = transformedId;
  }

  // Recursively transform all fields
  Object.keys(result).forEach(key => {
    if (key === '_id' || key === 'id') return;
    // const originalValue = result[key];
    const transformedValue = transformValue(result[key]);
    
    // Log transformations for debugging
    // if (originalValue !== transformedValue) {
    //   console.log(`🔧 Transformed ${key}:`, originalValue, '→', transformedValue);
    // }
    
    result[key] = transformedValue;
  });

  // Remove Mongoose internals
  delete result.__v;

  // console.log('✅ Transform completed. Final _id:', result._id, 'Type:', typeof result._id);
  
  return result;
}

/**
 * Standard schema options for all document models
 * Provides consistent transformation behavior across the application
 */
export const standardSchemaOptions: SchemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: standardTransform
  },
  toObject: {
    virtuals: true,
    transform: standardTransform
  }
};

/**
 * Standard fields that most documents need
 * Add these to your schema definition
 */
export const standardDocumentFields = {
  ownerIds: {
    type: [String],
    default: [],
    required: false
  }
};

/**
 * Utility to create schema with standard options and custom collection name
 */
export function createStandardSchema(
  fields: Record<string, unknown>,
  collectionName?: string
): SchemaOptions {
  return {
    ...standardSchemaOptions,
    ...(collectionName && { collection: collectionName })
  };
}