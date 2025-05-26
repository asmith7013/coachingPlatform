import { createEntityHooks } from '@query/client/factories/entity-factory';
import { VisitZodSchema, VisitInputZodSchema, Visit } from '@zod-schema/visits/visit';

import { fetchVisits, createVisit } from '@/app/actions/visits/visits';
import { WithDateObjects, DocumentInput } from '@core-types/document';
import { wrapServerActions } from '@transformers/factories/server-action-factory';
import { QueryParams } from '@core-types/query';
import { ZodType } from 'zod';
import { CollectionResponse } from '@core-types/response';
import { transformData } from '@transformers/core/unified-transformer';
import { asDateObjectSchema } from '@/lib/schema/zod-schema/base-schemas';

/**
 * Visit entity with Date objects instead of string dates
 */
export type VisitWithDates = WithDateObjects<Visit>;

/**
 * Input type that satisfies DocumentInput constraint for Visit
 */
export type VisitInput = DocumentInput<Visit>;
/**
 * Adapter to ensure fetchVisits returns PaginatedResponse (adds hasMore and required fields)
 */
const fetchVisitsWithHasMore = async (params: QueryParams) => {
  const result = await fetchVisits(params);
  // Ensure required fields for PaginatedResponse
  const page = typeof result.page === 'number' ? result.page : 1;
  const limit = typeof result.limit === 'number' ? result.limit : 10;
  const total = typeof result.total === 'number' ? result.total : 0;
  const totalPages = typeof result.totalPages === 'number' ? result.totalPages : Math.ceil(total / limit);
  return {
    ...result,
    page,
    limit,
    total,
    totalPages,
    hasMore: page * limit < total,
  };
};

/**
 * Wraps all server actions to transform dates in responses
 */
const wrappedActions = wrapServerActions<Visit, VisitWithDates, VisitInput>(
  {
    fetch: fetchVisitsWithHasMore,
    create: createVisit as (data: VisitInput) => Promise<CollectionResponse<Visit>>,
  },
  (items: Visit[]) => transformData<Visit, VisitWithDates>(items, {
    schema: VisitZodSchema as ZodType<VisitWithDates>,
    handleDates: true,
    errorContext: 'useVisits'
  })
);

/**
 * Custom React Query hooks for Visit entity
 * 
 * These hooks handle fetching, creating, updating, and deleting visits
 * with proper date transformation (string dates to Date objects)
 */
const {
  useEntityList: useVisitsList,
  useEntityById: useVisitById,
  useMutations: useVisitsMutations,
  useManager: useVisits
} = createEntityHooks<VisitWithDates, VisitInput>({
  entityType: 'visits',
  fullSchema: asDateObjectSchema(VisitZodSchema) as ZodType<VisitWithDates>,
  inputSchema: VisitInputZodSchema as unknown as ZodType<VisitInput>,
  serverActions: wrappedActions,
  validSortFields: ['date', 'school', 'coach', 'createdAt', 'updatedAt'],
  defaultParams: {
    sortBy: 'date',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  },
  staleTime: 5 * 60 * 1000, // 5 minutes
  persistFilters: true,
  relatedEntityTypes: ['schools', 'coachingLogs']
});

// Export individual hooks
export { useVisitsList, useVisitById, useVisitsMutations, useVisits };

// Default export
export default useVisits; 