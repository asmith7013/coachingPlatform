import React from 'react';
import { useScheduleSelection, useVisitData } from './context';
import type { ClassScheduleItem } from '@zod-schema/schedule/schedule';

interface TeacherPeriodCellProps {
  teacherId: string;
  period: number | string;
  schedule?: ClassScheduleItem;
}

export function TeacherPeriodCell({ teacherId, period, schedule }: TeacherPeriodCellProps) {
  const { selectedTeacher, selectedPeriod, handleTeacherPeriodSelect } = useScheduleSelection();
  const { getVisit, isDropZoneFullyScheduled } = useVisitData();

  const isSelected = selectedTeacher === teacherId && selectedPeriod === period;
  const visit = getVisit(teacherId, period);
  const dropZoneFullyScheduled = isDropZoneFullyScheduled(period);

  if (visit) {
    return (
      <div className="h-16 flex flex-col items-center justify-center bg-blue-500 text-white rounded border border-blue-600">
        <span className="font-medium text-sm">{visit.purpose}</span>
        <span className="text-xs opacity-90">Scheduled</span>
      </div>
    );
  }

  if (schedule?.dayType === 'lunch') {
    const getLunchStyle = () => {
      if (isSelected) {
        return {
          backgroundColor: '#EC4899', // pink-500
          borderColor: '#BE185D',     // pink-700
          borderWidth: '3px',
          color: 'white'
        };
      }
      if (dropZoneFullyScheduled) {
        return {
          backgroundColor: '#FDF2F8', // pink-50
          borderColor: '#FCE7F3',     // pink-100
          color: '#F9A8D4'            // pink-300
        };
      }
      return {
        backgroundColor: '#FDF2F8',   // pink-50
        borderColor: '#FBCFE8',       // pink-200
        color: '#BE185D'              // pink-700
      };
    };

    return (
      <div 
        className="h-16 flex items-center justify-center rounded cursor-pointer transition-all border hover:opacity-80"
        style={getLunchStyle()}
        onClick={() => !dropZoneFullyScheduled && handleTeacherPeriodSelect(teacherId, period)}
      >
        <div className="text-center">
          <div className="font-medium text-sm">LUNCH</div>
          <div className="text-xs">
            {isSelected ? 'Selected' : dropZoneFullyScheduled ? 'Period full' : 'Click to select'}
          </div>
        </div>
      </div>
    );
  }

  if (schedule?.dayType === 'prep') {
    const getPrepStyle = () => {
      if (isSelected) {
        return {
          backgroundColor: '#6B7280', // gray-500
          borderColor: '#374151',     // gray-700
          borderWidth: '3px',
          color: 'white'
        };
      }
      if (dropZoneFullyScheduled) {
        return {
          backgroundColor: '#F9FAFB', // gray-50
          borderColor: '#F3F4F6',     // gray-100
          color: '#9CA3AF'            // gray-400
        };
      }
      return {
        backgroundColor: '#F3F4F6',   // gray-100
        borderColor: '#E5E7EB',       // gray-200
        color: '#374151'              // gray-700
      };
    };

    return (
      <div 
        className="h-16 flex flex-col items-center justify-center rounded cursor-pointer transition-all border hover:opacity-80"
        style={getPrepStyle()}
        onClick={() => !dropZoneFullyScheduled && handleTeacherPeriodSelect(teacherId, period)}
      >
        <span className="font-medium text-sm">PREP</span>
        <span className="text-xs">
          {isSelected ? 'Selected' : dropZoneFullyScheduled ? 'Period scheduled' : 'Available'}
        </span>
      </div>
    );
  }

  // Force override with !important-style approach using style attribute
  const getBackgroundStyle = () => {
    if (isSelected) {
      return {
        backgroundColor: '#3B82F6', // blue-500
        borderColor: '#1D4ED8',     // blue-700
        borderWidth: '3px',
        color: 'white'
      };
    }
    if (dropZoneFullyScheduled) {
      return {
        backgroundColor: '#EBF8FF', // blue-50
        borderColor: '#DBEAFE',     // blue-100
        color: '#93C5FD'            // blue-300
      };
    }
    return {
      backgroundColor: '#EBF8FF',   // blue-50
      borderColor: '#BFDBFE',       // blue-200
      color: '#1D4ED8'              // blue-700
    };
  };

  return (
    <div 
      className="h-16 rounded cursor-pointer transition-all border hover:opacity-80"
      style={getBackgroundStyle()}
      onClick={() => !dropZoneFullyScheduled && handleTeacherPeriodSelect(teacherId, period)}
    >
      <div className="h-full flex flex-col items-center justify-center">
        <span className="font-medium text-sm">
          {schedule?.dayType || 'Available'}
        </span>
        <span className="text-xs">
          {isSelected ? 'Selected' : dropZoneFullyScheduled ? 'Period scheduled' : 'Click to select'}
        </span>
      </div>
    </div>
  );
} 