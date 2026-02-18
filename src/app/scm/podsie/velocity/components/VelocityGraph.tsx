import React, { useState, lazy, Suspense } from "react";
import type { DailyVelocityStats } from "@/app/actions/scm/podsie/velocity/velocity";
import type { UnitSchedule } from "@zod-schema/calendar";
import { ToggleSwitch } from "@/components/core/fields/ToggleSwitch";
import { VelocityChartSkeleton } from "./VelocityGraphSkeleton";
import { ChartBarIcon } from "@heroicons/react/24/outline";

// Colors for unit bar annotations (background colors with alpha)
const UNIT_COLORS = [
  {
    bg: "rgba(59, 130, 246, 0.04)",
    border: "rgba(59, 130, 246, 0.25)",
    text: "#1e40af",
  }, // blue
  {
    bg: "rgba(34, 197, 94, 0.04)",
    border: "rgba(34, 197, 94, 0.25)",
    text: "#166534",
  }, // green
  {
    bg: "rgba(168, 85, 247, 0.04)",
    border: "rgba(168, 85, 247, 0.25)",
    text: "#6b21a8",
  }, // purple
  {
    bg: "rgba(245, 158, 11, 0.04)",
    border: "rgba(245, 158, 11, 0.25)",
    text: "#92400e",
  }, // amber
  {
    bg: "rgba(244, 63, 94, 0.04)",
    border: "rgba(244, 63, 94, 0.25)",
    text: "#9f1239",
  }, // rose
  {
    bg: "rgba(6, 182, 212, 0.04)",
    border: "rgba(6, 182, 212, 0.25)",
    text: "#0e7490",
  }, // cyan
  {
    bg: "rgba(249, 115, 22, 0.04)",
    border: "rgba(249, 115, 22, 0.25)",
    text: "#9a3412",
  }, // orange
  {
    bg: "rgba(20, 184, 166, 0.04)",
    border: "rgba(20, 184, 166, 0.25)",
    text: "#115e59",
  }, // teal
];

