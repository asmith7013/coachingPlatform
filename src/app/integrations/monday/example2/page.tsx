"use client";

import { useState } from "react";
import { Button } from "@/components/core";
import { Card } from "@/components/composed/cards";
import { Alert } from "@/components/core/feedback/Alert";
import { Spinner } from "@/components/core/feedback";
import { Input } from "@/components/core/fields";
import { useMondayMutations } from "@/hooks/integrations/monday/useMondayMutations";
import type { MondayBoard } from "@/lib/integrations/monday/types/board";

export default function MondaySimpleExamplePage() {
  // Use the API-based hook
  const {
    testConnection,
    getBoard,
    loading,
    error: apiError
  } = useMondayMutations();
  
  // State management
  const [connectionState, setConnectionState] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const [connectionData, setConnectionData] = useState<{ name?: string; email?: string } | null>(null);
  const [boardId, setBoardId] = useState<string>("");
  const [board, setBoard] = useState<MondayBoard | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Handle connection test
  const handleTestConnection = async () => {
    try {
      const result = await testConnection();
      
      if (result.success) {
        setConnectionState('connected');
        setConnectionData({
          name: result.message?.split(' ')[0] || 'Unknown',
          email: result.message?.split(' ')[1]?.replace(/[()]/g, '') || 'unknown@example.com'
        });
      } else {
        setConnectionState('error');
        setConnectionData(null);
        setError(result.message || 'Connection failed');
      }
    } catch (err) {
      setConnectionState('error');
      setConnectionData(null);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  };
  
  // Handle board fetch
  const handleFetchBoard = async () => {
    if (!boardId) return;
    
    try {
      const boardData = await getBoard(boardId);
      setBoard(boardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch board');
    }
  };
  
  // Combine errors for display
  const displayError = error || apiError;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Monday.com Simple Integration Example</h1>
      
      {/* Connection Status */}
      <Card className="mb-6">
        <Card.Header>Connection Status</Card.Header>
        <Card.Body>
          {connectionState === 'unknown' ? (
            <Button onClick={handleTestConnection} disabled={loading}>
              {loading ? <><Spinner size="sm" className="mr-2" /> Testing...</> : "Test Connection"}
            </Button>
          ) : connectionState === 'connected' ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Connected to Monday.com</span>
              </div>
              {connectionData && (
                <p className="text-sm text-gray-600">
                  Logged in as: {connectionData.name} ({connectionData.email})
                </p>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Failed to connect</span>
              </div>
              {displayError && (
                <Alert intent="error">
                  <Alert.Description>{displayError}</Alert.Description>
                </Alert>
              )}
              <Button onClick={handleTestConnection} className="mt-2" disabled={loading}>
                {loading ? <><Spinner size="sm" className="mr-2" /> Retrying...</> : "Retry Connection"}
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Board Fetch */}
      {connectionState === 'connected' && (
        <Card className="mb-6">
          <Card.Header>Fetch Monday.com Board</Card.Header>
          <Card.Body>
            <div className="flex gap-4">
              <Input
                type="text"
                value={boardId}
                onChange={(e) => setBoardId(e.target.value)}
                placeholder="Enter board ID"
                className="flex-1"
              />
              <Button 
                onClick={handleFetchBoard}
                disabled={!boardId || loading}
              >
                {loading ? <><Spinner size="sm" className="mr-2" /> Fetching...</> : "Fetch Board"}
              </Button>
            </div>
            
            {board && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <h3 className="font-medium mb-2">Board Details</h3>
                <pre className="text-sm overflow-auto max-h-96">
                  {JSON.stringify(board, null, 2)}
                </pre>
              </div>
            )}
          </Card.Body>
        </Card>
      )}
      
      {/* Generic Error Display */}
      {displayError && !connectionData && (
        <Alert intent="error" className="mt-4">
          <Alert.Title>Error</Alert.Title>
          <Alert.Description>{displayError}</Alert.Description>
        </Alert>
      )}
    </div>
  );
}
