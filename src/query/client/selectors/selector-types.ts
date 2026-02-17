import { BaseDocument, WithDateObjects } from "@core-types/document";

/**
 * Function type for entity selectors
 * @template _T The input entity type
 * @template R The return type of the selector
 */
export type SelectorFunction<_T, R> = (data: unknown) => R;

/**
 * Interface for entity selectors that provide various transformation methods
 */
export interface EntitySelector<T extends BaseDocument> {
  // Basic selectors
  basic: SelectorFunction<T, T[]>;
  detail: SelectorFunction<T, T | null>;

  // Common transformations
  withDates: SelectorFunction<T, WithDateObjects<T>[]>;
  reference: SelectorFunction<T, Array<{ value: string; label: string }>>;

  // Pagination handling
  paginated: SelectorFunction<
    T,
    {
      items: T[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }
  >;

  // Advanced usage
  transform: <R extends Record<string, unknown>>(
    transformFn: (item: T) => R,
  ) => SelectorFunction<T, R[]>;
  withOptions: (options: Record<string, unknown>) => SelectorFunction<T, T[]>;

  // Schema validation
  validate: (data: unknown) => boolean;
}
