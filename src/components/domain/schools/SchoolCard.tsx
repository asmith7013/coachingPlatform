"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from '@/components/composed/cards/Card';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
import { Button } from '@/components/core/Button';
import { DataImportDialog } from '@/components/composed/dialogs/DataImportDialog';
import { SchoolWithDates } from "@hooks/domain/useSchools";
import { cn } from '@ui/utils/formatters';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

interface SchoolCardProps {
  school: SchoolWithDates;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

export function SchoolCard({ school, onDelete, isDeleting }: SchoolCardProps) {
  const router = useRouter();
  const [showDataImportDialog, setShowDataImportDialog] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking any button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    router.push(`/dashboard/schools/${school._id}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (school._id && onDelete) {
      if (window.confirm("Are you sure you want to delete this school?")) {
        onDelete(school._id);
      }
    }
  };

  const handleAddData = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDataImportDialog(true);
  };

  return (
    <>
      <div
        className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
        onClick={handleCardClick}
      >
        <Card
          padding="md"
          radius="lg"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 min-w-0">
              <Heading 
                level="h3" 
                color="default"
                className={cn("text-primary font-medium")}
              >
                {school.emoji || '🏫'} {school.schoolName}
              </Heading>
              <Text 
                textSize="base" 
                color="muted"
                className="mt-2"
              >
                District: {school.district}
              </Text>
              {school.address && (
                <Text 
                  textSize="base" 
                  color="muted"
                  className="mt-2"
                >
                  {school.address}
                </Text>
              )}
              {school.createdAt && (
                <Text textSize="sm" color="muted" className="mt-1">
                  Created: {school.createdAt.toLocaleDateString()}
                </Text>
              )}
            </div>
          </div>
          
          <div className="mb-4">
            <Heading 
              level="h4" 
              color="default"
              className={cn("text-primary font-medium")}
            >
              Grade Levels
            </Heading>
            <div className="flex flex-wrap gap-2 mt-2">
              {school.gradeLevelsSupported && school.gradeLevelsSupported.map((grade: string, index: number) => (
                <span 
                  key={index} 
                  className={cn(
                    'rounded-full px-3 py-1',
                    'text-sm',
                    'text-white',
                    'bg-primary'
                  )}
                >
                  {grade}
                </span>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <Button
              onClick={handleAddData}
              appearance="outline"
              textSize="sm"
              padding="sm"
              className="flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Add Data
            </Button>
            
            <Button
              onClick={handleDelete}
              appearance="outline"
              textSize="sm"
              padding="sm"
              className="text-danger flex items-center gap-2"
              disabled={isDeleting}
            >
              <TrashIcon className="h-4 w-4" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </Card>
      </div>

      <DataImportDialog
        open={showDataImportDialog}
        onClose={() => setShowDataImportDialog(false)}
        school={school}
      />
    </>
  );
} 