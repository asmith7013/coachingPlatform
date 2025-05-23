import type { Model } from "mongoose";
import { revalidatePath } from "next/cache";
import type { ZodSchema } from "zod";
import { validateStrict, validatePartialStrict } from '@/lib/data-utilities/transformers/core/schema-validators';

import { prepareForCreate, transformDocument } from "@/lib/data-utilities/transformers/core/db-transformers";
import { handleServerError } from "@error/handlers/server";
import { connectToDB } from "@data-server/db/connection";
import type { z } from "zod";
import { BaseDocument } from "@core-types/document";
import { CollectionResponse } from "@core-types/response";

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
): Promise<CollectionResponse<InferSchema<Schema>>> {
  try {
    // Ensure database connection
    await connectToDB();

    // Validate data
    const validatedData = validateStrict(schema, data);
    
    // Remove timestamp and ID fields at all levels using the utility function
    const safeToCreate = prepareForCreate(validatedData);

    // Create item with sanitized data
    const created = await model.create(safeToCreate);

    // Revalidate paths
    pathsToRevalidate.forEach(path => revalidatePath(path));

    return {
      success: true,
      items: [transformDocument(created)]
    };
  } catch (error) {
    return {
      success: false,
      items: [],
      message: handleServerError(error)
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
): Promise<CollectionResponse<InferSchema<Schema>>> {
  try {
    // Ensure database connection
    await connectToDB();

    // Validate data
    const validatedData = validatePartialStrict(schema, data);
    
    // Remove timestamp and ID fields at all levels using the utility function
    const safeToUpdate = prepareForCreate(validatedData);

    // Update item
    const updated = await model.findByIdAndUpdate(
      id,
      { $set: safeToUpdate },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return {
        success: false,
        items: [],
        message: handleServerError(new Error(`Item with ID ${id} not found`))
      };
    }

    // Revalidate paths
    pathsToRevalidate.forEach(path => revalidatePath(path));

    return {
      success: true,
      items: [transformDocument(updated)]
    };
  } catch (error) {
    return {
      success: false,
      items: [],
      message: handleServerError(error)
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
): Promise<CollectionResponse<InferSchema<Schema>>> {
  try {
    // Ensure database connection
    await connectToDB();

    const deleted = await model.findByIdAndDelete(id);

    if (!deleted) {
      return {
        success: false,
        items: [],
        message: handleServerError(new Error(`Item with ID ${id} not found`))
      };
    }

    // Revalidate paths
    pathsToRevalidate.forEach(path => revalidatePath(path));

    return {
      success: true,
      items: [transformDocument(deleted)]
    };
  } catch (error) {
    return {
      success: false,
      items: [],
      message: handleServerError(error)
    };
  }
} 