// Lazy load the heavy Chart.js component
const VelocityLineChart = lazy(() =>
  import("./VelocityLineChart").then((module) => ({
    default: module.VelocityLineChart,
  })),
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
  showSidekicks: boolean;
  onShowSidekicksChange: (value: boolean) => void;
  unitSchedules?: UnitSchedule[]; // Unit schedules for the unit bar (when all sections share same scope/grade)
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
  onShowRampUpsChange,
  showSidekicks,
  onShowSidekicksChange,
  unitSchedules,
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
    const [year, month, day] = dateStr.split("-").map(Number);
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

    // Use the max student count as the overall class size (avoids fluctuations from attendance)
    const overallStudentCount = Math.max(
      ...section.data.map((d) => d.studentsPresent),
      1,
    );

    // Calculate rolling 3-day average (only school days)
    const dataWithRollingAverage = filteredData.map((dataPoint, index) => {
      // Get the previous 2 school days plus the current day (3 days total)
      const precedingDays = filteredData.slice(
        Math.max(0, index - 2),
        index + 1,
      );

      // Calculate adjusted velocity based on block type toggle, ramp up filter, and sidekick filter
      const getAdjustedVelocity = (d: DailyVelocityStats): number => {
        // Start with total completions
        let totalCompletions = d.totalCompletions;

        // Optionally exclude ramp ups (by lesson type)
        if (!showRampUps) {
          totalCompletions -= d.byLessonType.rampUps;
        }

        // Optionally exclude sidekicks (by activity type)
        if (!showSidekicks) {
          totalCompletions -= d.byActivityType.sidekicks;
        }

        // Always divide by overall student count (not per-day attendance)
        const rawVelocity = totalCompletions / overallStudentCount;

        if (!adjustForBlockType || d.blockType !== "double") {
          return rawVelocity;
        }
        // With adjustment: divide by 2 for double blocks
        return rawVelocity / 2;
      };

      // Calculate average velocity over these days
      const rollingAverage =
        precedingDays.reduce((sum, d) => sum + getAdjustedVelocity(d), 0) /
        precedingDays.length;

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
      const [year, month, day] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }),
    datasets: processedSections.map((section) => {
      // Create a map for quick lookup
      const dataMap = new Map(section.processedData.map((d) => [d.date, d]));

      return {
        label: section.shortName,
        data: sortedDates.map((dateStr) => {
          const dataPoint = dataMap.get(dateStr);
          if (!dataPoint) return null;
          return showRollingAverage
            ? dataPoint.rollingAverage
            : dataPoint.adjustedVelocity;
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
        showRollingAverage ? d.rollingAverage : d.adjustedVelocity,
      ),
    ),
  );

  // Set Y-axis max to 1.5 by default, or extend proportionally if data exceeds it
  const yAxisMax = Math.max(1.5, Math.ceil(maxVelocity * 1.1)); // Add 10% padding

  // Generate unit bar annotations
  const unitAnnotations = (() => {
    if (
      !unitSchedules ||
      unitSchedules.length === 0 ||
      sortedDates.length === 0
    ) {
      return [];
    }

    // Create a map from date string to label index for quick lookups
    const dateIndexMap = new Map<string, number>();
    sortedDates.forEach((date, idx) => {
      dateIndexMap.set(date, idx);
    });

    // Format dates to match chart labels (e.g., "Sep 15")
    const formatDateToLabel = (dateStr: string) => {
      const [year, month, day] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    };

    const chartStartDate = sortedDates[0];
    const chartEndDate = sortedDates[sortedDates.length - 1];

    const annotations: {
      type: "box";
      xMin: string;
      xMax: string;
      yMin: number;
      yMax: number;
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
      borderRadius: number;
      label: {
        display: boolean;
        content: string;
        position: {
          x: "center" | "start" | "end";
          y: "center" | "start" | "end";
        };
        yAdjust: number;
        font: { size: number; weight: "bold" };
        color: string;
        backgroundColor: string;
        padding: { top: number; bottom: number; left: number; right: number };
        borderRadius: number;
      };
    }[] = [];

    const unitsWithDates = unitSchedules
      .filter((u) => u.startDate && u.endDate)
      .sort((a, b) => (a.startDate || "").localeCompare(b.startDate || ""));

    unitsWithDates.forEach((unit) => {
      const unitStart = unit.startDate || "";
      const unitEnd = unit.endDate || "";

      // Skip if unit is completely outside chart range
      if (unitEnd < chartStartDate || unitStart > chartEndDate) {
        return;
      }

      // Clamp to chart bounds
      const effectiveStart =
        unitStart < chartStartDate ? chartStartDate : unitStart;
      const effectiveEnd = unitEnd > chartEndDate ? chartEndDate : unitEnd;

      // Find the label index for start and end
      let startIdx = dateIndexMap.get(effectiveStart);
      let endIdx = dateIndexMap.get(effectiveEnd);

      // If start date isn't found, find the first date >= effectiveStart
      if (startIdx === undefined) {
        startIdx = sortedDates.findIndex((d) => d >= effectiveStart);
        if (startIdx === -1) return;
      }

      // If end date isn't found, find the last date <= effectiveEnd
      if (endIdx === undefined) {
        for (let i = sortedDates.length - 1; i >= 0; i--) {
          if (sortedDates[i] <= effectiveEnd) {
            endIdx = i;
            break;
          }
        }
        if (endIdx === undefined) return;
      }

      const colorIdx = (unit.unitNumber - 1) % UNIT_COLORS.length;
      const colors = UNIT_COLORS[colorIdx];

      // Get the labels for xMin and xMax
      const startLabel = formatDateToLabel(sortedDates[startIdx]);
      const endLabel = formatDateToLabel(sortedDates[endIdx]);

      // Create box annotation for the unit
      annotations.push({
        type: "box",
        xMin: startLabel,
        xMax: endLabel,
        yMin: 0,
        yMax: yAxisMax,
        backgroundColor: colors.bg,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 4,
        label: {
          display: true,
          content: `Unit ${unit.unitNumber}`,
          position: { x: "center", y: "start" },
          yAdjust: 6,
          font: { size: 12, weight: "bold" },
          color: colors.text,
          backgroundColor: colors.border,
          padding: { top: 2, bottom: 2, left: 6, right: 6 },
          borderRadius: 4,
        },
      });
    });

    return annotations;
  })();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
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
          title: function (tooltipItems: { dataIndex: number }[]) {
            if (tooltipItems.length === 0) return "";
            const dateStr = sortedDates[tooltipItems[0].dataIndex];
            if (!dateStr) return "";
            const [year, month, day] = dateStr.split("-").map(Number);
            const date = new Date(year, month - 1, day);
            return date.toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            });
          },
          label: function (context: {
            dataset: { label?: string };
            raw: unknown;
            datasetIndex: number;
            dataIndex: number;
          }) {
            const sectionData = processedSections[context.datasetIndex];
            const dateStr = sortedDates[context.dataIndex];
            const dataPoint = sectionData.processedData.find(
              (d) => d.date === dateStr,
            );

            if (!dataPoint) return "";

            const value = Number(context.raw) || 0;
            const sectionLabel = context.dataset.label || sectionData.name;

            if (showRollingAverage) {
              return [
                `${sectionLabel}:`,
                `3-Day Avg Velocity: ${value.toFixed(2)}`,
                `Today's Velocity: ${dataPoint.adjustedVelocity.toFixed(2)}`,
                `Total Completions: ${dataPoint.totalCompletions}`,
                `Students Present: ${dataPoint.studentsPresent}`,
                adjustForBlockType && dataPoint.blockType === "double"
                  ? "(Adjusted for double block)"
                  : "",
              ].filter(Boolean);
            } else {
              return [
                `${sectionLabel}:`,
                `Daily Velocity: ${value.toFixed(2)}`,
                `Total Completions: ${dataPoint.totalCompletions}`,
                `Students Present: ${dataPoint.studentsPresent}`,
                adjustForBlockType && dataPoint.blockType === "double"
                  ? "(Adjusted for double block)"
                  : "",
              ].filter(Boolean);
            }
          },
        },
      },
      annotation: {
        annotations: unitAnnotations,
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
            <ChartBarIcon className="h-5 w-5 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700">
              Velocity Rolling 3-Day Average
            </h3>
            {hasLoadingSections && (
              <div className="flex items-center gap-2">
                {loadingSections.map((section) => (
                  <span
                    key={section.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium animate-pulse"
                    style={{
                      backgroundColor: `${section.color}20`,
                      color: section.color,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ backgroundColor: section.color }}
                    ></span>
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
            <VelocityLineChart
              chartData={chartData}
              chartOptions={chartOptions}
            />
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
            label="Include Ramp Ups"
          />
          <ToggleSwitch
            checked={showSidekicks}
            onChange={onShowSidekicksChange}
            label="Include Sidekick Lessons"
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
