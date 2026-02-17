import { BaseResponse } from "@core-types/response";

/**
 * Validation result for Monday.com data
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  missingRequired: string[];
}

/**
 * Transform result from Monday.com item to Visit
 */
export interface TransformResult extends Pick<BaseResponse, "success"> {
  transformed: Record<string, unknown>;
  valid: boolean;
  success: boolean;
  missingRequired: string[];
  errors: Record<string, string>;
  warnings?: Record<string, string>;
  requiredForFinalValidation?: string[];
}
