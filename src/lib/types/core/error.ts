/**
 * Centralized error type definitions for the application
 */

import type { BaseResponse, CollectionResponse, EntityResponse } from './response';
import type { ErrorContextBase } from './base-types';

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
export interface ErrorContext extends ErrorContextBase {
  severity?: ErrorSeverity;
  category?: ErrorCategory;
  userId?: string;
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
 * Base application error with standardized properties
 */
export class AppError extends Error {
  /** Error code for categorization */
  public code?: string;
  /** Error severity level */
  public severity: ErrorSeverity;
  /** Error category */
  public category: ErrorCategory;
  /** Error metadata */
  public meta: Record<string, unknown>;
  /** Source information */
  public context?: ErrorContext;
  
  constructor(message: string, options: {
    code?: string;
    context?: ErrorContext;
    severity?: ErrorSeverity;
    category?: ErrorCategory;
    meta?: Record<string, unknown>;
  } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = options.code;
    this.severity = options.severity || 'error';
    this.category = options.category || 'unknown';
    this.meta = options.meta || {};
    this.context = options.context;
  }
  
  /**
   * Converts error to object representation
   */
  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      category: this.category,
      meta: this.meta,
      context: this.context,
    };
  }
}

/**
 * Specialized error for validation failures
 */
export class ValidationError extends AppError {
  constructor(message: string, fields?: Record<string, string>, context?: ErrorContext) {
    super(message, {
      code: 'VALIDATION_ERROR',
      category: 'validation',
      severity: 'warning',
      context,
      meta: { fields }
    });
  }
}

/**
 * Specialized error for network/HTTP issues
 */
export class NetworkError extends AppError {
  public statusCode?: number;
  
  constructor(message: string, statusCode?: number, context?: ErrorContext) {
    super(message, {
      code: statusCode ? `HTTP_${statusCode}` : 'NETWORK_ERROR',
      category: 'network',
      severity: statusCode && statusCode >= 500 ? 'error' : 'warning',
      context,
      meta: { statusCode }
    });
    this.statusCode = statusCode;
  }
}

/**
 * Specialized error for permission issues
 */
export class PermissionError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, {
      code: 'PERMISSION_DENIED',
      category: 'permission',
      severity: 'error',
      context
    });
  }
}

/**
 * Specialized error for business logic violations
 */
export class BusinessError extends AppError {
  constructor(message: string, code?: string, context?: ErrorContext) {
    super(message, {
      code: code || 'BUSINESS_RULE_VIOLATION',
      category: 'business',
      severity: 'warning',
      context
    });
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