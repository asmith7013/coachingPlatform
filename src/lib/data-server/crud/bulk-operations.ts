import { z } from "zod";
import { Model } from "mongoose";
import { revalidatePath } from "next/cache";
import { safeParseAndLog } from "@data-utilities/transformers/parse";
import { connectToDB } from "@data-server/db/connection";
import { handleCollectionError } from "@error/crud-error-handling";
import { createCollectionErrorResponse } from "@core-types/error";
import { BulkUploadResult } from "@core-types/crud";

// Define type alias for inferred schema types
type InferSchema<T extends z.ZodType> = z.infer<T>;

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
      return createCollectionErrorResponse<InferSchema<Schema>>(
        "No valid items to upload", 
        [{item: data, error: "No valid items to upload"}]
      ) as BulkUploadResult<InferSchema<Schema>>;
    }

    // Insert items
    const items = await model.insertMany(validatedData);

    // Log success
    const successMessage = `Successfully uploaded ${items.length} items`;
    console.log(successMessage);

    // Revalidate paths
    revalidatePaths.forEach(path => revalidatePath(path));

    // Return sanitized data
    return {
      success: true,
      message: successMessage,
      items: items.map(item => schema.parse(item.toObject())),
      total: items.length
    };
  } catch (error) {
    return handleCollectionError<InferSchema<Schema>>(error, "BulkUpload") as BulkUploadResult<InferSchema<Schema>>;
  }
} 