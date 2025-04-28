/**
 * Type alias to extract keys of an object whose values match a specific type
 */
export type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

/**
 * Type alias to pick properties from an object whose values match a specific type
 */
export type PickByType<T, V> = Pick<T, KeysOfType<T, V>>;

/**
 * Type alias for a function that takes no arguments and returns a value
 */
export type Thunk<T> = () => T;

/**
 * Type alias for a function that takes a value and returns another value
 */
export type Mapper<T, U> = (value: T) => U;

/**
 * Type alias for a function that takes a value and returns a promise
 */
export type AsyncMapper<T, U> = (value: T) => Promise<U>;

/**
 * Type alias for a function that takes a value and returns a boolean
 */
export type Predicate<T> = (value: T) => boolean;

/**
 * Type alias for a function that takes a value and returns a void promise
 */
export type AsyncVoidFn<T> = (value: T) => Promise<void>;

/**
 * Type alias for a record with string keys
 */
export type StringRecord<T> = Record<string, T>;

/**
 * Type alias for a nullable type
 */
export type Nullable<T> = T | null;

/**
 * Type alias for an optional type
 */
export type Optional<T> = T | undefined; 