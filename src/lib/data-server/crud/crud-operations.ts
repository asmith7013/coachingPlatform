import type { Model, Document } from "mongoose";
import { revalidatePath } from "next/cache";
import type { ZodSchema } from "zod";
import { parseOrThrow, parsePartialOrThrow } from "@data-utilities/transformers/parse";
import { sanitizeDocument, removeTimestampFields } from "@data-utilities/transformers/sanitize";
import { handleServerError } from "@core/error/handle-server-error";
import { connectToDB } from "@data-server/db/connection";
import type { z } from "zod";

// Simple base document interface
export interface BaseDocument extends Document {
  [key: string]: unknown;
}

export interface CrudResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  [key: string]: unknown;
}

// Define type alias for inferred schema types
type InferSchema<T extends ZodSchema> = z.infer<T>;

/**
 * Creates a new item in the database
 */
export async function createItem<Doc extends BaseDocument, Schema extends ZodSchema>(
  model: Model<Doc>,
  schema: Schema,
  data: unknown,
  pathsToRevalidate: string[] = []
): Promise<CrudResult<InferSchema<Schema>>> {
  try {
    // Ensure database connection
    await connectToDB();

    // Validate data
    const validatedData = parseOrThrow(schema, data);
    
    // Remove timestamp and ID fields at all levels using the utility function
    const safeToCreate = removeTimestampFields(validatedData);

    // Create item with sanitized data
    const created = await model.create(safeToCreate);

    // Revalidate paths
    pathsToRevalidate.forEach(path => revalidatePath(path));

    return {
      success: true,
      data: sanitizeDocument(created, schema)
    };
  } catch (error) {
    return {
      success: false,
      error: handleServerError(error)
    };
  }
}

/**
 * Updates an existing item in the database
 */
export async function updateItem<Doc extends BaseDocument, Schema extends ZodSchema>(
  model: Model<Doc>,
  schema: Schema,
  id: string,
  data: unknown,
  pathsToRevalidate: string[] = []
): Promise<CrudResult<InferSchema<Schema>>> {
  try {
    // Ensure database connection
    await connectToDB();

    // Validate data
    const validatedData = parsePartialOrThrow(schema, data);
    
    // Remove timestamp and ID fields at all levels using the utility function
    const safeToUpdate = removeTimestampFields(validatedData);

    // Update item
    const updated = await model.findByIdAndUpdate(
      id,
      { $set: safeToUpdate },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return {
        success: false,
        error: handleServerError(new Error(`Item with ID ${id} not found`))
      };
    }

    // Revalidate paths
    pathsToRevalidate.forEach(path => revalidatePath(path));

    return {
      success: true,
      data: sanitizeDocument(updated, schema)
    };
  } catch (error) {
    return {
      success: false,
      error: handleServerError(error)
    };
  }
}

/**
 * Deletes an item from the database
 */
export async function deleteItem<Doc extends BaseDocument, Schema extends ZodSchema>(
  model: Model<Doc>,
  schema: Schema,
  id: string,
  pathsToRevalidate: string[] = []
): Promise<CrudResult<InferSchema<Schema>>> {
  try {
    // Ensure database connection
    await connectToDB();

    const deleted = await model.findByIdAndDelete(id);

    if (!deleted) {
      return {
        success: false,
        error: handleServerError(new Error(`Item with ID ${id} not found`))
      };
    }

    // Revalidate paths
    pathsToRevalidate.forEach(path => revalidatePath(path));

    return {
      success: true,
      data: sanitizeDocument(deleted, schema)
    };
  } catch (error) {
    return {
      success: false,
      error: handleServerError(error)
    };
  }
} 