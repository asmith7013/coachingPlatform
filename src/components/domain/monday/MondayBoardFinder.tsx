'use client';

import { useState } from 'react';
import { Button } from '@/components/core/Button';
import { Card } from '@/components/composed/cards/Card';
import { Alert } from '@/components/core/feedback/Alert';
import { Spinner } from '@/components/core/feedback/Spinner';
import { Input } from '@/components/core/fields/Input';
import { useErrorHandledMutation } from '@/hooks/error/useErrorHandledMutation';
import { 
  getBoardWithItems, 
  getNextItemsPage,
  testMondayConnection,
  testPaginationStructure
} from '@/app/actions/integrations/monday-explorer';

// Type definitions
interface MondayColumn {
  id: string;
  title: string;
  type: string;
  settings_str?: string;
}

interface MondayColumnValue {
  id: string;
  title: string;
  text: string | null;
  value: string | null;
}

interface MondayItem {
  id: string;
  name: string;
  column_values: MondayColumnValue[];
}

interface ItemsPage {
  cursor: string;
  items: MondayItem[];
}

interface Board {
  id: string;
  name: string;
  description?: string;
  workspace?: {
    id: string;
    name: string;
  };
  columns: MondayColumn[];
  items_page?: ItemsPage;
}

interface MondayApiResponse {
  data?: {
    boards?: Board[];
    next_items_page?: ItemsPage;
  };
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
  }>;
  account_id?: number;
}

