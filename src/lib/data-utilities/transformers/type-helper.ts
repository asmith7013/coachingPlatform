import { FetchFunction } from "@/lib/api/handlers/reference-endpoint";

/**
 * Creates a type-safe wrapper around fetch functions that ensures
 * the returned items array has the correct TypeScript type
 */
export function createTypeSafeFetch<T>(fetchFn: FetchFunction<T>) {
    return async (params = {}) => {
      // Call the original fetch function
      const result = await fetchFn(params);
      
      // Return the same result but with a type assertion on the items
      return {
        ...result,
        items: result.items as T[]
      };
    };
  }