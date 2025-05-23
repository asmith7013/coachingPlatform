import { 
    ErrorSeverity, 
    ErrorCategory, 
    AppError,
    ValidationError,
    NetworkError,
    PermissionError,
    BusinessError,
    ErrorContext
  } from "@error-types";
  
  /**
   * Core error classification system
   */
  export function classifyError(error: unknown): { 
    severity: ErrorSeverity; 
    category: ErrorCategory;
    statusCode?: string;
    message: string;
  } {
    // Handle AppError class hierarchy directly
    if (error instanceof AppError) {
      return { 
        severity: error.severity, 
        category: error.category, 
        statusCode: error.meta.statusCode as string,
        message: error.message 
      };
    }
    
    // Extract message for non-AppError errors
    const message = error instanceof Error 
      ? error.message 
      : typeof error === 'string'
        ? error
        : 'Unknown error';
    
    // Determine status code
    let statusCode: string | undefined;
    
    if (error instanceof Error) {
      if (message.includes("not found")) statusCode = "404";
      else if (message.includes("invalid")) statusCode = "400";
      else if (message.includes("unauthorized")) statusCode = "401";
      else if (message.includes("forbidden")) statusCode = "403";
      else if (message.includes("conflict")) statusCode = "409";
      else if (message.includes("unprocessable")) statusCode = "422";
      else if (message.includes("too many requests")) statusCode = "429";
    }
    
    // Network errors
    if (error instanceof TypeError && 
        (message.includes('fetch') || 
         message.includes('network') || 
         message.includes('connection'))) {
      return { 
        severity: 'warning', 
        category: 'network', 
        statusCode: statusCode || "503",
        message
      };
    }
    
    // Permission errors
    if (error instanceof Error && 
       (message.includes('permission') || 
        message.includes('unauthorized') ||
        message.includes('forbidden') ||
        message.includes('not allowed'))) {
      return { 
        severity: 'error', 
        category: 'permission', 
        statusCode: statusCode || "403",
        message
      };
    }
    
    // Validation errors
    if (error instanceof Error && 
       (error.name.includes('Zod') ||
        error.name.includes('Validation') ||
        message.includes('validation') ||
        message.includes('invalid'))) {
      return { 
        severity: 'warning', 
        category: 'validation', 
        statusCode: statusCode || "422",
        message
      };
    }
    
    // Default classification
    return { 
      severity: 'error', 
      category: 'unknown',
      statusCode: statusCode || "500",
      message
    };
  }
  
  /**
   * Create the appropriate error instance from any error type
   */
  export function createAppError(
    error: unknown, 
    context?: ErrorContext
  ): AppError {
    // If it's already an AppError, update context if provided
    if (error instanceof AppError) {
      if (context) {
        error.context = { ...error.context, ...context };
      }
      return error;
    }
    
    // Extract error information
    const { severity, category, statusCode, message } = classifyError(error);
    
    // Create appropriate error based on category
    switch (category) {
      case 'validation':
        return new ValidationError(message, undefined, context);
      
      case 'network':
        return new NetworkError(
          message, 
          statusCode ? parseInt(statusCode, 10) : undefined, 
          context
        );
      
      case 'permission':
        return new PermissionError(message, context);
      
      case 'business':
        return new BusinessError(message, undefined, context);
      
      default:
        return new AppError(message, {
          severity,
          category,
          context,
          code: statusCode
        });
    }
  }
  
  /**
   * Creates a validation error with appropriate category and context
   */
  export function createValidationError(
    message: string,
    fields?: Record<string, string>,
    context?: ErrorContext
  ): ValidationError {
    return new ValidationError(message, fields, context);
  }
  
  /**
   * Creates a network error with appropriate category and context
   */
  export function createNetworkError(
    message: string,
    status?: number,
    context?: ErrorContext
  ): NetworkError {
    return new NetworkError(message, status, context);
  }
  
  /**
   * Creates a permission error with appropriate category and context
   */
  export function createPermissionError(
    message: string,
    context?: ErrorContext
  ): PermissionError {
    return new PermissionError(message, context);
  }
  
  /**
   * Creates a business error with appropriate category and context
   */
  export function createBusinessError(
    message: string,
    code?: string,
    context?: ErrorContext
  ): BusinessError {
    return new BusinessError(message, code, context);
  }