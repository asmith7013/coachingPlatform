import React from "react";
import { UserIcon } from "@heroicons/react/24/outline";
import { Legend, LegendGroup, LegendItem } from "@/components/core/feedback/Legend";

// Shared icon components for reuse
const LessonBadge = () => (
  <span className="px-2 py-1 bg-blue-500 text-white rounded font-bold text-xs leading-none">3</span>
);

const RampUpBadge = () => (
  <span className="px-2 py-1 bg-orange-500 text-white rounded font-bold text-xs leading-none">2</span>
);

const SingleBlockIcon = () => (
  <div className="flex items-center justify-center gap-0.5">
    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
  </div>
);

const DoubleBlockIcon = () => (
  <div className="flex items-center justify-center gap-0.5">
    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
  </div>
);

/**
 * Legend for the Student Velocity Graph accordion
 * Shows: Lessons badge, Ramp Ups badge
 */
export function StudentGraphLegend() {
  return (
    <Legend>
      <LegendGroup>
        <LegendItem icon={<LessonBadge />} label="Lessons" />
        <LegendItem icon={<RampUpBadge />} label="Ramp Ups" />
      </LegendGroup>
    </Legend>
  );
}

/**
 * Legend for the Calendar View accordion
 * Shows: Velocity score, Students present, Lessons, Ramp Ups, Single/Double Block, Weekend/Day Off
 */
export function CalendarLegend() {
  return (
    <Legend>
      {/* Velocity metrics group */}
      <LegendGroup>
        <LegendItem
          icon={<span className="text-sm font-bold text-blue-600">2.5</span>}
          label="Velocity score"
        />
        <LegendItem
          icon={
            <span className="flex items-center gap-0.5">
              <span className="text-sm">12</span>
              <UserIcon className="h-3 w-3 text-gray-500" />
            </span>
          }
          label="Students present"
        />
      </LegendGroup>

      {/* Activity badges group */}
      <LegendGroup>
        <LegendItem icon={<LessonBadge />} label="Lessons" />
        <LegendItem icon={<RampUpBadge />} label="Ramp Ups" />
      </LegendGroup>

      {/* Block type and day off group */}
      <LegendGroup>
        <LegendItem icon={<SingleBlockIcon />} label="Single Block" />
        <LegendItem icon={<DoubleBlockIcon />} label="Double Block" />
        <LegendItem
          icon={<div className="w-4 h-4 bg-gray-100 border rounded" />}
          label="Weekend/Day Off"
        />
      </LegendGroup>
    </Legend>
  );
}

/**
 * Legend for the Student Detail Table accordion
 * Shows: Lessons, Ramp Ups, Attendance colors (Present, Late, Absent, Not Tracked), Block types
 */
export function TableLegend() {
  return (
    <Legend>
      {/* Activity badges group */}
      <LegendGroup>
        <LegendItem icon={<LessonBadge />} label="Lessons" />
        <LegendItem icon={<RampUpBadge />} label="Ramp Ups" />
      </LegendGroup>

      {/* Attendance group */}
      <LegendGroup>
        <LegendItem
          icon={<div className="w-4 h-4 bg-green-100 border border-green-300 rounded" />}
          label="Present"
        />
        <LegendItem
          icon={<div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded" />}
          label="Late"
        />
        <LegendItem
          icon={<div className="w-4 h-4 bg-red-100 border border-red-300 rounded" />}
          label="Absent"
        />
        <LegendItem
          icon={<div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded" />}
          label="Not Tracked"
        />
      </LegendGroup>

      {/* Block type group */}
      <LegendGroup>
        <LegendItem icon={<SingleBlockIcon />} label="Single Block" />
        <LegendItem icon={<DoubleBlockIcon />} label="Double Block" />
      </LegendGroup>
    </Legend>
  );
}

/**
 * @deprecated Use StudentGraphLegend, CalendarLegend, or TableLegend instead
 */
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
