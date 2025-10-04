import { z } from "zod";
import { Model } from "mongoose";
import { revalidatePath } from "next/cache";
import { validateSafe } from "@/lib/data-processing/validation/zod-validation";
import { connectToDB } from "@server/db/connection";
import { handleCollectionError, createCollectionErrorResponse } from "@error";
import { BulkUploadResult } from "@core-types/crud";
import { validateStrict } from '@/lib/data-processing/validation/zod-validation';


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
      validateSafe(
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
      items: items.map(item => validateStrict(schema, item.toObject())) as InferSchema<Schema>[],
      total: items.length
    };
  } catch (error) {
    return handleCollectionError<InferSchema<Schema>>(error, "BulkUpload") as BulkUploadResult<InferSchema<Schema>>;
  }
} 