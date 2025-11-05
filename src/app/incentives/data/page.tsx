"use client";

import React, { useState, useEffect } from "react";
import {
  fetchActivityData,
  exportActivityDataAsCSV,
  deleteActivity,
  ActivityDataFilters,
  StudentActivityRecord,
} from "./actions";
import { fetchUnitsByGrade } from "../form/actions";
import { TrackingTables } from "./TrackingTables";

interface Unit {
  _id: string;
  unitNumber: number;
  unitTitle: string;
}

export default function IncentivesDataPage() {

  // Load saved filters from localStorage (shared with form page)
  const [section, setSection] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('incentives-form-section') || "";
    }
    return "";
  });
  const [unitId, setUnitId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('incentives-form-current-unit') || "";
    }
    return "";
  });

  // Data
  const [records, setRecords] = useState<StudentActivityRecord[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [view, setView] = useState<"table" | "summary" | "tracking">("tracking");

  // Load units on mount
  useEffect(() => {
    async function loadMetadata() {
      const unitsResult = await fetchUnitsByGrade("8");

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

    const dataResult = await fetchActivityData(filters);

    if (typeof dataResult !== 'string' && dataResult.success && dataResult.data) {
      setRecords(dataResult.data as StudentActivityRecord[]);
    }

    setIsLoading(false);
  };

  // Save section and unitId to localStorage when they change (shared with form page)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (section) {
        localStorage.setItem('incentives-form-section', section);
      } else {
        localStorage.removeItem('incentives-form-section');
      }
    }
  }, [section]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (unitId) {
        localStorage.setItem('incentives-form-current-unit', unitId);
      } else {
        localStorage.removeItem('incentives-form-current-unit');
      }
    }
  }, [unitId]);

  // Load data when filters change
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, unitId]);

  const handleExportCSV = async () => {
    setIsExporting(true);

    const filters: ActivityDataFilters = {};
    if (section) filters.section = section;
    if (unitId) filters.unitId = unitId;

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
  };

  const handleDeleteActivity = async (activityId: string, studentName: string) => {
    if (!confirm(`Delete this activity for ${studentName}?`)) {
      return;
    }

    const result = await deleteActivity(activityId);

    if (typeof result !== 'string' && result.success) {
      // Reload data after successful delete
      await loadData();
    } else {
      const errorMsg = typeof result === 'string' ? result : result.error;
      alert(`Failed to delete activity: ${errorMsg}`);
    }
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
                onClick={() => setView("tracking")}
                className={`px-4 py-2 border rounded-md transition-colors ${
                  view === "tracking"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                📈 Tracking
              </button>
              <button
                onClick={() => setView("table")}
                className={`px-4 py-2 border rounded-md transition-colors ${
                  view === "table"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                📋 Table
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Tracking View */}
        {view === "tracking" && (
          <TrackingTables section={section} unitId={unitId} />
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
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
                            record.lessonName ||
                            "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {record.loggedBy || "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleDeleteActivity(record._id, record.studentName)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Delete
                          </button>
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
