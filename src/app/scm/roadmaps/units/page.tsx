"use client";

import { useState, useEffect } from "react";
import { getRoadmapUnits } from "@/app/actions/313/roadmaps-units";
import { RoadmapUnit } from "@zod-schema/313/roadmap-unit";
import { Student } from "@zod-schema/313/student";
import { UnitListItem } from "./components/UnitListItem";
import { UnitDetailView } from "./components/UnitDetailView";
import { StudentFilter } from "../scope-and-sequence/components/StudentFilter";
import { SkillDetailWrapper } from "../components/SkillDetailWrapper";
import { RoadmapsSkill } from "@zod-schema/313/roadmap-skill";
import { fetchRoadmapsSkillsByNumbers } from "@/app/actions/313/roadmaps-skills";
import { Spinner } from "@/components/core/feedback/Spinner";

const GRADE_OPTIONS = [
  { value: "", label: "Select Grade" },
  { value: "Illustrative Math New York - 4th Grade", label: "4th Grade" },
  { value: "Illustrative Math New York - 5th Grade", label: "5th Grade" },
  { value: "Illustrative Math New York - 6th Grade", label: "6th Grade" },
  { value: "Illustrative Math New York - 7th Grade", label: "7th Grade" },
  { value: "Illustrative Math New York - 8th Grade", label: "8th Grade" },
  { value: "Illustrative Math New York - Algebra 1", label: "Algebra 1" },
];

export default function RoadmapUnitsPage() {
  const [units, setUnits] = useState<RoadmapUnit[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<RoadmapUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedSkill, setSelectedSkill] = useState<RoadmapsSkill | null>(null);
  const [selectedSkillColor, setSelectedSkillColor] = useState<'blue' | 'green' | 'orange' | 'purple'>('green');

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

  const handleUnitClick = (unitId: string) => {
    setSelectedUnitId(unitId);
    setSelectedSkill(null); // Clear skill selection when unit changes
  };

  const handleSkillClick = async (skillNumber: string, color: 'blue' | 'green' | 'orange' | 'purple') => {
    setSelectedSkillColor(color);
    try {
      const result = await fetchRoadmapsSkillsByNumbers([skillNumber]);
      if (result.success && result.data && result.data.length > 0) {
        setSelectedSkill(result.data[0]);
      } else {
        // Show not found skill
        setSelectedSkill({
          skillNumber,
          notFound: true,
        } as unknown as RoadmapsSkill);
      }
    } catch (error) {
      console.error('Error fetching skill:', error);
      setSelectedSkill({
        skillNumber,
        notFound: true,
      } as unknown as RoadmapsSkill);
    }
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
          <h1 className="text-3xl font-bold mb-6">Roadmap Units</h1>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Card: Title + Grade Filter + Stats */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-3xl font-bold mb-2">Roadmap Units</h1>
            <p className="text-gray-600 mb-4">
              Select a grade and unit to view lessons
            </p>

            {/* Grade Filter */}
            <div className="mb-6">
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

          {/* Right Card: Section & Student Filter */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm p-6">
            <div className={selectedGrade === "" ? "opacity-50 pointer-events-none" : ""}>
              <StudentFilter
                onStudentSelect={setSelectedStudent}
                selectedStudent={selectedStudent}
                onSectionSelect={setSelectedSection}
                multiSelect={true}
                onStudentsSelect={setSelectedStudents}
                selectedStudents={selectedStudents}
                maxStudents={5}
              />
            </div>
          </div>
        </div>

        {/* Dynamic Layout: Unit List + Unit Detail (+ Skill Detail when skill selected) */}
        <div className="flex gap-6">
          {/* Left Column: Unit List (compact when skill selected, expanded when not) */}
          <div className={`${selectedSkill ? 'w-20' : 'w-2/5'} bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden transition-all duration-300`}>
            <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-4 py-3 z-10">
              <h3 className={`font-semibold text-gray-900 ${selectedSkill ? 'text-center text-xs' : ''}`}>
                Units
              </h3>
            </div>
            <div className="overflow-y-auto">
              {filteredUnits.length === 0 ? (
                <div className={`p-8 text-center text-gray-500 ${selectedSkill ? 'p-4' : ''}`}>
                  {selectedGrade === "" ? (
                    <>
                      <div className="text-gray-400 text-lg mb-2">🎓</div>
                      {!selectedSkill && <div className="text-sm">Select a grade to view units</div>}
                    </>
                  ) : (
                    <>
                      <div className="text-gray-400 text-lg mb-2">📚</div>
                      {!selectedSkill && <div className="text-sm">No units found for this grade</div>}
                    </>
                  )}
                </div>
              ) : (
                filteredUnits.map((unit) => (
                  <UnitListItem
                    key={unit._id}
                    unit={unit}
                    isSelected={selectedUnitId === unit._id}
                    onClick={() => handleUnitClick(unit._id)}
                    compact={selectedSkill !== null}
                  />
                ))
              )}
            </div>
          </div>

          {/* Middle Column: Unit Detail View */}
          <div className={`${selectedSkill ? 'w-2/5' : 'w-3/5'} transition-all duration-300`}>
            <UnitDetailView
              unit={selectedUnit}
              selectedSection={selectedSection}
              onSkillClick={handleSkillClick}
              selectedStudents={selectedStudents}
            />
          </div>

          {/* Right Column: Skill Detail View (expands to use space from compressed left column) */}
          {selectedSkill && (
            <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden transition-all duration-300">
              <SkillDetailWrapper
                skill={selectedSkill}
                color={selectedSkillColor}
                onSkillClick={handleSkillClick}
                masteredSkills={selectedStudent?.masteredSkills || []}
                showHeader={true}
                onClose={() => setSelectedSkill(null)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
