/**
 * @fileoverview DEPRECATED - This file is deprecated and will be removed.
 * Migration: Use components from @/components/features/schedulesUpdated/ instead
 * @deprecated
 */

import React, { useState } from 'react';
import { Users, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/core/Button';
import { useScheduleContext } from './context';
import { ScheduleAssignment } from '@enums';

/**
 * @deprecated Use SelectionStatusFooter from @/components/features/schedulesUpdated/ instead.
 * This component will be removed in a future version.
 * Migration: Replace with equivalent component from schedulesUpdated feature.
 */
export function SelectionStatusFooter() {
  if (process.env.NODE_ENV === 'development') {
    console.warn('DEPRECATED: SelectionStatusFooter from schedulesNew is deprecated. Use schedulesUpdated instead.');
  }
  // ✅ SIMPLIFIED: Use context directly with UI state
  const { uiState, teachers, visits, clearAllVisits, isLoading } = useScheduleContext();
  const { selectedTeacher, selectedPeriod, selectedPortion } = uiState;
  
  // Clear schedule state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [clearResult, setClearResult] = useState<{ success: boolean; message: string } | null>(null);

  // Check if there are any visits to show clear button
  const hasVisits = visits && visits.length > 0;
  const totalEvents = visits?.reduce((count, visit) => count + (visit.events?.length || 0), 0) || 0;

  const handleClearSchedule = async () => {
    setIsClearing(true);
    setClearResult(null);
    
    try {
      const result = await clearAllVisits();
      
      if (result.success) {
        setClearResult({
          success: true,
          message: `Successfully cleared ${result.deletedCount} visit${result.deletedCount !== 1 ? 's' : ''}`
        });
      } else {
        setClearResult({
          success: false,
          message: result.error || 'Failed to clear schedule'
        });
      }
    } catch {
      setClearResult({
        success: false,
        message: 'An error occurred while clearing the schedule'
      });
    } finally {
      setIsClearing(false);
      setShowConfirmDialog(false);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setClearResult(null), 3000);
    }
  };

  // Only show if there's a selection OR there are visits to clear
  const shouldShow = (selectedTeacher && selectedPeriod) || selectedPortion || hasVisits;

  if (!shouldShow) {
    return null;
  }

  return (
    <>
      <div className="mt-4 bg-blue-50 rounded-lg border border-blue-200 p-4">
        <div className="flex items-center justify-between">
          {/* Left side - Selection info */}
          <div className="flex items-center space-x-6">
            {selectedTeacher && selectedPeriod && (
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-blue-700">
                  {teachers.find(t => t._id === selectedTeacher)?.staffName} • Period {selectedPeriod}
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

          {/* Right side - Clear button */}
          {hasVisits && (
            <Button
              intent="danger"
              appearance="outline"
              padding="sm"
              onClick={() => setShowConfirmDialog(true)}
              disabled={isLoading || isClearing}
              className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
              icon={<Trash2 className="w-4 h-4" />}
            >
              {isClearing ? 'Clearing...' : 'Clear Schedule'}
            </Button>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Clear Schedule?</h3>
            <p className="text-gray-600 mb-4">
              This will permanently delete all {totalEvents} scheduled event{totalEvents !== 1 ? 's' : ''} for this day. 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                intent="secondary"
                appearance="outline"
                padding="sm"
                onClick={() => setShowConfirmDialog(false)}
                disabled={isClearing}
              >
                Cancel
              </Button>
              <Button
                intent="danger"
                appearance="solid"
                padding="sm"
                onClick={handleClearSchedule}
                disabled={isClearing}
                className="bg-red-600 hover:bg-red-700"
              >
                {isClearing ? 'Clearing...' : 'Clear Schedule'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 