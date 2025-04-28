import React from 'react';
import { cn } from '@/lib/utils';
import { TeacherBadgeProps } from '../data/scheduleTypes';

/**
 * Component for displaying teacher activity badges
 */
export const TeacherBadge: React.FC<TeacherBadgeProps> = ({
  teacherName,
  activity,
  subject,
  room
}) => {
  // Determine badge styling based on activity
  const getBadgeStyle = () => {
    switch (activity) {
      case "teaching":
        return {
          container: "bg-green-100 border-green-500 text-green-800",
          title: "text-green-800 font-medium",
          detail: "text-green-700"
        };
      case "prep":
        return {
          container: "bg-purple-100 border-purple-500 text-purple-800",
          title: "text-purple-800 font-medium",
          detail: "text-purple-700"
        };
      case "lunch":
        return {
          container: "bg-orange-100 border-orange-500 text-orange-800",
          title: "text-orange-800 font-medium",
          detail: "text-orange-700"
        };
      default:
        return {
          container: "bg-gray-100 border-gray-500 text-gray-800",
          title: "text-gray-800 font-medium",
          detail: "text-gray-700"
        };
    }
  };

  const styles = getBadgeStyle();

  return (
    <div className={cn(
      "px-2 py-1 mb-2 rounded-md border shadow-sm flex flex-col",
      styles.container
    )}>
      <div className={cn("font-medium", styles.title)}>
        {teacherName}
      </div>
      
      {/* Display subject and room when available */}
      {(subject || room) && (
        <div className="text-xs mt-1 space-y-1">
          {subject && (
            <div className={styles.detail}>
              {subject}
            </div>
          )}
          
          {room && (
            <div className={cn("font-light italic", styles.detail)}>
              Room: {room}
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 