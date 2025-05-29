// src/lib/server/crud/crud-factory.ts
import { ZodType } from "zod";
import { Model, Document } from "mongoose";
import { revalidatePath } from "next/cache";
import { connectToDB } from "@server/db/connection";
import { BaseDocument } from "@core-types/document";
import { QueryParams, DEFAULT_QUERY_PARAMS } from "@core-types/query";
import { CollectionResponse, PaginatedResponse } from "@core-types/response";
import { fetchPaginatedResource } from "@transformers/pagination/unified-pagination";

import { createTransformer } from "@transformers/core/unified-transformer";
import { createResponseTransformer } from "@transformers/factories/response-factory";
import { createValidator } from "@transformers/utils/validation-helpers";
import { handleCrudError } from "@error/handlers/crud";
import { fetchById } from "@transformers/utils/fetch-utils";

/**
 * CRUD factory with proper type compatibility for all Zod schemas
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

  // Create reusable transformer instances with type casting for compatibility
  const transformer = createTransformer<T, T>({
    schema: schema as ZodType<T>,
    handleDates: true,
    errorContext: `${name}CRUD`
  });

  const responseTransformer = createResponseTransformer<T>(schema as ZodType<T>);
  const inputValidator = inputSchema ? createValidator(inputSchema as ZodType<TInput>, name) : null;

  // Helper function to perform revalidation
  const revalidatePaths = () => {
    revalidationPaths.forEach(path => revalidatePath(path));
  };

  return {
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

    async create(data: TInput): Promise<CollectionResponse<T>> {
      try {
        await connectToDB();
        
        let validated: TInput;
        if (inputValidator) {
          const validation = inputValidator.validateSingle(JSON.stringify(data));
          if (!validation.success) {
            return handleCrudError<T>(
              new Error(validation.error), 
              {
                component: name,
                operation: 'create',
                metadata: { data: data as Record<string, unknown> }
              }
            ) as CollectionResponse<T>;
          }
          validated = validation.data as TInput;
        } else {
          validated = data;
        }
        
        const doc = await model.create(validated);
        
        // Use unified transformer instead of processDocument to preserve all fields
        const transformed = transformer.transform([doc]);
        
        if (!transformed || transformed.length === 0) {
          return handleCrudError<T>(
            new Error("Failed to transform created document"), 
            { component: name, operation: 'create' }
          ) as CollectionResponse<T>;
        }

        const response = responseTransformer({
          success: true,
          items: transformed,
          total: 1,
          message: `${name} created successfully`
        });
        
        revalidatePaths();
        return response;
      } catch (error) {
        return handleCrudError<T>(error, {
          component: name,
          operation: 'create',
          metadata: { data: data as Record<string, unknown> }
        }) as CollectionResponse<T>;
      }
    },

    async update(id: string, data: Partial<TInput>): Promise<CollectionResponse<T>> {
      try {
        await connectToDB();
        
        let validated: Partial<TInput>;
        if (inputValidator && Object.keys(data).length > 0) {
          const validation = inputValidator.validateSingle(JSON.stringify(data));
          if (!validation.success) {
            return handleCrudError<T>(
              new Error(validation.error), 
              {
                component: name,
                operation: 'update',
                metadata: { id, data }
              }
            ) as CollectionResponse<T>;
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
          return handleCrudError<T>(
            new Error(`${name} with ID ${id} not found`), 
            { component: name, operation: 'update' }
          ) as CollectionResponse<T>;
        }
        
        const transformed = transformer.transform([doc]);
        
        revalidatePaths();
        
        return {
          success: true,
          items: transformed,
          total: transformed.length,
          message: `${name} updated successfully`
        };
      } catch (error) {
        return handleCrudError<T>(error, {
          component: name,
          operation: 'update',
          metadata: { id, data }
        }) as CollectionResponse<T>;
      }
    },

    async delete(id: string): Promise<CollectionResponse<T>> {
      try {
        await connectToDB();
        
        const doc = await model.findByIdAndDelete(id).lean();
        
        if (!doc) {
          return handleCrudError<T>(
            new Error(`${name} with ID ${id} not found`), 
            { component: name, operation: 'delete' }
          ) as CollectionResponse<T>;
        }
        
        const transformed = transformer.transform([doc]);
        
        revalidatePaths();
        
        return {
          success: true,
          items: transformed,
          total: transformed.length,
          message: `${name} deleted successfully`
        };
      } catch (error) {
        return handleCrudError<T>(error, {
          component: name,
          operation: 'delete',
          metadata: { id }
        }) as CollectionResponse<T>;
      }
    },

    async fetchById(id: string): Promise<CollectionResponse<T>> {
      try {
        const result = await fetchById(model, id, schema as ZodType<T>);
        
        if (!result.success || result.items.length === 0) {
          return handleCrudError<T>(
            new Error(result.error || `${name} with ID ${id} not found`),
            { component: name, operation: 'fetchById' }
          ) as CollectionResponse<T>;
        }
        
        return {
          success: true,
          items: result.items as T[],
          total: result.items.length
        };
      } catch (error) {
        return handleCrudError<T>(error, {
          component: name,
          operation: 'fetchById',
          metadata: { id }
        }) as CollectionResponse<T>;
      }
    }
  };
}