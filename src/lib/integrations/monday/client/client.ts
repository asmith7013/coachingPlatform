import { 
  MondayItem, 
  MondayUser,
  MondayBoard, 
  MondayConnectionTestResult,
  ApiResponse
} from '@api-monday/types';
import { 
  ITEMS_QUERY, 
  BOARD_WITH_ITEMS_QUERY,
  WORKSPACES_QUERY,
  BOARDS_BY_WORKSPACE_QUERY,
  ITEM_BY_ID_QUERY,
  USER_BY_EMAIL_QUERY,
  UPDATE_ITEM_MUTATION
} from '@api-monday/client/queries';

/**
 * Monday.com GraphQL API Client
 * 
 * Low-level client for communicating with the Monday.com GraphQL API
 */
class MondayClient {
  private apiUrl: string;
  private token: string;
  
  /**
   * Create a new Monday.com API client
   */
  constructor() {
    this.apiUrl = 'https://api.monday.com/v2';
    this.token = process.env.MONDAY_API_TOKEN || '';
    
    if (!this.token) {
      console.warn('MONDAY_API_TOKEN environment variable is not set');
    }
  }
  
  /**
   * Execute a GraphQL query
   * 
   * @param query GraphQL query string
   * @param variables Variables for the query
   * @returns Query result
   */
  async query<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
    return this.request<T>(query, variables);
  }
  
  /**
   * Execute a GraphQL mutation
   * 
   * @param mutation GraphQL mutation string
   * @param variables Variables for the mutation
   * @returns Mutation result
   */
  async mutate<T>(mutation: string, variables: Record<string, unknown> = {}): Promise<T> {
    return this.request<T>(mutation, variables);
  }
  
  /**
   * Make a request to the Monday.com API
   * 
   * @param query GraphQL query or mutation
   * @param variables Variables for the query
   * @returns API response
   */
  private async request<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.token,
          'API-Version': '2023-10'
        },
        body: JSON.stringify({
          query,
          variables
        })
      });
      
      const result = await response.json();
      
      if (result.errors) {
        throw new Error(
          `Monday.com API Error: ${result.errors.map((e: { message: string }) => e.message).join(', ')}`
        );
      }
      
      return result.data as T;
    } catch (error) {
      console.error('Monday.com API Request Error:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const mondayClient = new MondayClient();

/**
 * Test connection to Monday.com
 * 
 * Data access function that verifies API connection by retrieving the current user
 * 
 * @returns Connection test result
 */
export async function testConnection(): Promise<MondayConnectionTestResult> {
  try {
    // Use a simple query to get the current user
    const response = await mondayClient.query<{ me: { name: string; email: string } }>(
      `query { me { name email } }`
    );
    
    if (!response.me) {
      return {
        success: false,
        error: "API returned no user data. Check token permissions."
      };
    }
    
    return {
      success: true,
      data: {
        name: response.me.name,
        email: response.me.email
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Fetch a Monday.com board with its items
 * 
 * Data access function that retrieves a board by ID
 * 
 * @param boardId Board ID to fetch
 * @param itemLimit Maximum items to fetch
 * @returns API response with board data
 */
export async function fetchMondayBoard(
  boardId: string, 
  itemLimit: number = 20
): Promise<ApiResponse<MondayBoard>> {
  try {
    // Make API request
    const response = await mondayClient.query<{ boards: MondayBoard[] }>(
      BOARD_WITH_ITEMS_QUERY, 
      { 
        boardId, 
        itemLimit 
      }
    );
    
    // Check if board exists
    if (!response.boards || response.boards.length === 0) {
      return { 
        success: false, 
        error: `Board with ID ${boardId} not found or not accessible`
      };
    }
    
    return { 
      success: true, 
      data: response.boards[0]
    };
  } catch (error) {
    console.error("Error fetching Monday board:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Fetch all Monday.com boards
 * 
 * Data access function that retrieves all boards from all workspaces
 * 
 * @returns API response with boards data
 */
export async function fetchMondayBoards(): Promise<ApiResponse<MondayBoard[]>> {
  try {
    // Get all workspaces first
    const workspacesResponse = await mondayClient.query<{ workspaces: { id: string; name: string }[] }>(
      WORKSPACES_QUERY
    );
    
    if (!workspacesResponse.workspaces || workspacesResponse.workspaces.length === 0) {
      return { 
        success: false, 
        error: "No workspaces found. Check API token permissions."
      };
    }
    
    // Get boards from all workspaces
    const boards: MondayBoard[] = [];
    
    for (const workspace of workspacesResponse.workspaces) {
      const boardsResponse = await mondayClient.query<{ boards: MondayBoard[] }>(
        BOARDS_BY_WORKSPACE_QUERY,
        { workspaceId: workspace.id }
      );
      
      if (boardsResponse.boards) {
        boards.push(...boardsResponse.boards);
      }
    }
    
    return {
      success: true,
      data: boards
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Fetch items from a Monday.com board
 * 
 * Data access function that retrieves all items from a board
 * 
 * @param boardId Board ID to fetch items from
 * @returns Array of Monday.com items
 */
export async function fetchMondayItems(boardId: string): Promise<MondayItem[]> {
  try {
    const response = await mondayClient.query<{ boards: { items_page: { items: MondayItem[] } }[] }>(
      ITEMS_QUERY, 
      { boardId }
    );
    
    if (!response.boards || response.boards.length === 0 || !response.boards[0].items_page) {
      return [];
    }
    
    return response.boards[0].items_page.items;
  } catch (error) {
    console.error("Error fetching Monday items:", error);
    throw new Error(`Failed to fetch Monday items: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch a specific Monday.com item by ID
 * 
 * Data access function that retrieves a single item by ID
 * 
 * @param itemId Item ID to fetch
 * @returns Monday.com item
 */
export async function fetchMondayItemById(itemId: string): Promise<MondayItem> {
  try {
    const response = await mondayClient.query<{ items: MondayItem[] }>(
      ITEM_BY_ID_QUERY, 
      { itemId }
    );
    
    if (!response.items || response.items.length === 0) {
      throw new Error(`Item with ID ${itemId} not found or not accessible`);
    }
    
    return response.items[0];
  } catch (error) {
    console.error("Error fetching Monday item:", error);
    throw new Error(`Failed to fetch Monday item: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch a Monday.com user by email
 * 
 * Data access function that retrieves a user by email address
 * 
 * @param email Email address to search for
 * @returns API response with user data
 */
export async function fetchMondayUserByEmail(email: string): Promise<ApiResponse<MondayUser>> {
  try {
    const response = await mondayClient.query<{ users: MondayUser[] }>(
      USER_BY_EMAIL_QUERY, 
      { email }
    );
    
    if (!response.users || response.users.length === 0) {
      return {
        success: false,
        error: `User with email ${email} not found or not accessible`
      };
    }
    
    return {
      success: true,
      data: response.users[0]
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Update a Monday.com item
 * 
 * Data access function that updates an item's column values
 * 
 * @param boardId Board ID containing the item
 * @param itemId Item ID to update
 * @param columnValues Column values to update
 * @returns API response with updated item data
 */
export async function updateMondayItem(
  boardId: string,
  itemId: string,
  columnValues: Record<string, unknown>
): Promise<ApiResponse<MondayItem>> {
  try {
    // Convert columnValues to the format expected by Monday.com
    const columnValuesJson = JSON.stringify(columnValues);
    
    // Make mutation request
    const response = await mondayClient.mutate<{ change_multiple_column_values: { id: string } }>(
      UPDATE_ITEM_MUTATION,
      {
        boardId,
        itemId,
        columnValues: columnValuesJson
      }
    );
    
    if (!response.change_multiple_column_values) {
      return {
        success: false,
        error: "Failed to update item. Check API token permissions."
      };
    }
    
    // Fetch the updated item
    const updatedItem = await fetchMondayItemById(itemId);
    
    return {
      success: true,
      data: updatedItem
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}