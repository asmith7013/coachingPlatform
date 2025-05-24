import { BaseDocument, WithDateObjects } from '@core-types/document';
import { TransformOptions } from '@transformers/unified-transformer';

/**
 * Basic selector function type
 */
export type SelectorFunction<T, R = T[]> = (data: unknown) => R;

/**
 * Interface for entity selectors
 */
export interface EntitySelector<T extends BaseDocument> {
  // Basic selectors
  basic: SelectorFunction<T, T[]>;
  detail: SelectorFunction<T, T | null>;
  
  // Common transformations
  withDates: SelectorFunction<T, WithDateObjects<T>[]>;
  reference: SelectorFunction<T, Array<{ value: string; label: string }>>;
  
  // Pagination handling
  paginated: SelectorFunction<T, {
    items: T[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }
  }>;
  
  // Advanced usage
  transform: <R>(transformFn: (item: T) => R) => SelectorFunction<T, R[]>;
  withOptions: (options: Partial<TransformOptions<T>>) => SelectorFunction<T, T[]>;
  
  // Schema validation
  validate: (data: unknown) => boolean;
} 