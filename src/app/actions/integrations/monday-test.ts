"use server";

import { mondayClient } from "@/app/api/integrations/monday/client";

// Simple test function to verify API connection
export async function testMondayConnection() {
  try {
    // Simple query to get a single board's name
    const response = await mondayClient.query<{ boards: { id: string, name: string }[] }>(`
      {
        boards(limit: 1) {
          id
          name
        }
      }
    `);
    
    return { 
      success: true, 
      data: response.boards?.[0] || null
    };
  } catch (error) {
    console.error("Monday connection test failed:", error);
    return { 
      success: false, 
      error: (error as Error).message 
    };
  }
}

// Test function to get workspaces
export async function testMondayWorkspaces() {
  try {
    const response = await mondayClient.query<{ workspaces: { id: string, name: string }[] }>(`
      {
        workspaces {
          id
          name
        }
      }
    `);
    
    return { 
      success: true, 
      data: response.workspaces || []
    };
  } catch (error) {
    console.error("Monday workspaces test failed:", error);
    return { 
      success: false, 
      error: (error as Error).message 
    };
  }
} 