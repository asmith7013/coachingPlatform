// src/lib/types/core/api-integration.ts
import { z } from "zod";
import {
  ApiRequestConfigZodSchema,
  IntegrationEndpointConfigZodSchema,
  IntegrationResponseMetaZodSchema,
  IntegrationResponseZodSchema,
} from "@zod-schema/core-types/api-integration";

// Derive types from schemas instead of defining interfaces
export type ApiRequestConfig = z.infer<typeof ApiRequestConfigZodSchema>;
export type IntegrationEndpointConfig<TParams = Record<string, unknown>> =
  z.infer<typeof IntegrationEndpointConfigZodSchema> & {
    defaultParams?: Partial<TParams>;
  };
export type IntegrationResponseMeta = z.infer<
  typeof IntegrationResponseMetaZodSchema
>;
export type IntegrationResponse = z.infer<typeof IntegrationResponseZodSchema>;
