import { BaseResponse, ResourceResponse } from '@/lib/types/core/response';
import { MondayBoard, MondayItem } from '@api-monday/types';

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