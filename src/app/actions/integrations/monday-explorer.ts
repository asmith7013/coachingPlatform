"use server";

import { 
  captureError, 
  handleValidationError, 
  createErrorContext 
} from "@/lib/error";
import { mondayClient } from "@/app/api/integrations/monday/client";
import { 
  WORKSPACES_QUERY, 
  BOARDS_BY_WORKSPACE_QUERY,
  BOARD_ITEMS_QUERY 
} from "@api-integrations/monday-queries";
import { z } from "zod";

// Helper to create standardized error context for Monday API operations
function createMondayErrorContext(operation: string, metadata: Record<string, unknown> = {}) {
  return createErrorContext("MondayAPI", operation, {
    category: "network",
    severity: "error",
    metadata: {
      ...metadata,
      apiType: "monday.com"
    }
  });
}

// Helper to handle API-specific errors with proper logging
function handleMondayApiError(error: unknown, operation: string, metadata: Record<string, unknown> = {}) {
  // Create error context with operation and metadata
  const errorContext = createMondayErrorContext(operation, metadata);
  
  // Capture error with monitoring system
  const errorId = captureError(error, errorContext);
  
  // Log error details
  console.error(`Monday.com API error in ${operation}:`, error);
  console.error(`Error ID: ${errorId}`);
  
  // Return standardized error message
  const message = error instanceof Error ? error.message : String(error);
  return { 
    success: false, 
    error: message,
    errorId,
    data: null,
    rawResponse: metadata.responseData || null
  };
}

export async function getMondayWorkspaces() {
  try {
    const response = await mondayClient.query<{ workspaces: { id: string, name: string }[] }>(
      WORKSPACES_QUERY
    );
    
    return { 
      success: true, 
      data: response.workspaces || []
    };
  } catch (error) {
    console.error("Failed to fetch Monday workspaces:", error);
    return { 
      success: false, 
      error: (error as Error).message 
    };
  }
}

export async function getBoardsByWorkspace(workspaceId: string) {
  try {
    const response = await mondayClient.query<{ 
      boards: {
        id: string;
        name: string;
        columns: {
          id: string;
          title: string;
          type: string;
        }[];
      }[] 
    }>(
      BOARDS_BY_WORKSPACE_QUERY,
      { workspaceId }
    );
    
    return { 
      success: true, 
      data: response.boards || []
    };
  } catch (error) {
    console.error(`Failed to fetch boards for workspace ${workspaceId}:`, error);
    return { 
      success: false, 
      error: (error as Error).message 
    };
  }
}

export async function getBoardItemSamples(boardId: string, limit: number = 5) {
  try {
    const response = await mondayClient.query<{
      boards: {
        items: {
          id: string;
          name: string;
          column_values: {
            id: string;
            title: string;
            text: string | null;
            value: string | null;
          }[];
        }[];
      }[];
    }>(
      BOARD_ITEMS_QUERY,
      { boardId, limit }
    );
    
    return { 
      success: true, 
      data: response.boards?.[0]?.items || []
    };
  } catch (error) {
    console.error(`Failed to fetch items for board ${boardId}:`, error);
    return { 
      success: false, 
      error: (error as Error).message 
    };
  }
}

/**
 * Fetch a Monday.com board by its ID with columns
 * @param boardId - The Monday.com board ID to fetch
 * @returns Board details with columns
 */
export async function getBoardById(boardId: string) {
  if (!boardId?.trim()) {
    return { success: false, error: "Board ID is required" };
  }
  
  try {
    // Execute the GraphQL query - remove the items field that's causing issues
    const response = await mondayClient.query<{
      boards: {
        id: string;
        name: string;
        description?: string;
        workspace?: {
          id: string;
          name: string;
        };
        columns: {
          id: string;
          title: string;
          type: string;
          settings_str?: string;
        }[];
      }[];
    }>(`
      query getBoard($boardId: ID!) {
        boards(ids: [$boardId]) {
          id
          name
          description
          workspace {
            id
            name
          }
          columns {
            id
            title
            type
            settings_str
          }
        }
      }
    `, 
    { boardId });
    
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
    console.error("Monday.com API error:", error);
    return { 
      success: false, 
      error: (error as Error).message || "Failed to fetch board"
    };
  }
}

/**
 * Fetch items from a Monday.com board
 * @param boardId - The Monday.com board ID
 * @param limit - Maximum number of items to fetch
 * @returns Board items
 */
