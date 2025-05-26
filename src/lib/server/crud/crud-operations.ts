import type { Model } from "mongoose";
import { revalidatePath } from "next/cache";
import type { ZodSchema } from "zod";
import { validateStrict } from '@transformers/core/validation';
import { createTransformer } from "@transformers/core/unified-transformer";
import { handleServerError } from "@error/handlers/server";
import { connectToDB } from "@server/db/connection";
import type { z } from "zod";
import { BaseDocument } from "@core-types/document";
import { CollectionResponse } from "@core-types/response";
import { prepareForCreate } from "@transformers/core/document";

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

    // Create item with validated data
    const created = await model.create(validatedData);

    // Revalidate paths
    pathsToRevalidate.forEach(path => revalidatePath(path));

    // Transform the result
    const transformer = createTransformer<Doc, InferSchema<Schema>>({
      schema,
      handleDates: true,
      errorContext: 'createItem'
    });

    return {
      success: true,
      items: transformer.transform([created]),
      total: 1
    };
  } catch (error) {
    return {
      success: false,
      items: [],
      total: 0,
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
    const validatedData = validateStrict(schema, data);
    
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
        total: 0,
        message: handleServerError(new Error(`Item with ID ${id} not found`))
      };
    }

    // Revalidate paths
    pathsToRevalidate.forEach(path => revalidatePath(path));

    // Transform the result
    const transformer = createTransformer<Doc, InferSchema<Schema>>({
      schema,
      handleDates: true,
      errorContext: 'updateItem'
    });

    return {
      success: true,
      items: transformer.transform([updated]),
      total: 1
    };
  } catch (error) {
    return {
      success: false,
      items: [],
      total: 0,
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
        total: 0,
        message: handleServerError(new Error(`Item with ID ${id} not found`))
      };
    }

    // Revalidate paths
    pathsToRevalidate.forEach(path => revalidatePath(path));

    // Transform the result
    const transformer = createTransformer<Doc, InferSchema<Schema>>({
      schema,
      handleDates: true,
      errorContext: 'deleteItem'
    });

    return {
      success: true,
      items: transformer.transform([deleted]),
      total: 1
    };
  } catch (error) {
    return {
      success: false,
      items: [],
      total: 0,
      message: handleServerError(error)
    };
  }
} 