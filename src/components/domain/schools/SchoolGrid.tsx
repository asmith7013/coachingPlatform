"use client";

import React, { useState } from "react";
import Link from 'next/link';
import { Card } from '@/components/composed/cards/Card';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';
import { Button } from '@/components/core/Button';
import { DataImportDialog } from '@/components/composed/dialogs/DataImportDialog';
// import { SchedulePreview } from '@/components/features/schedulesNew/SchedulePreview';
import { School } from "@zod-schema/core/school";
import { cn } from '@ui/utils/formatters';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { schoolToSlug } from '@/lib/data-processing/transformers/utils/school-slug-utils';
import { useTeacherSchedules } from '@/hooks/domain/schedulesOld/useTeacherSchedules';

interface SchoolGridCardProps {
  school: School;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

export function SchoolGridCard({ school, onDelete, isDeleting }: SchoolGridCardProps) {
  const [showDataImportDialog, setShowDataImportDialog] = useState(false);

  // Fetch teacher schedules for this school
  const { 
    items: _teacherSchedules, 
    isLoading: _isLoadingSchedules,
    error: _schedulesError 
  } = useTeacherSchedules.list({
    school: school._id
  });

  // Generate slug for this school
  const schoolSlug = schoolToSlug(school);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (school._id && onDelete) {
      if (window.confirm("Are you sure you want to delete this school?")) {
        onDelete(school._id);
      }
    }
  };

  const handleAddData = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDataImportDialog(true);
  };

  return (
    <>
      <Card
        padding="md"
        radius="lg"
        className="relative"
      >
        {/* Clickable area for navigation */}
        <Link href={`/dashboard/schools/${schoolSlug}`} className="block">
          <div className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
            {/* School Header Information */}
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
                    Created: {school.createdAt}
                  </Text>
                )}
              </div>
            </div>
            
            {/* Schedule Section */}
            <div className="mb-4">
              {/* <SchedulePreview
                teacherSchedules={teacherSchedules}
                isLoading={isLoadingSchedules}
                error={!!schedulesError}
                showTitle={true}
                maxDaysPreview={3}
              /> */}
            </div>

            {/* Add padding bottom to account for absolute positioned buttons */}
            <div className="pb-12"></div>
          </div>
        </Link>

        {/* Action buttons positioned absolutely outside the Link */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center pt-4 border-t border-gray-200 bg-white">
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

      {/* Keep dialog outside Card */}
      <DataImportDialog
        open={showDataImportDialog}
        onClose={() => setShowDataImportDialog(false)}
        school={school}
      />
    </>
  );
} 