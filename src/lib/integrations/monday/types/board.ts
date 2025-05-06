import { ClientDocument } from '@/lib/types/core/document';

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
export interface MondayItem extends Pick<ClientDocument, 'id'> {
  id: string;
  name: string;
  board_id?: string;
  state?: string;
  column_values: MondayColumnValue[];
}

/**
 * Value for a specific column in a Monday.com item
 */
export interface MondayColumnValue {
  id: string;
  title?: string;
  text: string | null;
  value: string | null;
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
 * Monday column ID map
 */
export interface MondayColumnMap {
  [key: string]: string;
}