export async function getBoardItems(boardId: string, limit: number = 5) {
  if (!boardId?.trim()) {
    return { success: false, error: "Board ID is required" };
  }
  
  try {
    // Use the correct query for fetching items
    const response = await mondayClient.query<{
      boards: {
        items_page: {
          items: {
            id: string;
            name: string;
            column_values: {
              id: string;
              title: string;
              text: string | null;
              value: string | null;
            }[];
          }[];
        };
      }[];
    }>(`
      query getBoardItems($boardId: ID!, $limit: Int) {
        boards(ids: [$boardId]) {
          items_page(limit: $limit) {
            items {
              id
              name
              column_values {
                id
                title
                text
                value
              }
            }
          }
        }
      }
    `, 
    { boardId, limit });
    
    // Check if board exists and has items
    if (!response.boards || 
        response.boards.length === 0 || 
        !response.boards[0].items_page ||
        !response.boards[0].items_page.items) {
      return { 
        success: true, 
        data: [] // Return empty array if no items
      };
    }
    
    return { 
      success: true, 
      data: response.boards[0].items_page.items
    };
  } catch (error) {
    console.error(`Failed to fetch items for board ${boardId}:`, error);
    return { 
      success: false, 
      error: (error as Error).message 
    };
  }
} 

// Add this to your getBoardById function in monday-explorer.ts
export async function getBoardByIdWithRawResponse(boardId: string) {
    if (!boardId?.trim()) {
      return { success: false, error: "Board ID is required" };
    }
    
    try {
      // Execute the GraphQL query
      const query = `
        query getBoard($boardId: ID!) {
          boards(ids: [$boardId]) {
            id
            name
            description
            workspace {
              id
              name
            }
            columns {
              id
              title
              type
              settings_str
            }
          }
        }
      `;
      
      // Make the raw fetch call to capture all details
      const response = await fetch("https://api.monday.com/v2", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': process.env.MONDAY_API_TOKEN || ''
        },
        body: JSON.stringify({
          query,
          variables: { boardId }
        }),
      });
      
      // Get the raw response
      const rawResponseData = await response.json();
      
      // Check if board exists
      if (!rawResponseData.data?.boards || rawResponseData.data.boards.length === 0) {
        return { 
          success: false, 
          error: `Board with ID ${boardId} not found or not accessible`,
          rawResponse: rawResponseData
        };
      }
      
      return { 
        success: true, 
        data: rawResponseData.data.boards[0],
        rawResponse: rawResponseData
      };
    } catch (error) {
      console.error("Monday.com API error:", error);
      return { 
        success: false, 
        error: (error as Error).message || "Failed to fetch board"
      };
    }
  }

/**
 * Fetch a Monday.com board by its ID with columns and items
 * @param boardId - The Monday.com board ID to fetch
 * @param itemLimit - Maximum number of items to fetch (default: 20)
 * @returns Board details with columns and items
 */
export async function getBoardWithItems(boardId: string, itemLimit: number = 20) {
  // Input validation
  try {
    const validatedInput = z.object({
      boardId: z.string().min(1, "Board ID is required"),
      itemLimit: z.number().int().positive().default(20)
    }).parse({ boardId, itemLimit });
    
    boardId = validatedInput.boardId;
    itemLimit = validatedInput.itemLimit;
  } catch (validationError) {
    if (validationError instanceof z.ZodError) {
      const errorMsg = handleValidationError(validationError);
      return { success: false, error: errorMsg };
    }
  }
  
  // Debug logging
  console.log(`Attempting to fetch board: ${boardId} with itemLimit: ${itemLimit}`);
  console.log(`API token available: ${!!process.env.MONDAY_API_TOKEN}`);
  
  try {
    // GraphQL query for board with items
    const query = `
      query getBoard($boardId: ID!, $itemLimit: Int) {
        boards(ids: [$boardId]) {
          id
          name
          description
          workspace {
            id
            name
          }
          columns {
            id
            title
            type
            settings_str
          }
          items_page(limit: $itemLimit) {
            cursor
            items {
              id
              name
              column_values {
                id
                title
                text
                value
              }
            }
          }
        }
      }
    `;
    
    // Make API request
    const response = await fetch("https://api.monday.com/v2", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.MONDAY_API_TOKEN || ''
      },
      body: JSON.stringify({
        query,
        variables: { boardId, itemLimit }
      }),
    });
    
    // Handle HTTP errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Monday.com API HTTP error: ${response.status} - ${response.statusText}`);
      console.error(`Response body: ${errorText}`);
      
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
      return handleMondayApiError(error, "getBoardWithItems", {
        boardId,
        itemLimit,
        httpStatus: response.status,
        httpStatusText: response.statusText,
        responseBody: errorText.substring(0, 1000) // Limit size
      });
    }
    
    // Parse JSON response
    const rawResponseData = await response.json();
    console.log(`Raw API response:`, JSON.stringify(rawResponseData, null, 2));
    
    // Handle GraphQL errors
    if (rawResponseData.errors && rawResponseData.errors.length > 0) {
      const errorMessages = rawResponseData.errors.map((e: { message: string }) => e.message).join(', ');
      console.error(`Monday.com GraphQL errors: ${errorMessages}`);
      
      const error = new Error(`GraphQL errors: ${errorMessages}`);
      return handleMondayApiError(error, "getBoardWithItems", {
        boardId, 
        itemLimit,
        graphqlErrors: rawResponseData.errors
      });
    }
    
    // Check if board exists
    if (!rawResponseData.data?.boards || rawResponseData.data.boards.length === 0) {
      const error = new Error(`Board with ID ${boardId} not found or not accessible`);
      return handleMondayApiError(error, "getBoardWithItems", {
        boardId,
        itemLimit,
        responseData: rawResponseData
      });
    }
    
    // Return success response
    return { 
      success: true, 
      data: rawResponseData.data.boards[0],
      rawResponse: rawResponseData
    };
  } catch (error) {
    // Handle any other errors
    return handleMondayApiError(error, "getBoardWithItems", {
      boardId,
      itemLimit
    });
  }
}

