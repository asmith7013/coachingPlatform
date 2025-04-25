import React from 'react';
import { CalendarDay, CycleInfo, Visit } from './types';
import { statusColors, deliveryColors } from './constants';

type CalendarGridViewProps = {
  monthDays: CalendarDay[];
  visitsByDate: Record<string, Visit[]>;
  getCycleInfo: (dateObj: Date) => CycleInfo | null;
};

const CalendarGridView: React.FC<CalendarGridViewProps> = ({ 
  monthDays, 
  visitsByDate, 
  getCycleInfo 
}) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 bg-gray-50 border-b">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="py-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 bg-white">
        {monthDays.map((day, i) => {
          const dayVisits = visitsByDate[day.formattedDate] || [];
          const cycleInfo = getCycleInfo(day.date);
          
          return (
            <div
              key={i}
              className={`min-h-[120px] border p-1 ${
                !day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
              } ${day.isToday ? 'bg-blue-50' : ''}`}
            >
              <div className="flex justify-between items-start">
                <span className={`text-sm font-medium ${day.isToday ? 'h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center' : ''}`}>
                  {day.day}
                </span>
                {cycleInfo && (
                  <span className={`text-xs px-2 py-1 rounded ${cycleInfo.name.includes('Winter') ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                    {cycleInfo.name.split(' ')[0]}
                  </span>
                )}
              </div>
              
              <div className="mt-1 space-y-1 overflow-y-auto max-h-[80px]">
                {dayVisits.map((visit) => (
                  <div
                    key={visit.id}
                    className={`px-2 py-1 rounded text-xs font-medium text-white ${statusColors[visit.status] || 'bg-gray-500'}`}
                  >
                    <div className="truncate">{visit.sessionName}</div>
                    <div className="flex items-center mt-1">
                      <span className={`w-2 h-2 rounded-full ${deliveryColors[visit.delivery] || 'bg-gray-300'} mr-1`}></span>
                      <span className="text-xs">{visit.school}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGridView; 