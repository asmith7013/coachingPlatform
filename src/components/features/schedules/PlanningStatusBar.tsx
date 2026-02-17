import React from "react";
import { Eye, MessageCircle } from "lucide-react";
import { cn } from "@ui/utils/formatters";
import type { PlanningStatusBarProps } from "./types";
import {
  getTeacherPlanningStatus,
  getTeacherName,
  getPlanningIconStyle,
} from "./utils";

/**
 * PlanningStatusBar Component
 *
 * Displays planning status for all teachers with observation and meeting indicators.
 * Uses VisitScheduleBlock exclusively - no dual-mode support.
 */
export function PlanningStatusBar({
  teachers,
  visits,
  className,
}: PlanningStatusBarProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-gray-200 p-4",
        className,
      )}
    >
      <h3 className="text-lg font-semibold mb-3">Planning Status</h3>

      <div className="space-y-2">
        {teachers.map((teacher) => {
          const planning = getTeacherPlanningStatus(visits, teacher._id);

          return (
            <div
              key={teacher._id}
              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
            >
              <span className="font-medium text-gray-700 flex-1 truncate">
                {getTeacherName(teachers, teacher._id)}
              </span>

              <div className="flex items-center space-x-1 flex-shrink-0">
                {/* Observation Icon */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                    getPlanningIconStyle(planning.observation, "observation"),
                  )}
                >
                  <Eye className="w-4 h-4" />
                </div>

                {/* Meeting Icon */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                    getPlanningIconStyle(planning.meeting, "meeting"),
                  )}
                >
                  <MessageCircle className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600">Observation</span>
          </div>
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-4 h-4 text-purple-500" />
            <span className="text-gray-600">Meeting</span>
          </div>
        </div>
      </div>
    </div>
  );
}