/**
 * Fetch next page of items using a cursor
 * @param cursor - The cursor returned from a previous query
 * @param itemLimit - Maximum number of items to fetch
 * @returns Next page of items
 */
export async function getNextItemsPage(cursor: string, itemLimit: number = 20) {
  // Input validation
  try {
    const validatedInput = z.object({
      cursor: z.string().min(1, "Cursor is required"),
      itemLimit: z.number().int().positive().default(20)
    }).parse({ cursor, itemLimit });
    
    cursor = validatedInput.cursor;
    itemLimit = validatedInput.itemLimit;
  } catch (validationError) {
    if (validationError instanceof z.ZodError) {
      const errorMsg = handleValidationError(validationError);
      return { success: false, error: errorMsg };
    }
  }
  
  // Debug logging
  console.log(`Attempting pagination with cursor: ${cursor.substring(0, 20)}... and limit: ${itemLimit}`);
  
  try {
    // GraphQL query for next page
    const query = `
      query getNextItemsPage($cursor: String!, $itemLimit: Int) {
        next_items_page(cursor: $cursor, limit: $itemLimit) {
          cursor
          items {
            id
            name
            column_values {
              id
              title
              text
              value
            }
          }
        }
      }
    `;
    
    // Make API request
    const response = await fetch("https://api.monday.com/v2", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.MONDAY_API_TOKEN || ''
      },
      body: JSON.stringify({
        query,
        variables: { cursor, itemLimit }
      }),
    });
    
    // Handle HTTP errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Monday.com API HTTP error: ${response.status} - ${response.statusText}`);
      console.error(`Response body: ${errorText}`);
      
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
      return handleMondayApiError(error, "getNextItemsPage", {
        cursor: cursor.substring(0, 20), // Truncate long cursor
        itemLimit,
        httpStatus: response.status,
        httpStatusText: response.statusText,
        responseBody: errorText.substring(0, 1000) // Limit size
      });
    }
    
    // Parse JSON response
    const rawResponseData = await response.json();
    console.log(`Raw pagination response:`, JSON.stringify(rawResponseData, null, 2));
    
    // Handle GraphQL errors
    if (rawResponseData.errors && rawResponseData.errors.length > 0) {
      const errorMessages = rawResponseData.errors.map((e: { message: string }) => e.message).join(', ');
      console.error(`Monday.com GraphQL errors: ${errorMessages}`);
      
      const error = new Error(`GraphQL errors: ${errorMessages}`);
      return handleMondayApiError(error, "getNextItemsPage", {
        cursor: cursor.substring(0, 20),
        itemLimit,
        graphqlErrors: rawResponseData.errors
      });
    }
    
    // Check if we got results
    if (!rawResponseData.data?.next_items_page) {
      const error = new Error(`Failed to fetch next page of items: no next_items_page in response`);
      return handleMondayApiError(error, "getNextItemsPage", {
        cursor: cursor.substring(0, 20),
        itemLimit,
        responseData: rawResponseData
      });
    }
    
    // Return success response
    return { 
      success: true, 
      data: rawResponseData.data.next_items_page,
      rawResponse: rawResponseData
    };
  } catch (error) {
    // Handle any other errors
    return handleMondayApiError(error, "getNextItemsPage", {
      cursor: cursor.substring(0, 20),
      itemLimit
    });
  }
}

