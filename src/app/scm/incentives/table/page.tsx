"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  exportActivityDataAsCSV,
  deleteActivity,
  updateActivity,
  ActivityDataFilters,
  StudentActivityRecord,
} from "../data/actions";
import { useRoadmapUnits } from "@/hooks/scm";
import { useActivityTypes, useActivityData } from "../hooks";
import { Spinner } from "@/components/core/feedback/Spinner";

export default function IncentivesTablePage() {
  // Load saved filters from localStorage (shared with form page)
  const [section, setSection] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("incentives-form-section") || "";
    }
    return "";
  });
  const [unitId, setUnitId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("incentives-form-current-unit") || "";
    }
    return "";
  });

  // Build filters object for React Query
  const filters: ActivityDataFilters = useMemo(() => {
    const f: ActivityDataFilters = {};
    if (section) f.section = section;
    if (unitId) f.unitId = unitId;
    return f;
  }, [section, unitId]);

  // Data fetching with React Query hooks
  const { units: allUnits, loading: unitsLoading } = useRoadmapUnits();
  const { activityTypes } = useActivityTypes();
  const { records, loading: recordsLoading, refetch } = useActivityData(filters);

  // Filter units for grade 8
  const units = useMemo(() => {
    return allUnits.filter((u) => u.grade.includes("8th Grade"));
  }, [allUnits]);

  // UI State
  const [isExporting, setIsExporting] = useState(false);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    activityDate: string;
    activityType: string;
    activityLabel: string;
  }>({ activityDate: "", activityType: "", activityLabel: "" });

  // Save section and unitId to localStorage when they change (shared with form page)
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (section) {
        localStorage.setItem("incentives-form-section", section);
      } else {
        localStorage.removeItem("incentives-form-section");
      }
    }
  }, [section]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (unitId) {
        localStorage.setItem("incentives-form-current-unit", unitId);
      } else {
        localStorage.removeItem("incentives-form-current-unit");
      }
    }
  }, [unitId]);

  const handleExportCSV = async () => {
    setIsExporting(true);

    const result = await exportActivityDataAsCSV(filters);

    if (typeof result !== "string" && result.success && result.data) {
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

  const handleEditClick = (record: StudentActivityRecord) => {
    setEditingRow(record._id);
    setEditValues({
      activityDate: record.activityDate,
      activityType: record.activityType,
      activityLabel: record.activityLabel,
    });
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditValues({ activityDate: "", activityType: "", activityLabel: "" });
  };

  const handleSaveEdit = async (activityId: string) => {
    const result = await updateActivity(activityId, {
      activityDate: editValues.activityDate,
      activityType: editValues.activityType,
      activityLabel: editValues.activityLabel,
    });

    if (typeof result !== "string" && result.success) {
      setEditingRow(null);
      setEditValues({ activityDate: "", activityType: "", activityLabel: "" });
      refetch();
    } else {
      const errorMsg = typeof result === "string" ? result : result.error;
      alert(`Failed to update activity: ${errorMsg}`);
    }
  };

  const handleDeleteActivity = async (activityId: string, studentName: string) => {
    if (!confirm(`Delete this activity for ${studentName}?`)) {
      return;
    }

    const result = await deleteActivity(activityId);

    if (typeof result !== "string" && result.success) {
      refetch();
    } else {
      const errorMsg = typeof result === "string" ? result : result.error;
      alert(`Failed to delete activity: ${errorMsg}`);
    }
  };

  const formatDateTime = (dateStr: string | undefined) => {
    if (!dateStr) return "-";

    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isToday) {
      return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else if (isYesterday) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else {
      const dayOfWeek = date.toLocaleDateString([], { weekday: "short" });
      const dateFormat = date.toLocaleDateString([], { month: "numeric", day: "numeric" });
      const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      return `${dayOfWeek}, ${dateFormat}, ${timeStr}`;
    }
  };

  const isLoading = unitsLoading || recordsLoading;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Incentives Activity Table
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                View, edit, and export student activity records
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExportCSV}
                disabled={isExporting || records.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isExporting ? "Exporting..." : "Export CSV"}
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
              {isLoading
                ? "Loading..."
                : `${records.length} record${records.length !== 1 ? "s" : ""} found`}
            </div>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <Spinner size="lg" variant="primary" />
            </div>
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
                      Student
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Section
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class Date
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
                      Submitted
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((record, index) => {
                    const isEditing = editingRow === record._id;
                    return (
                      <tr key={`${record.studentId}-${index}`}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {record.studentName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {record.section}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {isEditing ? (
                            <input
                              type="date"
                              value={editValues.activityDate}
                              onChange={(e) =>
                                setEditValues({ ...editValues, activityDate: e.target.value })
                              }
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          ) : (
                            record.activityDate
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {isEditing ? (
                            <select
                              value={editValues.activityType}
                              onChange={(e) => {
                                const selectedType = activityTypes.find(
                                  (t) => t._id === e.target.value
                                );
                                setEditValues({
                                  ...editValues,
                                  activityType: e.target.value,
                                  activityLabel: selectedType?.label || "",
                                });
                              }}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              {activityTypes.map((type) => (
                                <option key={type._id} value={type._id}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            record.activityLabel
                          )}
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
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {formatDateTime(record.loggedAt)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {isEditing ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveEdit(record._id)}
                                className="text-green-600 hover:text-green-800 font-medium cursor-pointer"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="text-gray-600 hover:text-gray-800 font-medium cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditClick(record)}
                                className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteActivity(record._id, record.studentName)}
                                className="text-red-600 hover:text-red-800 font-medium cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
