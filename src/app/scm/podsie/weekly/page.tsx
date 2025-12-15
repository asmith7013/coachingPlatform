"use client";

import { useState, useMemo } from "react";
import type { CurrentUnitInfo } from "@/app/actions/calendar/current-unit";
import { Spinner } from "@/components/core/feedback/Spinner";
import { CheckIcon, ClockIcon, XMarkIcon, ClipboardDocumentIcon } from "@heroicons/react/24/solid";
import { SectionSummaryCard } from "@/app/scm/podsie/pace/components";
import { useWeeklyVelocity, useCurrentUnits, type SectionWeeklyData } from "@/hooks/scm";

// Hardcoded sections for this page
const SECTIONS = [
  { section: "802", school: "IS313" },
  { section: "803", school: "IS313" },
  { section: "804", school: "IS313" },
  { section: "805", school: "IS313" },
] as const;

const SCHOOL_YEAR = "2025-2026";

// Get Monday of the current week
function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

// Format date to YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default function WeeklySummaryPage() {
  // Default to current week (Monday to Friday)
  const [startDate, setStartDate] = useState(() => {
    const monday = getMonday(new Date());
    return formatDate(monday);
  });
  const [endDate, setEndDate] = useState(() => {
    const monday = getMonday(new Date());
    const friday = new Date(monday);
    friday.setDate(friday.getDate() + 4);
    return formatDate(friday);
  });

  // Pacing date for SectionSummaryCards (defaults to today)
  const [pacingDate, setPacingDate] = useState(() => formatDate(new Date()));
  const [copied, setCopied] = useState(false);

  // Data fetching with React Query hooks
  const { currentUnits } = useCurrentUnits(SCHOOL_YEAR);
  const { sectionData, loading, error } = useWeeklyVelocity(SECTIONS, startDate, endDate);

  // Calculate attendance percentages
  const getAttendancePercentages = (data: SectionWeeklyData) => {
    const total = data.attendance.total;
    if (total === 0) return { present: 0, late: 0, absent: 0 };

    return {
      present: Math.round((data.attendance.present / total) * 100),
      late: Math.round((data.attendance.late / total) * 100),
      absent: Math.round((data.attendance.absent / total) * 100),
    };
  };

  // Sorted sections data
  const sortedSections = useMemo(() => {
    return SECTIONS.map(s => sectionData.get(s.section)).filter((d): d is SectionWeeklyData => d !== undefined);
  }, [sectionData]);

  // Get current unit info for a section
  const getCurrentUnitForSection = (section: string, school: string): CurrentUnitInfo | null => {
    return (
      currentUnits.find(
        (cu) => cu.school === school && cu.classSection === section
      ) || null
    );
  };

  // Generate markdown table
  const generateMarkdown = () => {
    if (sortedSections.length === 0) return "";

    const lines = [
      "| Section | Podsie Mastery | Attendance |",
      "|---------|----------------|------------|",
    ];

    for (const data of sortedSections) {
      const percentages = getAttendancePercentages(data);
      const masteryText = `${data.totalMasteryChecks} Mastery Checks (${data.masteryChecksPerStudent} per student)`;
      const attendanceText = `${percentages.present}% ✅, ${percentages.late}% 🟡, ${percentages.absent}% 🟥`;
      lines.push(`| ${data.section} | ${masteryText} | ${attendanceText} |`);
    }

    return lines.join("\n");
  };

  // Copy markdown to clipboard
  const handleCopyMarkdown = async () => {
    const markdown = generateMarkdown();
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Weekly Summary</h1>
          <p className="text-gray-600 text-sm mt-1">
            Podsie mastery checks and attendance overview by section
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <label htmlFor="pacingDate" className="text-sm font-medium text-gray-700">
                Pacing Date
              </label>
              <input
                type="date"
                id="pacingDate"
                value={pacingDate}
                onChange={(e) => setPacingDate(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm p-12">
            <div className="flex flex-col items-center justify-center">
              <Spinner size="lg" className="mb-2" />
              <p className="text-gray-600">Loading weekly data...</p>
            </div>
          </div>
        )}

        {/* Summary Table */}
        {!loading && sortedSections.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Weekly Mastery & Attendance</h2>
              <button
                onClick={handleCopyMarkdown}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer transition-colors"
              >
                <ClipboardDocumentIcon className="w-4 h-4" />
                {copied ? "Copied!" : "Copy as Markdown"}
              </button>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Podsie Mastery
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Attendance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {sortedSections.map((data) => {
                  const percentages = getAttendancePercentages(data);
                  return (
                    <tr key={data.section}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-gray-900">{data.section}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900">
                          {data.totalMasteryChecks} Mastery Checks ({data.masteryChecksPerStudent} per student)
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {/* Present - Green Check */}
                          <span className="flex items-center gap-1 text-sm">
                            <span className="text-gray-900">{percentages.present}%</span>
                            <CheckIcon className="w-5 h-5 text-green-500" />
                          </span>
                          {/* Late - Yellow Clock */}
                          <span className="flex items-center gap-1 text-sm">
                            <span className="text-gray-900">{percentages.late}%</span>
                            <ClockIcon className="w-5 h-5 text-yellow-500" />
                          </span>
                          {/* Absent - Red X */}
                          <span className="flex items-center gap-1 text-sm">
                            <span className="text-gray-900">{percentages.absent}%</span>
                            <XMarkIcon className="w-5 h-5 text-red-500" />
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Section Pacing Cards - 2x2 Grid */}
        {!loading && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Pacing Progress</h2>
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <span className="font-bold text-gray-700">Key:</span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  Far Behind
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  Behind
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  On Pace
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  Ahead
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  Far Ahead
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  Complete
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SECTIONS.map(({ section, school }) => (
                <SectionSummaryCard
                  key={section}
                  section={section}
                  school={school}
                  currentUnitInfo={getCurrentUnitForSection(section, school)}
                  pacingDate={pacingDate}
                />
              ))}
            </div>
          </div>
        )}

        {/* No Data State */}
        {!loading && sortedSections.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600">No data available for the selected date range</p>
          </div>
        )}
      </div>
    </div>
  );
}
