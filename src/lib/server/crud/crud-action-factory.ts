// src/lib/server/crud/crud-action-factory.ts
import { z, ZodSchema } from "zod";
import { Model, Document } from "mongoose";
import { revalidatePath } from "next/cache";
import { connectToDB } from "@server/db/connection";
import { handleCrudError } from "@error/handlers/crud";
import { BaseDocument } from "@core-types/document";
import { DEFAULT_QUERY_PARAMS, QueryParams } from "@core-types/query";
import { CollectionResponse, PaginatedResponse } from "@core-types/response";
import { fetchPaginatedResource } from "@transformers/pagination/unified-pagination";
import { transformData, TransformOptions } from "@transformers/core/unified-transformer";
import { createPartialSchema } from "@server/crud/crud-utils";
/**
 * Configuration for CRUD action factory
 */
export interface CrudActionConfig<
  Doc extends Document,
  InputType,
  FullType extends BaseDocument,
  DomainType extends Record<string, unknown> = FullType
> {
  // Required config
  model: Model<Doc>;
  fullSchema: ZodSchema<FullType>;
  inputSchema: ZodSchema<InputType>;
  
  // Optional config
  revalidationPaths?: string[];
  transformOptions?: Partial<TransformOptions<FullType, DomainType>>;
  options?: {
    validSortFields?: string[];
    defaultSortField?: string;
    defaultSortOrder?: 'asc' | 'desc';
    entityName?: string;
  };
}

/**
 * Creates standardized CRUD actions for a model and schema
 * Supports domain transformations for enhanced entity types
 */
export function createCrudActions<
  Doc extends Document,
  InputType,
  FullType extends BaseDocument,
  DomainType extends Record<string, unknown> = FullType
