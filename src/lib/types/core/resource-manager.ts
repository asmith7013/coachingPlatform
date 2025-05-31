import { CollectionResponse } from '@core-types/response';
import type { QueryParams } from "@core-types/query";
// import { BaseDocument } from "@core-types/document";

export type FetchFunction<T> = (params: QueryParams) => Promise<CollectionResponse<T>>;

export interface ResourceManagerOptions {
  initialPage?: number;
  initialLimit?: number;
  defaultSortOrder?: "asc" | "desc";
  debug?: boolean;
}

// Helper to get ID value regardless of property name
export function getId(item: { id: string } | { _id: string }): string {
  return 'id' in item ? item.id : item._id;
}