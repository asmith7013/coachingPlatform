import { z } from "zod";
import { Model } from "mongoose";
import { revalidatePath } from "next/cache";
import { handleServerError } from "@/lib/core/error/handleServerError";
import { handleValidationError } from "@/lib/core/error/handleValidationError";
import { safeParseAndLog } from "./safeParse";
import { connectToDB } from "@/lib/core/db";

// Define type alias for inferred schema types
type InferSchema<T extends z.ZodType> = z.infer<T>;

export interface BulkUploadResult<T> {
  success: boolean;
  items?: T[];
  error?: string;
}

export async function bulkUploadToDB<Doc extends { _id: string }, Schema extends z.ZodType<Doc>>(
  data: Omit<Doc, "_id" | "createdAt" | "updatedAt">[],
  model: Model<Doc>,
  schema: Schema,
  revalidatePaths: string[]
): Promise<BulkUploadResult<InferSchema<Schema>>> {
  try {
    // Ensure database connection
    await connectToDB();

    console.log(`Uploading ${data.length} items`);

    // Validate input data
    const validatedData = data.map(item => 
      safeParseAndLog(
        schema,
        item
      )
    ).filter((item): item is Doc => item !== null);

    if (validatedData.length === 0) {
      return {
        success: false,
        error: "No valid items to upload"
      };
    }

    // Insert items
    const items = await model.insertMany(validatedData);

    // Log success
    console.log(`Successfully uploaded ${items.length} items`);

    // Revalidate paths
    revalidatePaths.forEach(path => revalidatePath(path));

    // Return sanitized data
    return {
      success: true,
      items: items.map(item => schema.parse(item.toObject()))
    };
  } catch (error) {
    console.error("Error uploading items:", error);
    if (error instanceof z.ZodError) {
      throw handleValidationError(error);
    }
    throw handleServerError(error);
  }
} 