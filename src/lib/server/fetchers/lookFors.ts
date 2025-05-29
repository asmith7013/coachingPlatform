import { LookForModel, RubricModel } from '@mongoose-schema/look-fors';
import { LookForZodSchema } from '@zod-schema/look-fors/look-for';
import { RubricZodSchema } from '@zod-schema/look-fors/rubric';
import { createApiSafeFetcher } from '@/lib/server/fetchers/fetcher-factory';

/**
 * API-safe fetcher for look fors
 */
export const fetchLookForsForApi = createApiSafeFetcher(
  LookForModel,
  LookForZodSchema,
  "topic"
);

/**
 * API-safe fetcher for rubrics
 */
export const fetchRubricsForApi = createApiSafeFetcher(
  RubricModel,
  RubricZodSchema,
  "category"
); 