"use client";

import { useState } from "react";
import { Button } from "@components/core";
import { Card } from "@components/composed/cards";
import { Alert } from "@components/core/feedback/Alert";
import { Spinner } from "@components/core/feedback";
import { Select } from "@components/core/fields";
import type { ImportPreview } from "@lib/integrations/monday/types/import";
import type { MondayBoard } from "@lib/integrations/monday/types/board";
import { 
  useMondayConnection,
  useMondayBoard,
  useMondayUserByEmail
} from '@hooks/integrations/monday/useMondayQueries';

export default function MondayLiveExamplePage() {
  // Use the API-based hook
  const {
    testConnection,
    getBoard,
    findPotentialVisits,
    importVisits,
    loading,
    error: apiError
  } = useMondayMutations();
  
  // State management
  const [connectionState, setConnectionState] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const [connectionData, setConnectionData] = useState<{ name?: string; email?: string } | null>(null);
  const [board, setBoard] = useState<MondayBoard | null>(null);
  const [previewItems, setPreviewItems] = useState<ImportPreview[] | null>(null);
  const [importResult, setImportResult] = useState<{ success: boolean; message?: string; errors?: Record<string, string> } | null>(null);
  const [selectedBoardId, setSelectedBoardId] = useState<string>("");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [transformPreview, setTransformPreview] = useState<ImportPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // React Query hooks
  const connectionQuery = useMondayConnection();
  const boardMutation = useMondayBoard();
  const userQuery = useMondayUserByEmail(connectionData?.email || '');
  
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
  
  // Handle board selection
  const handleBoardChange = async (boardId: string) => {
    setSelectedBoardId(boardId);
    if (boardId) {
      try {
        // Load board data
        const boardData = await getBoard(boardId);
        setBoard(boardData);
        
        // Find potential items to import
        const potentialItems = await findPotentialVisits(boardId);
        setPreviewItems(potentialItems);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load board data');
      }
    }
  };

  // Handle item selection
  const handleItemSelect = (itemId: string) => {
    setSelectedItemId(itemId);
    // Find the preview for this item
    const preview = previewItems?.find(p => p.original.id === itemId) || null;
    setTransformPreview(preview);
  };

  // Handle import of selected item
  const handleImport = async () => {
    if (!selectedItemId || !transformPreview?.valid || !selectedBoardId) return;
    
    try {
      const result = await importVisits([selectedItemId], selectedBoardId);
      setImportResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    }
  };
  
  // Combine errors for display
  const displayError = error || apiError;

  // Handle board fetch
  const handleFetchBoard = async () => {
    if (!selectedBoardId) {
      setError('Please enter a board ID');
      return;
    }
    
    setError(null);
    
    try {
      await boardMutation.mutateAsync([selectedBoardId]);
    } catch (err) {
      console.error('Error fetching board:', err);
      setError(err instanceof Error ? err.message : String(err));
    }
  };
  
  // Determine loading state
  const isLoading = connectionQuery.isLoading || boardMutation.isPending || userQuery.isLoading;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Monday.com Live Integration Example</h1>
      
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
      
      {/* Board Selection */}
      {connectionState === 'connected' && (
        <Card className="mb-6">
          <Card.Header>Select a Monday.com Board</Card.Header>
          <Card.Body>
            {loading ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" />
                <span>Loading boards...</span>
              </div>
            ) : board ? (
              <div>
                <Select
                  value={selectedBoardId}
                  onChange={handleBoardChange}
                  options={[...(board ? [{ value: board.id, label: board.name }] : [])]}
                  placeholder="Select a board"
                />
              </div>
            ) : (
              <p>No boards found. Make sure your Monday.com account has access to boards.</p>
            )}
          </Card.Body>
        </Card>
      )}
      
      {/* Potential Import Items */}
      {connectionState === 'connected' && selectedBoardId && (
        <Card className="mb-6">
          <Card.Header>Potential Import Items</Card.Header>
          <Card.Body>
            {loading ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" />
                <span>Finding items to import...</span>
              </div>
            ) : previewItems && previewItems.length > 0 ? (
              <div>
                <p className="mb-2 text-sm text-gray-600">
                  Found {previewItems.length} potential items. Click on an item to select it.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {previewItems.map(item => (
                    <div
                      key={String(item.original.id)}
                      className={`p-3 border rounded cursor-pointer ${
                        selectedItemId === String(item.original.id) ? 'bg-blue-50 border-blue-300' : ''
                      }`}
                      onClick={() => handleItemSelect(String(item.original.id))}
                    >
                      <div className="flex justify-between items-center">
                        <span>{String(item.original.name)}</span>
                        {item.isDuplicate && (
                          <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                            Duplicate
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          ID: {String(item.original.id)}
                        </span>
                        {item.valid ? (
                          <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                            Valid
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                            Invalid
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p>No eligible items found for import in this board.</p>
            )}
          </Card.Body>
        </Card>
      )}
      
      {/* Selected Item Preview */}
      {transformPreview && (
        <Card className="mb-6">
          <Card.Header>
            Selected Item Preview
            {transformPreview.valid ? (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                Valid
              </span>
            ) : (
              <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                Missing Required Fields
              </span>
            )}
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Transformed Data</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-96">
                  {JSON.stringify(transformPreview.transformed, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Validation Results</h3>
                <div>
                  <p className="mb-1">
                    <span className="font-medium">Valid:</span> {transformPreview.valid ? "Yes" : "No"}
                  </p>
                  
                  {transformPreview.missingRequired.length > 0 && (
                    <div className="mt-3">
                      <h4 className="font-medium text-red-600">Missing Required Fields:</h4>
                      <ul className="list-disc pl-5">
                        {transformPreview.missingRequired.map(field => (
                          <li key={field}>{field}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {Object.keys(transformPreview.errors).length > 0 && (
                    <div className="mt-3">
                      <h4 className="font-medium text-red-600">Errors:</h4>
                      <ul className="list-disc pl-5">
                        {Object.entries(transformPreview.errors).map(([field, error]) => (
                          <li key={field}>
                            <span className="font-medium">{field}:</span> {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {transformPreview.valid && (
                    <div className="mt-4">
                      <Button 
                        onClick={handleImport}
                        disabled={loading}
                      >
                        {loading ? <><Spinner size="sm" className="mr-2" /> Importing...</> : "Import to Database"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}
      
      {/* Import Result */}
      {importResult && (
        <Card className="mb-6">
          <Card.Header>Import Result</Card.Header>
          <Card.Body>
            <div className={`p-4 rounded ${importResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className={`font-medium ${importResult.success ? 'text-green-700' : 'text-red-700'}`}>
                {importResult.message}
              </p>
              
              {importResult.success && (
                <p className="mt-2">
                  Successfully imported items.
                </p>
              )}
              
              {Object.keys(importResult.errors || {}).length > 0 && (
                <div className="mt-3">
                  <h4 className="font-medium text-red-600">Errors:</h4>
                  <ul className="list-disc pl-5">
                    {Object.entries(importResult.errors || {}).map(([id, message]) => (
                      <li key={id}>{message as string}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
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
                value={selectedBoardId}
                onChange={e => setSelectedBoardId(e.target.value)}
                placeholder="Enter Monday.com board ID"
              />
            </div>
            <div>
              <Button 
                onClick={handleFetchBoard}
                disabled={isLoading || !selectedBoardId}
              >
                {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
                Fetch Board
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
      
      {/* User lookup */}
      <Card className="mb-6">
        <Card.Body>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={connectionData?.email || ''}
                onChange={e => setConnectionData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter user email"
              />
            </div>
          </div>
          
          {userQuery.data && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <Text className="font-medium">User Found</Text>
              <Text className="text-gray-600">
                Name: {userQuery.data.name}
              </Text>
              <Text className="text-gray-600">
                Email: {userQuery.data.email}
              </Text>
            </div>
          )}
        </Card.Body>
      </Card>
      
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
