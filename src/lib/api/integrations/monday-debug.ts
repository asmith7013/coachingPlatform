/**
 * Monday.com API Debug Utilities
 * 
 * Progressive testing utilities to identify and resolve Monday.com API connectivity issues
 */

import { 
  captureError, 
  // handleServerError, 
  createErrorContext 
} from "@/lib/error";

// Base options type for all debugging functions
interface DebugOptions {
  logResults?: boolean;
  throwOnError?: boolean;
}

// Helper function to create a standard error context
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

/**
 * Basic connectivity test that verifies API token works
 * This should be your first test when diagnosing issues
 */
export async function testBasicConnectivity(options: DebugOptions = {}) {
  const { logResults = true, throwOnError = false } = options;
  
  try {
    // Simple query to test connectivity - retrieve user info
    const query = `
      query {
        me {
          name
          email
        }
      }
    `;
    
    if (logResults) {
      console.log("Testing basic Monday.com API connectivity...");
      console.log("Query:", query);
    }
    
    // Make direct fetch call to capture all details
    const response = await fetch("https://api.monday.com/v2", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.MONDAY_API_TOKEN || ''
      },
      body: JSON.stringify({ query })
    });
    
    // Capture detailed response information
    const responseStatus = response.status;
    const responseHeaders = Object.fromEntries([...response.headers]);
    const responseText = await response.text();
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { parseError: true, text: responseText };
    }
    
    if (logResults) {
      console.log("Response status:", responseStatus);
      console.log("Response headers:", responseHeaders);
      console.log("Response data:", responseData);
    }
    
    // Check for success
    const success = responseStatus === 200 && !responseData.errors && responseData.data?.me;
    
    // Format result
    const result = {
      success,
      status: responseStatus,
      headers: responseHeaders,
      data: responseData,
      user: responseData.data?.me,
      errors: responseData.errors,
      errorSummary: responseData.errors 
        ? responseData.errors.map((e: { message: string }) => e.message).join(', ')
        : null
    };
    
    // Throw on error if requested
    if (!success && throwOnError) {
      throw new Error(`API connectivity test failed: ${result.errorSummary || 'Unknown error'}`);
    }
    
    return result;
  } catch (error) {
    // Log and capture error
    console.error("Monday.com API basic connectivity test failed:", error);
    
    const errorContext = createMondayErrorContext("testBasicConnectivity");
    captureError(error, errorContext);
    
    // Rethrow if requested
    if (throwOnError) {
      throw error;
    }
    
    return { 
      success: false, 
      error: String(error)
    };
  }
}

/**
 * Test access to a specific board
 * This verifies you can access the requested board before trying to access items
 */
export async function testBoardAccess(boardId: string, options: DebugOptions = {}) {
  const { logResults = true, throwOnError = false } = options;
  
  try {
    // Simple query just to verify board access
    const query = `
      query ($boardId: ID!) {
        boards(ids: [$boardId]) {
          id
          name
          columns {
            id
            title
            type
          }
        }
      }
    `;
    
    const variables = { boardId };
    
    if (logResults) {
      console.log(`Testing access to board ${boardId}...`);
      console.log("Query:", query);
      console.log("Variables:", variables);
    }
    
    // Make direct fetch call to capture all details
    const response = await fetch("https://api.monday.com/v2", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.MONDAY_API_TOKEN || ''
      },
      body: JSON.stringify({ 
        query,
        variables
      })
    });
    
    // Capture detailed response information
    const responseStatus = response.status;
    const responseHeaders = Object.fromEntries([...response.headers]);
    const responseText = await response.text();
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { parseError: true, text: responseText };
    }
    
    if (logResults) {
      console.log("Response status:", responseStatus);
      console.log("Response headers:", responseHeaders);
      console.log("Response data:", responseData);
    }
    
    // Check for success - board access is valid if we get a board back
    const boardExists = responseData.data?.boards?.length > 0;
    const success = responseStatus === 200 && !responseData.errors && boardExists;
    
    // Format result
    const result = {
      success,
      status: responseStatus,
      headers: responseHeaders,
      data: responseData,
      board: boardExists ? responseData.data.boards[0] : null,
      boardFound: boardExists,
      errors: responseData.errors,
      errorSummary: responseData.errors 
        ? responseData.errors.map((e: { message: string }) => e.message).join(', ')
        : null
    };
    
    // Throw on error if requested
    if (!success && throwOnError) {
      throw new Error(`Board access test failed: ${result.errorSummary || (boardExists ? 'Unknown error' : 'Board not found')}`);
    }
    
    return result;
  } catch (error) {
    // Log and capture error
    console.error(`Monday.com API board access test failed for board ${boardId}:`, error);
    
    const errorContext = createMondayErrorContext("testBoardAccess", { boardId });
    captureError(error, errorContext);
    
    // Rethrow if requested
    if (throwOnError) {
      throw error;
    }
    
    return { 
      success: false, 
      error: String(error),
      boardId
    };
  }
}

