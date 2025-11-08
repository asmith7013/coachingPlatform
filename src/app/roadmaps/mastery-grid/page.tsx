"use client";

import { useState, useEffect } from "react";
import { getRoadmapUnits } from "@/app/actions/313/roadmaps-units";
import { RoadmapUnit } from "@zod-schema/313/roadmap-unit";
import { Student } from "@zod-schema/313/student";
import { UnitListItem } from "../units/components/UnitListItem";
import { RoadmapsNav } from "../components/RoadmapsNav";
import { StudentGridView } from "../units/components/StudentGridView";
import { AllUnitsGridView } from "../units/components/AllUnitsGridView";
import { fetchStudents } from "@/app/actions/313/students";

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
  const [units, setUnits] = useState<RoadmapUnit[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<RoadmapUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [sections, setSections] = useState<string[]>([]);
  // Student grid view is hardcoded to true
  const studentGridView = true;

  useEffect(() => {
    const loadUnits = async () => {
      try {
        setLoading(true);
        const result = await getRoadmapUnits({
          successOnly: true,
          limit: 1000
        });

        if (result.success && result.data) {
          const rawUnits = Array.isArray(result.data) ? result.data : [];
          const unitsWithStringIds = rawUnits.map((unit: Record<string, unknown>): RoadmapUnit => ({
            _id: (unit._id as string)?.toString() || (unit._id as string),
            ownerIds: (unit.ownerIds as string[]) || [],
            grade: (unit.grade as string) || '',
            unitTitle: (unit.unitTitle as string) || '',
            unitNumber: (unit.unitNumber as number) || 0,
            url: (unit.url as string) || '',
            targetCount: (unit.targetCount as number) || 0,
            supportCount: (unit.supportCount as number) || 0,
            extensionCount: (unit.extensionCount as number) || 0,
            targetSkills: (unit.targetSkills as string[]) || [],
            additionalSupportSkills: (unit.additionalSupportSkills as string[]) || [],
            extensionSkills: (unit.extensionSkills as string[]) || [],
            scrapedAt: (unit.scrapedAt as string) || new Date().toISOString(),
            success: (unit.success as boolean) ?? true,
            error: unit.error as string | undefined,
            createdAt: (unit.createdAt as string) || new Date().toISOString(),
            updatedAt: (unit.updatedAt as string) || new Date().toISOString(),
          }));

          // Sort by createdAt ascending (oldest first)
          const sortedUnits = unitsWithStringIds.sort((a, b) =>
            new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
          );

          setUnits(sortedUnits);
          setFilteredUnits(sortedUnits);
        } else {
          setError(result.error || "Failed to load units");
        }
      } catch (err) {
        setError('Failed to load units');
        console.error('Error loading units:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUnits();
  }, []);

  // Load students for section selector
  useEffect(() => {
    const loadStudents = async () => {
      try {
        const result = await fetchStudents({
          page: 1,
          limit: 1000,
          sortBy: "lastName",
          sortOrder: "asc",
          filters: { active: true },
          search: "",
          searchFields: []
        });
        if (result.success && result.items) {
          const uniqueSections = Array.from(new Set((result.items as Student[]).map(s => s.section))).sort();
          setSections(uniqueSections);
        }
      } catch (err) {
        console.error('Error loading students:', err);
      }
    };
    loadStudents();
  }, []);

  // Filter units when grade selection changes and clear selected unit
  useEffect(() => {
    let filtered: RoadmapUnit[];
    if (selectedGrade === "") {
      // Show no units when "Select Grade" is chosen
      filtered = [];
    } else {
      filtered = units.filter(unit => unit.grade === selectedGrade);
    }

    // Maintain createdAt sort order
    const sorted = filtered.sort((a, b) =>
      new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
    );

    setFilteredUnits(sorted);

    // Clear selection when grade changes
    setSelectedUnitId(null);
  }, [selectedGrade, units]);

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
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-gray-600">Loading units...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-6">
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
        <div className="container mx-auto p-6">
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
      <div className="container mx-auto p-6">
        {/* Navigation */}
        <RoadmapsNav />

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
                      <div className="text-gray-400 text-lg mb-2">🎓</div>
                      {!studentGridView && <div className="text-sm">Select a grade to view units</div>}
                    </>
                  ) : (
                    <>
                      <div className="text-gray-400 text-lg mb-2">📚</div>
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
