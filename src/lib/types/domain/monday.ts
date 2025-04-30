// src/lib/types/domain/monday.ts

/**
 * Core Monday.com board structure
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
 */
export interface MondayItem {
  id: string;
  name: string;
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
 */
export interface MondayBoardResponse {
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
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}