>(config: CrudActionConfig<Doc, InputType, FullType, DomainType>) {
  const {
    model,
    fullSchema,
    inputSchema,
    revalidationPaths = [],
    transformOptions = {},
    options = {}
  } = config;
  
  const {
    validSortFields = ['createdAt', 'updatedAt'],
    defaultSortField = 'createdAt',
    defaultSortOrder = 'desc',
    entityName = model.modelName
  } = options;

  // Create a standard set of transformation options
  const standardTransformOptions: TransformOptions<FullType, DomainType> = {
    schema: fullSchema,
    handleDates: true,
    errorContext: `${entityName}Transform`,
    ...transformOptions
  };

  // Helper function to perform revalidation
  const revalidatePaths = () => {
    if (revalidationPaths.length > 0) {
      for (const path of revalidationPaths) {
        revalidatePath(path);
      }
    }
  };

  return {
    /**
     * Fetches a paginated list of items
     */
    fetch: async (params: QueryParams): Promise<PaginatedResponse<DomainType>> => {
      try {
        await connectToDB();
        
        // Prepare parameters with defaults
        const fetchParams = {
          ...DEFAULT_QUERY_PARAMS,
          ...params,
          sortBy: params.sortBy ?? defaultSortField,
          sortOrder: params.sortOrder ?? defaultSortOrder,
          filters: params.filters ?? {}
        };

        // Use the modified unified pagination with transformer options
        const result = await fetchPaginatedResource<FullType, DomainType>(
          model as unknown as Model<unknown>,
          fullSchema,
          fetchParams,
          { 
            validSortFields,
            transformOptions: standardTransformOptions
          }
        );

        return result;
      } catch (error) {
        // Standard error handling
        return {
          success: false,
          items: [] as DomainType[],
          total: 0,
          page: params.page || 1,
          limit: params.limit || 10,
          totalPages: 0,
          hasMore: false,
          empty: true,
          error: handleCrudError(error, {
            component: entityName,
            operation: 'Fetch',
            metadata: { filters: params.filters }
          }).message
        };
      }
    },

    /**
     * Creates a new item
     */
    create: async (data: InputType): Promise<CollectionResponse<DomainType>> => {
      try {
        await connectToDB();
        
        // Validate against input schema
        const validatedInput = inputSchema.parse(data);
        
        // Create the document
        const createdDoc = await model.create(validatedInput);
        
        // Transform using the unified transformer
        const transformedItems = transformData<FullType, DomainType>(
          [createdDoc.toObject()],
          standardTransformOptions
        );
        
        // Revalidate paths
        revalidatePaths();
        
        return {
          success: true,
          items: transformedItems,
          total: transformedItems.length,
          message: `${entityName} created successfully`
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            success: false,
            items: [] as DomainType[],
            total: 0,
            error: handleCrudError(error, {
              component: entityName,
              operation: 'Create',
              metadata: { data }
            }).message
          };
        }
        
        return {
          success: false,
          items: [] as DomainType[],
          total: 0,
          error: handleCrudError(error, {
            component: entityName,
            operation: 'Create'
          }).message
        };
      }
    },

    /**
     * Updates an existing item
     */
    update: async (id: string, data: Partial<InputType>): Promise<CollectionResponse<DomainType>> => {
      try {
        await connectToDB();
        
        // Create a partial schema using our utility function
        const partialSchema = createPartialSchema(inputSchema);
        
        // Validate partial input
        const validatedUpdate = partialSchema.parse(data);
        
        // Update document
        const updatedDoc = await model.findByIdAndUpdate(
          id, 
          { $set: validatedUpdate },
          { new: true }
        ).lean();
        
        if (!updatedDoc) {
          return { 
            success: false, 
            items: [] as DomainType[],
            total: 0,
            error: `${entityName} with ID ${id} not found`
          };
        }
        
        // Transform using the unified transformer
        const transformedItems = transformData<FullType, DomainType>(
          [updatedDoc as FullType],
          standardTransformOptions
        );
        
        // Revalidate paths
        revalidatePaths();
        
        return {
          success: true,
          items: transformedItems,
          total: transformedItems.length,
          message: `${entityName} updated successfully`
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            success: false,
            items: [] as DomainType[],
            total: 0,
            error: handleCrudError(error, {
              component: entityName,
              operation: 'Update',
              metadata: { id, data }
            }).message
          };
        }
        
        return {
          success: false,
          items: [] as DomainType[],
          total: 0,
          error: handleCrudError(error, {
            component: entityName,
            operation: 'Update',
            metadata: { id }
          }).message
        };
      }
    },

    /**
     * Deletes an item
     */
    delete: async (id: string): Promise<CollectionResponse<DomainType>> => {
      try {
        await connectToDB();
        
        // Find document first to return it
        const docToDelete = await model.findById(id).lean();
        
        if (!docToDelete) {
          return { 
            success: false, 
            items: [] as DomainType[],
            total: 0,
            error: `${entityName} with ID ${id} not found`
          };
        }
        
        // Delete the document
        await model.findByIdAndDelete(id);
        
        // Transform the deleted document
        const transformedItems = transformData<FullType, DomainType>(
          [docToDelete as FullType],
          standardTransformOptions
        );
        
        // Revalidate paths
        revalidatePaths();
        
        return {
          success: true,
          items: transformedItems,
          total: transformedItems.length,
          message: `${entityName} deleted successfully`
        };
      } catch (error) {
        return {
          success: false,
          items: [] as DomainType[],
          total: 0,
          error: handleCrudError(error, {
            component: entityName,
            operation: 'Delete',
            metadata: { id }
          }).message
        };
      }
    },

    /**
     * Fetches a single item by ID
     */
    fetchById: async (id: string): Promise<CollectionResponse<DomainType>> => {
      try {
        await connectToDB();
        
        const item = await model.findById(id).lean().exec();
        
        if (!item) {
          return { 
            success: false, 
            items: [] as DomainType[],
            total: 0,
            error: `${entityName} with ID ${id} not found`
          };
        }
        
        // Transform using the unified transformer
        const transformedItems = transformData<FullType, DomainType>(
          [item as FullType],
          standardTransformOptions
        );
        
        if (transformedItems.length === 0) {
          return {
            success: false,
            items: [] as DomainType[],
            total: 0,
            error: `Invalid ${entityName} data`
          };
        }
        
        return { 
          success: true, 
          items: transformedItems,
          total: 1
        };
      } catch (error) {
        return {
          success: false,
          items: [] as DomainType[],
          total: 0,
          error: handleCrudError(error, {
            component: entityName,
            operation: 'FetchById',
            metadata: { id }
          }).message
        };
      }
    },

    /**
     * Bulk create multiple items
     */
    bulkCreate: async (dataArray: InputType[]): Promise<CollectionResponse<DomainType>> => {
      try {
        await connectToDB();
        
        // Validate all inputs
        const validatedInputs = dataArray.map(data => inputSchema.parse(data));
        
        // Create all documents
        const createdDocs = await model.insertMany(validatedInputs);
            
        // Convert documents to plain objects for transformation
       const docsToTransform: FullType[] = Array.isArray(createdDocs)
        ? createdDocs.map(doc => (doc as unknown as { toObject(): FullType }).toObject())
        : [(createdDocs as unknown as { toObject(): FullType }).toObject()];
        
        // Transform all created documents
        const transformedItems = transformData<FullType, DomainType>(
          docsToTransform as FullType[],
          standardTransformOptions
        );
        
        // Revalidate paths
        revalidatePaths();
        
        return {
          success: true,
          items: transformedItems,
          total: transformedItems.length,
          message: `${transformedItems.length} ${entityName}(s) created successfully`
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            success: false,
            items: [] as DomainType[],
            total: 0,
            error: handleCrudError(error, {
              component: entityName,
              operation: 'BulkCreate',
              metadata: { dataArray }
            }).message
          };
        }
        
        return {
          success: false,
          items: [] as DomainType[],
          total: 0,
          error: handleCrudError(error, {
            component: entityName,
            operation: 'BulkCreate'
          }).message
        };
      }
    },

    /**
     * Bulk update multiple items
     */
    bulkUpdate: async (updates: Array<{ id: string; data: Partial<InputType> }>): Promise<CollectionResponse<DomainType>> => {
      try {
        await connectToDB();
        
        const results: unknown[] = [];
        const partialSchema = createPartialSchema(inputSchema);
        
        for (const { id, data } of updates) {
          // Validate each update
          const validatedUpdate = partialSchema.parse(data);
          
          // Update the document
          const updatedDoc = await model.findByIdAndUpdate(
            id, 
            { $set: validatedUpdate },
            { new: true }
          ).lean();
          
          if (updatedDoc) {
            results.push(updatedDoc);
          }
        }
        
        // Transform all updated documents
        const transformedItems = transformData<FullType, DomainType>(
          results as FullType[],
          standardTransformOptions
        );
        
        // Revalidate paths
        revalidatePaths();
        
        return {
          success: true,
          items: transformedItems,
          total: transformedItems.length,
          message: `${transformedItems.length} ${entityName}(s) updated successfully`
        };
      } catch (error) {
        return {
          success: false,
          items: [] as DomainType[],
          total: 0,
          error: handleCrudError(error, {
            component: entityName,
            operation: 'BulkUpdate'
          }).message
        };
      }
    }
  };
}
