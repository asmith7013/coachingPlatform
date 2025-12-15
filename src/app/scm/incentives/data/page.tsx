"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRoadmapUnits } from "@/hooks/scm";
import type { RoadmapUnit as Unit } from "@zod-schema/scm/roadmaps/roadmap-unit";
import { TrackingTables } from "./TrackingTables";

export default function IncentivesDataPage() {
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

  // Data fetching with React Query
  const { units: allUnits } = useRoadmapUnits();

  // Filter units for grade 8
  const units = useMemo(() => {
    return allUnits.filter((u: Unit) => u.grade.includes("8th Grade"));
  }, [allUnits]);

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

  const clearFilters = () => {
    setSection("");
    setUnitId("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Incentives Activity Summary
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Track student activities across different categories
            </p>
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
                {units.map((unit: Unit) => (
                  <option key={unit._id} value={unit._id}>
                    {unit.unitTitle}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end mt-4">
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Tracking View */}
        <TrackingTables section={section} unitId={unitId} />
      </div>
    </div>
  );
}
