import { createEntityHooks } from '@/query/client/factories/entity-hooks';
import { 
  VisitZodSchema, 
  VisitInputZodSchema, 
  Visit, 
  VisitInput 
} from '@/lib/data-schema/zod-schema/visits/visit';
import { 
  fetchVisits, 
  createVisit
} from '@/app/actions/visits/visits';
import { WithDateObjects } from '@/lib/types/core/document';
import { wrapServerActions } from '@/lib/data-utilities/transformers/factories/server-action-factory';
import { QueryParams } from '@core-types/query';
import { ZodType } from 'zod';
import { CollectionResponse } from '@core-types/response';
import { transformDocument } from '@/lib/data-utilities/transformers/core/document';

/**
 * Visit entity with Date objects instead of string dates
 */
export type VisitWithDates = WithDateObjects<Visit>;

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
  (items: Visit[]) => transformDocument(items) as VisitWithDates[]
);

/**
 * Custom React Query hooks for Visit entity
 * 
 * These hooks handle fetching, creating, updating, and deleting visits
 * with proper date transformation (string dates to Date objects)
 */
const {
  useList: useVisitsList,
  useById: useVisitById,
  useMutations: useVisitsMutations,
  useEntity: useVisits
} = createEntityHooks<VisitWithDates, VisitInput>({
  entityType: 'visits',
  // The Zod schema uses string for dates, but VisitWithDates uses Date objects after transformation.
  // This cast is safe because we transform the data after fetching.
  fullSchema: VisitZodSchema as ZodType<VisitWithDates>,
  inputSchema: VisitInputZodSchema,
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