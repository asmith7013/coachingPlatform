import React from 'react';
import { Users, Clock, Trash2 } from 'lucide-react';
import { cn } from '@ui/utils/formatters';
import { Button } from '@/components/core/Button';
import { ScheduleAssignment } from '@enums';
import type { SelectionStatusFooterProps } from './types';
// import type { Visit } from '@zod-schema/visits/visit';
import { getTotalBlocksCount, getTeacherName } from './utils';

/**
 * SelectionStatusFooter Component
 * 
 * Pure UI component for displaying selection status footer.
 * Uses VisitScheduleBlock exclusively - no dual-mode support.
 */
export function SelectionStatusFooter({
  selectedTeacher,
  selectedPeriod,
  selectedPortion,
  teachers,
  visits,
  onRequestClear,
  clearResult,
  isLoading = false,
  className
}: SelectionStatusFooterProps) {
  
  // Check if there are any visits to show clear button
  const hasVisits = visits && visits.length > 0;
  const totalBlocks = getTotalBlocksCount(visits || []);

  // Only show if there's a selection OR there are visits to clear
  const shouldShow = (selectedTeacher && selectedPeriod) || selectedPortion || hasVisits;

  if (!shouldShow) {
    return null;
  }

  return (
    <div className={cn("mt-4 bg-blue-50 rounded-lg border border-blue-200 p-4", className)}>
      <div className="flex items-center justify-between">
        {/* Left side - Selection info */}
        <div className="flex items-center space-x-6">
          {selectedTeacher && selectedPeriod && (
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-blue-700">
                {getTeacherName(teachers, selectedTeacher)} • Period {selectedPeriod}
              </span>
            </div>
          )}
          
          {selectedPortion && (
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-green-700">
                {selectedPortion === ScheduleAssignment.FIRST_HALF ? 'First Half' :
                 selectedPortion === ScheduleAssignment.SECOND_HALF ? 'Second Half' : 'Full Period'} selected
              </span>
            </div>
          )}

          {/* Clear result message from parent */}
          {clearResult && (
            <div className={`text-sm ${clearResult.success ? 'text-green-600' : 'text-red-600'}`}>
              {clearResult.message}
            </div>
          )}
        </div>

        {/* Right side - Clear button */}
        {hasVisits && onRequestClear && (
          <Button
            intent="danger"
            appearance="outline"
            padding="sm"
            onClick={onRequestClear}
            disabled={isLoading}
            className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
            icon={<Trash2 className="w-4 h-4" />}
          >
            Clear Schedule ({totalBlocks} block{totalBlocks !== 1 ? 's' : ''})
          </Button>
        )}
      </div>
    </div>
  );
} 