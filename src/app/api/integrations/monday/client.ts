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