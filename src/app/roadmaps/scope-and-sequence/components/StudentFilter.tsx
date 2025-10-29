"use client";

import { useState, useEffect } from "react";
import { Student } from "@zod-schema/313/student";
import { fetchStudents } from "@actions/313/students";

interface StudentFilterProps {
  onStudentSelect: (student: Student | null) => void;
  selectedStudent: Student | null;
  onSectionSelect?: (section: string) => void;
}

export function StudentFilter({ onStudentSelect, selectedStudent, onSectionSelect }: StudentFilterProps) {
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>("");

  // Load all students on mount
  useEffect(() => {
    loadStudents();
  }, []);

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
        searchFields: []
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
    onStudentSelect(student);
  };

  const handleClear = () => {
    onStudentSelect(null);
  };

  // Get unique sections from all students
  const uniqueSections = Array.from(new Set(allStudents.map(s => s.section))).sort();

  // Filter students by selected section
  const filteredStudents = selectedSection
    ? allStudents.filter(s => s.section === selectedSection)
    : allStudents;

  return (
    <div className="relative space-y-3">
      {/* Section Filter */}
      <div>
        <label htmlFor="section-filter" className="block text-xs font-medium text-gray-700 mb-1">
          Filter by Section
        </label>
        <select
          id="section-filter"
          value={selectedSection}
          onChange={(e) => {
            setSelectedSection(e.target.value);
            // Clear student selection when section changes
            onStudentSelect(null);
            // Notify parent of section change
            if (onSectionSelect) {
              onSectionSelect(e.target.value);
            }
          }}
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
        >
          <option value="">All Sections</option>
          {uniqueSections.map(section => (
            <option key={section} value={section}>
              {section}
            </option>
          ))}
        </select>
      </div>

      {/* Student Filter */}
      <div>
        <label htmlFor="student-filter" className="block text-xs font-medium text-gray-700 mb-1">
          Select Student
        </label>
        <select
          id="student-filter"
          value={selectedStudent?._id || ""}
          onChange={(e) => {
            const student = filteredStudents.find(s => s._id === e.target.value);
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
          {filteredStudents.map(student => (
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
      </div>
    </div>
  );
}
