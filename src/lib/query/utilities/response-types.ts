
import { 
  extractItems,
  extractPagination,
  extractData,
  isCollectionResponse,
  isPaginatedResponse,
  isEntityResponse
} from '@data-utilities/transformers/utilities/response-utils';

export {
  createSchemaCollectionSelector as collectionSelector,
  createSchemaPaginatedSelector as paginatedSelector,
  createSchemaEntitySelector as entitySelector
} from '@data-utilities/transformers/utilities/selector-factories';

/**
 * Type guard to check if a response is a collection response
 * @deprecated Use isCollectionResponse from @/lib/data-utilities/transformers/utilities/response-utils instead
 */
export const isCollectionResponseType = isCollectionResponse;

/**
 * Type guard to check if a response is a paginated response
 * @deprecated Use isPaginatedResponse from @/lib/data-utilities/transformers/utilities/response-utils instead
 */
export const isPaginatedResponseType = isPaginatedResponse;

/**
 * Type guard to check if a response is an entity response
 * @deprecated Use isEntityResponse from @/lib/data-utilities/transformers/utilities/response-utils instead
 */
export const isEntityResponseType = isEntityResponse;

/**
 * Extracts items from a collection response
 * @deprecated Use extractItems from @/lib/data-utilities/transformers/utilities/response-utils instead
 */
export const extractItemsFromResponse = extractItems;

/**
 * Extracts pagination metadata from a paginated response
 * @deprecated Use extractPagination from @/lib/data-utilities/transformers/utilities/response-utils instead
 */
export const extractPaginationFromResponse = extractPagination;

/**
 * Extracts data from an entity response
 * @deprecated Use extractData from @/lib/data-utilities/transformers/utilities/response-utils instead
 */
export const extractDataFromResponse = extractData;