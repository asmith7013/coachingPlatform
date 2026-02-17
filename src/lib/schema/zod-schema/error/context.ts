import { z } from "zod";

const ErrorSeveritySchema = z.enum([
  "fatal",
  "error",
  "warning",
  "info",
  "debug",
]);
const ErrorCategorySchema = z.enum([
  "validation",
  "network",
  "permission",
  "business",
  "system",
  "unknown",
]);
const EnvironmentSchema = z.enum(["development", "test", "production"]);

// Use shared enums instead of duplicating
export const ErrorContextZodSchema = z.object({
  component: z.string().optional().describe("Component where error occurred"),
  operation: z.string().optional().describe("Operation that failed"),
  severity: ErrorSeveritySchema.optional().describe("Error severity level"),
  category: ErrorCategorySchema.optional().describe("Error category"),
  userId: z.string().optional().describe("User ID when error occurred"),
  orgId: z.string().optional().describe("Organization ID"),
  environment: EnvironmentSchema.optional().describe(
    "Environment where error occurred",
  ),
  timestamp: z.number().optional().describe("Error timestamp"),
  requestId: z.string().optional().describe("Request ID for tracing"),
  tags: z
    .record(z.string(), z.string())
    .optional()
    .describe("Additional error tags"),
  metadata: z
    .record(z.string(), z.unknown())
    .optional()
    .describe("Additional error metadata"),
});
