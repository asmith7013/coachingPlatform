import React from "react";

interface LegendGroupProps {
  children: React.ReactNode;
}

/**
 * A group of related legend items displayed in a white bordered card
 */
export function LegendGroup({ children }: LegendGroupProps) {
  return (
    <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg px-3 py-2">
      {children}
    </div>
  );
}

interface LegendItemProps {
  icon: React.ReactNode;
  label: React.ReactNode;
}

/**
 * A single legend item with an icon and label
 */
export function LegendItem({ icon, label }: LegendItemProps) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span>{label}</span>
    </div>
  );
}

interface LegendProps {
  children: React.ReactNode;
  title?: string;
}

/**
 * Container for legend groups with optional title
 * Displays groups on a dark grey background with white text
 */
export function Legend({ children, title = "Legend" }: LegendProps) {
  return (
    <div className="mt-4 pt-3 border-t border-gray-100">
      <div className="bg-gray-100 rounded-lg p-3">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
          {title}
        </h4>
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
          {children}
        </div>
      </div>
    </div>
  );
}
