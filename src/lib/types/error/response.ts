import { z } from 'zod';
import { 
  ErrorResponseZodSchema,
  ValidationErrorResponseZodSchema,
  ValidationErrorDetailsZodSchema,
  CollectionErrorResponseZodSchema,
  EntityErrorResponseZodSchema
} from '@zod-schema/error/response';

/**
 * Standard error response interfaces for API responses
 */

// Derive types from Zod schemas
export type ErrorResponse = z.infer<typeof ErrorResponseZodSchema>;
export type ValidationErrorDetails = z.infer<typeof ValidationErrorDetailsZodSchema>;
export type ValidationErrorResponse = z.infer<typeof ValidationErrorResponseZodSchema>;
export type CollectionErrorResponse<_T = unknown> = z.infer<typeof CollectionErrorResponseZodSchema>;
export type EntityErrorResponse<_T = unknown> = z.infer<typeof EntityErrorResponseZodSchema>;

