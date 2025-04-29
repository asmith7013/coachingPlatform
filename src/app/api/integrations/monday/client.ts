// src/lib/api/integrations/monday/client.ts
import { handleServerError } from "@/lib/error";

const MONDAY_API_URL = "https://api.monday.com/v2";

interface MondayClientOptions {
  apiToken: string;
}

export class MondayClient {
  private apiToken: string;
  
  constructor(options: MondayClientOptions) {
    this.apiToken = options.apiToken;
  }
  
  async query<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
    try {
      // Log for debugging (redact most of token for security)
      console.log("Making request to Monday API with token prefix:", 
        this.apiToken ? this.apiToken.substring(0, 5) + "..." : "MISSING_TOKEN");
      console.log("Query:", query);
      
      const response = await fetch(MONDAY_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.apiToken, // No 'Bearer' prefix for Monday API
        },
        body: JSON.stringify({
          query,
          variables
        }),
      });
      
      if (!response.ok) {
        const responseText = await response.text();
        console.error("Monday API HTTP error:", response.status, responseText);
        throw new Error(`Monday API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.errors) {
        console.error("Monday GraphQL errors:", JSON.stringify(data.errors));
        throw new Error(`GraphQL error: ${data.errors[0].message}`);
      }
      
      return data.data as T;
    } catch (error) {
      console.error("Monday API error:", error);
      throw handleServerError(error);
    }
  }
}

// Create singleton instance with environment variable
export const mondayClient = new MondayClient({
  apiToken: process.env.MONDAY_API_TOKEN || '',
});