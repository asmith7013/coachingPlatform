import { 
    ErrorSeverity, 
    ErrorCategory, 
    AppError,
    BusinessError,
    HttpError,
    ErrorContext
  } from "@core-types/error";
  
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
      // Use context properties if provided
      let severity = error.context?.severity || 'error';
      let category = error.context?.category || 'unknown';
      let statusCode: string | undefined;
      
      // Handle specific error types
      if (error instanceof BusinessError) {
        category = 'business';
        statusCode = error.code;
        severity = severity || 'warning';
      } else if (error instanceof HttpError) {
        category = 'network';
        statusCode = String(error.statusCode);
        severity = severity || (error.statusCode >= 500 ? 'error' : 'warning');
      }
      
      return { 
        severity, 
        category, 
        statusCode, 
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
   * Create an appropriate error instance from an unknown error
   * Useful for converting arbitrary errors to our error hierarchy
   */
  export function createAppError(
    error: unknown, 
    context?: ErrorContext
  ): AppError {
    // If it's already an AppError, merge contexts if provided
    if (error instanceof AppError) {
      if (context) {
        error.context = { ...error.context, ...context };
      }
      return error;
    }
    
    // Handle Error instances
    if (error instanceof Error) {
      // Extract potential status code from error message
      const statusMatch = error.message.match(/\[(\d+)\]/);
      const statusCode = statusMatch ? parseInt(statusMatch[1], 10) : undefined;
      
      // Create appropriate error instance
      if (statusCode) {
        return new HttpError(error.message, statusCode, context);
      }
      
      // Check for business error patterns
      if (error.name.includes('Business') || error.message.includes('business rule')) {
        return new BusinessError(error.message, 'BUSINESS_ERROR', context);
      }
      
      // Create generic AppError
      return new AppError(error.message, { context });
    }
    
    // Handle string errors
    if (typeof error === 'string') {
      return new AppError(error, { context });
    }
    
    // Handle unknown error types
    return new AppError(
      typeof error === 'object' ? JSON.stringify(error) : 'Unknown error', 
      { context }
    );
  }