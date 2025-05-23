import { z } from 'zod';

// API error schema for external integrations
export const ApiErrorZodSchema = z.object({
  error: z.string().describe("API error message"),
  code: z.string().optional().describe("API error code"),
  statusCode: z.number().optional().describe("HTTP status code"),
  path: z.string().optional().describe("API path that failed"),
  method: z.string().optional().describe("HTTP method"),
  field: z.string().optional().describe("Field that caused the error"),
  item: z.unknown().optional().describe("Item that caused the error"),
  details: z.string().optional().describe("Additional error details"),
  traceId: z.string().optional().describe("Trace ID for debugging")
});

// GraphQL error schema
export const GraphQLErrorZodSchema = z.object({
  message: z.string().describe("GraphQL error message"),
  locations: z.array(z.object({
    line: z.number(),
    column: z.number()
  })).optional().describe("Error locations in the query"),
  path: z.array(z.string()).optional().describe("Path to the error in the result"),
  extensions: z.record(z.unknown()).optional().describe("Additional error information")
});

// OAuth error schema
export const OAuthErrorZodSchema = z.object({
  error: z.string().describe("OAuth error type"),
  error_description: z.string().optional().describe("Human-readable error description"),
  error_uri: z.string().optional().describe("URI with error information")
}); 