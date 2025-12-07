import React, { useState, lazy, Suspense } from "react";
import type { DailyVelocityStats } from "@/app/actions/313/velocity/velocity";
import { ToggleSwitch } from "@/components/core/fields/ToggleSwitch";
import { VelocityChartSkeleton } from "./VelocityGraphSkeleton";

// Lazy load the heavy Chart.js component
const VelocityLineChart = lazy(() =>
  import("./VelocityLineChart").then((module) => ({
    default: module.VelocityLineChart,
  }))
);

interface SectionData {
  id: string;
  name: string;
  shortName: string;
  data: DailyVelocityStats[];
  color: string;
}

interface LoadingSection {
  id: string;
  shortName: string;
  color: string;
}

interface VelocityGraphProps {
  sections: SectionData[];
  loadingSections?: LoadingSection[];
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  daysOff: string[];
  includeNotTracked: boolean;
  onIncludeNotTrackedChange: (value: boolean) => void;
  showRampUps: boolean;
  onShowRampUpsChange: (value: boolean) => void;
}

export function VelocityGraph({
  sections,
  loadingSections = [],
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  daysOff,
  includeNotTracked,
  onIncludeNotTrackedChange,
  showRampUps,
  onShowRampUpsChange
}: VelocityGraphProps) {
  const [showRollingAverage, setShowRollingAverage] = useState(true);
  const [adjustForBlockType, setAdjustForBlockType] = useState(true);

  const hasData = sections && sections.length > 0;
  const hasLoadingSections = loadingSections && loadingSections.length > 0;

  // Show nothing if no sections selected and none loading
  if (!hasData && !hasLoadingSections) return null;

  // Helper to check if a date is a weekend
  const isWeekend = (dateStr: string): boolean => {
    // Parse date string directly to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  // Helper to check if a date is a school day
  const isSchoolDay = (dateStr: string): boolean => {
    return !isWeekend(dateStr) && !daysOff.includes(dateStr);
  };

  // Process data for each section
  const processedSections = sections.map((section) => {
    // Filter data by date range and only include school days with students present
    const filteredData = section.data
      .filter((d) => d.studentsPresent > 0)
      .filter((d) => d.date >= startDate && d.date <= endDate)
      .filter((d) => isSchoolDay(d.date))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate rolling 3-day average (only school days)
    const dataWithRollingAverage = filteredData.map((dataPoint, index) => {
      // Get the previous 2 school days plus the current day (3 days total)
      const precedingDays = filteredData.slice(Math.max(0, index - 2), index + 1);

      // Calculate adjusted velocity based on block type toggle and ramp up filter
      const getAdjustedVelocity = (d: DailyVelocityStats): number => {
        // Calculate total completions (optionally excluding ramp ups)
        const totalCompletions = showRampUps
          ? d.totalCompletions
          : d.totalCompletions - d.byLessonType.rampUps;

        if (!adjustForBlockType || d.blockType !== 'double') {
          // No adjustment: use raw completions / students
          return d.studentsPresent > 0 ? totalCompletions / d.studentsPresent : 0;
        }
        // With adjustment: divide by 2 for double blocks
        const rawVelocity = d.studentsPresent > 0 ? totalCompletions / d.studentsPresent : 0;
        return rawVelocity / 2;
      };

      // Calculate average velocity over these days
      const rollingAverage = precedingDays.reduce((sum, d) => sum + getAdjustedVelocity(d), 0) / precedingDays.length;

      return {
        ...dataPoint,
        rollingAverage,
        adjustedVelocity: getAdjustedVelocity(dataPoint),
      };
    });

    return {
      ...section,
      processedData: dataWithRollingAverage,
    };
  });

  // Get all unique dates across all sections and sort them
  const allDates = new Set<string>();
  processedSections.forEach((section) => {
    section.processedData.forEach((d) => allDates.add(d.date));
  });
  const sortedDates = Array.from(allDates).sort();

  // Prepare chart data with multiple datasets (one per section)
  const chartData = {
    labels: sortedDates.map((dateStr) => {
      // Parse date string directly to avoid timezone issues
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }),
    datasets: processedSections.map((section) => {
      // Create a map for quick lookup
      const dataMap = new Map(
        section.processedData.map((d) => [d.date, d])
      );

      return {
        label: section.shortName,
        data: sortedDates.map((dateStr) => {
          const dataPoint = dataMap.get(dateStr);
          if (!dataPoint) return null;
          return showRollingAverage ? dataPoint.rollingAverage : dataPoint.adjustedVelocity;
        }),
        borderColor: section.color,
        backgroundColor: section.color,
        fill: false, // No area fill for multi-line graphs
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: section.color,
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        spanGaps: false, // Don't connect points with null values
      };
    }),
  };

  // Calculate the maximum velocity value across all data points
  const maxVelocity = Math.max(
    ...processedSections.flatMap((section) =>
      section.processedData.map((d) =>
        showRollingAverage ? d.rollingAverage : d.adjustedVelocity
      )
    )
  );

  // Set Y-axis max to 1.5 by default, or extend proportionally if data exceeds it
  const yAxisMax = Math.max(1.5, Math.ceil(maxVelocity * 1.1)); // Add 10% padding

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleColor: "#fff",
        bodyColor: "#fff",
        callbacks: {
          label: function (context: { dataset: { label?: string }; raw: unknown; datasetIndex: number; dataIndex: number }) {
            const sectionData = processedSections[context.datasetIndex];
            const dateStr = sortedDates[context.dataIndex];
            const dataPoint = sectionData.processedData.find((d) => d.date === dateStr);

            if (!dataPoint) return '';

            const value = Number(context.raw) || 0;
            const sectionLabel = context.dataset.label || sectionData.name;

            if (showRollingAverage) {
              return [
                `${sectionLabel}:`,
                `3-Day Avg Velocity: ${value.toFixed(2)}`,
                `Today's Velocity: ${dataPoint.adjustedVelocity.toFixed(2)}`,
                `Total Completions: ${dataPoint.totalCompletions}`,
                `Students Present: ${dataPoint.studentsPresent}`,
                adjustForBlockType && dataPoint.blockType === 'double' ? '(Adjusted for double block)' : '',
              ].filter(Boolean);
            } else {
              return [
                `${sectionLabel}:`,
                `Daily Velocity: ${value.toFixed(2)}`,
                `Total Completions: ${dataPoint.totalCompletions}`,
                `Students Present: ${dataPoint.studentsPresent}`,
                adjustForBlockType && dataPoint.blockType === 'double' ? '(Adjusted for double block)' : '',
              ].filter(Boolean);
            }
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: yAxisMax,
        ticks: {
          callback: function (value: number | string) {
            return Number(value).toFixed(1);
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        title: {
          display: true,
          text: "Velocity",
          font: {
            size: 12,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 10,
          },
        },
      },
    },
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-gray-700">
              Velocity Trend - All Selected Sections
            </h3>
            {hasLoadingSections && (
              <div className="flex items-center gap-2">
                {loadingSections.map((section) => (
                  <span
                    key={section.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium animate-pulse"
                    style={{ backgroundColor: `${section.color}20`, color: section.color }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: section.color }}></span>
                    {section.shortName}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">Start:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="text-xs border rounded px-2 py-1 cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">End:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="text-xs border rounded px-2 py-1 cursor-pointer"
              />
            </div>
          </div>
        </div>
        {!hasData ? (
          <VelocityChartSkeleton />
        ) : (
          <Suspense fallback={<VelocityChartSkeleton />}>
            <VelocityLineChart chartData={chartData} chartOptions={chartOptions} />
          </Suspense>
        )}
      </div>

      {/* Toggles below the graph */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex items-center gap-6">
          <ToggleSwitch
            checked={showRollingAverage}
            onChange={setShowRollingAverage}
            label="Rolling Average"
          />
          <ToggleSwitch
            checked={adjustForBlockType}
            onChange={setAdjustForBlockType}
            label="Adjust for Block Type"
          />
          <ToggleSwitch
            checked={showRampUps}
            onChange={onShowRampUpsChange}
            label="Show Ramp Ups"
            accentColor="orange"
          />
          <ToggleSwitch
            checked={includeNotTracked}
            onChange={onIncludeNotTrackedChange}
            label="Include Untracked Attendance"
          />
        </div>
      </div>
    </>
  );
}
