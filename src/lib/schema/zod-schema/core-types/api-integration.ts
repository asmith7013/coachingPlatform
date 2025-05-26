import { z } from "zod";
import { BaseResponseZodSchema } from "@zod-schema/core-types/response";

const HttpMethodSchema = z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']);


// Use shared enum instead of duplicating
export const ApiRequestConfigZodSchema = z.object({
  url: z.string().url("Must be a valid URL").describe("API endpoint URL"),
  method: HttpMethodSchema.optional().describe("HTTP method"),
  headers: z.record(z.string()).optional().describe("Request headers"),
  body: z.unknown().optional().describe("Request body"),
  params: z.record(z.union([z.string(), z.number(), z.boolean(), z.undefined()])).optional().describe("Query parameters"),
  timeout: z.number().positive().optional().describe("Request timeout in milliseconds"),
  retry: z.object({
    attempts: z.number().int().positive().describe("Number of retry attempts"),
    delay: z.number().positive().describe("Delay between retries in milliseconds")
  }).optional().describe("Retry configuration")
});

// Auth type enum (shared building block)
export const AuthTypeSchema = z.enum(['bearer', 'basic', 'api-key']);

export const IntegrationEndpointConfigZodSchema = z.object({
  baseUrl: z.string().url("Must be a valid URL").describe("Base URL for the API"),
  headers: z.record(z.string()).optional().describe("Default headers"),
  defaultParams: z.record(z.unknown()).optional().describe("Default query parameters"),
  auth: z.object({
    type: AuthTypeSchema.describe("Authentication type"),
    tokenKey: z.string().optional().describe("Key for storing auth token"),
    headerName: z.string().optional().describe("Header name for auth token")
  }).optional().describe("Authentication configuration"),
  timeout: z.number().positive().optional().describe("Default timeout in milliseconds")
});

export const IntegrationResponseMetaZodSchema = z.object({
  statusCode: z.number().int().min(100).max(599).optional().describe("HTTP status code"),
  headers: z.record(z.string()).optional().describe("Response headers"),
  duration: z.number().nonnegative().optional().describe("Request duration in milliseconds"),
  source: z.string().optional().describe("Response source"),
  responseSize: z.number().nonnegative().optional().describe("Response size in bytes")
});

// Extend base response with meta information
export const IntegrationResponseZodSchema = BaseResponseZodSchema.extend({
  meta: IntegrationResponseMetaZodSchema.optional().describe("Integration-specific metadata")
}); 