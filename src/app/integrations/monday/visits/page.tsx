'use client';

import { useState } from 'react';
import { MondayVisitsSelector } from '@/components/integrations/monday/domain/visits/VisitSelector';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
import { Button } from '@/components/core/Button';
import { Card } from '@/components/composed/cards/Card';

export default function MondayVisits() {
  const [boardId, setBoardId] = useState<string>('7259948291');
  const [importCompleted, setImportCompleted] = useState(false);
  
  const handleImportComplete = () => {
    setImportCompleted(true);
    // In a real application, we might navigate to a list of visits or show a different view
    setTimeout(() => setImportCompleted(false), 5000);
  };
  
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <Heading level="h1">Monday.com Import Demo</Heading>
        <Text className="text-gray-600 mt-2">
          This page demonstrates the enhanced Monday.com import UI with controlled loading,
          filtering, selection controls, and improved error handling.
        </Text>
      </div>
      
      <Card className="mb-8 bg-gray-50">
        <Card.Body>
          <Text className="font-medium mb-2">Board ID</Text>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={boardId} 
              onChange={(e) => setBoardId(e.target.value)}
              className="border rounded py-2 px-3 flex-grow"
            />
          </div>
          <Text className="text-xs text-gray-500 mt-1">
            Enter a Monday.com board ID and click &quot;Connect to Monday.com&quot; to load data
          </Text>
        </Card.Body>
      </Card>
      
      {importCompleted ? (
        <Card variant="white" className="border border-green-200 bg-green-50 text-center">
          <Card.Body>
            <Heading level="h3" className="text-green-800">Import Completed!</Heading>
            <Text className="text-green-700 mt-2">
              The imports have been processed successfully. In a real application, you would be 
              redirected to a list of visits or shown a detailed status report.
            </Text>
            <Button 
              intent="secondary"
              className="mt-4"
              onClick={() => setImportCompleted(false)}
            >
              Import More Items
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Card variant="white" radius="md" className="border shadow">
          <Card.Body>
            <MondayVisitsSelector 
              boardId={boardId}
              onImportComplete={handleImportComplete}
            />
          </Card.Body>
        </Card>
      )}
    </div>
  );
} 