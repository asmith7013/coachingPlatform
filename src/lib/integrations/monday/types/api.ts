import { BaseResponse, EntityResponse } from '@core-types/response';
import { MondayBoard, MondayItem } from '@lib/integrations/monday/types/board';

/**
 * Standard API response wrapper compatible with core response patterns
 */
export interface ApiResponse<T> extends Pick<BaseResponse, 'success'> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * API response format for board queries
 */
export interface MondayBoardResponse extends Pick<EntityResponse<MondayBoard>, 'success'> {
  boards: MondayBoard[];
  error?: string;
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
 * Testing connection result
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

/**
 * Monday.com user information
 */
export interface MondayUser {
  id: string;
  name: string;
  email: string;
}

/**

/**
 * Monday.com user API response
 */
export interface MondayUserResponse {
  success: boolean;
  items: MondayUser[];
  error?: string;
} 