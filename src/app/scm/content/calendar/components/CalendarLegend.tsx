"use client";

import React from "react";
import { SECTION_COLORS } from "./SimplifiedUnitView";

interface CalendarLegendProps {
  legendEntries: { key: string; label: string; colorIndex: number }[];
}

export function CalendarLegend({ legendEntries }: CalendarLegendProps) {
  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-2 z-20">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="text-gray-500 font-semibold mr-1">Legend</span>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-100 rounded border border-gray-300" />
          <span>Weekend / No School / No Math</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-500 rounded" />
          <span>Event (Math Happens)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-100 rounded border border-gray-300" />
          <span className="text-gray-400">Other Units</span>
        </div>
        {legendEntries.map((entry) => {
          const color =
            SECTION_COLORS[entry.colorIndex % SECTION_COLORS.length];
          return (
            <div key={entry.key} className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded"
                style={{
                  backgroundColor: color.light,
                  border: `1px solid ${color.base}`,
                }}
              />
              <span style={{ color: color.base }}>{entry.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
