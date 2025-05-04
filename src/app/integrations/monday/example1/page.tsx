"use client";

import { useState } from "react";
import { Button } from "@/components/core";
import { Card } from "@/components/composed/cards";
import { Alert } from "@/components/core/feedback/Alert";
import { Spinner } from "@/components/core/feedback";
import { Select } from "@/components/core/fields";
import { useMondayIntegration } from "@/hooks/integrations/monday/useMondayIntegration";
// import { ImportItem } from "@/app/actions/integrations/monday";
import { ImportPreview } from "@/lib/integrations/monday/types";

export default function MondayLiveExamplePage() {
  // Use the consolidated Monday integration hook
  const {
    // Connection
    connectionStatus,
    connectionData,
    connectionError,
    testConnection,
    
    // Board operations
    board,
    boardLoading,
    boardError,
    getBoard,
    
    // Import operations
    previewItems,
    previewLoading,
    previewError,
    findItemsToImport,
    
    // Import execution
    importResult,
    importing,
    importError,
    importItems
  } = useMondayIntegration();
  
  
  // Local UI state
  const [selectedBoardId, setSelectedBoardId] = useState<string>("");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [transformPreview, setTransformPreview] = useState<ImportPreview | null>(null);
  
  // Handle board selection
  const handleBoardChange = (boardId: string) => {
    setSelectedBoardId(boardId);
    if (boardId) {
      // Load board data
      getBoard(boardId);
      // Find potential items to import
      findItemsToImport(boardId);
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
    if (!selectedItemId || !transformPreview?.valid) return;
    
    await importItems([selectedItemId]);
  };
  
  // Combine errors for display
  const error = connectionError || boardError || previewError || importError;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Monday.com Live Integration Example</h1>
      
      {/* Connection Status */}
      <Card className="mb-6">
        <Card.Header>Connection Status</Card.Header>
        <Card.Body>
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
      
      {/* Board Selection */}
      {connectionStatus === 'connected' && (
        <Card className="mb-6">
          <Card.Header>Select a Monday.com Board</Card.Header>
          <Card.Body>
            {boardLoading ? (
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
      {connectionStatus === 'connected' && selectedBoardId && (
        <Card className="mb-6">
          <Card.Header>Potential Import Items</Card.Header>
          <Card.Body>
            {previewLoading ? (
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
                        disabled={importing}
                      >
                        {importing ? "Importing..." : "Import to Database"}
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
                  Successfully imported {importResult.imported} items.
                </p>
              )}
              
              {Object.keys(importResult.errors).length > 0 && (
                <div className="mt-3">
                  <h4 className="font-medium text-red-600">Errors:</h4>
                  <ul className="list-disc pl-5">
                    {Object.entries(importResult.errors).map(([id, message]) => (
                      <li key={id}>{message}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      )}
      
      {/* Generic Error Display */}
      {error && (
        <Alert intent="error" className="mt-4">
          <Alert.Title>Error</Alert.Title>
          <Alert.Description>{error}</Alert.Description>
        </Alert>
      )}
    </div>
  );
}
