import React from 'react';
import { Users, Clock, Trash2, Check, Download } from 'lucide-react';
import { cn } from '@ui/utils/formatters';
import { Button } from '@/components/core/Button';
import { ScheduleAssignment } from '@enums';
import type { ScheduleFooterProps } from './types';
import { getTotalBlocksCount, getTeacherName } from './utils';

/**
 * ScheduleFooter Component
 * 
 * Unified footer combining selection status, clear functionality, and schedule actions.
 * Replaces both SelectionStatusFooter and the hardcoded footer in ScheduleGrid.
 * 
 * @example
 * ```tsx
 * // Basic usage with all functionality
 * <ScheduleFooter
 *   selectedTeacher="teacher123"
 *   selectedPeriod={3}
 *   teachers={teachers}
 *   visits={visits}
 *   onRequestClear={handleClear}
 *   scheduleStatus="ready"
 *   onExport={handleExport}
 * />
 * 
 * // Loading state
 * <ScheduleFooter
 *   teachers={teachers}
 *   visits={visits}
 *   scheduleStatus="loading"
 *   scheduleStatusText="Generating Schedule..."
 *   showExport={false}
 * />
 * ```
 */
export function ScheduleFooter({
  // Selection state
  selectedTeacher,
  selectedPeriod,
  selectedPortion,
  teachers,
  visits,
  
  // Clear functionality
  onRequestClear,
  clearResult,
  isClearing = false,
  
  // Schedule status and actions
  scheduleStatus = 'ready',
  scheduleStatusText = 'Ready',
  onExport,
  isExporting = false,
  showExport = true,
  
  className
}: ScheduleFooterProps) {
  
  // Check if there are any visits to show clear button
  const hasVisits = visits && visits.length > 0;
  const totalBlocks = getTotalBlocksCount(visits || []);
  
  // Show if there's a selection OR visits to clear OR always show for actions
  const hasSelection = (selectedTeacher && selectedPeriod) || selectedPortion;
  const shouldShow = hasSelection || hasVisits || showExport;

  if (!shouldShow) {
    return null;
  }

  const getStatusIcon = () => {
    switch (scheduleStatus) {
      case 'ready':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'loading':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'error':
        return <div className="w-4 h-4 bg-red-500 rounded-full" />;
      default:
        return <Check className="w-4 h-4 text-green-500" />;
    }
  };

  const getStatusColor = () => {
    switch (scheduleStatus) {
      case 'ready':
        return 'text-green-600';
      case 'loading':
        return 'text-blue-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-green-600';
    }
  };

  return (
    <div className={cn("border-t border-gray-200 bg-gray-50/50", className)}>
      {/* Selection Status Section (if there's a selection) */}
      {hasSelection && (
        <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
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

            {/* Clear result message */}
            {clearResult && (
              <div className={`text-sm ${clearResult.success ? 'text-green-600' : 'text-red-600'}`}>
                {clearResult.message}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions Section */}
      <div className="p-4 flex items-center justify-between">
        {/* Left side - Schedule status */}
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={cn("text-sm", getStatusColor())}>
            {scheduleStatusText}
          </span>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center space-x-3">
          {/* Clear button */}
          {hasVisits && onRequestClear && (
            <Button
              intent="danger"
              appearance="outline"
              padding="sm"
              onClick={onRequestClear}
              disabled={isClearing}
              loading={isClearing}
              className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
              icon={<Trash2 className="w-4 h-4" />}
            >
              Clear Schedule ({totalBlocks} block{totalBlocks !== 1 ? 's' : ''})
            </Button>
          )}

          {/* Export button */}
          {showExport && (
            <Button
              intent="primary"
              appearance="solid"
              padding="sm"
              onClick={onExport}
              disabled={isExporting || scheduleStatus === 'loading'}
              loading={isExporting}
              icon={<Download className="w-4 h-4" />}
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 