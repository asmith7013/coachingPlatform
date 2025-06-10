import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { validateSafe } from '@/lib/data-processing/validation/zod-validation';
import { handleValidationError } from '@error/handlers/validation';
/**
 * Streamlined validation service with focused responsibilities
 */
export class ValidationService {
  /**
   * Core validation - handles all validation needs
   */
  static validate<T>(
    schema: z.ZodSchema<T>, 
    data: unknown,
    options: { strict?: boolean; context?: string } = {}
  ): { success: true; data: T } | { success: false; error: string } {
    try {
      if (options.strict) {
        // Strict mode - throws on validation error
        const result = schema.parse(data);
        return { success: true, data: result };
      } else {
        // Safe mode - returns success/error object
        const result = validateSafe(schema, data);
        
        if (!result) {
          return { success: false, error: 'Validation failed' };
        }
        
        
        return { success: true, data: result };
      }
    } catch (error) {
      const errorMessage = handleValidationError(error as z.ZodError, 'validate');
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Middleware factory - simplified interface
   */
  static middleware<T>(schema: z.ZodSchema<T>, type: 'query' | 'body' = 'query') {
    return (handler: (validated: T, req: NextRequest) => Promise<Response>) => {
      return async (req: NextRequest) => {
        const data = type === 'query' 
          ? this.extractQueryParams(req)
          : await req.json().catch(() => ({}));
          
        const validation = this.validate(schema, data);
          
        if (!validation.success) {
          return NextResponse.json(
            { success: false, error: validation.error },
            { status: 400 }
          );
        }
          
        return handler(validation.data, req);
      };
    };
  }

  /**
   * Batch validation for arrays
   */
  static validateArray<T>(
    schema: z.ZodSchema<T>,
    items: unknown[]
  ): { valid: T[]; invalid: { item: unknown; error: string }[] } {
    const valid: T[] = [];
    const invalid: { item: unknown; error: string }[] = [];
    
    for (const item of items) {
      const result = this.validate(schema, item);
      if (result.success) {
        valid.push(result.data);
      } else {
        invalid.push({ item, error: result.error });
      }
    }
    
    return { valid, invalid };
  }

  // Helper methods
  private static formatZodError(error: z.ZodError): string {
    return error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
  }

  private static extractQueryParams(req: NextRequest): Record<string, unknown> {
    const url = new URL(req.url);
    const params: Record<string, unknown> = {};
    
    url.searchParams.forEach((value, key) => {
      // Handle multiple values
      if (params[key]) {
        params[key] = Array.isArray(params[key]) 
          ? [...params[key] as unknown[], value]
          : [params[key], value];
      } else {
        params[key] = value;
      }
    });
    
    return params;
  }
}

// Convenience exports
export const { validate, middleware: createMiddleware, validateArray } = ValidationService;

// Usage examples:
export const withQueryValidation = <T>(schema: z.ZodSchema<T>) => 
  ValidationService.middleware(schema, 'query');

export const withRequestValidation = <T>(schema: z.ZodSchema<T>) => 
  ValidationService.middleware(schema, 'body'); 