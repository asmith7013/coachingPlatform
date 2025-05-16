import { Types } from 'mongoose';

/**
 * Base interface for all MongoDB documents
 * Provides the foundation for all document types in the application
 */
export interface BaseDocument {
  /** MongoDB ObjectId (as string or ObjectId) */
  _id: string | Types.ObjectId;
  /** String version of _id for client-side use */
  id?: string;
  /** Document creation timestamp */
  createdAt?: Date;
  /** Document last update timestamp */
  updatedAt?: Date;
}

/**
 * Generic type for converting string date fields to Date objects
 * Use this type when you need to work with actual Date objects for createdAt/updatedAt
 * 
 * @example
 * // Define a type with Date objects instead of strings
 * export type SchoolWithDates = WithDateObjects<School>;
 */
export type WithDateObjects<T extends { createdAt?: string | Date; updatedAt?: string | Date }> = 
  Omit<T, 'createdAt' | 'updatedAt'> & {
    createdAt?: Date;
    updatedAt?: Date;
  };

/**
 * MongoDB document with system fields only represented as strings
 * Used primarily for client-side operations
 */
export interface ClientDocument {
  _id: string;
  id: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

/**
 * Base interface for document inputs (for creation/updates)
 * Omits system-generated fields
 */
export type BaseDocumentInput<T extends BaseDocument> = Omit<T, '_id' | 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Interface for documents with ownership
 */
export interface OwnedDocument extends BaseDocument {
  /** Array of owner IDs */
  owners: string[];
}

/**
 * Interface for tracking document changes
 */
export interface TrackableDocument extends BaseDocument {
  /** User who created the document */
  createdBy: string;
  /** User who last updated the document */
  updatedBy: string;
}

/**
 * Type for tracked document creation
 */
export type TrackableDocumentInput<T extends TrackableDocument> = BaseDocumentInput<T> & {
  createdBy: string;
  updatedBy: string;
};

/**
 * Convert a MongoDB document to a client-safe document
 * Ensures _id is always a string and adds id field if missing
 */
export function toClientDocument<T extends BaseDocument>(doc: T): T & { id: string } {
  const idStr = doc._id.toString();
  return {
    ...doc,
    _id: idStr,
    id: idStr
  };
}

/**
 * Type guard to check if an object is a BaseDocument
 */
export function isBaseDocument(obj: unknown): obj is BaseDocument {
  return obj !== null && 
         typeof obj === 'object' && 
         '_id' in obj &&
         'createdAt' in obj &&
         'updatedAt' in obj;
}