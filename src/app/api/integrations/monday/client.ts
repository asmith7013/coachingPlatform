// src/app/api/integrations/monday/client.ts
import { handleServerError } from "@/lib/error";

const MONDAY_API_URL = "https://api.monday.com/v2";

/**
 * Simple Monday.com API client
 */
export class MondayClient {
  private apiToken: string;
  
  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }
  
  /**
   * Execute a GraphQL query against the Monday.com API
   */
  async query<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
    try {
      const response = await fetch(MONDAY_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.apiToken
        },
        body: JSON.stringify({
          query,
          variables
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.errors) {
        throw new Error(`GraphQL error: ${data.errors[0].message}`);
      }
      
      return data.data as T;
    } catch (error) {
      console.error("Monday API error:", error);
      throw handleServerError(error);
    }
  }
}

// Create singleton instance using environment variable
export const mondayClient = new MondayClient(process.env.MONDAY_API_TOKEN || '');

/**
 * Fetch all items from a Monday.com board
 */
export async function fetchMondayItems(boardId: string) {
  const itemsQuery = `
    query($boardId: ID!) {
      boards(ids: [$boardId]) {
        items_page {
          items {
            id
            name
            board {
              id
            }
            state
            column_values {
              id
              value
              text
            }
          }
        }
      }
    }
  `;
  
  type BoardsResponse = {
    boards: Array<{
      items_page: {
        items: Array<{
          id: string;
          name: string;
          board: { id: string };
          state: string;
          column_values: Array<{
            id: string;
            title: string;
            value: string | null;
            text: string | null;
          }>;
        }>;
      };
    }>;
  };
  
  const response = await mondayClient.query<BoardsResponse>(itemsQuery, { boardId });
  
  if (!response.boards || response.boards.length < 1) {
    return [];
  }
  
  return response.boards[0].items_page.items;
}

/**
 * Fetch a specific Monday.com item by ID
 */
export async function fetchMondayItemById(itemId: string) {
  const itemQuery = `
    query($itemId: ID!) {
      items(ids: [$itemId]) {
        id
        name
        board {
          id
          name
        }
        column_values {
          id
          title
          value
          text
        }
      }
    }
  `;
  
  type ItemsResponse = {
    items: Array<{
      id: string;
      name: string;
      board: { id: string; name: string };
      column_values: Array<{
        id: string;
        title: string;
        value: string | null;
        text: string | null;
      }>;
    }>;
  };
  
  const response = await mondayClient.query<ItemsResponse>(itemQuery, { itemId });
  
  if (!response.items || response.items.length < 1) {
    throw new Error(`Item with ID ${itemId} not found`);
  }
  
  return response.items[0];
}