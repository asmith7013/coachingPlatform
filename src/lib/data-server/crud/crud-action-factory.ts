// src/lib/data-server/crud/crud-action-factory.ts
import { z, ZodSchema, ZodObject } from "zod";
import { Model, Document } from "mongoose";
import { revalidatePath } from "next/cache";
import { connectToDB } from "@data-server/db/connection";
import { handleCrudError } from "@error/handlers/crud";
import { BaseDocument } from "@core-types/document";
import { QueryParams, PaginatedResponse } from "@core-types/query";
import { CollectionResponse } from "@core-types/response";
import { fetchPaginatedResource } from "@data-utilities/pagination/unified-pagination";
import { transformData, TransformOptions } from "@transformers/unified-transformer";

/**
 * Configuration for CRUD action factory
 */
export interface CrudActionConfig<
  Doc extends BaseDocument,
  InputType,
  FullType extends BaseDocument,
  DomainType = FullType
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
  Doc extends BaseDocument,
  InputType,
  FullType extends BaseDocument,
  DomainType = FullType
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

        // Cast the model to the expected type
        const typedModel = model as unknown as Model<Document>;
        
        // Use the modified unified pagination with transformer options
        const result = await fetchPaginatedResource<FullType>(
          typedModel,
          fullSchema,
          fetchParams,
          { 
            validSortFields,
            transformOptions: {
              ...standardTransformOptions,
              domainTransform: undefined // Remove domain transform for pagination
            }
          }
        );

        // Transform the result to use domain types
        return {
          ...result,
          items: result.items as unknown as DomainType[]
        };
      } catch (error) {
        // Standard error handling
        return {
          success: false,
          items: [],
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
        } as PaginatedResponse<DomainType>;
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
            items: [],
            total: 0,
            error: handleCrudError(error, {
              component: entityName,
              operation: 'Create',
              metadata: { data }
            }).message
          } as CollectionResponse<DomainType>;
        }
        
        return {
          success: false,
          items: [],
          total: 0,
          error: handleCrudError(error, {
            component: entityName,
            operation: 'Create'
          }).message
        } as CollectionResponse<DomainType>;
      }
    },

    /**
     * Updates an existing item
     */
    update: async (id: string, data: Partial<InputType>): Promise<CollectionResponse<DomainType>> => {
      try {
        await connectToDB();
        
        // Create a partial schema manually if inputSchema is a ZodObject
        const partialSchema = inputSchema instanceof ZodObject
          ? z.object(
              Object.fromEntries(
                Object.entries(inputSchema.shape).map(([key, value]) => [
                  key,
                  (value as z.ZodTypeAny).optional()
                ])
              )
            )
          : z.any().optional();
        
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
            items: [],
            total: 0,
            error: `${entityName} with ID ${id} not found`
          } as CollectionResponse<DomainType>;
        }
        
        // Transform using the unified transformer
        const transformedItems = transformData<FullType, DomainType>(
          [updatedDoc],
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
            items: [],
            total: 0,
            error: handleCrudError(error, {
              component: entityName,
              operation: 'Update',
              metadata: { id, data }
            }).message
          } as CollectionResponse<DomainType>;
        }
        
        return {
          success: false,
          items: [],
          total: 0,
          error: handleCrudError(error, {
            component: entityName,
            operation: 'Update',
            metadata: { id }
          }).message
        } as CollectionResponse<DomainType>;
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
            items: [],
            total: 0,
            error: `${entityName} with ID ${id} not found`
          } as CollectionResponse<DomainType>;
        }
        
        // Delete the document
        await model.findByIdAndDelete(id);
        
        // Transform the deleted document
        const transformedItems = transformData<FullType, DomainType>(
          [docToDelete],
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
          items: [],
          total: 0,
          error: handleCrudError(error, {
            component: entityName,
            operation: 'Delete',
            metadata: { id }
          }).message
        } as CollectionResponse<DomainType>;
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
            items: [],
            total: 0,
            error: `${entityName} with ID ${id} not found`
          } as CollectionResponse<DomainType>;
        }
        
        // Transform using the unified transformer
        const transformedItems = transformData<FullType, DomainType>(
          [item],
          standardTransformOptions
        );
        
        if (transformedItems.length === 0) {
          return {
            success: false,
            items: [],
            total: 0,
            error: `Invalid ${entityName} data`
          } as CollectionResponse<DomainType>;
        }
        
        return { 
          success: true, 
          items: transformedItems,
          total: 1
        };
      } catch (error) {
        return {
          success: false,
          items: [],
          total: 0,
          error: handleCrudError(error, {
            component: entityName,
            operation: 'FetchById',
            metadata: { id }
          }).message
        } as CollectionResponse<DomainType>;
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
        
        // Transform all created documents
        const transformedItems = transformData<FullType, DomainType>(
          Array.isArray(createdDocs) 
            ? createdDocs.map(doc => {
                // Type guard for Document
                if (doc && typeof doc === 'object' && 'toObject' in doc) {
                  return (doc as Document).toObject() as FullType;
                }
                return doc as FullType;
              })
            : [createdDocs && typeof createdDocs === 'object' && 'toObject' in createdDocs 
                ? (createdDocs as Document).toObject() as FullType
                : createdDocs as FullType],
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
            items: [],
            total: 0,
            error: handleCrudError(error, {
              component: entityName,
              operation: 'BulkCreate',
              metadata: { dataArray }
            }).message
          } as CollectionResponse<DomainType>;
        }
        
        return {
          success: false,
          items: [],
          total: 0,
          error: handleCrudError(error, {
            component: entityName,
            operation: 'BulkCreate'
          }).message
        } as CollectionResponse<DomainType>;
      }
    },

    /**
     * Bulk update multiple items
     */
    bulkUpdate: async (updates: Array<{ id: string; data: Partial<InputType> }>): Promise<CollectionResponse<DomainType>> => {
      try {
        await connectToDB();
        
        const results: unknown[] = [];
        const partialSchema = inputSchema.partial();
        
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
          results,
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
          items: [],
          total: 0,
          error: handleCrudError(error, {
            component: entityName,
            operation: 'BulkUpdate'
          }).message
        } as CollectionResponse<DomainType>;
      }
    }
  };
}
