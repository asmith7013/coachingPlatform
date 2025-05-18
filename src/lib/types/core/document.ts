import type { DocumentBase } from './base-types';
import type { Types } from 'mongoose';

/**
 * Base document interface for all MongoDB documents
 */
export interface BaseDocument extends DocumentBase {
  /** MongoDB ObjectId (as string or ObjectId) */
  _id: string | Types.ObjectId;
  /** String version of _id for client-side use */
  id?: string;
  /** Document creation timestamp */
  createdAt?: Date;
  /** Document last update timestamp */
  updatedAt?: Date;
  /** Array of owner IDs */
  owners?: string[];
}

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
    const idStr = typeof doc._id === 'string' ? doc._id : doc._id.toString();
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

// Maintain backward compatibility
export type BaseDocumentInput<T extends BaseDocument> = DocumentInput<T>;
export const toClientDocument = DocumentUtils.toClient;
export const isBaseDocument = DocumentUtils.isDocument;

// For the rare cases where these are needed
export type WithDateObjects<T extends { createdAt?: string | Date; updatedAt?: string | Date }> = 
  Omit<T, 'createdAt' | 'updatedAt'> & {
    createdAt?: Date;
    updatedAt?: Date;
  };

export interface OwnedDocument extends BaseDocument {
  owners: string[];
}