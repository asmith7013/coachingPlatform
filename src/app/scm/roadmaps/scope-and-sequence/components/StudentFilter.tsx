"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Student } from "@zod-schema/scm/student/student";
import { fetchStudents } from "@actions/scm/student/students";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { SECTION_ROADMAP_CONFIG, Roadmaps313Type } from "@schema/enum/scm";

interface StudentFilterProps {
  onStudentSelect: (student: Student | null) => void;
  selectedStudent: Student | null;
  onSectionSelect?: (section: string) => void;
  onStudentsSelect?: (students: Student[]) => void;
  selectedStudents?: Student[];
  multiSelect?: boolean;
  maxStudents?: number;
  /** Filter sections to only show those matching this curriculum */
  scopeSequenceTag?: string;
}

/**
 * Map scope sequence tags to roadmap names for filtering
 */
function getScopeSectionsForTag(scopeSequenceTag: string): string[] {
  // Map scope sequence tags to full roadmap names
  const tagToRoadmap: Record<string, Roadmaps313Type> = {
    "Grade 6": "Illustrative Math New York - 6th Grade",
    "Grade 7": "Illustrative Math New York - 7th Grade",
    "Grade 8": "Illustrative Math New York - 8th Grade",
    "Algebra 1": "Illustrative Math New York - Algebra 1",
  };

  const roadmapName = tagToRoadmap[scopeSequenceTag];
  if (!roadmapName) return [];

  // Find all sections that have this roadmap (primary or secondary)
  return SECTION_ROADMAP_CONFIG.filter((config) =>
    config.roadmaps.some((r) => r.roadmapName === roadmapName),
  ).map((config) => config.section);
}