export function MondayBoardFinder() {
  const [boardId, setBoardId] = useState<string>('');
  const [boardDetails, setBoardDetails] = useState<Board | null>(null);
  const [itemsPage, setItemsPage] = useState<ItemsPage | null>(null);
  const [rawResponse, setRawResponse] = useState<MondayApiResponse | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [loadingNextPage, setLoadingNextPage] = useState(false);
  const [nextPageError, setNextPageError] = useState<Error | null>(null);
  const [itemLimit, setItemLimit] = useState<number>(20);
  const [testingApi, setTestingApi] = useState(false);
  const [testResults, setTestResults] = useState<{
    success: boolean;
    message?: string;
    error?: string;
    data?: {
      name: string;
      email: string;
    };
  } | null>(null);
  const [testingPagination, setTestingPagination] = useState(false);
  const [paginationTestResults, setPaginationTestResults] = useState<{
    success: boolean;
    message?: string;
    error?: string;
    firstPage?: {
      itemCount: number;
      cursor: string;
    };
    secondPage?: Record<string, unknown>;
  } | null>(null);
  
  const { 
    mutate: fetchBoard, 
    isLoading, 
    error, 
    isSuccess
  } = useErrorHandledMutation(async (id: string) => {
    if (!id.trim()) {
      throw new Error("Board ID is required");
    }
    
    // Reset test results when fetching a new board
    setTestResults(null);
    setPaginationTestResults(null);
    
    // Reset state for new board fetch
    setBoardDetails(null);
    setItemsPage(null);
    setRawResponse(null);
    setNextPageError(null);
    
    const result = await getBoardWithItems(id, itemLimit);
    
    if (result.success && result.data) {
      setBoardDetails(result.data);
      
      // Store items page separately for easier handling
      if (result.data.items_page) {
        setItemsPage(result.data.items_page);
      }
      
      // Store raw response for debugging
      if (result.rawResponse) {
        setRawResponse(result.rawResponse);
      }
      
      return result;
    } else {
      if (result.rawResponse) {
        setRawResponse(result.rawResponse);
      }
      throw new Error(result.error || "Failed to fetch board");
    }
  });
  
  const handleFetchBoard = () => {
    if (boardId.trim()) {
      fetchBoard(boardId);
    }
  };
  
  const toggleRawView = () => setShowRaw(!showRaw);
  
  const handleFetchNextPage = async () => {
    if (!itemsPage?.cursor) return;
    
    try {
      setLoadingNextPage(true);
      setNextPageError(null);
      
      const result = await getNextItemsPage(itemsPage.cursor, itemLimit);
      
      if (result.success && result.data) {
        // Update the items page with new data
        setItemsPage(result.data);
        
        // Update raw response for debugging
        if (result.rawResponse) {
          setRawResponse(result.rawResponse);
        }
      } else {
        setNextPageError(new Error(result.error || "Failed to fetch next page"));
        
        // Still update raw response if available
        if (result.rawResponse) {
          setRawResponse(result.rawResponse);
        }
      }
    } catch (err) {
      setNextPageError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoadingNextPage(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingApi(true);
    setTestResults(null);
    try {
      // Call the test function
      const result = await testMondayConnection();
      setTestResults(result);
    } catch (error) {
      setTestResults({
        success: false,
        error: (error as Error).message || "Test failed with unknown error"
      });
    } finally {
      setTestingApi(false);
    }
  };

  const handleTestPagination = async () => {
    if (!boardId.trim()) return;
    
    setTestingPagination(true);
    setPaginationTestResults(null);
    try {
      // Call the pagination test function
      const result = await testPaginationStructure(boardId, itemLimit);
      setPaginationTestResults(result);
    } catch (error) {
      setPaginationTestResults({
        success: false,
        error: (error as Error).message || "Pagination test failed with unknown error"
      });
    } finally {
      setTestingPagination(false);
    }
  };
  
  return (
    <Card>
      <Card.Header>Find Monday.com Board by ID</Card.Header>
      <Card.Body>
        <div className="space-y-6">
          <div>
            <p className="mb-2">
              Enter a Monday.com board ID to fetch its details. You can find board IDs in the URL of a board page.
            </p>
            
            <div className="flex space-x-2">
              <Input
                value={boardId}
                onChange={(e) => setBoardId(e.target.value)}
                placeholder="Enter board ID (e.g., 1234567890)"
                className="w-full"
                onKeyDown={(e) => e.key === 'Enter' && handleFetchBoard()}
              />
              <Button 
                className="primary"
                onClick={handleFetchBoard} 
                disabled={isLoading || !boardId.trim()}
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Loading...
                  </>
                ) : "Fetch Board"}
              </Button>
            </div>
            
            <div className="mt-2 flex items-center space-x-2">
              <label className="text-sm whitespace-nowrap">Items per page:</label>
              <select 
                value={itemLimit} 
                onChange={(e) => setItemLimit(Number(e.target.value))}
                className="text-sm p-1 border rounded"
                disabled={isLoading}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              
              <div className="ml-4">
                <Button 
                  className="secondary text-sm"
                  onClick={handleTestConnection} 
                  disabled={testingApi}
                >
                  {testingApi ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Testing API...
                    </>
                  ) : "Test API Connection"}
                </Button>
              </div>
            </div>
          </div>
          
          {error && (
            <Alert variant="error">
              <Alert.Title>Error Fetching Board</Alert.Title>
              <Alert.Description>{error.toString()}</Alert.Description>
            </Alert>
          )}
          
          {isSuccess && !boardDetails && (
            <Alert variant="info">
              <Alert.Description>Board not found or not accessible.</Alert.Description>
            </Alert>
          )}
          
          {boardDetails && (
            <div className="space-y-4">
              <Alert variant="success" className="mb-4">
                <Alert.Title>Board Found!</Alert.Title>
                <Alert.Description>Successfully retrieved board details.</Alert.Description>
              </Alert>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium mb-1">{boardDetails.name}</h3>
                
                {boardDetails.workspace && (
                  <div className="text-sm text-gray-500 mb-2">
                    Workspace: {boardDetails.workspace.name}
                  </div>
                )}
                
                <div className="text-xs text-gray-400 mb-4">
                  ID: {boardDetails.id}
                </div>
                
                {boardDetails.description && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-1">Description:</h4>
                    <p className="text-sm">{boardDetails.description}</p>
                  </div>
                )}
                
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Columns ({boardDetails.columns.length}):</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {boardDetails.columns.map(column => (
                      <div key={column.id} className="bg-white p-2 rounded border">
                        <div className="font-medium truncate">{column.title}</div>
                        <div className="text-xs text-gray-500">ID: {column.id}</div>
                        <div className="text-xs text-gray-500">Type: {column.type}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Items Display Section */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Items:</h4>
                    {itemsPage && itemsPage.cursor && (
                      <Button
                        className="secondary text-xs"
                        onClick={handleFetchNextPage}
                        disabled={loadingNextPage}
                      >
                        {loadingNextPage ? (
                          <>
                            <Spinner size="sm" className="mr-1" />
                            Loading...
                          </>
                        ) : "Load Next Page"}
                      </Button>
                    )}
                  </div>
                  
                  {nextPageError && (
                    <Alert variant="error" className="mb-2">
                      <Alert.Title>Error Loading Next Page</Alert.Title>
                      <Alert.Description>{nextPageError.toString()}</Alert.Description>
                    </Alert>
                  )}
                  
                  {itemsPage && itemsPage.items.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="p-2 border text-left">Name</th>
                            {boardDetails.columns.slice(0, 5).map(column => (
                              <th key={column.id} className="p-2 border text-left">
                                {column.title}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {itemsPage.items.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="p-2 border">{item.name}</td>
                              {boardDetails.columns.slice(0, 5).map(column => {
                                const columnValue = item.column_values.find(cv => cv.id === column.id);
                                return (
                                  <td key={column.id} className="p-2 border">
                                    {columnValue?.text || '—'}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-white p-4 rounded border text-center text-gray-500">
                      No items found on this board.
                    </div>
                  )}
                </div>
              </div>
              
              {/* Raw JSON Response Section */}
              {rawResponse && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Raw API Response</h3>
                    <Button 
                      className="secondary text-sm"
                      onClick={toggleRawView}
                    >
                      {showRaw ? 'Hide Raw JSON' : 'Show Raw JSON'}
                    </Button>
                  </div>
                  
                  {showRaw && (
                    <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-auto max-h-96">
                      <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(rawResponse, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-end">
                <Button 
                  className="secondary"
                  onClick={() => {
                    // You could add functionality to use this board for import
                    console.log(`Selected board: ${boardDetails.id}`);
                  }}
                >
                  Use This Board for Import
                </Button>
                
                <Button 
                  className="secondary ml-2"
                  onClick={handleTestPagination}
                  disabled={testingPagination || !boardId.trim()}
                >
                  {testingPagination ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Testing Pagination...
                    </>
                  ) : "Test Pagination"}
                </Button>
              </div>
              
              {/* Display pagination test results */}
              {paginationTestResults && (
                <div className="mt-4">
                  <Alert variant={paginationTestResults.success ? "success" : "error"}>
                    <Alert.Title>
                      {paginationTestResults.success 
                        ? "Pagination Test Successful" 
                        : "Pagination Test Failed"}
                    </Alert.Title>
                    <Alert.Description>
                      {paginationTestResults.message || paginationTestResults.error}
                    </Alert.Description>
                    
                    {paginationTestResults.success && paginationTestResults.firstPage && (
                      <div className="mt-2">
                        <div className="text-sm">
                          <span className="font-medium">First page items:</span> {paginationTestResults.firstPage.itemCount}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Cursor available:</span> {paginationTestResults.firstPage.cursor ? "Yes" : "No"}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Second page fetch:</span> {
                            paginationTestResults.secondPage?.success ? "Successful" : "Failed"
                          }
                        </div>
                      </div>
                    )}
                  </Alert>
                </div>
              )}
            </div>
          )}
          
          {/* Display API test results */}
          {testResults && (
            <Alert variant={testResults.success ? "success" : "error"} className="mt-4">
              <Alert.Title>{testResults.success ? "Connection Successful" : "Connection Failed"}</Alert.Title>
              <Alert.Description>{testResults.message || testResults.error}</Alert.Description>
              {testResults.data && (
                <div className="mt-2">
                  <div className="text-sm font-medium">User: {testResults.data.name}</div>
                  <div className="text-sm">{testResults.data.email}</div>
                </div>
              )}
            </Alert>
          )}
        </div>
      </Card.Body>
    </Card>
  );
} 