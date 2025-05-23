import type { ErrorCategory, ErrorOptions, ErrorSeverity } from '@error-types/core';
import type { ErrorContext } from '@error-types/context';

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
  
  constructor(message: string, options: ErrorOptions & { context?: ErrorContext } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = options.code;
    this.severity = options.severity || 'error';
    this.category = options.category || 'unknown';
    this.meta = options.meta || {};
    this.context = options.context;
  }
}

/**
 * Specialized error for validation failures
 */
export class ValidationError extends AppError {
  public fields?: Record<string, string>;
  
  constructor(message: string, fields?: Record<string, string>, context?: ErrorContext) {
    super(message, {
      code: 'VALIDATION_ERROR',
      category: 'validation',
      severity: 'warning',
      context,
      meta: { fields }
    });
    this.fields = fields;
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

/**
 * Specialized error for database operations
 */
export class DatabaseError extends AppError {
  constructor(message: string, operation?: string, context?: ErrorContext) {
    super(message, {
      code: 'DATABASE_ERROR',
      category: 'system',
      severity: 'error',
      context: {
        ...context,
        operation: operation || context?.operation
      }
    });
  }
}

/**
 * Specialized error for not found cases
 */
export class NotFoundError extends AppError {
  constructor(entityType: string, id?: string, context?: ErrorContext) {
    super(
      id ? `${entityType} with ID ${id} not found` : `${entityType} not found`,
      {
        code: 'NOT_FOUND',
        category: 'business',
        severity: 'warning',
        context,
        meta: { entityType, id }
      }
    );
  }
} 