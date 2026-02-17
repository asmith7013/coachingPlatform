import { z } from "zod";
import { BaseResponseZodSchema } from "@zod-schema/core-types/response";

// Basic error response schema
export const ErrorResponseZodSchema = BaseResponseZodSchema.extend({
  success: z.literal(false),
  error: z.string(),
  errorCode: z.string().optional(),
  details: z.string().optional(),
});

// Build validation error details
export const ValidationErrorDetailsZodSchema = z.object({
  field: z.string().describe("Field that failed validation"),
  message: z.string().describe("Validation error message"),
  code: z.string().optional().describe("Error code"),
  path: z.array(z.string()).optional().describe("Path to the field"),
  value: z.unknown().optional().describe("Invalid value"),
});

// Extend the centralized error response
export const ValidationErrorResponseZodSchema = ErrorResponseZodSchema.extend({
  validationErrors: z
    .array(ValidationErrorDetailsZodSchema)
    .describe("Detailed validation errors"),
});

// Collection error response
export const CollectionErrorResponseZodSchema = ErrorResponseZodSchema.extend({
  items: z
    .array(z.never())
    .default([])
    .describe("Empty items array for errors"),
  total: z.literal(0).describe("Zero total for error responses"),
});

// Entity error response
export const EntityErrorResponseZodSchema = ErrorResponseZodSchema.extend({
  data: z.null().describe("Null data for error responses"),
});
