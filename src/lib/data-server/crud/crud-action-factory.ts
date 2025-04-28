// src/lib/data-server/crud/crud-action-factory.ts
import { z } from "zod";
import { Model, FilterQuery } from "mongoose";
import { 
  createItem,
  updateItem,
  deleteItem,
} from "./crud-operations";
import type { CrudResultType } from "@core-types/crud";
import { BaseDocument } from "@core-types/document";  
import { connectToDB } from "@data-server/db/connection";
import { handleCrudError } from "@error/crud-error-handling";
import { PaginatedResponse } from "@core-types/response";
import { FetchParams, getDefaultFetchParams as getDefaultParams } from "@core-types/api";

// Utility to sanitize sort fields
export function sanitizeSortBy(
    allowedSortFields: string[],
    sortBy?: string | string[]
  ): Record<string, 1 | -1> {
    if (!sortBy) return { _id: -1 };
    
    const sortFields = Array.isArray(sortBy) ? sortBy : [sortBy];
    const sortOptions: Record<string, 1 | -1> = {};
    
    // Process each sort field
    sortFields.forEach(field => {
      const isDesc = field.startsWith("-");
      const cleanField = isDesc ? field.substring(1) : field;
      
      // Only add if it's an allowed field
      if (allowedSortFields.includes(cleanField)) {
        sortOptions[cleanField] = isDesc ? -1 : 1;
      }
    });
    
    // Default to _id descending if no valid sort fields
    if (Object.keys(sortOptions).length === 0) {
      return { _id: -1 };
    }
    
    return sortOptions;
  }
  
  // Apply default pagination parameters - adapter for compatibility
// Apply default pagination parameters - adapter for compatibility
export function getDefaultFetchParams(params: FetchParams): ReturnType<typeof getDefaultParams> {
    return getDefaultParams(params);
}

// Fetch paginated resources
export async function fetchPaginatedResource<
  Doc extends BaseDocument, 
  Schema extends z.ZodType
>(
  model: Model<Doc>,
  schema: Schema,
  params: ReturnType<typeof getDefaultFetchParams>,
  options: {
    validSortFields: string[];
    defaultSortField?: string;
  }
): Promise<PaginatedResponse<z.infer<Schema>>> {
  try {
    await connectToDB();
    
    const { page, limit, sortBy, filter, search, searchFields } = params;
    
    // Build query
    let query = model.find(filter as FilterQuery<Doc>);
    
    // Add text search if provided
    if (search && searchFields && searchFields.length > 0) {
      // Use a safer approach for creating search conditions
      const searchConditions: FilterQuery<Doc>[] = [];
      
      for (const field of searchFields) {
        const condition = {
          [field]: { $regex: search, $options: 'i' }
        } as unknown as FilterQuery<Doc>;
        
        searchConditions.push(condition);
      }
      
      if (searchConditions.length > 0) {
        query = query.or(searchConditions);
      }
    }
    
    // Count total before pagination
    const total = await model.countDocuments(query.getFilter());
    
    // Apply pagination and sorting
    const sortOptions = sanitizeSortBy(
      options.validSortFields,
      typeof sortBy === 'string' ? sortBy : undefined
    );
    
    query = query
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit);
    
    // Execute query
    const items = await query.lean().exec();
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;
    const empty = items.length === 0;
    
    // Validate items against schema
    const validatedItems = items.map(item => {
      try {
        return schema.parse(item);
      } catch (error) {
        console.error(`Validation error for item ${String(item._id)}:`, error);
        return item; // Return original if validation fails
      }
    }) as z.infer<Schema>[];
    
    return {
      success: true,
      items: validatedItems,
      total,
      page,
      limit,
      totalPages,
      hasMore,
      empty
    };
  } catch (error) {
    return {
      ...handleCrudError(error, "FetchPaginated"),
      items: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      hasMore: false,
      empty: true
    };
  }
}

/**
 * Creates standardized CRUD actions for a model and schema
 */
export function createCrudActions<
  Doc extends BaseDocument,
  InputType,
  FullType
>(config: {
  model: Model<Doc>;
  fullSchema: z.ZodType<FullType>;
  inputSchema: z.ZodType<InputType>;
  revalidationPaths?: string[];
  options?: {
    validSortFields?: string[];
    defaultSortField?: string;
    defaultSortOrder?: 'asc' | 'desc';
    entityName?: string;
  };
}) {
  const {
    model,
    fullSchema,
    inputSchema,
    revalidationPaths = [],
    options = {}
  } = config;
  
  const {
    validSortFields = [],
    defaultSortField = 'createdAt',
    defaultSortOrder = 'desc',
    entityName = model.modelName
  } = options;

  return {
    /**
     * Fetches a paginated list of items
     */
    fetch: async (params: FetchParams = {}): Promise<PaginatedResponse<FullType>> => {
      try {
        await connectToDB();
        
        // Prepare parameters
        const fetchParams = getDefaultFetchParams({
          ...params,
          sortBy: params.sortBy ?? defaultSortField,
          sortOrder: params.sortOrder ?? defaultSortOrder
        });

        return fetchPaginatedResource(
          model,
          fullSchema,
          fetchParams,
          { 
            validSortFields,
            defaultSortField
          }
        );
      } catch (error) {
        return {
          ...handleCrudError(error, `${entityName}Fetch`),
          items: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
          hasMore: false,
          empty: true
        };
      }
    },

    /**
     * Creates a new item
     */
    create: async (data: InputType): Promise<CrudResultType<FullType>> => {
      try {
        await connectToDB();
        
        const result = await createItem(
          model,
          inputSchema,
          data,
          revalidationPaths
        );
        
        // Cast the result to match the expected return type
        return result as unknown as CrudResultType<FullType>;
      } catch (error) {
        return handleCrudError(error, `${entityName}Create`) as unknown as CrudResultType<FullType>;
      }
    },

    /**
     * Updates an existing item
     */
    update: async (id: string, data: Partial<InputType>): Promise<CrudResultType<FullType>> => {
      try {
        await connectToDB();
        
        const result = await updateItem(
          model,
          inputSchema,
          id,
          data,
          revalidationPaths
        );
        
        // Cast the result to match the expected return type
        return result as unknown as CrudResultType<FullType>;
      } catch (error) {
        return handleCrudError(error, `${entityName}Update`) as unknown as CrudResultType<FullType>;
      }
    },

    /**
     * Deletes an item
     */
    delete: async (id: string): Promise<CrudResultType<FullType>> => {
      try {
        await connectToDB();
        
        return await deleteItem(
          model,
          fullSchema,
          id,
          revalidationPaths
        );
      } catch (error) {
        return handleCrudError(error, `${entityName}Delete`) as unknown as CrudResultType<FullType>;
      }
    },

    /**
     * Fetches a single item by ID
     */
    fetchById: async (id: string): Promise<CrudResultType<FullType>> => {
      try {
        await connectToDB();
        const item = await model.findById(id).lean().exec();
        
        if (!item) {
          return { 
            success: false, 
            error: `${entityName} not found`,
            message: `${entityName} not found`
          };
        }
        
        try {
          const validatedItem = fullSchema.parse(item);
          return { 
            success: true, 
            data: validatedItem as FullType
          };
        } catch (error) {
          return handleCrudError(error, `${entityName}FetchById`) as unknown as CrudResultType<FullType>;
        }
      } catch (error) {
        return handleCrudError(error, `${entityName}FetchById`) as unknown as CrudResultType<FullType>;
      }
    }
  };
} 