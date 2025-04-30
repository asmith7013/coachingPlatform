'use client';

import { useState } from 'react';
import { Card } from '@/components/composed/cards/Card';
import { Button } from '@/components/core/Button';
import { Input } from '@/components/core/fields/Input';
import { Alert } from '@/components/core/feedback/Alert';
import { Spinner } from '@/components/core/feedback/Spinner';
import { getBoard, testConnection } from '@/app/actions/integrations/monday';
import { 
  MondayBoard, 
  MondayItem,
  MondayConnectionTestResult
} from '@/lib/types/domain/monday';

interface BoardFinderProps {
  onBoardSelect?: (board: { id: string; name: string }) => void;
}

export function BoardFinder({ onBoardSelect }: BoardFinderProps) {
  const [boardId, setBoardId] = useState<string>('');
  const [board, setBoard] = useState<MondayBoard | null>(null);
  const [items, setItems] = useState<MondayItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionTestStatus, setConnectionTestStatus] = useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    message?: string;
  }>({ status: 'idle' });

  // Handle board fetch
  const handleFetchBoard = async () => {
    if (!boardId.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getBoard(boardId);
      
      if (result.success && result.data) {
        setBoard(result.data);
        setItems(result.data.items_page?.items || []);
        
        // Notify parent about selected board
        if (onBoardSelect) {
          onBoardSelect({
            id: result.data.id,
            name: result.data.name
          });
        }
      } else {
        setError(result.error || "Failed to fetch board");
        setBoard(null);
        setItems([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setBoard(null);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Test API connection
  const handleTestConnection = async () => {
    setConnectionTestStatus({ status: 'loading' });
    
    try {
      const result = await testConnection() as MondayConnectionTestResult;
      
      if (result.success && result.data) {
        setConnectionTestStatus({ 
          status: 'success', 
          message: `Connected as ${result.data.name} (${result.data.email})` 
        });
      } else {
        setConnectionTestStatus({ 
          status: 'error', 
          message: result.error || "Connection test failed" 
        });
      }
    } catch (err) {
      setConnectionTestStatus({ 
        status: 'error', 
        message: err instanceof Error ? err.message : "An unknown error occurred" 
      });
    }
  };

  return (
    <Card>
      <Card.Header>Monday.com Board Finder</Card.Header>
      <Card.Body>
        <div className="space-y-4">
          {/* Connection test button */}
          <div className="flex justify-end">
            <Button 
              className="secondary text-sm" 
              onClick={handleTestConnection}
              disabled={connectionTestStatus.status === 'loading'}
            >
              {connectionTestStatus.status === 'loading' ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Testing Connection...
                </>
              ) : "Test Connection"}
            </Button>
          </div>
          
          {/* Connection test result */}
          {connectionTestStatus.status === 'success' && (
            <Alert variant="success">
              <Alert.Title>Connection Successful</Alert.Title>
              <Alert.Description>{connectionTestStatus.message}</Alert.Description>
            </Alert>
          )}
          
          {connectionTestStatus.status === 'error' && (
            <Alert variant="error">
              <Alert.Title>Connection Failed</Alert.Title>
              <Alert.Description>{connectionTestStatus.message}</Alert.Description>
            </Alert>
          )}
          
          {/* Board ID input */}
          <div>
            <p className="mb-2">
              Enter a Monday.com board ID to fetch its details.
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
          </div>
          
          {/* Error message */}
          {error && (
            <Alert variant="error">
              <Alert.Title>Error</Alert.Title>
              <Alert.Description>{error}</Alert.Description>
            </Alert>
          )}
          
          {/* Board details */}
          {board && (
            <div className="space-y-4">
              <Alert variant="success">
                <Alert.Title>Board Found!</Alert.Title>
                <Alert.Description>
                  Successfully retrieved board details.
                  {onBoardSelect && (
                    <span className="block mt-2 text-sm">
                      This board has been selected for import.
                    </span>
                  )}
                </Alert.Description>
              </Alert>
              
              {!onBoardSelect && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-1">{board.name}</h3>
                  
                  {board.workspace && (
                    <div className="text-sm text-gray-500 mb-2">
                      Workspace: {board.workspace.name}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-400 mb-4">
                    ID: {board.id}
                  </div>
                  
                  {board.description && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-1">Description:</h4>
                      <p className="text-sm">{board.description}</p>
                    </div>
                  )}
                  
                  {/* Columns */}
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Columns ({board.columns.length}):</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {board.columns.map(column => (
                        <div key={column.id} className="bg-white p-2 rounded border">
                          <div className="font-medium truncate">{column.title}</div>
                          <div className="text-xs text-gray-500">ID: {column.id}</div>
                          <div className="text-xs text-gray-500">Type: {column.type}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Items */}
                  {items.length > 0 ? (
                    <div>
                      <h4 className="font-medium mb-2">Items ({items.length}):</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="p-2 border text-left">Name</th>
                              {board.columns.slice(0, 5).map(column => (
                                <th key={column.id} className="p-2 border text-left">
                                  {column.title}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {items.map(item => (
                              <tr key={item.id} className="hover:bg-gray-50">
                                <td className="p-2 border">{item.name}</td>
                                {board.columns.slice(0, 5).map(column => {
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
                    </div>
                  ) : (
                    <div className="text-center p-4 bg-gray-100 rounded">
                      No items found on this board.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
} 