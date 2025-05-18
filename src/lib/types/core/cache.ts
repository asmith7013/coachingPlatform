import type { Identifiable } from './base-types';
import type { QueryKey } from '@tanstack/react-query';
import type { BaseResponse } from './response';

/**
 * Cache operation types for entity mutations
 */
export type CacheOperationType = 'create' | 'update' | 'delete' | 'bulkCreate' | 'bulkUpdate' | 'bulkDelete';

/**
 * Configuration for cache synchronization
 */
export interface CacheSyncConfig {
  /** The entity type being operated on (e.g., 'school', 'visit') */
  entityType: string;
  /** The type of operation being performed */
  operationType: CacheOperationType;
  /** Optional collection of paths to revalidate (for Next.js) */
  revalidatePaths?: string[];
  /** Optional query keys to invalidate in addition to standard entity keys */
  additionalInvalidateKeys?: QueryKey[];
}

/**
 * Options for optimistic update operations
 */
export interface OptimisticUpdateOptions<T> {
  /** The entity type being operated on */
  entityType: string;
  /** Function to extract ID from entity (defaults to _id or id) */
  getEntityId?: (entity: T) => string;
  /** Optional additional query keys to invalidate after update */
  invalidateQueries?: QueryKey[];
}

/**
 * Result of a server action with proper typing
 */
export type ServerActionResult<T> = Promise<BaseResponse & { data?: T }>;

/**
 * Type for a server action function
 */
export type ServerAction<TArgs extends unknown[], TResult> = (...args: TArgs) => Promise<TResult>;

/**
 * Interface for cache operations for a specific entity
 */
export interface EntityCacheOperations {
  /** Invalidate list queries for an entity */
  invalidateList: () => Promise<void>;
  /** Invalidate a single entity by ID */
  invalidateDetail: (id: string) => Promise<void>;
  /** Update entity data directly in cache */
  updateEntity: <T extends Identifiable>(id: string, updater: (old: T) => T) => Promise<void>;
  /** Add a new entity to list cache */
  addEntity: <T extends Identifiable>(entity: T) => Promise<void>;
  /** Remove an entity from list cache */
  removeEntity: (id: string) => Promise<void>;
} 