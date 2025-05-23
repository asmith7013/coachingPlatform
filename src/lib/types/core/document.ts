import { Types } from 'mongoose';
import { z } from 'zod';
import { BaseDocumentSchema } from '@zod-schema/base-schemas';

/**
 * Base document interface for all MongoDB documents
 */
export type BaseDocument = z.infer<typeof BaseDocumentSchema>;

/**
 * Create a MongoDB-specific type that supports ObjectId
 */
export type MongoBaseDocument = Omit<BaseDocument, '_id'> & {
  _id: string | Types.ObjectId;
};

/**
 * Type specifically for Mongoose transform functions
 * Focuses on fields that need special handling during transformation
 */
export type MongooseTransformDocument = {
  _id?: Types.ObjectId | string;
  id?: string;
  __v?: unknown;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  [key: string]: unknown;
};

/**
 * Base interface for document inputs (for creation/updates)
 * Omits system-generated fields
 */
export type DocumentInput<T extends BaseDocument> = Omit<T, '_id' | 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Utility functions for document operations
 */
export const DocumentUtils = {
  /**
   * Convert a document to client-safe format
   * Ensures _id is a string and adds id field
   */
  toClient<T extends BaseDocument>(doc: T): T & { id: string } {
    const idStr = typeof doc._id === 'string' ? doc._id : (doc._id as Types.ObjectId).toString();
    return {
      ...doc,
      _id: idStr,
      id: idStr
    };
  },
  
  /**
   * Check if an object is a BaseDocument
   */
  isDocument(obj: unknown): obj is BaseDocument {
    return obj !== null && 
           typeof obj === 'object' && 
           '_id' in obj;
  },
  
  /**
   * Parse date strings to Date objects
   */
  parseDates<T extends Record<string, unknown>>(
    doc: T, 
    dateFields: (keyof T)[] = ['createdAt', 'updatedAt']
  ): T {
    const result = { ...doc };
    
    dateFields.forEach(field => {
      const value = doc[field];
      if (typeof value === 'string') {
        result[field] = new Date(value) as unknown as T[typeof field];
      }
    });
    
    return result;
  }
};

// For the rare cases where these are needed
export type WithDateObjects<T extends { createdAt?: string | Date; updatedAt?: string | Date }> = 
  Omit<T, 'createdAt' | 'updatedAt'> & {
    createdAt?: Date;
    updatedAt?: Date;
};