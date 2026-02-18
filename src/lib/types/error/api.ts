import { z } from "zod";
import {
  ApiErrorZodSchema,
  GraphQLErrorZodSchema,
  OAuthErrorZodSchema,
} from "@zod-schema/error/api";

// Derive types from Zod schemas
export type ApiError = z.infer<typeof ApiErrorZodSchema>;
export type GraphQLError = z.infer<typeof GraphQLErrorZodSchema>;
export type OAuthError = z.infer<typeof OAuthErrorZodSchema>;