/**
 * Test basic connectivity to Monday.com API
 * @returns Test result with user information if successful
 */
export async function testMondayConnection() {
  try {
    console.log("Testing basic Monday.com API connectivity");
    
    const query = `
      query {
        me {
          name
          email
        }
      }
    `;
    
    // Make API request
    const response = await fetch("https://api.monday.com/v2", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.MONDAY_API_TOKEN || ''
      },
      body: JSON.stringify({ query }),
    });
    
    // Handle HTTP errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API HTTP error: ${response.status} ${response.statusText}`);
      console.error(`Error details: ${errorText}`);
      
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
      return handleMondayApiError(error, "testMondayConnection", {
        httpStatus: response.status,
        httpStatusText: response.statusText,
        responseBody: errorText.substring(0, 1000)
      });
    }
    
    // Parse JSON response
    const result = await response.json();
    console.log("API connection test result:", JSON.stringify(result, null, 2));
    
    // Handle GraphQL errors
    if (result.errors) {
      const error = new Error(`API connection test failed: ${result.errors[0].message}`);
      return handleMondayApiError(error, "testMondayConnection", {
        graphqlErrors: result.errors
      });
    }
    
    // Check if user data exists
    if (!result.data?.me) {
      const error = new Error("API connection test failed: No user data returned");
      return handleMondayApiError(error, "testMondayConnection", {
        responseData: result
      });
    }
    
    // Return success response
    return { 
      success: true, 
      message: `Successfully connected to Monday.com API as ${result.data.me.name}`,
      data: result.data.me,
      rawResponse: result
    };
  } catch (error) {
    // Handle any other errors
    return handleMondayApiError(error, "testMondayConnection", {});
  }
}

/**
 * Test cursor-based pagination structure for a board
 * @param boardId - Monday.com board ID to test
 * @param itemsPerPage - Number of items per page to request
 * @returns Test results including first and second page details
 */
export async function testPaginationStructure(boardId: string, itemsPerPage: number = 5) {
  // Input validation
  try {
    const validatedInput = z.object({
      boardId: z.string().min(1, "Board ID is required"),
      itemsPerPage: z.number().int().positive().default(5)
    }).parse({ boardId, itemsPerPage });
    
    boardId = validatedInput.boardId;
    itemsPerPage = validatedInput.itemsPerPage;
  } catch (validationError) {
    if (validationError instanceof z.ZodError) {
      const errorMsg = handleValidationError(validationError);
      return { success: false, error: errorMsg };
    }
  }
  
  console.log(`Testing pagination structure for board ${boardId} with ${itemsPerPage} items per page`);
  
  try {
    // First, get the initial page
    const firstPageResult = await getBoardWithItems(boardId, itemsPerPage);
    
    if (!firstPageResult.success) {
      return {
        success: false,
        error: `Failed to fetch first page: ${firstPageResult.error}`,
        rawResponse: 'rawResponse' in firstPageResult ? firstPageResult.rawResponse : undefined
      };
    }
    
    // We know firstPageResult is successful at this point, so data is available
    const firstPageData = firstPageResult.data;
    
    // Validate items_page data
    if (!firstPageData.items_page) {
      const error = new Error("No items_page found in response");
      return handleMondayApiError(error, "testPaginationStructure", {
        boardId,
        itemsPerPage,
        responseData: firstPageResult.rawResponse,
        firstPageData
      });
    }
    
    const itemsPage = firstPageData.items_page;
    
    // Validate cursor
    if (!itemsPage.cursor) {
      const error = new Error("No cursor found in items_page");
      return handleMondayApiError(error, "testPaginationStructure", {
        boardId,
        itemsPerPage,
        responseData: firstPageResult.rawResponse,
        itemsPage
      });
    }
    
    // Validate items in first page
    if (!itemsPage.items || itemsPage.items.length === 0) {
      const error = new Error("No items found in first page");
      return handleMondayApiError(error, "testPaginationStructure", {
        boardId,
        itemsPerPage,
        responseData: firstPageResult.rawResponse,
        itemsPage
      });
    }
    
    console.log(`First page successful: Found ${itemsPage.items.length} items and cursor`);
    
    // Try to fetch the second page
    const secondPageResult = await getNextItemsPage(itemsPage.cursor, itemsPerPage);
    
    // Return combined results
    return {
      success: true,
      message: "Pagination structure validation complete",
      firstPage: {
        itemCount: itemsPage.items.length,
        cursor: itemsPage.cursor
      },
      secondPage: secondPageResult,
    };
  } catch (error) {
    // Handle any other errors
    return handleMondayApiError(error, "testPaginationStructure", {
      boardId,
      itemsPerPage
    });
  }
}