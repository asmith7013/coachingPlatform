import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
);

interface SkillsBarChartProps {
  chartData: Parameters<typeof Bar>[0]["data"];
  chartOptions: Parameters<typeof Bar>[0]["options"];
}

/**
 * Lazy-loaded Bar chart component for skills mastery
 * Separated to reduce initial bundle size
 */
export function SkillsBarChart({
  chartData,
  chartOptions,
}: SkillsBarChartProps) {
  return (
    <div className="h-96">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
}
