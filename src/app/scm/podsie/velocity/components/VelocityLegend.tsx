import React from "react";
import { UserIcon } from "@heroicons/react/24/outline";

export function VelocityLegend() {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-8">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Legend</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-3 text-sm">
        {/* Velocity & Students (Calendar only) */}
        <div className="flex items-center gap-2">
          <div className="text-sm font-bold text-blue-600">2.5</div>
          <span>Velocity score</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            <span className="text-sm">12</span>
            <UserIcon className="h-3 w-3 text-gray-500" />
          </div>
          <span>Students present</span>
        </div>

        {/* Activity completion badges (shared) */}
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-blue-500 text-white rounded font-bold text-xs leading-none">3</span>
          <span>Lessons</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-orange-500 text-white rounded font-bold text-xs leading-none">2</span>
          <span>Ramp Ups</span>
        </div>

        {/* Block type (shared) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center gap-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
          </div>
          <span>Single Block</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center gap-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
          </div>
          <span>Double Block</span>
        </div>

        {/* Attendance (Table only) */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded" />
          <span>Present</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded" />
          <span>Late</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded" />
          <span>Absent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded" />
          <span>Not Tracked</span>
        </div>

        {/* Weekend/Day Off (Calendar only) */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 border rounded" />
          <span>Weekend/Day Off</span>
        </div>
      </div>
    </div>
  );
}
