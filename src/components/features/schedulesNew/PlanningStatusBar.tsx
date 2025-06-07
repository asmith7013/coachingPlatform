import React from 'react';
import { Eye, MessageCircle } from 'lucide-react';
import { useTeacherPlanning } from './context';

export function PlanningStatusBar() {
  const { teachers, getTeacherPlanning } = useTeacherPlanning();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {/* Teacher Planning Status Cards */}
          <div className="grid grid-cols-3 gap-4">
            {teachers.map(teacher => {
              const planning = getTeacherPlanning(teacher._id);
              return (
                <div key={teacher._id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2 border">
                  <span className="font-medium text-gray-900">{teacher.staffName.split(' ')[0]}</span>
                  
                  <div className="flex items-center space-x-1">
                    {/* Observation Icon */}
                    <div className={`w-6 h-6 rounded-full border-2 border-blue-500 flex items-center justify-center transition-colors
                      ${planning.observation ? 'bg-blue-500' : 'bg-white'}`}>
                      <Eye className={`w-3 h-3 ${planning.observation ? 'text-white' : 'text-blue-500'}`} />
                    </div>
                    
                    {/* Meeting Icon */}
                    <div className={`w-6 h-6 rounded-full border-2 border-purple-500 flex items-center justify-center transition-colors
                      ${planning.meeting ? 'bg-purple-500' : 'bg-white'}`}>
                      <MessageCircle className={`w-3 h-3 ${planning.meeting ? 'text-white' : 'text-purple-500'}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 