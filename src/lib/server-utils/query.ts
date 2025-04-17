import { z } from 'zod';
import { Model, SortOrder } from 'mongoose';
import { USE_MOCK_DATA, loadMockData, createPaginatedMockResult } from '@/lib/dev-utils/useMockData';
import { MockAwarePaginationOptions, PaginatedResult } from './types';

/**
 * Execute a smart query with optional mock data support
 * 
 * @param model The mongoose model to query
 * @param filters Query filters
 * @param schema Zod schema for validation
 * @param options Pagination options including optional mock file
 * @returns Paginated result with validated data
 * 
 * 🎯 Use mock data during development by setting mockFile
 * 🔄 To disable: set USE_MOCK_DATA = false in useMockData.ts
 */
export async function executeSmartQuery<TModel, TOutput>(
  model: Model<TModel>,
  filters: Record<string, unknown>,
  schema: z.ZodType<TOutput>,
  options: MockAwarePaginationOptions
): Promise<PaginatedResult<TOutput>> {
  const { page, limit, sortBy, sortOrder, mockFile } = options;

  // ✅ Use mock data if requested and toggle is ON
  if (USE_MOCK_DATA && mockFile) {
    const mockData = await loadMockData<TOutput[]>(mockFile);
    if (mockData) {
      console.log(`[DEV] Using mock data from ${mockFile}`);
      return createPaginatedMockResult(mockData, page, limit);
    }
    console.warn(`[DEV] Mock file ${mockFile} not found, falling back to DB`);
  }

  // ⛳️ Real DB query
  const skip = (page - 1) * limit;
  const query = model.find(filters);

  if (sortBy) {
    const sortDirection: SortOrder = sortOrder === 'desc' ? -1 : 1;
    query.sort({ [sortBy]: sortDirection });
  }

  query.skip(skip).limit(limit);
  const items = await query.exec();
  const total = await model.countDocuments(filters);
  const parsed = schema.array().parse(items);

  return {
    data: parsed,
    total,
    page,
    limit,
  };
} 