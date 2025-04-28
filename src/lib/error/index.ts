/**
 * Error handling system exports
 * 
 * This file serves as the central export point for all error handling utilities.
 * Use named imports to get exactly what you need.
 */

// Client-side error handling
export { handleClientError } from './handle-client-error';
export { 
  handleEnhancedClientError,
  captureError,
  classifyError,
  createErrorContext,
  reportBusinessError,
  AppError,
  withErrorMonitoring,
  withAsyncErrorMonitoring,
  createMonitoredErrorResponse
} from './error-monitor';

// Server-side error handling
export { handleServerError } from './handle-server-error';
export { handleValidationError } from './handle-validation-error';
export { 
  handleCrudError,
  getErrorMessage
} from './crud-error-handling';

// Re-export error types and helpers for convenience
export { 
  createErrorResponse,
  BusinessError
} from '@core-types/error';

// Re-export type definitions
export type {
  ErrorResponse,
  ApiError,
  ErrorSeverity,
  ErrorCategory,
  ErrorContext,
  ServerResponse,
  ErrorHandlingOptions
} from '@core-types/error';