// src/lib/integrations/monday/client/client.ts
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

/**
 * Interface for Monday.com user
 */
export interface MondayUser {
  id: string;
  name: string;
  email: string;
  title?: string;
  photo_thumb?: string;
  teams?: { id: string, name: string }[];
  is_verified?: boolean;
}

/**
 * Fetch all users from Monday.com
 * 
 * @returns Array of Monday.com users
 */
export async function fetchMondayUsers() {
  const usersQuery = `
    query {
      users {
        id
        name
        email
        title
        is_verified
      }
    }
  `;
  
  type UsersResponse = {
    users: MondayUser[];
  };
  
  const response = await mondayClient.query<UsersResponse>(usersQuery);
  
  if (!response.users) {
    return [];
  }
  
  return response.users;
}

/**
 * Fetch a specific Monday.com user by ID
 * 
 * @param userId The Monday.com user ID
 * @returns The Monday user if found, null otherwise
 */
export async function fetchMondayUserById(userId: string): Promise<MondayUser | null> {
  try {
    const userQuery = `
      query($userId: ID!) {
        users(ids: [$userId]) {
          id
          name
          email
          title
          is_verified
        }
      }
    `;
    
    type UserResponse = {
      users: MondayUser[];
    };
    
    const response = await mondayClient.query<UserResponse>(userQuery, { userId });
    
    if (!response.users || response.users.length === 0) {
      return null;
    }
    
    // Ensure teams is properly structured if it exists
    const user = response.users[0];
    
    // Handle case where teams is not an array or contains invalid elements
    if (user.teams) {
      if (!Array.isArray(user.teams)) {
        user.teams = [];
      } else {
        // Filter out any malformed team objects
        user.teams = user.teams.filter(team => 
          team && typeof team === 'object' && 'id' in team && 'name' in team
        );
      }
    }
    
    return user;
  } catch (error) {
    console.error("Error fetching Monday user by ID:", error);
    throw error;
  }
}

/**
 * Search for a Monday.com user by email address
 * 
 * @param email The email address to search for
 * @returns The Monday user if found, null otherwise
 */
export async function fetchMondayUserByEmail(email: string): Promise<MondayUser | null> {
  try {
    // Get all users and filter by email (Monday API doesn't support filtering by email)
    const usersQuery = `
      query {
        users {
          id
          name
          email
          title
        }
      }
    `;
    
    type UsersResponse = {
      users: Array<{
        id: string;
        name: string;
        email: string;
        title?: string;
        photo_thumb?: string;
      }>;
    };
    
    const response = await mondayClient.query<UsersResponse>(usersQuery);
    
    if (!response.users) {
      return null;
    }
    
    // Find the user with matching email (case insensitive)
    const user = response.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    
    if (!user) {
      return null;
    }
    
    // Return with empty teams array for consistency
    return {
      ...user,
      teams: []
    };
  } catch (error) {
    console.error("Error fetching Monday users:", error);
    throw error;
  }
}