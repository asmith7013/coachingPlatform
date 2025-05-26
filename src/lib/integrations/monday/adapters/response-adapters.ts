import { CollectionResponse, EntityResponse } from '@core-types/response';
import { MondayBoard, MondayItem } from '@lib/integrations/monday/types/board';
import { MondayConnectionTestResult, MondayUser } from '@lib/integrations/monday/types/api';

  
  /**
   * Adapts a Monday board response to the standardized entity format
   */
  export function adaptMondayBoardResponse(
    response: { boards?: MondayBoard[] }
  ): EntityResponse<MondayBoard> {
    if (!response.boards || response.boards.length === 0) {
      return {
        success: false,
        error: 'Board not found or not accessible',
        data: {} as MondayBoard
      };
    }
    
    return {
      success: true,
      data: response.boards[0]
    };
  }
  
  /**
   * Adapts a Monday boards response to the standardized collection format
   */
  export function adaptMondayBoardsResponse(
    response: { boards?: MondayBoard[] }
  ): CollectionResponse<MondayBoard> {
    if (!response.boards || response.boards.length === 0) {
      return {
        success: false,
        items: [],
        total: 0,
        error: 'No boards found'
      };
    }
    
    return {
      success: true,
      items: response.boards,
      total: response.boards.length
    };
  }
  
  /**
   * Adapts a Monday items response to the standardized collection format
   */
  export function adaptMondayItemsResponse(
    response: { boards?: { items_page?: { items?: MondayItem[] } }[] }
  ): CollectionResponse<MondayItem> {
    if (!response.boards || 
        response.boards.length === 0 || 
        !response.boards[0].items_page || 
        !response.boards[0].items_page.items) {
      return {
        success: false,
        items: [],
        total: 0,
        error: 'No items found'
      };
    }
    
    const items = response.boards[0].items_page.items;
    
    return {
      success: true,
      items,
      total: items.length
    };
  }
  
  /**
   * Adapts a Monday user response to the standardized entity format
   */
  export function adaptMondayUserResponse(
    response: { users?: MondayUser[] },
    email?: string
  ): EntityResponse<MondayUser> {
    if (!response.users || response.users.length === 0) {
      return {
        success: false,
        error: email ? `User with email ${email} not found` : 'User not found',
        data: {} as MondayUser
      };
    }
    
    return {
      success: true,
      data: response.users[0]
    };
  }
  
  /**
   * Adapts a Monday connection test response to the standardized entity format
   */
  export function adaptMondayConnectionTestResponse(
    response: { me?: { name: string; email: string } }
  ): EntityResponse<MondayConnectionTestResult> {
    if (!response.me) {
      return {
        success: false,
        error: "API returned no user data. Check token permissions.",
        data: {
          success: false,
          error: "API returned no user data. Check token permissions."
        }
      };
    }
    
    return {
      success: true,
      data: {
        success: true,
        data: {
          name: response.me.name,
          email: response.me.email
        }
      }
    };
  }