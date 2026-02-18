"use client";

import React, { lazy, Suspense } from "react";
import { cn } from "@ui/utils/formatters";
import {
  Legend,
  LegendGroup,
  LegendItem,
} from "@/components/core/feedback/Legend";

// Lazy load the heavy Chart.js component
const SkillsBarChart = lazy(() =>
  import("./SkillsBarChart").then((module) => ({
    default: module.SkillsBarChart,
  })),
);

export interface BarDataItem {
  label: string;
  diagnosticValue: number;
  practiceValue: number;
  /** Number of skill challenges attempted (shown inside green bar) */
  attemptedCount?: number;
  tooltipTitle?: string;
  tooltipExtra?: string[];
}

interface StackedSkillsBarChartProps {
  data: BarDataItem[];
  yAxisTitle?: string;
  diagnosticLabel?: string;
  practiceLabel?: string;
  className?: string;
}

function ChartSkeleton() {
  return (
    <div className="h-80 flex items-end gap-1 p-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 bg-gray-200 rounded-t animate-pulse"
          style={{ height: `${Math.random() * 60 + 20}%` }}
        />
      ))}
    </div>
  );
}

/**
 * Reusable stacked bar chart for showing diagnostic baseline + practice skills.
 * Used for both per-student and per-section views.
 */
export function StackedSkillsBarChart({
  data,
  yAxisTitle = "Skills Mastered",
  diagnosticLabel = "Diagnostic Baseline",
  practiceLabel = "Skills Mastered (Practice)",
  className,
}: StackedSkillsBarChartProps) {
  const labels = data.map((d) => d.label);

  const chartData = {
    labels,
    datasets: [
      {
        label: diagnosticLabel,
        data: data.map((d) => d.diagnosticValue),
        backgroundColor: "rgb(209, 213, 219)", // gray-300
        borderRadius: 0,
        borderSkipped: false as const,
        datalabels: {
          display: false,
        },
      },
      {
        label: practiceLabel,
        data: data.map((d) => d.practiceValue),
        backgroundColor: "rgb(16, 185, 129)", // emerald-500
        borderRadius: {
          topLeft: 4,
          topRight: 4,
        },
        borderSkipped: false as const,
        datalabels: {
          display: (context: { dataIndex: number }) =>
            data[context.dataIndex].practiceValue > 0 ||
            (data[context.dataIndex].attemptedCount ?? 0) > 0,
          anchor: "end" as const,
          align: "top" as const,
          offset: 4,
          formatter: (_value: number, context: { dataIndex: number }) => {
            const item = data[context.dataIndex];
            const practiceStr =
              item.practiceValue > 0 ? `+${item.practiceValue}` : "";
            const attemptStr = item.attemptedCount
              ? `(${item.attemptedCount})`
              : "";
            return [practiceStr, attemptStr].filter(Boolean).join(" ");
          },
          color: "rgb(5, 150, 105)", // emerald-600
          font: {
            size: 11,
            weight: "bold" as const,
          },
        },
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: function (context: { dataIndex: number }[]) {
            const idx = context[0].dataIndex;
            return data[idx].tooltipTitle || data[idx].label;
          },
          label: function (context: {
            dataset: { label?: string };
            parsed: { y: number };
          }) {
            const label = context.dataset.label || "";
            const value = context.parsed.y || 0;
            if (label.includes("Practice")) {
              return `+${value} skills mastered`;
            }
            return `${value} from diagnostic`;
          },
          footer: function (context: { dataIndex: number }[]) {
            const idx = context[0].dataIndex;
            const item = data[idx];
            const total = item.diagnosticValue + item.practiceValue;
            const lines = [
              `Total: ${Number.isInteger(total) ? total : total.toFixed(1)} skills`,
            ];
            if (item.tooltipExtra) {
              lines.push(...item.tooltipExtra);
            }
            return lines;
          },
        },
        backgroundColor: "rgb(17, 24, 39)", // gray-900
        titleFont: {
          weight: "bold" as const,
        },
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 11,
          },
          color: "rgb(107, 114, 128)", // gray-500
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grace: "10%",
        grid: {
          color: "rgb(243, 244, 246)", // gray-100
        },
        ticks: {
          stepSize: 5,
          font: {
            size: 11,
          },
          color: "rgb(107, 114, 128)", // gray-500
        },
        title: {
          display: true,
          text: yAxisTitle,
          font: {
            size: 12,
            weight: "normal" as const,
          },
          color: "rgb(107, 114, 128)", // gray-500
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
  };

  return (
    <div className={cn("bg-white rounded-lg", className)}>
      <Suspense fallback={<ChartSkeleton />}>
        <SkillsBarChart chartData={chartData} chartOptions={chartOptions} />
      </Suspense>
      <Legend title="Chart Key">
        <LegendGroup>
          <LegendItem
            icon={
              <span className="inline-block w-3 h-3 rounded-sm bg-gray-300" />
            }
            label="Diagnostic Baseline"
          />
          <LegendItem
            icon={
              <span className="inline-block w-3 h-3 rounded-sm bg-emerald-500" />
            }
            label="Skills Mastered"
          />
        </LegendGroup>
        <LegendGroup>
          <LegendItem
            icon={<span className="font-bold text-emerald-600">+X</span>}
            label="Skills mastered from practice"
          />
          <LegendItem
            icon={<span className="font-bold text-emerald-600">(Y)</span>}
            label="Total skill challenge attempts"
          />
        </LegendGroup>
      </Legend>
    </div>
  );
}
