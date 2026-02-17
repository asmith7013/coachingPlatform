"use client";

import React, { useState, useMemo } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import { useTimesheetEntries } from "@/hooks/scm";
import { deleteTimesheetEntry } from "@/app/actions/scm/timesheet/timesheet";
import type { TimesheetEntry } from "@zod-schema/scm/timesheet/timesheet-entry";
import { TrashIcon } from "@heroicons/react/24/outline";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
);

// Helper to get week start date (Sunday)
function getWeekStart(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  const day = date.getDay(); // 0 = Sunday
  const diff = date.getDate() - day; // Go back to Sunday
  const sunday = new Date(date.setDate(diff));
  return sunday.toISOString().split("T")[0];
}

// Format week label
function formatWeekLabel(weekStart: string): string {
  const start = new Date(weekStart + "T12:00:00");
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

interface GroupedEntries {
  [date: string]: TimesheetEntry[];
}

// Task type categories and their colors
const TASK_COLORS: Record<string, string> = {
  "Lead coaching activities": "#3b82f6", // blue
  "Content Development": "#10b981", // green
  "Site Context + Support": "#f59e0b", // amber
  "Lead Facilitation": "#8b5cf6", // purple
  "Content Training": "#ec4899", // pink
  "Local Travel": "#6366f1", // indigo
  Other: "#6b7280", // gray
};

// Helper to categorize tasks
function categorizeTask(task: string): string {
  if (task.includes("Lead coaching")) return "Lead coaching activities";
  if (task.includes("Content Development")) return "Content Development";
  if (task.includes("Site Context")) return "Site Context + Support";
  if (task.includes("Lead Facilitation")) return "Lead Facilitation";
  if (task.includes("Content Training")) return "Content Training";
  if (task.includes("Local Travel")) return "Local Travel";
  return "Other";
}

// Format currency with commas
function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Format number with commas
function formatNumber(value: number, decimals: number = 1): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function TimesheetPage() {
  // Date range filters - default to Sept 1 through today
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    // Use Sept 1 of current year, or previous year if before Sept
    const year =
      now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
    return `${year}-09-01`;
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  // Fetch entries using React Query
  const {
    data: entries = [],
    isLoading: loading,
    error,
    refetch,
  } = useTimesheetEntries({
    startDate,
    endDate,
  });

  // Delete handler
  const handleDelete = async (entryId: string, entry: TimesheetEntry) => {
    const confirmMsg = `Delete entry from ${entry.date}?\n${entry.task} - ${entry.hours}hrs ($${entry.totalPay.toFixed(2)})`;
    if (!confirm(confirmMsg)) return;

    const result = await deleteTimesheetEntry(entryId);
    if (result.success) {
      refetch();
    } else {
      alert(`Failed to delete: ${result.error}`);
    }
  };

  // Group entries by date
  const groupedEntries: GroupedEntries = entries.reduce((acc, entry) => {
    const date = entry.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {} as GroupedEntries);

  // Sort dates descending
  const sortedDates = Object.keys(groupedEntries).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  // Calculate totals
  const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
  const totalPay = entries.reduce((sum, e) => sum + e.totalPay, 0);

  // Calculate hours for current week (since Sunday)
  const currentWeekStart = getWeekStart(new Date().toISOString().split("T")[0]);
  const hoursThisWeek = entries
    .filter((e) => e.date >= currentWeekStart)
    .reduce((sum, e) => sum + e.hours, 0);

  // Calculate earnings by task category for pie chart
  const earningsByCategory = useMemo(() => {
    const categoryTotals: Record<string, number> = {};

    entries.forEach((entry) => {
      const category = categorizeTask(entry.task);
      categoryTotals[category] =
        (categoryTotals[category] || 0) + entry.totalPay;
    });

    // Sort by value descending
    const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

    return {
      labels: sorted.map(([label]) => label),
      values: sorted.map(([, value]) => value),
      colors: sorted.map(
        ([label]) => TASK_COLORS[label] || TASK_COLORS["Other"],
      ),
    };
  }, [entries]);

  const pieChartData = {
    labels: earningsByCategory.labels,
    datasets: [
      {
        data: earningsByCategory.values,
        backgroundColor: earningsByCategory.colors,
        borderColor: earningsByCategory.colors.map(() => "#ffffff"),
        borderWidth: 2,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: { label?: string; raw: unknown }) {
            const value = Number(context.raw) || 0;
            const percentage = ((value / totalPay) * 100).toFixed(1);
            return `${context.label || ""}: $${formatCurrency(value)} (${percentage}%)`;
          },
        },
      },
    },
  };

  // Calculate earnings and hours by week
  const weeklyData = useMemo(() => {
    const weekTotals: Record<
      string,
      { pay: number; hours: number; tlStudioHours: number }
    > = {};

    entries.forEach((entry) => {
      const weekStart = getWeekStart(entry.date);
      if (!weekTotals[weekStart]) {
        weekTotals[weekStart] = { pay: 0, hours: 0, tlStudioHours: 0 };
      }
      weekTotals[weekStart].pay += entry.totalPay;
      weekTotals[weekStart].hours += entry.hours;
      // Track TL Studio project hours
      if (entry.project.includes("Studio")) {
        weekTotals[weekStart].tlStudioHours += entry.hours;
      }
    });

    // Sort by week date ascending
    const sorted = Object.entries(weekTotals).sort((a, b) =>
      a[0].localeCompare(b[0]),
    );

    return {
      weekStarts: sorted.map(([weekStart]) => weekStart),
      labels: sorted.map(([weekStart]) => formatWeekLabel(weekStart)),
      payValues: sorted.map(([, data]) => data.pay),
      hoursValues: sorted.map(([, data]) => data.hours),
      tlStudioHoursValues: sorted.map(([, data]) => data.tlStudioHours),
    };
  }, [entries]);

  const barChartData = {
    labels: weeklyData.labels,
    datasets: [
      {
        label: "Weekly Earnings",
        data: weeklyData.payValues,
        backgroundColor: "#3b82f6",
        borderColor: "#2563eb",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: { raw: unknown }) {
            return `$${formatCurrency(Number(context.raw) || 0)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: number | string) {
            return "$" + Number(value).toLocaleString();
          },
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Timesheet Entries
          </h1>
          <p className="text-gray-600 mt-2">
            Track and view your submitted timesheet entries
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => refetch()}
              className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">
              Total Entries
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {entries.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Total Hours</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(totalHours)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Total Pay</div>
            <div className="text-2xl font-bold text-green-600">
              ${formatCurrency(totalPay)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">
              Hours This Week
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {formatNumber(hoursThisWeek)}
            </div>
          </div>
        </div>

        {/* Charts */}
        {!loading && entries.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Pie Chart - Earnings by Task Type */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Earnings by Task Type
              </h3>
              <div className="h-64">
                <Pie data={pieChartData} options={pieChartOptions} />
              </div>
            </div>

            {/* Bar Chart - Weekly Earnings */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Weekly Earnings
              </h3>
              <div className="h-64">
                <Bar data={barChartData} options={barChartOptions} />
              </div>
            </div>
          </div>
        )}

        {/* Weekly Summary Table */}
        {!loading && weeklyData.labels.length > 0 && (
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-4 py-3 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                Weekly Summary
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Week
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hours
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      TL Studio Hours
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Earnings
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg $/hr
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {weeklyData.labels.map((label, index) => {
                    const hours = weeklyData.hoursValues[index];
                    const tlStudioHours = weeklyData.tlStudioHoursValues[index];
                    const pay = weeklyData.payValues[index];
                    const avgRate = hours > 0 ? pay / hours : 0;
                    return (
                      <tr
                        key={weeklyData.weekStarts[index]}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {label}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          {formatNumber(hours)}
                        </td>
                        <td className="px-4 py-3 text-sm text-blue-600 text-right">
                          {formatNumber(tlStudioHours)}
                        </td>
                        <td className="px-4 py-3 text-sm text-green-600 font-medium text-right">
                          ${formatCurrency(pay)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">
                          ${formatCurrency(avgRate)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-100">
                  <tr>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      Total
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                      {formatNumber(totalHours)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-blue-600 text-right">
                      {formatNumber(
                        weeklyData.tlStudioHoursValues.reduce(
                          (sum, h) => sum + h,
                          0,
                        ),
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600 text-right">
                      ${formatCurrency(totalPay)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-600 text-right">
                      $
                      {totalHours > 0
                        ? formatCurrency(totalPay / totalHours)
                        : "0.00"}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Loading / Error States */}
        {loading && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-500">Loading entries...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-700">
              {error instanceof Error ? error.message : "An error occurred"}
            </div>
          </div>
        )}

        {/* Entries by Date */}
        {!loading && !error && sortedDates.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-500">
              No entries found for the selected date range.
            </div>
          </div>
        )}

        {/* All Entries Table */}
        {!loading && entries.length > 0 && (
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-4 py-3 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                All Entries
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hours
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rate
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[...entries]
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime(),
                    )
                    .map((entry) => {
                      const displayDate = new Date(
                        entry.date + "T12:00:00",
                      ).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      });
                      return (
                        <tr key={entry._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                            {displayDate}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <div
                              className="max-w-xs truncate"
                              title={entry.task}
                            >
                              {entry.task}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {entry.project}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            {entry.hours}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">
                            ${formatCurrency(entry.rate)}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                            ${formatCurrency(entry.totalPay)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleDelete(entry._id, entry)}
                              className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                              title="Delete entry"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
                <tfoot className="bg-gray-100">
                  <tr>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      Total
                    </td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                      {formatNumber(totalHours)}
                    </td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600 text-right">
                      ${formatCurrency(totalPay)}
                    </td>
                    <td className="px-4 py-3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
