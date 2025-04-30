'use client';

import { useState } from 'react';
import { BoardFinder } from '@/components/domain/monday';
import { MondayImportSelector } from '@/components/domain/monday/MondayImportSelector';
import { PageHeader } from '@/components/shared/PageHeader';

export default function MondayPage() {
  const [selectedBoard, setSelectedBoard] = useState<{
    id: string;
    name: string;
  } | null>(null);
  
  const handleBoardSelect = (board: { id: string; name: string }) => {
    setSelectedBoard(board);
  };
  
  const handleImportComplete = () => {
    // Optionally reset the selected board or keep it and refresh the imports
    // For now we'll just keep the selected board
  };
  
  return (
    <div className="container mx-auto py-8 space-y-6">
      <PageHeader
        title="Monday.com Integration"
        subtitle="Look up and import items from Monday.com boards"
      />
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Select a Monday Board</h2>
        <BoardFinder onBoardSelect={handleBoardSelect} />
      </div>
      
      {selectedBoard && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Import from: {selectedBoard.name}
          </h2>
          
          <MondayImportSelector 
            boardId={selectedBoard.id} 
            onImportComplete={handleImportComplete}
          />
        </div>
      )}
    </div>
  );
} 
