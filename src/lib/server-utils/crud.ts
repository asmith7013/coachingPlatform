import type { Model, Document, Types } from "mongoose";
import { revalidatePath } from "next/cache";
import type { ZodSchema } from "zod";
import { parseOrThrow, parsePartialOrThrow } from "./safeParse";
import { sanitizeDocument } from "./sanitize";
import { handleServerError } from "@/lib/error/handleServerError";
import type { z } from "zod";

interface TimestampedDocument extends Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface CrudResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  [key: string]: unknown;
}

/**
 * Creates a new item in the database
 */
export async function createItem<T extends TimestampedDocument, S extends ZodSchema>(
  model: Model<T>,
  schema: S,
  data: unknown,
  pathsToRevalidate: string[] = []
): Promise<CrudResult<z.infer<S>>> {
  try {
    // Validate data
    const validatedData = parseOrThrow(schema, data);

    // Create item
    const created = await model.create(validatedData);

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
export async function updateItem<T extends TimestampedDocument, S extends ZodSchema>(
  model: Model<T>,
  schema: S,
  id: string,
  data: unknown,
  pathsToRevalidate: string[] = []
): Promise<CrudResult<z.infer<S>>> {
  try {
    // Validate data
    const validatedData = parsePartialOrThrow(schema, data);

    // Update item
    const updated = await model.findByIdAndUpdate(
      id,
      { $set: validatedData },
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
export async function deleteItem<T extends TimestampedDocument, S extends ZodSchema>(
  model: Model<T>,
  schema: S,
  id: string,
  pathsToRevalidate: string[] = []
): Promise<CrudResult<z.infer<S>>> {
  try {
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