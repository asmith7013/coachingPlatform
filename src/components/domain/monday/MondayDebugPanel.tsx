'use client';

import { useState } from 'react';
import { Button } from '@/components/core/Button';
import { Card } from '@/components/composed/cards/Card';
import { Input } from '@/components/core/fields/Input';
import { Alert } from '@/components/core/feedback/Alert';
import { Spinner } from '@/components/core/feedback/Spinner';
import { runMondayDebug } from '@/app/actions/integrations/monday-debug-action';
import { useErrorHandledMutation } from '@/hooks/error/useErrorHandledMutation';

// Define interface for debug results
interface DebugTestResult {
  success: boolean;
  status?: number;
  headers?: Record<string, string>;
  data?: Record<string, unknown>;
  error?: string;
  errorSummary?: string;
  message?: string;
  user?: { name: string; email: string };
  board?: { id: string; name: string; columns?: Array<Record<string, unknown>> };
  itemCount?: number;
  cursor?: string;
  nextCursor?: string;
  boardFound?: boolean;
  nextItemsPageFound?: boolean;
  cursorFound?: boolean;
  itemsFound?: boolean;
}

interface MondayDebugResults {
  success: boolean;
  connectivityResult?: DebugTestResult;
  boardResult?: DebugTestResult;
  itemsPageResult?: DebugTestResult;
  nextItemsPageResult?: DebugTestResult | null;
  fullBoardResult?: DebugTestResult;
  error?: string;
  message?: string;
}

export function MondayDebugPanel() {
  const [boardId, setBoardId] = useState<string>('');
  const [debugResults, setDebugResults] = useState<MondayDebugResults | null>(null);
  
  const { 
    mutate: runDebug, 
    isLoading, 
    error 
  } = useErrorHandledMutation(async (id: string) => {
    // Call the server action for debugging
    const results = await runMondayDebug(id);
    // Cast the results to the expected type to fix TypeScript error
    setDebugResults(results as MondayDebugResults);
    return results;
  });
  
  // Helper to display a test result
  const renderTestResult = (title: string, result: DebugTestResult | undefined | null) => {
    if (!result) return null;
    
    return (
      <div className="mt-2">
        <h4 className="text-sm font-medium">{title}</h4>
        <div className={`mt-1 p-2 rounded text-sm ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
          {result.success ? (
            <span className="text-green-600">✓ Success</span>
          ) : (
            <div>
              <span className="text-red-600">✗ Failed</span>
              {result.errorSummary && (
                <div className="mt-1 text-red-600">
                  {result.errorSummary}
                </div>
              )}
            </div>
          )}
          
          {result.success && result.user && (
            <div className="mt-1 text-sm">
              User: {result.user.name} ({result.user.email})
            </div>
          )}
          
          {result.success && result.board && (
            <div className="mt-1 text-sm">
              Board: {result.board.name} (ID: {result.board.id})
            </div>
          )}
          
          {result.success && result.itemCount !== undefined && (
            <div className="mt-1 text-sm">
              Items: {result.itemCount}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <Card>
      <Card.Header>Monday.com API Diagnostic Tool</Card.Header>
      <Card.Body>
        <div className="space-y-4">
          <p>
            This tool runs a series of tests to diagnose issues with your Monday.com API 
            integration.
          </p>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Monday.com Board ID
            </label>
            <Input
              value={boardId}
              onChange={(e) => setBoardId(e.target.value)}
              placeholder="Enter board ID (e.g., 1234567890)"
              className="w-full"
            />
          </div>
          
          <Button 
            className="primary"
            onClick={() => runDebug(boardId)} 
            disabled={isLoading || !boardId.trim()}
          >
            {isLoading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Running Diagnostics...
              </>
            ) : "Run Diagnostics"}
          </Button>
          
          {error && (
            <Alert variant="error">
              <Alert.Title>Error</Alert.Title>
              <Alert.Description>{error.toString()}</Alert.Description>
            </Alert>
          )}
          
          {debugResults && (
            <div className="mt-4">
              <Alert variant={debugResults.success ? "success" : "error"}>
                <Alert.Title>
                  {debugResults.success ? "Diagnostics Passed!" : "Diagnostics Failed"}
                </Alert.Title>
                <Alert.Description>
                  {debugResults.message || debugResults.error}
                </Alert.Description>
              </Alert>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium">Test Results</h3>
                
                {renderTestResult("API Connectivity", debugResults.connectivityResult)}
                {renderTestResult("Board Access", debugResults.boardResult)}
                {renderTestResult("Items Page Access", debugResults.itemsPageResult)}
                {renderTestResult("Pagination Test", debugResults.nextItemsPageResult)}
                {renderTestResult("Full Board Data", debugResults.fullBoardResult)}
                
                {!debugResults.success && (
                  <div className="mt-4">
                    <h3 className="font-medium text-red-600">Recommended Actions</h3>
                    
                    {!debugResults.connectivityResult?.success && (
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                        <li>Verify your Monday.com API token is valid</li>
                        <li>Check your network connectivity to api.monday.com</li>
                        <li>Ensure environment variables are correctly set up</li>
                      </ul>
                    )}
                    
                    {debugResults.connectivityResult?.success && !debugResults.boardResult?.success && (
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                        <li>Verify the board ID is correct</li>
                        <li>Confirm you have access permissions to this board</li>
                        <li>Check if the board has been archived or deleted</li>
                      </ul>
                    )}
                    
                    {debugResults.boardResult?.success && !debugResults.itemsPageResult?.success && (
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                        <li>Check if the board has items</li>
                        <li>Verify your permissions include reading items</li>
                        <li>Try reducing the limit parameter to stay within API limits</li>
                      </ul>
                    )}
                    
                    {debugResults.itemsPageResult?.success && 
                     debugResults.nextItemsPageResult && 
                     !debugResults.nextItemsPageResult.success && (
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                        <li>The cursor may have expired (valid for 60 minutes)</li>
                        <li>Try requesting a new cursor by querying items_page again</li>
                      </ul>
                    )}
                    
                    {debugResults.itemsPageResult?.success && 
                     (!debugResults.nextItemsPageResult || debugResults.nextItemsPageResult.success) && 
                     !debugResults.fullBoardResult?.success && (
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                        <li>The query may be too complex - try simplifying it</li>
                        <li>The board might have custom column types not handled correctly</li>
                        <li>Check for API rate limits or query complexity limits</li>
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
} 