import { z } from 'zod';
import { Model, SortOrder } from 'mongoose';
import type { ResourceResponse } from '@/lib/server-utils/types';

// Define a base type for models with timestamps
interface WithTimestamps {
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/**
 * Execute a smart query with pagination and sorting
 * 
 * @param model The mongoose model to query
 * @param filters Query filters
 * @param schema Zod schema for validation
 * @param options Pagination options
 * @returns Resource response with validated data
 */
export async function executeSmartQuery<TModel extends WithTimestamps, TOutput>(
  model: Model<TModel>,
  filters: Record<string, unknown>,
  schema: z.ZodType<TOutput>,
  options: {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }
): Promise<ResourceResponse<TOutput>> {
  const { page, limit, sortBy, sortOrder } = options;

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
  
  // Convert Mongoose documents to plain objects
  const jsonItems = items.map(item => item.toJSON());

  // Debug log for date fields in development
  if (process.env.NODE_ENV === 'development') {
    const firstItem = jsonItems[0];
    if (firstItem) {
      console.log('🔍 Document Debug Info:');
      if ('createdAt' in firstItem) {
        console.log('  CreatedAt:', {
          type: typeof firstItem.createdAt,
          value: firstItem.createdAt,
          isDate: firstItem.createdAt instanceof Date
        });
      }
      if ('updatedAt' in firstItem) {
        console.log('  UpdatedAt:', {
          type: typeof firstItem.updatedAt,
          value: firstItem.updatedAt,
          isDate: firstItem.updatedAt instanceof Date
        });
      }
    }
  }

  // Let Zod handle the parsing and type conversion
  const parsed: TOutput[] = schema.array().parse(jsonItems);

  return {
    items: parsed,
    total,
    empty: parsed.length === 0,
  };
} 