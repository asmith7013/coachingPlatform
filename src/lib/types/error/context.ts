import { z } from "zod";
import { ErrorContextZodSchema } from "@zod-schema/error/context";

/**
 * Error context with detailed information about where and why an error occurred
 */
export type ErrorContext = z.infer<typeof ErrorContextZodSchema>;
