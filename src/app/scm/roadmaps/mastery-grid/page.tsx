"use client";

import { useState, useMemo, useEffect } from "react";
import { UnitListItem } from "../units/components/UnitListItem";
import { StudentGridView } from "../units/components/StudentGridView";
import { AllUnitsGridView } from "../units/components/AllUnitsGridView";
import { Spinner } from "@/components/core/feedback/Spinner";
import { AcademicCapIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import { useRoadmapUnits, useSectionOptions } from "@/hooks/scm";
import type { RoadmapUnit as Unit } from "@zod-schema/scm/roadmaps/roadmap-unit";

const GRADE_OPTIONS = [
  { value: "", label: "Select Grade" },
  { value: "Illustrative Math New York - 4th Grade", label: "4th Grade" },
  { value: "Illustrative Math New York - 5th Grade", label: "5th Grade" },
  { value: "Illustrative Math New York - 6th Grade", label: "6th Grade" },
  { value: "Illustrative Math New York - 7th Grade", label: "7th Grade" },
  { value: "Illustrative Math New York - 8th Grade", label: "8th Grade" },
  { value: "Illustrative Math New York - Algebra 1", label: "Algebra 1" },
];

export default function MasteryGridPage() {
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const studentGridView = true;

  // Data fetching with React Query hooks
  const { units, loading, error } = useRoadmapUnits();
  const { sections } = useSectionOptions();

  // Filter units by grade with useMemo
  const filteredUnits = useMemo(() => {
    if (selectedGrade === "") {
      return [];
    }
    return units
      .filter((unit: Unit) => unit.grade === selectedGrade)
      .sort(
        (a: Unit, b: Unit) =>
          new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
      );
  }, [selectedGrade, units]);

  // Clear unit selection when grade changes
  useEffect(() => {
    setSelectedUnitId(null);
  }, [selectedGrade]);

  const handleUnitClick = (unitId: string | null) => {
    setSelectedUnitId(unitId);
  };

  // Get the selected unit object
  const selectedUnit = selectedUnitId
    ? filteredUnits.find(u => u._id === selectedUnitId) || null
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto p-6" style={{ maxWidth: "1600px" }}>
          <div className="flex justify-center items-center min-h-[400px]">
            <Spinner size="lg" variant="primary" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto p-6" style={{ maxWidth: "1600px" }}>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-600 mr-2">⚠️</div>
              <div className="text-red-800">Error: {error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (units.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto p-6" style={{ maxWidth: "1600px" }}>
          <h1 className="text-3xl font-bold mb-6">Mastery Grid</h1>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-yellow-600 mr-2">ℹ️</div>
              <div className="text-yellow-800">
                No units found in the database. Use the unit scraper to import units.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto p-6" style={{ maxWidth: "1600px" }}>
        {/* Navigation */}

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">Mastery Grid</h1>
          <p className="text-gray-600 mb-4">
            Select a grade, section, and unit to view student mastery
          </p>

          {/* Grade and Section Filters */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="grade-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Grade
              </label>
              <select
                id="grade-filter"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !selectedGrade
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-300'
                }`}
              >
                {GRADE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="section-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Class Section
              </label>
              <select
                id="section-filter"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !selectedSection
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-300'
                }`}
              >
                <option value="">Select Section</option>
                {sections.map(section => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{filteredUnits.length}</div>
              <div className="text-sm text-gray-500">Units</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-skill-target">
                {filteredUnits.reduce((sum, unit) => sum + unit.targetCount, 0)}
              </div>
              <div className="text-sm text-gray-500">Target Skills</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-skill-essential">
                {filteredUnits.reduce((sum, unit) => sum + unit.supportCount, 0)}
              </div>
              <div className="text-sm text-gray-500">Essential Skills</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-skill-helpful">
                {filteredUnits.reduce((sum, unit) => sum + unit.extensionCount, 0)}
              </div>
              <div className="text-sm text-gray-500">Helpful Skills</div>
            </div>
          </div>
        </div>

        {/* Dynamic Layout: Unit List + Student Grid View */}
        <div className="flex gap-6">
          {/* Left Column: Unit List (compact when student grid view) */}
          <div className={`${studentGridView ? 'w-20' : 'w-2/5'} bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden transition-all duration-300`}>
            <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-4 py-3 z-10">
              <h3 className={`font-semibold text-gray-900 ${studentGridView ? 'text-center text-xs' : ''}`}>
                {studentGridView ? 'Units' : 'Units'}
              </h3>
            </div>
            <div className="overflow-y-auto">
              {filteredUnits.length === 0 ? (
                <div className={`p-8 text-center text-gray-500 ${studentGridView ? 'p-4' : ''}`}>
                  {selectedGrade === "" ? (
                    <>
                      <AcademicCapIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      {!studentGridView && <div className="text-sm">Select a grade to view units</div>}
                    </>
                  ) : (
                    <>
                      <BookOpenIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      {!studentGridView && <div className="text-sm">No units found for this grade</div>}
                    </>
                  )}
                </div>
              ) : (
                <>
                  {filteredUnits.map((unit) => (
                    <UnitListItem
                      key={unit._id}
                      unit={unit}
                      isSelected={selectedUnitId === unit._id}
                      onClick={() => handleUnitClick(unit._id)}
                      compact={studentGridView}
                    />
                  ))}
                  {/* All Units Option */}
                  {studentGridView ? (
                    <div
                      onClick={() => handleUnitClick(null)}
                      className={`p-3 border-b border-gray-200 cursor-pointer transition-all flex items-center justify-center ${
                        selectedUnitId === null
                          ? 'bg-blue-50 border-l-4 border-l-blue-600'
                          : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                      }`}
                      title="All Units"
                    >
                      <span className={`inline-flex items-center justify-center px-2 py-1 rounded ${
                        selectedUnitId === null ? 'bg-blue-700' : 'bg-blue-600'
                      } text-white font-bold text-xs whitespace-nowrap`}>
                        All
                      </span>
                    </div>
                  ) : (
                    <div
                      onClick={() => handleUnitClick(null)}
                      className={`p-4 border-b border-gray-200 cursor-pointer transition-colors ${
                        selectedUnitId === null
                          ? 'bg-blue-50 border-l-4 border-l-blue-600'
                          : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center justify-center px-2 py-1 rounded ${
                          selectedUnitId === null ? 'bg-blue-700' : 'bg-blue-600'
                        } text-white font-bold text-xs flex-shrink-0 whitespace-nowrap`}>
                          All Units
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Middle Column: Student Grid View */}
          <div className={`${studentGridView ? 'w-[calc(100%-5rem-1.5rem)]' : 'w-3/5'} transition-all duration-300`}>
            {studentGridView && selectedSection ? (
              selectedUnitId === null ? (
                <AllUnitsGridView
                  units={filteredUnits}
                  selectedSection={selectedSection}
                  selectedGrade={selectedGrade}
                />
              ) : (
                <StudentGridView
                  unit={selectedUnit}
                  selectedStudents={[]}
                  selectedSection={selectedSection}
                />
              )
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
                <div className="text-gray-400 text-lg mb-2">👥</div>
                <div className="text-gray-600">
                  {!selectedSection ? "Select a class section to view mastery grid" : "Select a unit to view mastery grid"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
