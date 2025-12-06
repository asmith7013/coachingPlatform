import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface VelocityLineChartProps {
  chartData: Parameters<typeof Line>[0]['data'];
  chartOptions: Parameters<typeof Line>[0]['options'];
}

/**
 * Lazy-loaded Line chart component for velocity graph
 * Separated to reduce initial bundle size
 */
export function VelocityLineChart({ chartData, chartOptions }: VelocityLineChartProps) {
  return (
    <div className="h-64">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}
