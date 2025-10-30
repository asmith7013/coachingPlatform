"use client";

import { useState, useEffect } from "react";
import { fetchRoadmapsSkills } from "@actions/313/roadmaps-skills";
import { RoadmapsSkill } from "@zod-schema/313/roadmap-skill";
import { SkillListItem } from "./components/SkillListItem";
import { SkillDetailView } from "../components/SkillDetailView";
import { Alert } from "@/components/core/feedback/Alert";

export default function RoadmapsSkillsPage() {
  const [allSkills, setAllSkills] = useState<RoadmapsSkill[]>([]); // All skills for dropdown population
  const [skills, setSkills] = useState<RoadmapsSkill[]>([]); // Currently displayed skills
  const [filteredSkills, setFilteredSkills] = useState<RoadmapsSkill[]>([]); // After search filtering
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("");

  // Load all skills once on mount for dropdown population
  useEffect(() => {
    const loadAllSkills = async () => {
      try {
        console.log('🔍 Loading all skills for filters...');
        const result = await fetchRoadmapsSkills({
          page: 1,
          limit: 10000,
          sortBy: 'skillNumber',
          sortOrder: 'asc',
          filters: {}
        });

        if (result.success && result.items) {
          const sortedSkills = (result.items as RoadmapsSkill[]).sort((a, b) => {
            const numA = parseInt(a.skillNumber) || 0;
            const numB = parseInt(b.skillNumber) || 0;
            return numA - numB;
          });
          console.log('✅ Loaded all skills for filters:', sortedSkills.length);
          setAllSkills(sortedSkills);
        }
      } catch (err) {
        console.error('💥 Error loading all skills:', err);
      }
    };

    loadAllSkills();
  }, []);

  // Load filtered skills when grade/unit changes
  useEffect(() => {
    // Don't load skills until a grade is selected
    if (!selectedGrade) {
      setSkills([]);
      setFilteredSkills([]);
      setLoading(false);
      return;
    }

    const loadSkills = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching roadmaps skills...');

        // Build filters based on selected grade and unit
        const filters: Record<string, unknown> = {
          'units.grade': selectedGrade
        };

        if (selectedUnit) {
          filters['units.unitTitle'] = selectedUnit;
        }

        const result = await fetchRoadmapsSkills({
          page: 1,
          filters,
          limit: 10000,
          sortBy: 'skillNumber',
          sortOrder: 'asc' as const
        });

        console.log('📊 Fetch result:', {
          success: result.success,
          itemsLength: result.items?.length,
          error: result.error,
          filters
        });

        if (result.success && result.items) {
          // Sort by skill number
          const sortedSkills = (result.items as RoadmapsSkill[]).sort((a, b) => {
            const numA = parseInt(a.skillNumber) || 0;
            const numB = parseInt(b.skillNumber) || 0;
            return numA - numB;
          });
          console.log('✅ Loaded and sorted skills:', sortedSkills.length);
          setSkills(sortedSkills);
          setFilteredSkills(sortedSkills);
        } else {
          console.error('❌ Failed to load skills:', result.error);
          setError(result.error || "Failed to load skills");
        }
      } catch (err) {
        console.error('💥 Exception loading skills:', err);
        setError('Failed to load skills');
      } finally {
        setLoading(false);
      }
    };

    loadSkills();
  }, [selectedGrade, selectedUnit]);

  // Filter skills when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSkills(skills);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = skills.filter(skill =>
        skill.skillNumber.toLowerCase().includes(query) ||
        skill.title.toLowerCase().includes(query)
      );
      setFilteredSkills(filtered);
    }

    // Clear selection when search changes
    setSelectedSkillId(null);
  }, [searchQuery, skills]);

  const handleSkillClick = (skillId: string) => {
    setSelectedSkillId(skillId);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGrade(e.target.value);
    setSelectedUnit(""); // Reset unit when grade changes
    setSelectedSkillId(null); // Clear selection
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUnit(e.target.value);
    setSelectedSkillId(null); // Clear selection
  };

  const handleClearFilters = () => {
    setSelectedGrade("");
    setSelectedUnit("");
    setSearchQuery("");
    setSelectedSkillId(null);
  };

  // Extract unique grades from all skills (not just filtered ones)
  const availableGrades = Array.from(
    new Set(
      allSkills.flatMap(skill =>
        skill.units.map(unit => unit.grade)
      )
    )
  ).sort();

  // Extract unique units for the selected grade
  const availableUnits = selectedGrade
    ? Array.from(
        new Set(
          allSkills
            .flatMap(skill => skill.units)
            .filter(unit => unit.grade === selectedGrade)
            .map(unit => unit.unitTitle)
        )
      ).sort()
    : [];

  // Get the selected skill object
  const selectedSkill = selectedSkillId
    ? filteredSkills.find(s => s._id === selectedSkillId) || null
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-gray-600">Loading skills...</div>
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
          <Alert intent="error">
            <Alert.Title>Error Loading Skills</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert>
        </div>
      </div>
    );
  }

  // Remove the early return for empty skills - we'll show the UI with instructions to select a grade

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="mb-4">
            <h1 className="text-3xl font-bold mb-2">Roadmaps Skills</h1>
            <p className="text-gray-600">
              {selectedGrade
                ? `Showing ${filteredSkills.length} skills`
                : 'Select a grade to view skills'}
            </p>
          </div>

          {/* Filters Row */}
          <div className="flex gap-4 items-end mb-4">
            {/* Grade Filter */}
            <div className="flex-1">
              <label htmlFor="grade-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Grade
              </label>
              <select
                id="grade-filter"
                value={selectedGrade}
                onChange={handleGradeChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Grades</option>
                {availableGrades.map(grade => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit Filter */}
            <div className="flex-1">
              <label htmlFor="unit-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Unit
              </label>
              <select
                id="unit-filter"
                value={selectedUnit}
                onChange={handleUnitChange}
                disabled={!selectedGrade}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {selectedGrade ? "All Units" : "Select a grade first"}
                </option>
                {availableUnits.map(unit => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Bar */}
            <div className="flex-1">
              <label htmlFor="skill-search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Skills
              </label>
              <div className="relative">
                <input
                  id="skill-search"
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search by skill number or name..."
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                {!searchQuery && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Clear Filters Button */}
            {(selectedGrade || selectedUnit || searchQuery) && (
              <div className="flex items-end">
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Split View Layout: Skill List (40%) + Detail View (60%) */}
        <div className="flex gap-6">
          {/* Left Column: Skill List */}
          <div className="w-2/5 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-4 py-3 z-10">
              <h3 className="font-semibold text-gray-900">
                Skills ({filteredSkills.length})
              </h3>
              {(selectedGrade || selectedUnit || searchQuery) && (
                <p className="text-xs text-gray-500 mt-1">
                  {selectedGrade && `Grade: ${selectedGrade}`}
                  {selectedUnit && ` • Unit: ${selectedUnit}`}
                  {searchQuery && ` • Search: "${searchQuery}"`}
                </p>
              )}
            </div>
            <div className="overflow-y-auto">
              {!selectedGrade ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="text-gray-400 text-lg mb-2">🎓</div>
                  <div className="text-sm">Select a grade to view skills</div>
                </div>
              ) : filteredSkills.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="text-gray-400 text-lg mb-2">🔍</div>
                  <div className="text-sm">
                    {searchQuery
                      ? 'No skills match your search'
                      : 'No skills found for this selection'}
                  </div>
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                filteredSkills.map((skill) => (
                  <SkillListItem
                    key={skill._id}
                    skill={skill}
                    isSelected={selectedSkillId === skill._id}
                    onClick={() => handleSkillClick(skill._id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Right Column: Skill Detail View */}
          <div className="w-3/5 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <SkillDetailView
              skill={selectedSkill}
              color="green"
              onSkillClick={(skillNumber) => {
                // Find and select the skill by skill number
                const skill = filteredSkills.find(s => s.skillNumber === skillNumber);
                if (skill) {
                  setSelectedSkillId(skill._id);
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
