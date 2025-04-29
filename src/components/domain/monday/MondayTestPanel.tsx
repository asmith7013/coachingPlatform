import { useState } from 'react';
import { Button } from '@/components/core/Button';
import { Card } from '@/components/composed/cards/Card';
import { Alert } from '@/components/core/feedback/Alert';
import { Spinner } from '@/components/core/feedback/Spinner';
import { testMondayConnection, testMondayWorkspaces } from '@/app/actions/integrations/monday-test';
import { useErrorHandledMutation } from '@/hooks/error/useErrorHandledMutation';

interface BoardResult {
  id: string;
  name: string;
}

interface WorkspaceResult {
  id: string;
  name: string;
}

export function MondayTestPanel() {
  const [boardResult, setBoardResult] = useState<BoardResult | null>(null);
  const [workspacesResult, setWorkspacesResult] = useState<WorkspaceResult[]>([]);
  
  const { 
    mutate: testConnection, 
    isLoading: isTestingConnection, 
    error: connectionError, 
  } = useErrorHandledMutation(async () => {
    const result = await testMondayConnection();
    
    if (result.success && result.data) {
      setBoardResult(result.data as BoardResult);
    }
    
    return result;
  });

  const { 
    mutate: testWorkspaces, 
    isLoading: isTestingWorkspaces, 
    error: workspacesError, 
  } = useErrorHandledMutation(async () => {
    const result = await testMondayWorkspaces();
    
    if (result.success && result.data) {
      setWorkspacesResult(result.data as WorkspaceResult[]);
    }
    
    return result;
  });

  return (
    <Card>
      <Card.Header>Test Monday.com Connection</Card.Header>
      <Card.Body>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Test Board Connection</h3>
            <p className="mb-4">
              Test if we can connect to Monday.com API and fetch a board.
            </p>
            
            {boardResult && (
              <Alert variant="success" className="mb-4">
                <Alert.Title>Connection Successful</Alert.Title>
                <Alert.Description>
                  Successfully connected to board: {boardResult.name} (ID: {boardResult.id})
                </Alert.Description>
              </Alert>
            )}
            
            {connectionError && (
              <Alert variant="error" className="mb-4">
                <Alert.Title>Connection Failed</Alert.Title>
                <Alert.Description>{connectionError.toString()}</Alert.Description>
              </Alert>
            )}
            
            <Button 
              className="primary"
              onClick={() => testConnection()} 
              disabled={isTestingConnection}
            >
              {isTestingConnection ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Testing Board Connection...
                </>
              ) : "Test Board Connection"}
            </Button>
          </div>
          
          <hr />
          
          <div>
            <h3 className="text-lg font-medium mb-2">Test Workspaces Connection</h3>
            <p className="mb-4">
              Test if we can fetch workspaces from Monday.com API.
            </p>
            
            {workspacesResult && workspacesResult.length > 0 && (
              <Alert variant="success" className="mb-4">
                <Alert.Title>Workspaces Retrieved</Alert.Title>
                <Alert.Description>
                  Successfully retrieved {workspacesResult.length} workspaces.
                  <div className="mt-2 max-h-40 overflow-y-auto">
                    <ul className="list-disc pl-5">
                      {workspacesResult.slice(0, 5).map((ws: WorkspaceResult) => (
                        <li key={ws.id}>{ws.name} (ID: {ws.id})</li>
                      ))}
                      {workspacesResult.length > 5 && (
                        <li>...and {workspacesResult.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                </Alert.Description>
              </Alert>
            )}
            
            {workspacesError && (
              <Alert variant="error" className="mb-4">
                <Alert.Title>Workspaces Request Failed</Alert.Title>
                <Alert.Description>{workspacesError.toString()}</Alert.Description>
              </Alert>
            )}
            
            <Button 
              className="primary"
              onClick={() => testWorkspaces()} 
              disabled={isTestingWorkspaces}
            >
              {isTestingWorkspaces ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Testing Workspaces...
                </>
              ) : "Test Workspaces"}
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
} 