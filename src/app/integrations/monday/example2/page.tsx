"use client";

import { useState } from "react";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/composed/cards/Card";
import { Alert } from "@/components/core/feedback/Alert"; 
import { Spinner } from "@/components/core/feedback/Spinner";
import { Input } from "@/components/core/fields/Input";
import { useMondayIntegration } from "@/hooks/integrations/monday/useMondayIntegration";

export default function MondayBoardFinderPage() {
  // Use the consolidated Monday integration hook
  const {
    connectionStatus,
    connectionData,
    connectionError,
    testConnection,
    board,
    boardLoading,
    boardError,
    getBoard
  } = useMondayIntegration();
  
  // Board ID input state
  const [boardId, setBoardId] = useState<string>("");
  
  // Handle board search
  const handleFetchBoard = async () => {
    if (!boardId.trim()) {
      return;
    }
    
    await getBoard(boardId);
  };
  
  // Format column type for display
  const formatColumnType = (type: string) => {
    return type
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Monday.com Board Finder</h1>
      
      {/* Connection Status */}
      <Card className="mb-6">
        <Card.Header className="p-4 font-semibold text-lg">Connection Status</Card.Header>
        <Card.Body className="p-4">
          {connectionStatus === 'unknown' ? (
            <Button onClick={() => testConnection()}>
              Test Connection
            </Button>
          ) : connectionStatus === 'connected' ? (
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
              {connectionError && (
                <Alert intent="error">
                  <Alert.Title>Connection Error</Alert.Title>
                  <Alert.Description>{connectionError}</Alert.Description>
                </Alert>
              )}
              <Button onClick={() => testConnection()} className="mt-2">
                Retry Connection
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Board Finder */}
      <Card className="mb-6">
        <Card.Header className="p-4 font-semibold text-lg">Find a Board</Card.Header>
        <Card.Body className="p-4">
          <div className="flex gap-4 mb-4">
            <Input
              label="Board ID"
              value={boardId}
              onChange={(e) => setBoardId(e.target.value)}
              placeholder="Enter board ID"
              className="flex-grow"
            />
            <div className="self-end">
              <Button 
                onClick={handleFetchBoard}
                disabled={boardLoading || !boardId || connectionStatus !== 'connected'}
              >
                {boardLoading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Loading...
                  </>
                ) : "Fetch Board"}
              </Button>
            </div>
          </div>
          
          {boardError && (
            <Alert intent="error" className="mb-4">
              <Alert.Title>Board Error</Alert.Title>
              <Alert.Description>{boardError}</Alert.Description>
            </Alert>
          )}
          
          {connectionStatus !== 'connected' && (
            <Alert intent="warning" appearance="outline" className="mb-4">
              <Alert.Title>Not Connected</Alert.Title>
              <Alert.Description>
                Please test your connection before fetching a board.
              </Alert.Description>
            </Alert>
          )}
        </Card.Body>
      </Card>
      
      {/* Board Details */}
      {board && (
        <Card>
          <Card.Header className="p-4 font-semibold text-lg">Board Details: {board.name}</Card.Header>
          <Card.Body className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Board Information</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <p><span className="font-medium">ID:</span> {board.id}</p>
                  <p><span className="font-medium">Name:</span> {board.name}</p>
                  {board.description && (
                    <p><span className="font-medium">Description:</span> {board.description}</p>
                  )}
                  {board.workspace && (
                    <p>
                      <span className="font-medium">Workspace:</span> {board.workspace.name} 
                      <span className="text-gray-500 text-xs ml-1">({board.workspace.id})</span>
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Columns ({board.columns?.length || 0})</h3>
                {board.columns && board.columns.length > 0 ? (
                  <div className="bg-gray-50 p-4 rounded max-h-60 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left pb-2">Title</th>
                          <th className="text-left pb-2">Type</th>
                          <th className="text-left pb-2">ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {board.columns.map((column) => (
                          <tr key={column.id} className="border-b last:border-0">
                            <td className="py-2">{column.title}</td>
                            <td className="py-2">{formatColumnType(column.type)}</td>
                            <td className="py-2 text-gray-500">{column.id}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No columns found on this board.</p>
                )}
              </div>
            </div>
            
            {/* Items Section */}
            {board.items_page && board.items_page.items && (
              <div className="mt-6">
                <h3 className="font-medium mb-2">
                  Items ({board.items_page.items.length})
                </h3>
                <div className="bg-gray-50 p-4 rounded max-h-80 overflow-y-auto">
                  {board.items_page.items.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left pb-2">Name</th>
                          <th className="text-left pb-2">ID</th>
                          <th className="text-left pb-2">State</th>
                        </tr>
                      </thead>
                      <tbody>
                        {board.items_page.items.map((item) => (
                          <tr key={item.id} className="border-b last:border-0">
                            <td className="py-2">{item.name}</td>
                            <td className="py-2 text-gray-500">{item.id}</td>
                            <td className="py-2">{item.state || 'active'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-gray-500">No items found on this board.</p>
                  )}
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
