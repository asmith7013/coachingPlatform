// src/lib/server/crud/crud-factory.ts
import { ZodType } from "zod";
import { Model, Document } from "mongoose";
import { revalidatePath } from "next/cache";
import { connectToDB } from "@server/db/connection";
import { BaseDocument } from "@core-types/document";
import { QueryParams, DEFAULT_QUERY_PARAMS } from "@core-types/query";
import { PaginatedResponse, EntityResponse, BaseResponse } from "@core-types/response";
import { fetchPaginatedResource } from "@/lib/data-processing/pagination/unified-pagination";

// Removed over-engineered transformer - using simple sanitization instead
import { createValidator } from "@/lib/data-processing/validation/validation-helpers";
import { handleCrudError } from "@error/handlers/crud";

/**
 * CRUD factory with semantically correct response types
 */
interface CrudConfig<T extends BaseDocument, TInput = Partial<T>> {
  model: Model<Document>;
  schema: ZodType<T>;        // ← FIX: Properly typed schema constraint
  inputSchema?: ZodType<TInput>;
  name?: string;
  revalidationPaths?: string[];
  sortFields?: string[];
  defaultSortField?: string;
  defaultSortOrder?: 'asc' | 'desc';
}

export function createCrudActions<T extends BaseDocument, TInput = Partial<T>>(
  config: CrudConfig<T, TInput>
) {
  const {
    model,
    schema,
    inputSchema,
    name = model.modelName,
    revalidationPaths = [],
    sortFields = ['createdAt', 'updatedAt'],
    defaultSortField = 'createdAt',
    defaultSortOrder = 'desc'
  } = config;

  // Create input validator for validation
  const inputValidator = inputSchema ? createValidator(inputSchema as ZodType<TInput>, name) : null;

  // Helper function to perform revalidation
  const revalidatePaths = () => {
    revalidationPaths.forEach(path => revalidatePath(path));
  };

  return {
    // ✅ Collection operation - returns PaginatedResponse
    async fetch(params: QueryParams = DEFAULT_QUERY_PARAMS): Promise<PaginatedResponse<T>> {
      try {
        await connectToDB();
        
        const fetchParams = {
          ...DEFAULT_QUERY_PARAMS,
          ...params,
          sortBy: params.sortBy ?? defaultSortField,
          sortOrder: params.sortOrder ?? defaultSortOrder,
        };

        return await fetchPaginatedResource(model as Model<unknown>, schema as ZodType<T>, fetchParams, {
          validSortFields: sortFields
        });
      } catch (error) {
        return handleCrudError<T>(error, {
          component: name,
          operation: 'fetch',
          metadata: params
        }) as PaginatedResponse<T>;
      }
    },

    // ✅ Single entity operation - consistent error handling
    async create(data: TInput): Promise<EntityResponse<T>> {
      try {
        await connectToDB();
        
        let validated: TInput;
        if (inputValidator) {
          const validation = inputValidator.validateSingle(JSON.stringify(data));
          if (!validation.success) {
            // Create validation error and let handleCrudError format it
            const validationError = new Error(validation.error);
            validationError.name = 'ValidationError';
            throw validationError;
          }
          validated = validation.data as TInput;
        } else {
          validated = data;
        }
        
        const doc = await model.create(validated);
        const plainDocument = doc.toObject ? doc.toObject() : doc;
        
        revalidatePaths();
        
        return {
          success: true,
          data: plainDocument as T,
          message: `${name} created successfully`
        };
      } catch (error) {
        // ✅ Consistent error handling
        return handleCrudError<T>(error, {
          component: name,
          operation: 'create',
          metadata: { data: data as Record<string, unknown> }
        }) as EntityResponse<T>;
      }
    },

    // ✅ Single entity operation - consistent error handling
    async update(id: string, data: Partial<TInput>): Promise<EntityResponse<T>> {
      try {
        await connectToDB();
        
        let validated: Partial<TInput>;
        if (inputValidator && Object.keys(data).length > 0) {
          const validation = inputValidator.validateSingle(JSON.stringify(data));
          if (!validation.success) {
            const validationError = new Error(validation.error);
            validationError.name = 'ValidationError';
            throw validationError;
          }
          validated = validation.data as Partial<TInput>;
        } else {
          validated = data;
        }
        
        const doc = await model.findByIdAndUpdate(
          id,
          { $set: validated },
          { new: true, runValidators: true }
        );
        
        if (!doc) {
          throw new Error(`${name} with ID ${id} not found`);
        }
        
        // Convert to plain object to prevent hydration issues
        const plainDocument = doc.toObject ? doc.toObject() : doc;
        
        revalidatePaths();
        
        return {
          success: true,
          data: plainDocument as T,
          message: `${name} updated successfully`
        };
      } catch (error) {
        // ✅ Consistent error handling
        return handleCrudError<T>(error, {
          component: name,
          operation: 'update',
          metadata: { id, data }
        }) as EntityResponse<T>;
      }
    },

    // ✅ Delete operation - consistent error handling
    async delete(id: string): Promise<BaseResponse> {
      try {
        await connectToDB();
        
        const doc = await model.findByIdAndDelete(id).lean();
        
        if (!doc) {
          throw new Error(`${name} with ID ${id} not found`);
        }
        
        revalidatePaths();
        
        return {
          success: true,
          message: `${name} deleted successfully`
        };
      } catch (error) {
        // ✅ Consistent error handling
        return handleCrudError<T>(error, {
          component: name,
          operation: 'delete',
          metadata: { id }
        }) as BaseResponse;
      }
    },

    // ✅ Single entity operation - consistent error handling
    async fetchById(id: string): Promise<EntityResponse<T>> {
      try {
        await connectToDB();
        
        const doc = await model.findById(id);
        
        if (!doc) {
          throw new Error(`${name} with ID ${id} not found`);
        }
        
        // Convert to plain object to prevent hydration issues
        const plainDocument = doc.toObject ? doc.toObject() : doc;
                
        return {
          success: true,
          data: plainDocument as T
        };
      } catch (error) {
        // ✅ Consistent error handling
        return handleCrudError<T>(error, {
          component: name,
          operation: 'fetchById',
          metadata: { id }
        }) as EntityResponse<T>;
      }
    }
  };
}