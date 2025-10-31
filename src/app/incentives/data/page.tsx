"use client";

import React, { useState, useEffect } from "react";
import {
  fetchActivityData,
  getActivitySummary,
  exportActivityDataAsCSV,
  ActivityDataFilters,
  StudentActivityRecord,
} from "./actions";
import { fetchActivityTypes } from "../form/actions";
import { fetchUnitsByGrade } from "../form/actions";
import { ActivityTypeConfig } from "@zod-schema/313/activity-type-config";

interface Unit {
  _id: string;
  unitNumber: number;
  unitTitle: string;
}

interface Summary {
  totalActivities: number;
  uniqueStudents: number;
  byType: { [key: string]: number };
  byDate: { [key: string]: number };
  topStudents: Array<{ name: string; count: number }>;
  dateRange: { earliest: string; latest: string } | null;
}

export default function IncentivesDataPage() {
  // Filters
  const [section, setSection] = useState<string>("");
  const [unitId, setUnitId] = useState<string>("");
  const [activityType, setActivityType] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Data
  const [records, setRecords] = useState<StudentActivityRecord[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [activityTypes, setActivityTypes] = useState<ActivityTypeConfig[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [view, setView] = useState<"table" | "summary">("table");

  // Load activity types and units on mount
  useEffect(() => {
    async function loadMetadata() {
      const [typesResult, unitsResult] = await Promise.all([
        fetchActivityTypes(),
        fetchUnitsByGrade("8"),
      ]);

      if (typeof typesResult !== 'string' && typesResult.success && typesResult.data) {
        setActivityTypes(typesResult.data as ActivityTypeConfig[]);
      }

      if (typeof unitsResult !== 'string' && unitsResult.success && unitsResult.data) {
        setUnits(unitsResult.data as Unit[]);
      }
    }
    loadMetadata();
  }, []);

  const loadData = async () => {
    setIsLoading(true);

    const filters: ActivityDataFilters = {};
    if (section) filters.section = section;
    if (unitId) filters.unitId = unitId;
    if (activityType) filters.activityType = activityType;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const [dataResult, summaryResult] = await Promise.all([
      fetchActivityData(filters),
      getActivitySummary(filters),
    ]);

    if (typeof dataResult !== 'string' && dataResult.success && dataResult.data) {
      setRecords(dataResult.data as StudentActivityRecord[]);
    }

    if (typeof summaryResult !== 'string' && summaryResult.success && summaryResult.data) {
      setSummary(summaryResult.data as Summary);
    }

    setIsLoading(false);
  };

  // Load data when filters change
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, unitId, activityType, startDate, endDate]);

  const handleExportCSV = async () => {
    setIsExporting(true);

    const filters: ActivityDataFilters = {};
    if (section) filters.section = section;
    if (unitId) filters.unitId = unitId;
    if (activityType) filters.activityType = activityType;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const result = await exportActivityDataAsCSV(filters);

    if (typeof result !== 'string' && result.success && result.data) {
      // Create download link
      const blob = new Blob([result.data as string], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `incentives-data-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }

    setIsExporting(false);
  };

  const clearFilters = () => {
    setSection("");
    setUnitId("");
    setActivityType("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Incentives Activity Data
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                View and export student activity records
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setView(view === "table" ? "summary" : "table")}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                {view === "table" ? "📊 View Summary" : "📋 View Table"}
              </button>
              <button
                onClick={handleExportCSV}
                disabled={isExporting || records.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? "Exporting..." : "📥 Export CSV"}
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Sections</option>
                <option value="802">802</option>
                <option value="803">803</option>
                <option value="804">804</option>
                <option value="805">805</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Units</option>
                {units.map((unit) => (
                  <option key={unit._id} value={unit._id}>
                    {unit.unitTitle}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Activity Type
              </label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {activityTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              {isLoading ? "Loading..." : `${records.length} record${records.length !== 1 ? "s" : ""} found`}
            </div>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Summary View */}
        {view === "summary" && summary && (
          <div className="space-y-4">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-sm text-gray-500 mb-1">Total Activities</div>
                <div className="text-3xl font-bold text-gray-900">
                  {summary.totalActivities}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-sm text-gray-500 mb-1">Unique Students</div>
                <div className="text-3xl font-bold text-gray-900">
                  {summary.uniqueStudents}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-sm text-gray-500 mb-1">Date Range</div>
                <div className="text-lg font-semibold text-gray-900">
                  {summary.dateRange
                    ? `${summary.dateRange.earliest} to ${summary.dateRange.latest}`
                    : "No data"}
                </div>
              </div>
            </div>

            {/* Activities by Type */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Activities by Type
              </h3>
              <div className="space-y-2">
                {Object.entries(summary.byType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-gray-700">{type}</span>
                    <span className="font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Students */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Top 10 Most Active Students
              </h3>
              <div className="space-y-2">
                {summary.topStudents.map((student, index) => (
                  <div key={student.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 w-6">{index + 1}.</span>
                      <span className="text-gray-700">{student.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {student.count} {student.count === 1 ? "activity" : "activities"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Table View */}
        {view === "table" && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : records.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No activity records found. Try adjusting your filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Section
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Activity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Logged By
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {records.map((record, index) => (
                      <tr key={`${record.studentId}-${index}`}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {record.activityDate}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {record.studentName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {record.section}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {record.activityLabel}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {record.inquiryQuestion ||
                            record.customDetail ||
                            record.skillId ||
                            record.lessonId ||
                            "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {record.loggedBy || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
