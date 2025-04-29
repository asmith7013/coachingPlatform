'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/composed/cards/Card';
import { Alert } from '@/components/core/feedback/Alert';
import { Spinner } from '@/components/core/feedback/Spinner';
import { Select } from '@/components/core/fields/Select';
import { Button } from '@/components/core/Button';
import { Tabs } from '@/components/composed/tabs/Tabs';
import { 
  getMondayWorkspaces, 
  getBoardsByWorkspace, 
  getBoardItemSamples 
} from '@/app/actions/integrations/monday-explorer';
import { useErrorHandledMutation } from '@/hooks/error/useErrorHandledMutation';

// Types
interface Workspace {
  id: string;
  name: string;
}

interface Board {
  id: string;
  name: string;
  columns: Column[];
}

interface Column {
  id: string;
  title: string;
  type: string;
}

interface Item {
  id: string;
  name: string;
  column_values: ColumnValue[];
}

interface ColumnValue {
  id: string;
  title: string;
  text: string | null;
  value: string | null;
}

// Define base response type to match what useErrorHandledMutation expects
interface BaseResponse {
  success: boolean;
  error?: string;
}

export function MondayWorkspaceExplorer() {
  // State for hierarchical selection
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const [boardItems, setBoardItems] = useState<Item[]>([]);
  
  // Mutation for fetching workspaces
  const { 
    mutate: fetchWorkspaces, 
    isLoading: isLoadingWorkspaces, 
    error: workspacesError, 
  } = useErrorHandledMutation(async () => {
    const result = await getMondayWorkspaces();
    
    if (result.success && result.data) {
      setWorkspaces(result.data);
    }
    
    return result as BaseResponse;
  });
  
  // Mutation for fetching boards
  const { 
    mutate: fetchBoards, 
    isLoading: isLoadingBoards, 
    error: boardsError, 
  } = useErrorHandledMutation(async (workspaceId: string) => {
    if (!workspaceId) return { success: false, error: "No workspace ID provided" };
    
    const result = await getBoardsByWorkspace(workspaceId);
    
    if (result.success && result.data) {
      setBoards(result.data);
      setSelectedBoardId(''); // Reset board selection
      setBoardItems([]); // Clear items
    }
    
    return result as BaseResponse;
  });
  
  // Mutation for fetching board items
  const { 
    mutate: fetchBoardItems, 
    isLoading: isLoadingItems, 
    error: itemsError, 
  } = useErrorHandledMutation(async (boardId: string) => {
    if (!boardId) return { success: false, error: "No board ID provided" };
    
    const result = await getBoardItemSamples(boardId, 5);
    
    if (result.success && result.data) {
      setBoardItems(result.data);
    }
    
    return result as BaseResponse;
  });
  
  // Fetch workspaces on component mount
  useEffect(() => {
    fetchWorkspaces();
  }, []);
  
  // Handle workspace selection
  const handleWorkspaceChange = (value: string) => {
    setSelectedWorkspaceId(value);
    fetchBoards(value);
  };
  
  // Handle board selection
  const handleBoardChange = (value: string) => {
    setSelectedBoardId(value);
    fetchBoardItems(value);
  };
  
  // Find selected board object
  const selectedBoard = boards.find(b => b.id === selectedBoardId);
  
  // Prepare workspace options
  const workspaceOptions = workspaces.map(workspace => ({
    value: workspace.id,
    label: workspace.name,
  }));
  
  // Prepare board options
  const boardOptions = boards.map(board => ({
    value: board.id,
    label: board.name,
  }));
  
  // Prepare tabs for the Tabs component
  const tabItems = [
    {
      id: 'explorer',
      label: 'Explorer',
      content: (
        <div className="space-y-6">
          {/* Workspace Selector */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Select Workspace
            </label>
            
            {isLoadingWorkspaces ? (
              <div className="flex items-center">
                <Spinner size="sm" className="mr-2" />
                <span>Loading workspaces...</span>
              </div>
            ) : (
              <Select
                value={selectedWorkspaceId}
                onChange={handleWorkspaceChange}
                options={workspaceOptions}
                placeholder="Select a workspace"
              />
            )}
            
            {workspacesError && (
              <Alert variant="error" className="mt-2">
                <Alert.Title>Error loading workspaces</Alert.Title>
                <Alert.Description>{workspacesError.toString()}</Alert.Description>
              </Alert>
            )}
          </div>
          
          {/* Board Selector */}
          {selectedWorkspaceId && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Select Board
              </label>
              
              {isLoadingBoards ? (
                <div className="flex items-center">
                  <Spinner size="sm" className="mr-2" />
                  <span>Loading boards...</span>
                </div>
              ) : (
                <>
                  <Select
                    value={selectedBoardId}
                    onChange={handleBoardChange}
                    options={boardOptions}
                    placeholder="Select a board"
                  />
                  
                  {boards.length === 0 && (
                    <Alert variant="info" className="mt-2">
                      <Alert.Description>
                        No boards found in this workspace.
                      </Alert.Description>
                    </Alert>
                  )}
                </>
              )}
              
              {boardsError && (
                <Alert variant="error" className="mt-2">
                  <Alert.Title>Error loading boards</Alert.Title>
                  <Alert.Description>{boardsError.toString()}</Alert.Description>
                </Alert>
              )}
            </div>
          )}
          
          {/* Board Preview */}
          {selectedBoardId && selectedBoard && (
            <div>
              <h3 className="text-lg font-medium mb-2">
                Board: {selectedBoard.name}
              </h3>
              
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <h4 className="font-medium mb-2">Columns:</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {selectedBoard.columns.map(column => (
                    <div key={column.id} className="bg-white p-2 rounded border">
                      <div className="font-medium">{column.title}</div>
                      <div className="text-sm text-gray-500">ID: {column.id}</div>
                      <div className="text-sm text-gray-500">Type: {column.type}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <h4 className="font-medium mb-2">Sample Items:</h4>
              
              {isLoadingItems ? (
                <div className="flex items-center">
                  <Spinner size="sm" className="mr-2" />
                  <span>Loading sample items...</span>
                </div>
              ) : (
                <>
                  {boardItems.length === 0 ? (
                    <Alert variant="info">
                      <Alert.Description>
                        No items found on this board.
                      </Alert.Description>
                    </Alert>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="p-2 border text-left">Name</th>
                            {selectedBoard.columns.slice(0, 5).map(column => (
                              <th key={column.id} className="p-2 border text-left">
                                {column.title}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {boardItems.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="p-2 border">{item.name}</td>
                              {selectedBoard.columns.slice(0, 5).map(column => {
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
                  )}
                </>
              )}
              
              {itemsError && (
                <Alert variant="error" className="mt-2">
                  <Alert.Title>Error loading items</Alert.Title>
                  <Alert.Description>{itemsError.toString()}</Alert.Description>
                </Alert>
              )}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'import',
      label: 'Import Configuration',
      content: selectedBoardId && selectedBoard ? (
        <MondayFieldMapper 
          board={selectedBoard} 
          sampleItems={boardItems}
        />
      ) : (
        <Alert variant="info">
          <Alert.Description>
            Please select a workspace and board first to configure field mappings.
          </Alert.Description>
        </Alert>
      )
    }
  ];
  
  return (
    <Card>
      <Card.Header>Monday.com Explorer</Card.Header>
      <Card.Body>
        <Tabs
          tabs={tabItems}
          defaultTab="explorer"
          onChange={(id) => console.log(`Tab changed to ${id}`)}
        />
      </Card.Body>
    </Card>
  );
}

// Mapping component
interface MondayFieldMapperProps {
  board: Board;
  sampleItems: Item[];
}

function MondayFieldMapper({ board, sampleItems }: MondayFieldMapperProps) {
  // State for field mappings
  const [mappings, setMappings] = useState<Record<string, string>>({});
  
  // Your field definitions (from your data model)
  const targetFields = [
    { id: 'date', label: 'Date' },
    { id: 'school', label: 'School' },
    { id: 'coach', label: 'Coach' },
    { id: 'modeDone', label: 'Mode Done' },
    { id: 'solvesTouchpoint', label: 'SOLVES Touchpoint' },
    // Add more fields from your Visit schema
  ];
  
  // Update mapping
  const handleMappingChange = (targetField: string, mondayColumnId: string) => {
    setMappings(prev => ({
      ...prev,
      [targetField]: mondayColumnId,
    }));
  };
  
  // Save mappings
  const handleSaveMapping = () => {
    console.log('Saving mappings:', mappings);
    // TODO: Implement saving mappings
    alert('Mappings saved! (Console has the details)');
  };
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium mb-2">
        Map Monday.com Fields to Visit Fields
      </h3>
      
      <p className="mb-4">
        Select which Monday.com column corresponds to each field in your Visit data model.
      </p>
      
      <div className="space-y-4">
        {targetFields.map(field => (
          <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="font-medium">{field.label}</div>
            
            <Select
              value={mappings[field.id] || ''}
              onChange={(value) => handleMappingChange(field.id, value)}
              options={[
                { value: '', label: '— Not mapped —' },
                ...board.columns.map(column => ({
                  value: column.id,
                  label: column.title,
                })),
              ]}
              placeholder="Select a column"
            />
            
            <div className="text-sm text-gray-500">
              {mappings[field.id] && sampleItems.length > 0 && (
                <>
                  Example: {
                    sampleItems[0].column_values.find(cv => cv.id === mappings[field.id])?.text || '—'
                  }
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="pt-4 border-t">
        <Button 
          className="primary" 
          onClick={handleSaveMapping}
        >
          Save Mapping
        </Button>
      </div>
    </div>
  );
} 