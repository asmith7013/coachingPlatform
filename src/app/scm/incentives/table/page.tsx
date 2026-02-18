"use client";

import React, { useState, useMemo } from "react";
import {
  exportActivityDataAsCSV,
  deleteActivity,
  updateActivity,
  ActivityDataFilters,
  StudentActivityRecord,
} from "../data/actions";
import { useRoadmapUnits } from "@/hooks/scm";
import type { RoadmapUnit as Unit } from "@zod-schema/scm/roadmaps/roadmap-unit";
import { useActivityTypes, useActivityData } from "../hooks";
import { Spinner } from "@/components/core/feedback/Spinner";
import { useUrlSyncedState } from "@/hooks/scm/useUrlSyncedState";

/** Check if a unitId looks like a MongoDB ObjectId (24-char hex) */
function isMongoObjectId(id: string | undefined): boolean {
  return !!id && /^[0-9a-fA-F]{24}$/.test(id);
}

function formatDateTime(dateStr: string | undefined) {
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
    const dateFormat = date.toLocaleDateString([], {
      month: "numeric",
      day: "numeric",
    });
    const timeStr = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${dayOfWeek}, ${dateFormat}, ${timeStr}`;
  }
}

interface ActivityTableProps {
  records: StudentActivityRecord[];
  activityTypes: { _id: string; label: string }[];
  editingRow: string | null;
  editValues: {
    activityDate: string;
    activityType: string;
    activityLabel: string;
  };
  onEditClick: (record: StudentActivityRecord) => void;
  onSaveEdit: (activityId: string) => void;
  onCancelEdit: () => void;
  onEditValuesChange: (values: {
    activityDate: string;
    activityType: string;
    activityLabel: string;
  }) => void;
  onDelete: (activityId: string, studentName: string) => void;
  showUnit?: boolean;
  unitLookup?: Map<string, string>;
}

function ActivityTable({
  records,
  activityTypes,
  editingRow,
  editValues,
  onEditClick,
  onSaveEdit,
  onCancelEdit,
  onEditValuesChange,
  onDelete,
  showUnit = false,
  unitLookup,
}: ActivityTableProps) {
  if (records.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 text-sm">
        No records found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Student
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Date
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Activity
            </th>
            {showUnit && (
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Unit
              </th>
            )}
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Details
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Logged By
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Submitted
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {records.map((record, index) => {
            const isEditing = editingRow === record._id;
            return (
              <tr key={`${record._id}-${index}`}>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  {record.studentName}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  {isEditing ? (
                    <input
                      type="date"
                      value={editValues.activityDate}
                      onChange={(e) =>
                        onEditValuesChange({
                          ...editValues,
                          activityDate: e.target.value,
                        })
                      }
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  ) : (
                    record.activityDate
                  )}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  {isEditing ? (
                    <select
                      value={editValues.activityType}
                      onChange={(e) => {
                        const selectedType = activityTypes.find(
                          (t) => t._id === e.target.value,
                        );
                        onEditValuesChange({
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
                {showUnit && (
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    {unitLookup?.get(record.unitId || "") ||
                      record.unitId ||
                      "-"}
                  </td>
                )}
                <td className="px-3 py-2 text-sm text-gray-500 max-w-[150px] truncate">
                  {record.inquiryQuestion ||
                    record.customDetail ||
                    record.skillId ||
                    record.lessonName ||
                    "-"}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {record.loggedBy || "-"}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {formatDateTime(record.loggedAt)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onSaveEdit(record._id)}
                        className="text-green-600 hover:text-green-800 font-medium cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        onClick={onCancelEdit}
                        className="text-gray-600 hover:text-gray-800 font-medium cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEditClick(record)}
                        className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(record._id, record.studentName)}
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
  );
}

export default function IncentivesTablePage() {
  // Filters synced to URL + localStorage (shared keys with form/data pages)
  const [section, setSection] = useUrlSyncedState("section", {
    storageKey: "incentives-form-section",
  });
  const [unitId, setUnitId] = useUrlSyncedState("unit", {
    storageKey: "incentives-form-current-unit",
  });

  // Fetch ALL records for the section (no unit filter) so we can split by source
  const allFilters: ActivityDataFilters = useMemo(() => {
    const f: ActivityDataFilters = {};
    if (section) f.section = section;
    return f;
  }, [section]);

  // Data fetching
  const { units: allUnits, loading: unitsLoading } = useRoadmapUnits();
  const { activityTypes } = useActivityTypes();
  const {
    records: allRecords,
    loading: recordsLoading,
    refetch,
  } = useActivityData(allFilters);

  // Build unit lookup for platform data
  const units = useMemo(() => {
    return allUnits.filter((u: Unit) => u.grade.includes("8th Grade"));
  }, [allUnits]);

  const unitLookup = useMemo(() => {
    const map = new Map<string, string>();
    units.forEach((u: Unit) => map.set(u._id, u.unitTitle));
    return map;
  }, [units]);

  // Split records by source: Podsie (short numeric unitId) vs Platform (ObjectId unitId)
  const { podsieRecords, platformRecords } = useMemo(() => {
    const podsie: StudentActivityRecord[] = [];
    const platform: StudentActivityRecord[] = [];

    for (const record of allRecords) {
      if (isMongoObjectId(record.unitId)) {
        // Platform data — apply unit filter if set
        if (!unitId || record.unitId === unitId) {
          platform.push(record);
        }
      } else {
        podsie.push(record);
      }
    }

    return { podsieRecords: podsie, platformRecords: platform };
  }, [allRecords, unitId]);

  // UI State
  const [isExporting, setIsExporting] = useState(false);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    activityDate: string;
    activityType: string;
    activityLabel: string;
  }>({ activityDate: "", activityType: "", activityLabel: "" });

  const handleExportCSV = async () => {
    setIsExporting(true);
    const filters: ActivityDataFilters = {};
    if (section) filters.section = section;
    const result = await exportActivityDataAsCSV(filters);
    if (typeof result !== "string" && result.success && result.data) {
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

  const handleDeleteActivity = async (
    activityId: string,
    studentName: string,
  ) => {
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

  const isLoading = unitsLoading || recordsLoading;

  const sharedTableProps = {
    activityTypes,
    editingRow,
    editValues,
    onEditClick: handleEditClick,
    onSaveEdit: handleSaveEdit,
    onCancelEdit: handleCancelEdit,
    onEditValuesChange: setEditValues,
    onDelete: handleDeleteActivity,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
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
                disabled={isExporting || allRecords.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isExporting ? "Exporting..." : "Export CSV"}
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                Unit (Platform data only)
              </label>
              <select
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Units</option>
                {units.map((unit: Unit) => (
                  <option key={unit._id} value={unit._id}>
                    {unit.unitTitle}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
            {isLoading ? (
              <span>Loading...</span>
            ) : (
              <>
                <span>{allRecords.length} total records</span>
                <span className="text-gray-300">|</span>
                <span className="text-blue-600">
                  {podsieRecords.length} from Podsie
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-purple-600">
                  {platformRecords.length} from Platform
                </span>
              </>
            )}
          </div>
        </div>

        {/* Two-column layout */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Spinner size="lg" variant="primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Podsie Data */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
                <h2 className="text-sm font-semibold text-blue-800">
                  Podsie Data
                </h2>
                <p className="text-xs text-blue-600 mt-0.5">
                  {podsieRecords.length} records submitted from Podsie
                  class-points
                </p>
              </div>
              <div className="max-h-[600px] overflow-auto">
                <ActivityTable records={podsieRecords} {...sharedTableProps} />
              </div>
            </div>

            {/* Right: Platform Data */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-purple-50 border-b border-purple-100">
                <h2 className="text-sm font-semibold text-purple-800">
                  Platform Data
                </h2>
                <p className="text-xs text-purple-600 mt-0.5">
                  {platformRecords.length} records from coaching platform form
                </p>
              </div>
              <div className="max-h-[600px] overflow-auto">
                <ActivityTable
                  records={platformRecords}
                  showUnit
                  unitLookup={unitLookup}
                  {...sharedTableProps}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
