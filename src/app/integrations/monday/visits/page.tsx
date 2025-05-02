// src/app/integrations/monday/visits/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MondayVisitsSelector } from '@/components/integrations/monday/domain/visits/VisitSelector';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
import { Card } from '@/components/composed/cards/Card';
import type { VisitInput } from '@/lib/data-schema/zod-schema/visits/visit';
export default function MondayVisits() {
  const router = useRouter();
  const [boardId, setBoardId] = useState<string>('7259948291');
  
  // Handle the import initiation - redirects to the completion form
  const handleImportInitiate = (visit: Partial<VisitInput>, missingFields: string[]) => {
    // Encode the visit data and missing fields as URL parameters
    const visitData = encodeURIComponent(JSON.stringify(visit));
    const missingFieldsParam = encodeURIComponent(JSON.stringify(missingFields));
    
    // Redirect to the import completion form with the data
    router.push(
      `/integrations/monday/visits/import?boardId=${boardId}&visitData=${visitData}&missingFields=${missingFieldsParam}`
    );
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
      
      <Card variant="white" radius="md" className="border shadow">
        <Card.Body>
          <MondayVisitsSelector 
            boardId={boardId}
            onImportComplete={handleImportInitiate}
          />
        </Card.Body>
      </Card>
    </div>
  );
}