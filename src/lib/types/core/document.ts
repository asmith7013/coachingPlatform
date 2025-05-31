import { z } from 'zod';
import { BaseDocumentSchema } from '@zod-schema/base-schemas';

/**
 * Base document interface for all MongoDB documents
 */
export type BaseDocument = z.infer<typeof BaseDocumentSchema>;

/**
 * Base interface for document inputs (for creation/updates)
 * Omits system-generated fields
 */
export type DocumentInput<T extends BaseDocument> = Omit<T, '_id' | 'id' | 'createdAt' | 'updatedAt'>;

/**
 * For the rare cases where these are needed
 */
export type WithDateObjects<T extends { createdAt?: string | Date; updatedAt?: string | Date }> = 
  Omit<T, 'createdAt' | 'updatedAt'> & {
    createdAt?: Date;
    updatedAt?: Date;
};

