/**
 * Centralized error type definitions for the application
 */

import { BaseResponse, CollectionResponse, EntityResponse } from '@core-types/response';

// ---------- Core Error Types ----------

/**
 * Error severity levels
 */
export type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

/**
 * Error category types
 */
export type ErrorCategory = 'validation' | 'network' | 'permission' | 'business' | 'system' | 'unknown';

/**
 * Error context with additional metadata
 */
export interface ErrorContext {
  component?: string;
  operation?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  severity?: ErrorSeverity;
  category?: ErrorCategory;
  tags?: Record<string, string>;
}

/**
 * Detailed API error
 */
export interface ApiError {
  error: string;
  item?: unknown;
  code?: string;
  field?: string;
}

// ---------- Error Response Types ----------

/**
 * Error response extending BaseResponse
 */
export interface ErrorResponse extends BaseResponse {
  success: false;
  error: string;
}

/**
 * Collection error response
 */
export type CollectionErrorResponse<T = unknown> = CollectionResponse<T> & ErrorResponse & {
  items: [];
  total: 0;
};

/**
 * Entity error response
 */
export type EntityErrorResponse<T = unknown> = EntityResponse<T> & ErrorResponse & {
  data: null;
};

export type ErrorVariant = 'default' | 'minimal' | 'detailed';

export interface ErrorDisplayConfig {
  showDetails: boolean;
  showRetry: boolean;
  showErrorId: boolean;
  customTitles?: Record<ErrorCategory, string>;
}

export interface ErrorPresentation {
  intent: 'error' | 'warning' | 'info';
  title: string;
  showDetails: boolean;
  showRetry: boolean;
  showErrorId: boolean;
}

// ---------- Error Classes ----------

/**
 * Base application error with context support
 */
export class AppError extends Error {
  public context?: ErrorContext;
  public code?: string;
  
  constructor(message: string, options?: {
    code?: string;
    context?: ErrorContext;
  }) {
    super(message);
    this.name = this.constructor.name;
    this.code = options?.code;
    this.context = options?.context;
  }
}

/**
 * Business domain error
 */
export class BusinessError extends AppError {
  constructor(message: string, code: string, context?: ErrorContext) {
    super(message, { code, context });
    this.name = 'BusinessError';
  }
}

/**
 * HTTP error with status code
 */
export class HttpError extends AppError {
  public statusCode: number;
  
  constructor(message: string, statusCode: number, context?: ErrorContext) {
    super(message, { context });
    this.name = 'HttpError';
    this.statusCode = statusCode;
  }
}

// ---------- Handler Types ----------

/**
 * Generic error handler function
 */
export type ErrorHandler<T = string> = (
  error: unknown, 
  context?: ErrorContext | string
) => T;

/**
 * Error handling options for hooks
 */
export interface ErrorHandlingOptions {
  errorResetTime?: number;
  errorContext?: string | ErrorContext;
  defaultErrorMessage?: string;
  throwErrors?: boolean;
}

// ---------- React Components ----------

/**
 * Error boundary props
 */
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode | ((error: Error) => React.ReactNode);
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  reportToSentry?: boolean;
}