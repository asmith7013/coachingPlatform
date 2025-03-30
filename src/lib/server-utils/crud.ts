import type { Model, Document, Types, HydratedDocument } from "mongoose";
import { revalidatePath } from "next/cache";
import type { ZodSchema } from "zod";
import { parseOrThrow, parsePartialOrThrow } from "./safeParse";
import { sanitizeDocument } from "./sanitize";
import { handleServerError } from "@/lib/error/handleServerError";
import { connectToDB } from "@/lib/db";
import type { z } from "zod";

// Define type for document with timestamps
interface TimestampedDoc {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

export interface TimestampedDocument extends Document {
  _id: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export type SanitizableDoc<T> = HydratedDocument<T & TimestampedDoc>;

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
export async function createItem<Doc extends TimestampedDocument, Schema extends ZodSchema>(
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

    // Create item
    const created = await model.create(validatedData);

    // Revalidate paths
    pathsToRevalidate.forEach(path => revalidatePath(path));

    return {
      success: true,
      data: sanitizeDocument(created as unknown as SanitizableDoc<Doc>, schema)
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
export async function updateItem<Doc extends TimestampedDocument, Schema extends ZodSchema>(
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
      data: sanitizeDocument(updated as unknown as SanitizableDoc<Doc>, schema)
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
export async function deleteItem<Doc extends TimestampedDocument, Schema extends ZodSchema>(
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
      data: sanitizeDocument(deleted as unknown as SanitizableDoc<Doc>, schema)
    };
  } catch (error) {
    return {
      success: false,
      error: handleServerError(error)
    };
  }
} 