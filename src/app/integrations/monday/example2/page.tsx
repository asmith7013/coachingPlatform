"use client";

import { useState } from "react";
import { Button } from "@/components/core";
import { Card } from "@/components/composed/cards";
import { Alert } from "@/components/core/feedback/Alert";
import { Spinner } from "@/components/core/feedback";
import { useMondayConnection, useMondayBoard, useMondayImport } from "@/hooks/integrations/monday/useMondayQueries";
import { Heading } from "@/components/core/typography/Heading";
import { Text } from "@/components/core/typography/Text";

export default function MondayExample2() {
  const [boardId, setBoardId] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // React Query hooks
  const connectionQuery = useMondayConnection();
  const boardMutation = useMondayBoard();
  const importMutation = useMondayImport();
  
  // Handle board fetch
  const handleFetchBoard = async () => {
    if (!boardId) {
      setError('Please enter a board ID');
      return;
    }
    
    setError(null);
    
    try {
      await boardMutation.mutateAsync([boardId]);
    } catch (err) {
      console.error('Error fetching board:', err);
      setError(err instanceof Error ? err.message : String(err));
    }
  };
  
  // Handle import
  const handleImport = async () => {
    if (!boardId) {
      setError('Please enter a board ID');
      return;
    }
    
    setError(null);
    
    try {
      await importMutation.mutateAsync({
        ids: ['123', '456'], // Example item IDs
        boardId
      });
    } catch (err) {
      console.error('Error importing items:', err);
      setError(err instanceof Error ? err.message : String(err));
    }
  };
  
  // Determine loading state
  const isLoading = connectionQuery.isLoading || boardMutation.isPending || importMutation.isPending;

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <Heading level="h1">Monday.com Integration Example 2</Heading>
        <Text className="text-gray-600 mt-2">
          Example of using Monday.com integration hooks for imports
        </Text>
      </div>
      
      {/* Connection status */}
      <Card className="mb-6">
        <Card.Body>
          <div className="flex items-center justify-between">
            <div>
              <Text className="font-medium">Connection Status</Text>
              <Text className="text-gray-600">
                {connectionQuery.isLoading ? 'Checking...' : 
                  connectionQuery.data?.success ? 'Connected' : 'Not connected'}
              </Text>
            </div>
            <Button 
              onClick={() => connectionQuery.refetch()}
              disabled={isLoading}
            >
              {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
              Refresh
            </Button>
          </div>
        </Card.Body>
      </Card>
      
      {/* Board fetch */}
      <Card className="mb-6">
        <Card.Body>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Board ID
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={boardId}
                onChange={e => setBoardId(e.target.value)}
                placeholder="Enter Monday.com board ID"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleFetchBoard}
                disabled={isLoading || !boardId}
              >
                {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
                Fetch Board
              </Button>
              <Button 
                onClick={handleImport}
                disabled={isLoading || !boardId}
                intent="primary"
              >
                {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
                Import Items
              </Button>
            </div>

            {boardId && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <h3 className="font-medium mb-2">Board Details</h3>
                <pre className="text-sm overflow-auto max-h-96">
                  {JSON.stringify(boardId, null, 2)}
                </pre>
              </div>
            )}
            </div>
          </Card.Body>
        </Card>
      
      
      {/* Error display */}
      {error && (
        <Alert intent="error" className="mb-4">
          <Alert.Title>Error</Alert.Title>
          <Alert.Description>{error}</Alert.Description>
        </Alert>
      )}
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
          <div className="ml-4">Loading...</div>
        </div>
      )}
    </div>
  );
}
