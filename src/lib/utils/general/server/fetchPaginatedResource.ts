import { z } from 'zod';
import mongoose from 'mongoose';
import { StandardResponse } from './standardizeResponse';

export interface FetchParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
  search?: string;
  searchFields?: string[];
}

export function getDefaultFetchParams(): FetchParams {
  return {
    page: 1,
    limit: 10,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    filters: {}
  };
}

export async function fetchPaginatedResource<T>(
  model: mongoose.Model<unknown>,
  schema: z.ZodType<T>,
  params: FetchParams
): Promise<StandardResponse<T>> {
  const { page = 1, limit = 10, sortBy = 'updatedAt', sortOrder = 'desc', filters = {} } = params;
  
  // Remove empty filters
  const sanitizedFilters = Object.entries(filters)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

  // Build query
  const query = model.find(sanitizedFilters);
  
  // Add search if provided
  if (params.search && params.searchFields?.length) {
    const searchRegex = new RegExp(params.search, 'i');
    const searchQuery = params.searchFields.map(field => ({ [field]: searchRegex }));
    query.or(searchQuery);
  }
  
  // Get total count
  const total = await model.countDocuments(sanitizedFilters);
  
  // Add pagination and sorting
  const skip = (page - 1) * limit;
  query.skip(skip).limit(limit).sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 });
  
  // Execute query
  const items = await query.lean();
  
  // Validate items against schema
  const validItems = items.map(item => {
    try {
      return schema.parse(item);
    } catch (error) {
      console.error('Validation error:', error);
      return item; // Return original item if validation fails
    }
  });
  
  return {
    items: validItems as T[],
    total,
    page,
    limit,
    success: true
  };
} 