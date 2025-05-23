// src/lib/data-utilities/transformers/fetch-by-id.ts
import { connectToDB } from '@data-server/db/connection';
import { transformDocument } from '@/lib/data-utilities/transformers/core/db-transformers';
import { Model } from 'mongoose';
import { ZodSchema } from 'zod';

/**
 * Utility to fetch a document by ID
 * 
 * @param model Mongoose model to query
 * @param id Document ID to fetch
 * @param schema Zod schema to validate the document against
 * @returns Collection response with the document or error
 */
export async function fetchById<T>(
  model: Model<T>,
  id: string,
  schema: ZodSchema
) {
  try {
    await connectToDB();
    
    const document = await model.findById(id).lean();
    
    if (!document) {
      return {
        success: false,
        items: [],
        error: `Document with ID ${id} not found`
      };
    }
    
    // Deep sanitize the document and then validate with schema
    const sanitized = schema.parse(transformDocument(document));
    
    return {
      success: true,
      items: [sanitized],
      total: 1
    };
  } catch (error) {
    console.error(`Error fetching document by ID:`, error);
    return {
      success: false,
      items: [],
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}