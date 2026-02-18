import { z } from "zod";
import {
  BaseResponse,
  CollectionResponse,
  EntityResponse,
} from "@core-types/response";

/**
 * Helper type for Zod schema inference
 * Provides a standardized way to infer types from Zod schemas
 */
export type ZodInfer<T extends z.ZodTypeAny> = z.infer<T>;

/**
 * Type guard for successful responses
 */
export function isSuccessResponse<T>(
  response: unknown,
): response is EntityResponse<T> & { success: true } {
  return (
    typeof response === "object" &&
    response !== null &&
    "success" in response &&
    (response as { success: boolean }).success === true
  );
}

/**
 * Type guard for error responses
 */
export function isErrorResponse(
  response: unknown,
): response is BaseResponse & { success: false } {
  return (
    typeof response === "object" &&
    response !== null &&
    "success" in response &&
    (response as { success: boolean }).success === false
  );
}

/**
 * Type guard for collection responses
 */
export function isCollectionResponse<T>(
  response: unknown,
): response is CollectionResponse<T> & { success: true } {
  return (
    isSuccessResponse(response) &&
    "data" in response &&
    Array.isArray((response as { data: unknown[] }).data)
  );
}
