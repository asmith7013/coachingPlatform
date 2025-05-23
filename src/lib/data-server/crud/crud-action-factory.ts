// src/lib/data-server/crud/crud-action-factory.ts
import { z } from "zod";
import { Model, FilterQuery } from "mongoose";
import { 
  createItem,
  updateItem,
  deleteItem,
} from "./crud-operations";
import { BaseDocument } from "@core-types/document";  
import { connectToDB } from "@data-server/db/connection";
import { handleCrudError } from "@error/handlers/crud";
import { CollectionResponse } from "@core-types/response";
import { PaginatedResponse } from "@core-types/pagination";
import { QueryParams, buildQueryParams as getDefaultParams } from "@core-types/query";
// Import the sanitization utilities
import { transformDocument } from "@/lib/data-utilities/transformers/core/db-transformers";
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
export function buildQueryParams(params: QueryParams): ReturnType<typeof getDefaultParams> {
    return getDefaultParams(params);
}

// Fetch paginated resources
export async function fetchPaginatedResource<
  Doc extends BaseDocument, 
  Schema extends z.ZodType
>(
  model: Model<Doc>,
  schema: Schema,
  params: ReturnType<typeof buildQueryParams>,
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
    
    // UPDATED: Validate items against schema with sanitization
    const validatedItems = items.map(item => {
      try {
        // First sanitize the document (convert ObjectIds to strings, etc.)
        const sanitized = transformDocument(item);
        return schema.parse(sanitized) as z.infer<Schema>;
      } catch (error) {
        console.error(`Validation error for item ${String(item._id)}:`, error);
        // If validation fails, still return a sanitized version
        const sanitized = transformDocument(item);
        return sanitized as z.infer<Schema>;
      }
    });
    
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
    fetch: async (params: QueryParams = {}): Promise<PaginatedResponse<FullType>> => {
      try {
        await connectToDB();
        
        // Prepare parameters
        const fetchParams = buildQueryParams({
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
    create: async (data: InputType): Promise<CollectionResponse<FullType>> => {
      try {
        await connectToDB();
        
        const result = await createItem(
          model,
          inputSchema,
          data,
          revalidationPaths
        );
        
        // Convert CrudResultType to CollectionResponse
        return {
          success: result.success,
          items: result.data ? [result.data] : [],
          message: result.message
        };
      } catch (error) {
        const errorResult = handleCrudError(error, `${entityName}Create`);
        return {
          success: false,
          items: [],
          message: errorResult.message
        };
      }
    },

    /**
     * Updates an existing item
     */
    update: async (id: string, data: Partial<InputType>): Promise<CollectionResponse<FullType>> => {
      try {
        await connectToDB();
        
        const result = await updateItem(
          model,
          inputSchema,
          id,
          data,
          revalidationPaths
        );
        
        // Convert CrudResultType to CollectionResponse
        return {
          success: result.success,
          items: result.data ? [result.data] : [],
          message: result.message
        };
      } catch (error) {
        const errorResult = handleCrudError(error, `${entityName}Update`);
        return {
          success: false,
          items: [],
          message: errorResult.message
        };
      }
    },

    /**
     * Deletes an item
     */
    delete: async (id: string): Promise<CollectionResponse<FullType>> => {
      try {
        await connectToDB();
        
        const result = await deleteItem(
          model,
          fullSchema,
          id,
          revalidationPaths
        );
        
        // Convert CrudResultType to CollectionResponse
        return {
          success: result.success,
          items: result.data ? [result.data] : [],
          message: result.message
        };
      } catch (error) {
        const errorResult = handleCrudError(error, `${entityName}Delete`);
        return {
          success: false,
          items: [],
          message: errorResult.message
        };
      }
    },

    /**
     * Fetches a single item by ID
     */
    fetchById: async (id: string): Promise<CollectionResponse<FullType>> => {
      try {
        await connectToDB();
        const item = await model.findById(id).lean().exec();
        
        if (!item) {
          return { 
            success: false, 
            items: [],
            message: `${entityName} not found`
          };
        }
        
        try {
          // UPDATED: Use deepSanitize and then parse with schema for lean objects
          const sanitized = transformDocument(item);
          const validatedItem = fullSchema.parse(sanitized);
          return { 
            success: true, 
            items: [validatedItem as FullType]
          };
        } catch (error) {
          const errorResult = handleCrudError(error, `${entityName}FetchById`);
          return {
            success: false,
            items: [],
            message: errorResult.message
          };
        }
      } catch (error) {
        const errorResult = handleCrudError(error, `${entityName}FetchById`);
        return {
          success: false,
          items: [],
          message: errorResult.message
        };
      }
    }
  };
} 