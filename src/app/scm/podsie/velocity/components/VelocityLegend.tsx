import React from "react";
import { UserIcon } from "@heroicons/react/24/outline";

export function VelocityLegend() {
  return (
    <div className="bg-white rounded-lg shadow p-4 mt-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Legend</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 bg-blue-500 text-white rounded font-bold">Lesson</span>
          <span>Lesson completions</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 bg-orange-500 text-white rounded font-bold">
            Ramp Up
          </span>
          <span>Ramp Up completions</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 border rounded" />
          <span>Weekend/Day Off</span>
        </div>
      </div>
    </div>
  );
}
