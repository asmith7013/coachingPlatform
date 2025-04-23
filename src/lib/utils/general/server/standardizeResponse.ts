export interface StandardResponse<T = Record<string, unknown>> {
  items: T[];
  total?: number;
  page?: number;
  limit?: number;
  message?: string;
  success: boolean;
}

export function standardizeResponse<T>(data: T | T[] | StandardResponse<T> | null | undefined): StandardResponse<T> {
  if (!data) {
    return { items: [], success: true };
  }

  if (Array.isArray(data)) {
    return { items: data, success: true };
  }

  if (data && typeof data === 'object' && 'items' in data && Array.isArray((data as StandardResponse<T>).items)) {
    return { 
      ...data as StandardResponse<T>, 
      success: (data as StandardResponse<T>).success !== undefined ? (data as StandardResponse<T>).success : true 
    };
  }

  return { 
    items: [data as T], 
    success: true 
  };
}

export function withStandardResponse<T extends (...args: unknown[]) => Promise<unknown>>(handler: T) {
  return async function(...args: Parameters<T>): Promise<StandardResponse<Awaited<ReturnType<T>>>> {
    try {
      const result = await handler(...args);
      return standardizeResponse(result);
    } catch (error) {
      return {
        items: [],
        success: false,
        message: error instanceof Error ? error.message : String(error)
      };
    }
  };
} 