/**
 * Test items_page access for a specific board
 * This tests if you can retrieve items using the items_page field
 */
export async function testItemsPageAccess(boardId: string, limit: number = 5, options: DebugOptions = {}) {
  const { logResults = true, throwOnError = false } = options;
  
  try {
    // Query for items_page with minimal fields
    const query = `
      query ($boardId: ID!, $limit: Int!) {
        boards(ids: [$boardId]) {
          items_page(limit: $limit) {
            cursor
            items {
              id
              name
            }
          }
        }
      }
    `;
    
    const variables = { boardId, limit };
    
    if (logResults) {
      console.log(`Testing items_page access for board ${boardId} with limit ${limit}...`);
      console.log("Query:", query);
      console.log("Variables:", variables);
    }
    
    // Make direct fetch call to capture all details
    const response = await fetch("https://api.monday.com/v2", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.MONDAY_API_TOKEN || ''
      },
      body: JSON.stringify({ 
        query,
        variables
      })
    });
    
    // Capture detailed response information
    const responseStatus = response.status;
    const responseHeaders = Object.fromEntries([...response.headers]);
    const responseText = await response.text();
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { parseError: true, text: responseText };
    }
    
    if (logResults) {
      console.log("Response status:", responseStatus);
      console.log("Response headers:", responseHeaders);
      console.log("Response data:", responseData);
    }
    
    // Check if board exists
    const boardExists = responseData.data?.boards?.length > 0;
    
    // Check if items_page exists
    const itemsPageExists = boardExists && responseData.data.boards[0].items_page;
    
    // Check if cursor exists
    const cursorExists = itemsPageExists && responseData.data.boards[0].items_page.cursor;
    
    // Check if items exist
    const itemsExist = itemsPageExists && responseData.data.boards[0].items_page.items?.length > 0;
    
    // Overall success
    const success = responseStatus === 200 && !responseData.errors && boardExists && itemsPageExists;
    
    // Format result
    const result = {
      success,
      status: responseStatus,
      headers: responseHeaders,
      data: responseData,
      boardFound: boardExists,
      itemsPageFound: itemsPageExists,
      cursorFound: cursorExists,
      itemsFound: itemsExist,
      itemCount: itemsExist ? responseData.data.boards[0].items_page.items.length : 0,
      cursor: cursorExists ? responseData.data.boards[0].items_page.cursor : null,
      errors: responseData.errors,
      errorSummary: responseData.errors 
        ? responseData.errors.map((e: { message: string }) => e.message).join(', ')
        : null
    };
    
    // Throw on error if requested
    if (!success && throwOnError) {
      throw new Error(`Items page access test failed: ${result.errorSummary || 'Unknown error'}`);
    }
    
    return result;
  } catch (error) {
    // Log and capture error
    console.error(`Monday.com API items_page access test failed for board ${boardId}:`, error);
    
    const errorContext = createMondayErrorContext("testItemsPageAccess", { boardId, limit });
    captureError(error, errorContext);
    
    // Rethrow if requested
    if (throwOnError) {
      throw error;
    }
    
    return { 
      success: false, 
      error: String(error),
      boardId,
      limit
    };
  }
}

/**
 * Test next_items_page access using a cursor
 * This verifies pagination works correctly
 */