export function StudentFilter({
  onStudentSelect,
  selectedStudent,
  onSectionSelect,
  onStudentsSelect,
  selectedStudents = [],
  multiSelect = false,
  maxStudents = 5,
  scopeSequenceTag,
}: StudentFilterProps) {
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get sections allowed for this curriculum (memoized to prevent unnecessary re-renders)
  const allowedSections = useMemo(
    () => (scopeSequenceTag ? getScopeSectionsForTag(scopeSequenceTag) : []),
    [scopeSequenceTag],
  );

  // Load all students on mount
  useEffect(() => {
    loadStudents();
  }, []);

  // Reset section selection when scopeSequenceTag changes
  useEffect(() => {
    // If current section is not in allowed sections, reset it
    if (
      allowedSections.length > 0 &&
      selectedSection &&
      !allowedSections.includes(selectedSection)
    ) {
      setSelectedSection("");
      // Clear student selections
      if (multiSelect && onStudentsSelect) {
        onStudentsSelect([]);
      } else {
        onStudentSelect(null);
      }
      if (onSectionSelect) {
        onSectionSelect("");
      }
    }
  }, [
    scopeSequenceTag,
    allowedSections,
    selectedSection,
    onSectionSelect,
    multiSelect,
    onStudentsSelect,
    onStudentSelect,
  ]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const response = await fetchStudents({
        page: 1,
        limit: 1000,
        sortBy: "lastName",
        sortOrder: "asc",
        filters: { active: true },
        search: "",
        searchFields: [],
      });

      if (response.success && response.items) {
        setAllStudents(response.items as Student[]);
      }
    } catch (error) {
      console.error("Error loading students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentSelect = (student: Student) => {
    if (multiSelect && onStudentsSelect) {
      // Check if student is already selected
      const isAlreadySelected = selectedStudents.some(
        (s) => s._id === student._id,
      );

      if (isAlreadySelected) {
        // Remove student
        onStudentsSelect(selectedStudents.filter((s) => s._id !== student._id));
      } else if (selectedStudents.length < maxStudents) {
        // Add student
        onStudentsSelect([...selectedStudents, student]);
      }
      // Clear search input after selection
      setSearchQuery("");
    } else {
      onStudentSelect(student);
    }
  };

  const handleClear = () => {
    if (multiSelect && onStudentsSelect) {
      onStudentsSelect([]);
    } else {
      onStudentSelect(null);
    }
  };

  const removeStudent = (studentId: string) => {
    if (multiSelect && onStudentsSelect) {
      onStudentsSelect(selectedStudents.filter((s) => s._id !== studentId));
    }
  };

  // Get unique sections from all students, filtered by allowed sections if specified
  const uniqueSections = Array.from(new Set(allStudents.map((s) => s.section)))
    .filter(
      (section) =>
        allowedSections.length === 0 || allowedSections.includes(section),
    )
    .sort();

  // Filter students by selected section
  const sectionFilteredStudents = selectedSection
    ? allStudents.filter((s) => s.section === selectedSection)
    : allStudents;

  // Further filter by search query
  const filteredStudents = searchQuery
    ? sectionFilteredStudents.filter((student) => {
        const fullName =
          `${student.firstName} ${student.lastName}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
      })
    : sectionFilteredStudents;

  return (
    <div className="relative space-y-3">
      {/* Section Filter */}
      <div>
        <label
          htmlFor="section-filter"
          className="block text-xs font-medium text-gray-700 mb-1"
        >
          Filter by Section
        </label>
        <select
          id="section-filter"
          value={selectedSection}
          onChange={(e) => {
            setSelectedSection(e.target.value);
            // Clear student selection when section changes
            handleClear();
            // Notify parent of section change
            if (onSectionSelect) {
              onSectionSelect(e.target.value);
            }
          }}
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
        >
          <option value="">All Sections</option>
          {uniqueSections.map((section) => (
            <option key={section} value={section}>
              {section}
            </option>
          ))}
        </select>
      </div>

      {/* Student Filter */}
      <div>
        <label
          htmlFor="student-filter"
          className="block text-xs font-medium text-gray-700 mb-1"
        >
          {multiSelect
            ? `Select Students (max ${maxStudents})`
            : "Select Student"}
        </label>

        {multiSelect ? (
          <>
            {/* Search input with dropdown */}
            <div className="relative" ref={dropdownRef}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Type to search students..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              {/* Multi-select filtered list */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg max-h-48 overflow-y-auto shadow-lg z-10">
                  {filteredStudents.length === 0 ? (
                    <div className="px-3 py-4 text-center text-sm text-gray-500">
                      No students found
                    </div>
                  ) : (
                    filteredStudents.map((student) => {
                      const isSelected = selectedStudents.some(
                        (s) => s._id === student._id,
                      );
                      const canSelect =
                        selectedStudents.length < maxStudents || isSelected;

                      return (
                        <div
                          key={student._id}
                          onClick={() =>
                            canSelect && handleStudentSelect(student)
                          }
                          className={`px-3 py-2 border-b border-gray-200 last:border-b-0 cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-blue-50 hover:bg-blue-100"
                              : canSelect
                                ? "hover:bg-gray-50"
                                : "opacity-50 cursor-not-allowed"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              readOnly
                              className="rounded"
                            />
                            <span className="text-sm">
                              {student.firstName} {student.lastName}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({student.section})
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Selected students chips */}
            {selectedStudents.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedStudents.map((student) => (
                  <div
                    key={student._id}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                  >
                    <span>
                      {student.firstName} {student.lastName}
                    </span>
                    <button
                      onClick={() => removeStudent(student._id)}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {selectedStudents.length > 0 && (
              <div className="mt-1 text-xs text-gray-600">
                {selectedStudents.length} student
                {selectedStudents.length !== 1 ? "s" : ""} selected
              </div>
            )}
          </>
        ) : (
          <>
            {/* Single select dropdown */}
            <select
              id="student-filter"
              value={selectedStudent?._id || ""}
              onChange={(e) => {
                const student = filteredStudents.find(
                  (s) => s._id === e.target.value,
                );
                if (student) {
                  handleStudentSelect(student);
                } else {
                  handleClear();
                }
              }}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">No Student Selected</option>
              {filteredStudents.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.firstName} {student.lastName} ({student.section})
                </option>
              ))}
            </select>

            {selectedStudent && (
              <div className="mt-1 text-xs text-gray-600">
                {selectedStudent.masteredSkills?.length || 0} skills mastered
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
