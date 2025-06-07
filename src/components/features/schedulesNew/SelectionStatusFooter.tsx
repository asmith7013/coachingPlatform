import React from 'react';
import { Users, Clock } from 'lucide-react';
import { useSelectionStatus } from './context';

export function SelectionStatusFooter() {
  const {
    selectedTeacher,
    selectedPeriod,
    selectedPortion,
    teachers
  } = useSelectionStatus();

  if (!(selectedTeacher && selectedPeriod) && !selectedPortion) {
    return null;
  }

  return (
    <div className="mt-4 bg-blue-50 rounded-lg border border-blue-200 p-4">
      <div className="flex items-center space-x-6">
        {selectedTeacher && selectedPeriod && (
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-blue-700">
              {teachers.find(t => t.id === selectedTeacher)?.staffName} • Period {selectedPeriod}
            </span>
          </div>
        )}
        
        {selectedPortion && (
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-green-700">
              {selectedPortion === 'first_half' ? 'First Half' : 
               selectedPortion === 'second_half' ? 'Second Half' : 'Full Period'} selected
            </span>
          </div>
        )}
      </div>
    </div>
  );
} 