export async function testNextItemsPageAccess(cursor: string, limit: number = 5, options: DebugOptions = {}) {
  const { logResults = true, throwOnError = false } = options;
  
  try {
    // Query for next_items_page with minimal fields
    const query = `
      query ($cursor: String!, $limit: Int!) {
        next_items_page(cursor: $cursor, limit: $limit) {
          cursor
          items {
            id
            name
          }
        }
      }
    `;
    
    const variables = { cursor, limit };
    
    if (logResults) {
      console.log(`Testing next_items_page access with cursor (truncated): ${cursor.substring(0, 20)}... and limit ${limit}`);
      console.log("Query:", query);
      console.log("Variables:", { cursor: cursor.substring(0, 20) + "...", limit });
    }
    
    // Make direct fetch call to capture all details
    const response = await fetch("https://api.monday.com/v2", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.MONDAY_API_TOKEN || ''
      },
      body: JSON.stringify({ 
        query,
        variables
      })
    });
    
    // Capture detailed response information
    const responseStatus = response.status;
    const responseHeaders = Object.fromEntries([...response.headers]);
    const responseText = await response.text();
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { parseError: true, text: responseText };
    }
    
    if (logResults) {
      console.log("Response status:", responseStatus);
      console.log("Response headers:", responseHeaders);
      console.log("Response data:", responseData);
    }
    
    // Check if next_items_page exists
    const nextItemsPageExists = responseData.data?.next_items_page;
    
    // Check if cursor exists
    const cursorExists = nextItemsPageExists && responseData.data.next_items_page.cursor;
    
    // Check if items exist
    const itemsExist = nextItemsPageExists && responseData.data.next_items_page.items?.length > 0;
    
    // Overall success
    const success = responseStatus === 200 && !responseData.errors && nextItemsPageExists;
    
    // Format result
    const result = {
      success,
      status: responseStatus,
      headers: responseHeaders,
      data: responseData,
      nextItemsPageFound: nextItemsPageExists,
      cursorFound: cursorExists,
      itemsFound: itemsExist,
      itemCount: itemsExist ? responseData.data.next_items_page.items.length : 0,
      nextCursor: cursorExists ? responseData.data.next_items_page.cursor : null,
      errors: responseData.errors,
      errorSummary: responseData.errors 
        ? responseData.errors.map((e: { message: string }) => e.message).join(', ')
        : null
    };
    
    // Throw on error if requested
    if (!success && throwOnError) {
      throw new Error(`Next items page access test failed: ${result.errorSummary || 'Unknown error'}`);
    }
    
    return result;
  } catch (error) {
    // Log and capture error
    console.error(`Monday.com API next_items_page access test failed:`, error);
    
    const errorContext = createMondayErrorContext("testNextItemsPageAccess", { 
      cursorPreview: cursor.substring(0, 20),
      limit 
    });
    captureError(error, errorContext);
    
    // Rethrow if requested
    if (throwOnError) {
      throw error;
    }
    
    return { 
      success: false, 
      error: String(error),
      cursorPreview: cursor.substring(0, 20),
      limit
    };
  }
}

/**
 * Test full board data access with items and column values
 * This tests a more complex query that includes column values
 */
