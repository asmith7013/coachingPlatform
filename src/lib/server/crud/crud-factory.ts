// src/lib/server/crud/crud-factory.ts
import { ZodType } from "zod";
import { Model, Document } from "mongoose";
import { revalidatePath } from "next/cache";
import { connectToDB } from "@server/db/connection";
import { BaseDocument } from "@core-types/document";
import { QueryParams, DEFAULT_QUERY_PARAMS } from "@core-types/query";
import { PaginatedResponse, EntityResponse, BaseResponse } from "@core-types/response";
import { fetchPaginatedResource } from "@transformers/pagination/unified-pagination";

import { createTransformer } from "@transformers/core/unified-transformer";
import { createValidator } from "@transformers/utils/validation-helpers";
import { handleCrudError } from "@error/handlers/crud";
import { fetchById } from "@transformers/utils/fetch-utils";

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

  // Create reusable transformer instances
  const transformer = createTransformer<T, T>({
    schema: schema as ZodType<T>,
    handleDates: true,
    errorContext: `${name}CRUD`
  });

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

        return await fetchPaginatedResource(model, schema as ZodType<T>, fetchParams, {
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
        
        // Transform the single document
        let transformed: T[];
        try {
          transformed = transformer.transform([plainDocument]);
        } catch (transformError) {
          console.warn('⚠️ Transformation failed, using document as-is:', transformError);
          transformed = [plainDocument as T];
        }
        
        if (!transformed || transformed.length === 0) {
          throw new Error("Failed to transform created document");
        }

        revalidatePaths();
        
        return {
          success: true,
          data: transformed[0],
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
        ).lean();
        
        if (!doc) {
          throw new Error(`${name} with ID ${id} not found`);
        }
        
        const transformed = transformer.transform([doc]);
        
        if (!transformed || transformed.length === 0) {
          throw new Error("Failed to transform updated document");
        }
        
        revalidatePaths();
        
        return {
          success: true,
          data: transformed[0],
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
        const result = await fetchById(model, id, schema as ZodType<T>);
        
        if (!result.success || result.items.length === 0) {
          throw new Error(result.error || `${name} with ID ${id} not found`);
        }
        
        return {
          success: true,
          data: result.items[0] as T
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