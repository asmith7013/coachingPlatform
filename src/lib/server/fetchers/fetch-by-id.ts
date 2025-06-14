import { connectToDB } from "@server/db/connection";
import { sanitizeDocument } from "@server/api/responses/formatters";
import { Model } from 'mongoose';
import { isValidObjectId } from '@/lib/data-processing/validation/mongoose-validation';
import { CollectionResponse } from '@core-types/response';

/**
 * Generic utility to fetch a document by ID with validation and consistent error handling
 * 
 * @param model Mongoose model to query
 * @param id Document ID to fetch
 * @param entityName Human-readable entity name for error messages (optional)
 * @returns Collection response with the document or error
 */
export async function fetchById<T>(
    model: Model<T>,
    id: string,
    entityName?: string
  ): Promise<CollectionResponse<T>> {
    try {
      await connectToDB();
      
      // Validate ObjectId format before querying
      if (!isValidObjectId(id)) {
        return {
          success: false,
          items: [],
          total: 0,
          error: `Invalid ObjectId format: ${id}`
        };
      }
      
      const document = await model.findById(id); // Remove .lean() to allow transforms
      
      if (!document) {
        const entity = entityName || 'Document';
        return {
          success: false,
          items: [],
          total: 0,
          error: `${entity} with ID ${id} not found`
        };
      }
      
      // Convert to JSON to apply transforms, then sanitize
      const transformedDoc = document.toJSON();
      const sanitized = sanitizeDocument(transformedDoc);
      
      return {
        success: true,
        items: [sanitized as T],
        total: 1
      };
    } catch (error) {
      console.error(`Error fetching document by ID:`, error);
      const entity = entityName || 'document';
      return {
        success: false,
        items: [],
        total: 0,
        error: error instanceof Error ? error.message : `Failed to fetch ${entity}`
      };
    }
  }