export async function testBoardWithItemsAccess(boardId: string, limit: number = 5, options: DebugOptions = {}) {
  const { logResults = true, throwOnError = false } = options;
  
  try {
    // Query for board with items and column values
    const query = `
      query ($boardId: ID!, $limit: Int!) {
        boards(ids: [$boardId]) {
          id
          name
          description
          columns {
            id
            title
            type
          }
          items_page(limit: $limit) {
            cursor
            items {
              id
              name
              column_values {
                id
                text
                value
              }
            }
          }
        }
      }
    `;
    
    const variables = { boardId, limit };
    
    if (logResults) {
      console.log(`Testing full board data access for board ${boardId} with limit ${limit}...`);
      console.log("Query:", query);
      console.log("Variables:", variables);
    }
    
    // Make direct fetch call to capture all details
    const response = await fetch("https://api.monday.com/v2", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.MONDAY_API_TOKEN || ''
      },
      body: JSON.stringify({ 
        query,
        variables
      })
    });
    
    // Capture detailed response information
    const responseStatus = response.status;
    const responseHeaders = Object.fromEntries([...response.headers]);
    const responseText = await response.text();
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { parseError: true, text: responseText };
    }
    
    if (logResults) {
      console.log("Response status:", responseStatus);
      console.log("Response headers:", responseHeaders);
      console.log("Response data:", responseData);
    }
    
    // Check if we have boards
    const boardExists = responseData.data?.boards?.length > 0;
    
    // Check if items_page exists
    const itemsPageExists = boardExists && responseData.data.boards[0].items_page;
    
    // Check if cursor exists
    const cursorExists = itemsPageExists && responseData.data.boards[0].items_page.cursor;
    
    // Check if items exist
    const itemsExist = itemsPageExists && responseData.data.boards[0].items_page.items?.length > 0;
    
    // Overall success
    const success = responseStatus === 200 && !responseData.errors && boardExists && itemsPageExists;
    
    // Format result
    const result = {
      success,
      status: responseStatus,
      headers: responseHeaders,
      data: responseData,
      boardFound: boardExists,
      itemsPageFound: itemsPageExists,
      cursorFound: cursorExists,
      itemsFound: itemsExist,
      itemCount: itemsExist ? responseData.data.boards[0].items_page.items.length : 0,
      cursor: cursorExists ? responseData.data.boards[0].items_page.cursor : null,
      errors: responseData.errors,
      errorSummary: responseData.errors 
        ? responseData.errors.map((e: { message: string }) => e.message).join(', ')
        : null
    };
    
    // Throw on error if requested
    if (!success && throwOnError) {
      throw new Error(`Board with items access test failed: ${result.errorSummary || 'Unknown error'}`);
    }
    
    return result;
  } catch (error) {
    // Log and capture error
    console.error(`Monday.com API board with items access test failed for board ${boardId}:`, error);
    
    const errorContext = createMondayErrorContext("testBoardWithItemsAccess", { boardId, limit });
    captureError(error, errorContext);
    
    // Rethrow if requested
    if (throwOnError) {
      throw error;
    }
    
    return { 
      success: false, 
      error: String(error),
      boardId,
      limit
    };
  }
}

/**
 * Run all tests in sequence to diagnose issues
 * This is the main entry point for comprehensive debugging
 */
