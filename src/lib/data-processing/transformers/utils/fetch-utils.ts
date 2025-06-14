// src/lib/data-utilities/transformers/fetch-by-id.ts
import { connectToDB } from '@server/db/connection';
import { Model } from 'mongoose';
import { isValidObjectId } from '@lib/data-processing/validation/mongoose-validation';

/**
 * Utility to fetch a document by ID with ObjectId validation
 * 
 * @param model Mongoose model to query
 * @param id Document ID to fetch
 * @param schema Zod schema to validate the document against
 * @returns Collection response with the document or error
 */
export async function fetchById<T>(
  model: Model<T>,
  id: string,
) {
  try {
    await connectToDB();
    
    // Validate ObjectId format before querying
    if (!isValidObjectId(id)) {
      return {
        success: false,
        items: [],
        error: `Invalid ObjectId format: ${id}`
      };
    }
    
    const document = await model.findById(id);
    
    if (!document) {
      return {
        success: false,
        items: [],
        error: `Document with ID ${id} not found`
      };
    }
    
    return {
      success: true,
      items: [document],
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