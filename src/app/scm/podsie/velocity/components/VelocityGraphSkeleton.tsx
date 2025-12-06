import React from "react";
import { Spinner } from "@/components/core/feedback/Spinner";

/**
 * Minimal skeleton loading state for just the chart area
 * The card wrapper with controls will be shown immediately
 */
export function VelocityChartSkeleton() {
  return (
    <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" variant="primary" />
        <p className="text-sm text-gray-500">Loading chart...</p>
      </div>
    </div>
  );
}
