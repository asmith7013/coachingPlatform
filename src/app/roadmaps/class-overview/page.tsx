"use client";

import { useState, useEffect, useMemo } from "react";
import { getRoadmapUnits } from "@/app/actions/313/roadmaps-units";
import { fetchRoadmapsSkillsByNumbers } from "@/app/actions/313/roadmaps-skills";
import { RoadmapUnit } from "@zod-schema/313/roadmap-unit";
import { Student } from "@zod-schema/313/student";
import { RoadmapsSkill } from "@zod-schema/313/roadmap-skill";
import { StudentFilter } from "../scope-and-sequence/components/StudentFilter";
import { RoadmapsNav } from "../components/RoadmapsNav";
import { OverviewTable } from "./components/OverviewTable";

const GRADE_OPTIONS = [
  { value: "", label: "Select Grade" },
  { value: "Illustrative Math New York - 4th Grade", label: "4th Grade" },
  { value: "Illustrative Math New York - 5th Grade", label: "5th Grade" },
  { value: "Illustrative Math New York - 6th Grade", label: "6th Grade" },
  { value: "Illustrative Math New York - 7th Grade", label: "7th Grade" },
  { value: "Illustrative Math New York - 8th Grade", label: "8th Grade" },
  { value: "Illustrative Math New York - Algebra 1", label: "Algebra 1" },
];

export default function ClassOverviewPage() {
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [units, setUnits] = useState<RoadmapUnit[]>([]);
  const [skills, setSkills] = useState<RoadmapsSkill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load units when grade changes
  useEffect(() => {
    if (!selectedGrade) {
      setUnits([]);
      setSkills([]);
      return;
    }

    const loadUnits = async () => {
      try {
        setLoading(true);
        setError(null);

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

          // Filter by selected grade and sort by unit number
          const filteredUnits = unitsWithStringIds
            .filter(unit => unit.grade === selectedGrade)
            .sort((a, b) => (a.unitNumber ?? 0) - (b.unitNumber ?? 0));

          setUnits(filteredUnits);

          // Fetch all target skills
          const allTargetSkills = Array.from(
            new Set(filteredUnits.flatMap(unit => unit.targetSkills))
          );

          if (allTargetSkills.length > 0) {
            const skillsResult = await fetchRoadmapsSkillsByNumbers(allTargetSkills);
            if (skillsResult.success && skillsResult.data) {
              setSkills(skillsResult.data as RoadmapsSkill[]);
            }
          }
        } else {
          setError(result.error || "Failed to load units");
        }
      } catch (err) {
        setError('Failed to load data');
        console.error('Error loading units:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUnits();
  }, [selectedGrade]);

  // Process support skills grouped by grade band
  const supportSkillsByGrade = useMemo(() => {
    const grouped: Record<string, Array<{ skill: string; units: number[] }>> = {};

    units.forEach(unit => {
      if (unit.additionalSupportSkills && unit.additionalSupportSkills.length > 0) {
        unit.additionalSupportSkills.forEach(skillNumber => {
          // Determine grade band from skill metadata or number range
          // For now, we'll need to fetch the skill details to get the actual grade
          // This is a simplified version - you may need to fetch skill details
          const gradeBand = "Support Skills"; // Placeholder

          if (!grouped[gradeBand]) {
            grouped[gradeBand] = [];
          }

          const existing = grouped[gradeBand].find(s => s.skill === skillNumber);
          if (existing) {
            if (unit.unitNumber !== undefined && !existing.units.includes(unit.unitNumber)) {
              existing.units.push(unit.unitNumber);
            }
          } else {
            grouped[gradeBand].push({
              skill: skillNumber,
              units: unit.unitNumber !== undefined ? [unit.unitNumber] : []
            });
          }
        });
      }
    });

    return grouped;
  }, [units]);

  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGrade(e.target.value);
    setSelectedStudent(null);
    setSelectedStudents([]);
  };

  const handleStudentSelect = (student: Student | null) => {
    setSelectedStudent(student);
    if (student) {
      setSelectedStudents([student]);
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSectionSelect = (section: string) => {
    setSelectedSection(section);
  };

  const handleStudentsSelect = (students: Student[]) => {
    setSelectedStudents(students);
    setSelectedStudent(students.length === 1 ? students[0] : null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-6">
          <RoadmapsNav />
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-gray-600">Loading overview...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <RoadmapsNav />

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4">Class Overview</h1>

          <div className="grid grid-cols-2 gap-4">
            {/* Grade Selection */}
            <div>
              <label htmlFor="grade-select" className="block text-sm font-medium text-gray-700 mb-2">
                Select Grade
              </label>
              <select
                id="grade-select"
                value={selectedGrade}
                onChange={handleGradeChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !selectedGrade
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-300'
                }`}
              >
                {GRADE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Student/Section Filter */}
            <div>
              <StudentFilter
                selectedStudent={selectedStudent}
                onStudentSelect={handleStudentSelect}
                onSectionSelect={handleSectionSelect}
                selectedStudents={selectedStudents}
                onStudentsSelect={handleStudentsSelect}
                multiSelect={true}
                maxStudents={20}
              />
            </div>
          </div>
        </div>

        {/* Overview Table */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!selectedGrade ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 text-lg mb-2">📊</div>
            <div className="text-gray-600">Select a grade to view class overview</div>
          </div>
        ) : units.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 text-lg mb-2">📭</div>
            <div className="text-gray-600">No units found for this grade</div>
          </div>
        ) : (
          <OverviewTable
            units={units}
            skills={skills}
            supportSkillsByGrade={supportSkillsByGrade}
            selectedStudent={selectedStudent}
            selectedStudents={selectedStudents}
            selectedSection={selectedSection}
          />
        )}
      </div>
    </div>
  );
}
