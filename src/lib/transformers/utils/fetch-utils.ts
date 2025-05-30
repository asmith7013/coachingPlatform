// src/lib/data-utilities/transformers/fetch-by-id.ts
import { connectToDB } from '@server/db/connection';
import { transformSingleItem } from '@transformers/core/unified-transformer';
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
    
    // Transform and validate the document using unified transformer
    const sanitized = transformSingleItem(document, {
      schema,
      handleDates: true,
      errorContext: 'fetchById'
    });
    
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