export async function runComprehensiveDebug(boardId: string, limit: number = 5, options: DebugOptions = {}) {
  const { logResults = true, throwOnError = false } = options;
  
  try {
    // Step 1: Test basic connectivity
    console.log("\n=== STEP 1: Testing Basic Connectivity ===\n");
    const connectivityResult = await testBasicConnectivity({ logResults, throwOnError: true });
    
    if (!connectivityResult.success) {
      console.error("❌ Basic connectivity test failed - cannot proceed further");
      return {
        success: false,
        connectivityResult,
        error: "Basic connectivity test failed - check API token and network connection"
      };
    }
    
    console.log("\n✅ Basic connectivity test passed");
    console.log(`Authenticated as: ${connectivityResult.user?.name} (${connectivityResult.user?.email})`);
    
    // Step 2: Test board access
    console.log("\n=== STEP 2: Testing Board Access ===\n");
    const boardResult = await testBoardAccess(boardId, { logResults, throwOnError: true });
    
    if (!boardResult.success) {
      console.error("❌ Board access test failed - cannot proceed further");
      return {
        success: false,
        connectivityResult,
        boardResult,
        error: boardResult.boardFound 
          ? "Board access test failed with errors" 
          : `Board with ID ${boardId} not found or not accessible`
      };
    }
    
    console.log("\n✅ Board access test passed");
    console.log(`Found board: ${boardResult.board?.name} (${boardResult.board?.id})`);
    console.log(`Column count: ${boardResult.board?.columns?.length || 0}`);
    
    // Step 3: Test items_page access
    console.log("\n=== STEP 3: Testing Items Page Access ===\n");
    const itemsPageResult = await testItemsPageAccess(boardId, limit, { logResults, throwOnError: true });
    
    if (!itemsPageResult.success) {
      console.error("❌ Items page access test failed - cannot proceed further");
      return {
        success: false,
        connectivityResult,
        boardResult,
        itemsPageResult,
        error: "Items page access test failed - check board permissions and API limits"
      };
    }
    
    console.log("\n✅ Items page access test passed");
    console.log(`Found ${itemsPageResult.itemCount} items`);
    console.log(`Cursor obtained: ${itemsPageResult.cursor ? 'Yes' : 'No'}`);
    
    // Step 4: Test next_items_page if we have a cursor
    let nextItemsPageResult = null;
    if (itemsPageResult.cursor) {
      console.log("\n=== STEP 4: Testing Next Items Page Access ===\n");
      nextItemsPageResult = await testNextItemsPageAccess(
        itemsPageResult.cursor, 
        limit, 
        { logResults, throwOnError: true }
      );
      
      if (!nextItemsPageResult.success) {
        console.error("❌ Next items page access test failed");
        return {
          success: false,
          connectivityResult,
          boardResult,
          itemsPageResult,
          nextItemsPageResult,
          error: "Next items page access test failed - cursor may be invalid or expired"
        };
      }
      
      console.log("\n✅ Next items page access test passed");
      console.log(`Found ${nextItemsPageResult.itemCount} additional items`);
      console.log(`Next cursor obtained: ${nextItemsPageResult.nextCursor ? 'Yes' : 'No'}`);
    } else {
      console.log("\n⚠️ No cursor found, skipping next items page test");
    }
    
    // Step 5: Test full board with items access
    console.log("\n=== STEP 5: Testing Full Board Data Access ===\n");
    const fullBoardResult = await testBoardWithItemsAccess(boardId, limit, { logResults, throwOnError: true });
    
    if (!fullBoardResult.success) {
      console.error("❌ Full board data access test failed");
      return {
        success: false,
        connectivityResult,
        boardResult,
        itemsPageResult,
        nextItemsPageResult,
        fullBoardResult,
        error: "Full board data access test failed - the board may be too large or complex"
      };
    }
    
    console.log("\n✅ Full board data access test passed");
    console.log(`Complete board data retrieved successfully`);
    
    // All tests passed
    return {
      success: true,
      connectivityResult,
      boardResult,
      itemsPageResult,
      nextItemsPageResult,
      fullBoardResult,
      message: "All Monday.com API tests passed successfully"
    };
  } catch (error) {
    console.error("Comprehensive debug failed:", error);
    
    const errorContext = createMondayErrorContext("runComprehensiveDebug", { boardId, limit });
    captureError(error, errorContext);
    
    if (throwOnError) {
      throw error;
    }
    
    return {
      success: false,
      error: String(error),
      message: "Comprehensive debug failed - check error details"
    };
  }
}

/**
 * Helper function for simplifying the execution of comprehensive debug
 */
export async function debugMondayAPIIssue(boardId: string) {
  console.log(`Starting comprehensive Monday.com API debugging for board ${boardId}...`);
  
  try {
    const results = await runComprehensiveDebug(boardId, 5);
    
    if (results.success) {
      console.log("\n🎉 SUCCESS: All Monday.com API tests passed successfully!");
      console.log("You can now proceed with implementing the full integration");
    } else {
      console.error("\n❌ ERROR: Monday.com API debugging found issues:");
      console.error(results.error);
      console.log("\nRecommended actions:");
      
      if (!results.connectivityResult?.success) {
        console.log("1. Verify your Monday.com API token is valid and has the correct permissions");
        console.log("2. Check your network connectivity to api.monday.com");
        console.log("3. Ensure environment variables are correctly set up");
      } else if (!results.boardResult?.success) {
        console.log("1. Verify the board ID is correct");
        console.log("2. Confirm you have access permissions to this board");
        console.log("3. Check if the board has been archived or deleted");
      } else if (!results.itemsPageResult?.success) {
        console.log("1. Check if the board has items");
        console.log("2. Verify your permissions include reading items");
        console.log("3. Try reducing the limit parameter to stay within API limits");
      } else if (results.nextItemsPageResult && !results.nextItemsPageResult.success) {
        console.log("1. The cursor may have expired (valid for 60 minutes)");
        console.log("2. Try requesting a new cursor by querying items_page again");
      } else if (!results.fullBoardResult?.success) {
        console.log("1. The query may be too complex - try simplifying it");
        console.log("2. The board might have custom column types not handled correctly");
        console.log("3. Check for API rate limits or query complexity limits");
      }
    }
    
    return results;
  } catch (error) {
    console.error("Debug process failed with an unexpected error:", error);
    return {
      success: false,
      error: String(error),
      message: "Debug process failed with an unexpected error"
    };
  }
} 