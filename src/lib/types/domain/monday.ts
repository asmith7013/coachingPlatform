// src/lib/types/domain/monday.ts
import { 
  BaseResponse,
  ResourceResponse
} from '@/lib/types/core/response';
import { ClientDocument } from '@/lib/types/core/document';

/**
 * Core Monday.com Types
 * Contains all type definitions for Monday.com integration
 */

/**
 * Core Monday.com board structure
 * Follows entity naming conventions with common id field
 */
export interface MondayBoard {
  id: string;
  name: string;
  description?: string;
  workspace?: {
    id: string;
    name: string;
  };
  columns: MondayColumn[];
  items_page?: {
    cursor: string;
    items: MondayItem[];
  };
}

/**
 * Column definition in a Monday.com board
 */
export interface MondayColumn {
  id: string;
  title: string;
  type: string;
  settings_str?: string;
}

/**
 * Item (row) in a Monday.com board
 * Implements a minimal subset of ClientDocument properties for consistency
 */
export interface MondayItem extends Pick<ClientDocument, 'id'> {
  id: string;
  name: string;
  board_id?: string;
  state?: string; // Item state (active, archived, deleted)
  column_values: MondayColumnValue[];
}

/**
 * Value for a specific column in a Monday.com item
 */
export interface MondayColumnValue {
  id: string;
  title?: string; // Title is optional as it's not always returned
  text: string | null;
  value: string | null; // JSON string for complex values
}

/**
 * API response format for board queries
 * Follows the ResourceResponse pattern
 */
export interface MondayBoardResponse extends Pick<ResourceResponse<MondayBoard>, 'success'> {
  boards: MondayBoard[];
}

/**
 * API response format for item queries
 */
export interface MondayItemsResponse {
  boards: {
    items: MondayItem[];
  }[];
}

/**
 * Board with items page for import functionality
 */
export interface MondayBoardWithItemsPage {
  items_page: {
    items: MondayItem[];
  };
}

/**
 * Response format for importing from Monday.com
 */
export interface MondayResponse {
  boards: MondayBoardWithItemsPage[];
}

/**
 * Standard API response wrapper compatible with core response patterns
 * Uses the same structure as BaseResponse but maintains backward compatibility
 */
export interface ApiResponse<T> extends Pick<BaseResponse, 'success'> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Monday.com user information
 */
export interface MondayUser {
  id: string;
  name: string;
  email: string;
}

/**
 * Import preview for Monday.com items
 */
export interface ImportPreview {
  original: Record<string, unknown>;
  transformed: Record<string, unknown>;
  valid: boolean;
  existingItem?: Record<string, unknown>;
  isDuplicate: boolean;
  missingRequired: string[];
  errors: Record<string, string>;
}

/**
 * Monday to Visit mapping field definition
 */
export interface MondayFieldMapping {
  field: string;
  required: boolean;
  transform?: (value: string) => Promise<unknown> | unknown;
}

/**
 * Transform result from Monday.com item to Visit
 * Following pattern similar to core response types
 */
export interface TransformResult extends Pick<BaseResponse, 'success'> {
  transformed: Record<string, unknown>;
  valid: boolean;
  success: boolean;
  missingRequired: string[];
  errors: Record<string, string>;
}

/**
 * Import result from Monday.com items
 * Follows the BaseResponse pattern
 */
export interface ImportResult extends Pick<BaseResponse, 'success' | 'message'> {
  success: boolean;
  imported: number;
  errors: Record<string, string>;
  message?: string;
}

/**
 * Monday column ID map
 */
export interface MondayColumnMap {
  [key: string]: string;
}

/**
 * Testing connection result
 * Follows the BaseResponse pattern
 */
export interface MondayConnectionTestResult extends Pick<BaseResponse, 'success' | 'message'> {
  success: boolean;
  data?: {
    name: string;
    email: string;
  };
  error?: string;
  message?: string;
}