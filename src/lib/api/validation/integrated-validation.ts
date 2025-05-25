// src/lib/api/validation/integrated-validation.ts
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { ValidationErrorResponseZodSchema } from "@zod-schema/error/response";
import { collectionizeResponse } from "@api-responses/formatters";
import { handleValidationError } from "@error/handlers/validation";
import { createMonitoredErrorResponse } from "@/lib/error/core/responses";

/**
 * Normalizes and validates URL query parameters using a Zod schema
 * 
 * @param searchParams - The URL search parameters (from Next.js)
 * @param schema - A Zod schema to validate and transform the parameters
 * @returns The validated and transformed parameters
 */
function parseQueryParams<T>(
  searchParams: { [key: string]: string | string[] },
  schema: z.ZodType<T>
): T {
  // Convert string[] values to string by taking first value when appropriate
  const normalizedParams = Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => 
      [key, Array.isArray(value) && value.length === 1 ? value[0] : value]
    )
  );
  
  // Parse with Zod schema (will throw on validation error)
  return schema.parse(normalizedParams);
}

/**
 * Integrated validation service that combines validation logic with middleware capabilities
 * Maintains all functionality from both validate-request.ts and service.ts while eliminating duplication
 */
export const ValidationService = {
  /**
   * Core validation function that validates data against a schema
   * Returns detailed result with optional response object for middleware use
   */
  validate<T>(
    schema: z.ZodSchema<T>, 
    data: unknown,
    options?: { 
      errorMessage?: string;
      createResponse?: boolean;
      statusCode?: number;
    }
  ): {
    success: boolean;
    data?: T;
    errors?: string[];
    response?: Response;
  } {
    try {
      // Use safeParse for validation without throwing
      const result = schema.safeParse(data);
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        // Format validation errors
        const errors = handleValidationError(result.error);
        
        // Create formatted validation errors for API response
        const validationErrors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));
        
        // Create response object if requested
        let response: Response | undefined;
        if (options?.createResponse) {
          const errorResponse = ValidationErrorResponseZodSchema.parse({
            success: false,
            error: options?.errorMessage || "Validation error",
            validationErrors
          });
          
          response = NextResponse.json(
            errorResponse, 
            { status: options?.statusCode || 400 }
          );
        }
        
        return { 
          success: false, 
          errors: [errors],
          response
        };
      }
    } catch (error) {
      // Handle unexpected validation errors
      const errorMessage = `Validation process failed: ${error}`;
      
      // Create error response if requested
      let response: Response | undefined;
      if (options?.createResponse) {
        response = NextResponse.json(
          collectionizeResponse({
            success: false,
            error: errorMessage
          }),
          { status: options?.statusCode || 500 }
        );
      }
      
      return { 
        success: false, 
        errors: [errorMessage],
        response
      };
    }
  },
  
  /**
   * Validate a collection of items against a schema
   * Returns separate arrays of valid and invalid items
   */
  validateCollection<T>(schema: z.ZodSchema<T>, items: unknown[]): {
    valid: T[];
    invalid: { item: unknown; errors: string[] }[];
  } {
    const valid: T[] = [];
    const invalid: { item: unknown; errors: string[] }[] = [];
    
    items.forEach(item => {
      const result = this.validate(schema, item);
      
      if (result.success && result.data) {
        valid.push(result.data);
      } else {
        invalid.push({
          item,
          errors: result.errors || ["Unknown validation error"]
        });
      }
    });
    
    return { valid, invalid };
  },
  
  /**
   * Creates middleware that validates request body against a schema
   * Combines functionality from the original withRequestValidation
   */
  withRequestValidation<T>(
    schema: z.ZodSchema<T>,
    errorMessage?: string
  ) {
    return (handler: (validatedData: T, req: NextRequest) => Promise<Response>) => {
      return async (req: NextRequest) => {
        try {
          // Parse the request body
          const body = await req.json();
          
          // Validate with integrated validation service
          const validation = this.validate(schema, body, { 
            errorMessage: errorMessage || "Validation error", 
            createResponse: true 
          });
          
          if (!validation.success) {
            // Return pre-built response if validation failed
            return validation.response!;
          }
          
          // Call handler with validated data
          return handler(validation.data!, req);
        } catch (error) {
          // Handle JSON parsing errors
          return NextResponse.json(
            createMonitoredErrorResponse(
              "Validation error occurred", // First parameter should be a string message
              error, // Second parameter is the error object
              { component: 'ValidationMiddleware', operation: 'validateRequest' } // Third parameter is the context
            ),
            { status: 400 }
          );
        }
      };
    };
  },
  
  /**
   * Creates middleware that validates query parameters against a schema
   * Uses parseQueryParams for more reliable parameter handling
   */
  withQueryValidation<T>(
    schema: z.ZodSchema<T>,
    errorMessage?: string
  ) {
    return (handler: (validatedParams: T, req: NextRequest) => Promise<Response>) => {
      return async (req: NextRequest) => {
        try {
          // Extract query parameters from URL
          const url = new URL(req.url);
          const queryParams: Record<string, string | string[]> = {};
          
          // Build multivalue parameter object properly
          url.searchParams.forEach((value, key) => {
            if (key in queryParams) {
              if (Array.isArray(queryParams[key])) {
                (queryParams[key] as string[]).push(value);
              } else {
                queryParams[key] = [queryParams[key] as string, value];
              }
            } else {
              queryParams[key] = value;
            }
          });
          
          try {
            // Use the more reliable parseQueryParams function
            const validatedParams = parseQueryParams(queryParams, schema);
            
            // Call handler with validated parameters
            return handler(validatedParams, req);
          } catch (validationError) {
            // Handle validation errors with standardized format
            if (validationError instanceof z.ZodError) {
              const errorResponse = ValidationErrorResponseZodSchema.parse({
                success: false,
                error: errorMessage || "Validation error in query parameters",
                validationErrors: validationError.errors.map(err => ({
                  field: err.path.join('.'),
                  message: err.message,
                  code: err.code
                }))
              });
              
              return NextResponse.json(errorResponse, { status: 400 });
            }
            throw validationError; // Re-throw non-Zod errors
          }
        } catch (error) {
          // Handle other errors
          return NextResponse.json(
            createMonitoredErrorResponse(
              "Validation error occurred", // First parameter should be a string message
              error, // Second parameter is the error object
              { component: 'ValidationMiddleware', operation: 'validateRequest' } // Third parameter is the context
            ),
            { status: 400 }
          );
        }
      };
    };
  },
  
  /**
   * Validates data and throws formatted error if validation fails
   * Useful for server-side code that needs to halt execution on validation failure
   */
  validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
    const result = this.validate(schema, data);
    if (!result.success) {
      throw new Error(
        `Validation failed: ${result.errors?.join(', ') || 'Unknown validation error'}`
      );
    }
    return result.data!;
  },
  
  /**
   * Attempts to parse data with a schema, returning null if validation fails
   * Useful for non-critical validations where fallbacks are acceptable
   */
  validateSafe<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
    const result = this.validate(schema, data);
    return result.success ? result.data! : null;
  }
};

// Convenience exports for common middleware patterns
export const { 
  withRequestValidation, 
  withQueryValidation,
  validate,
  validateCollection,
  validateOrThrow,
  validateSafe
} = ValidationService;