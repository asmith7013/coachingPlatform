import { z } from "zod";

// Based on src/lib/types/core/response.ts
export const BaseResponseZodSchema = z.object({
    success: z.boolean().describe("Whether the operation succeeded"),
    message: z.string().optional().describe("Optional success or info message"),
    error: z.string().optional().describe("Error message if operation failed"),
    errors: z.array(
      z.object({
        item: z.unknown().optional(),
        error: z.string(),
        field: z.string().optional()
      })
    ).optional().describe("Detailed validation errors")
  });
  
  // Add specialized response types using extension
  export const SuccessResponseZodSchema = BaseResponseZodSchema.extend({
    success: z.literal(true)
  });
  
  export const ErrorResponseZodSchema = BaseResponseZodSchema.extend({
    success: z.literal(false),
    error: z.string() // Make error required for error responses
  });
  
  export const CollectionResponseZodSchema = BaseResponseZodSchema.extend({
    items: z.array(z.unknown()).describe("Array of items in the collection"),
    total: z.number().describe("Total number of items available"),
    empty: z.boolean().optional().describe("Whether the collection is empty")
  });
  
  export const EntityResponseZodSchema = BaseResponseZodSchema.extend({
    data: z.unknown().describe("The requested entity data")
  });