"use client";

import { useState, useEffect } from "react";
import { Student } from "@zod-schema/313/student";
import { fetchStudents } from "@actions/313/students";

interface StudentFilterProps {
  onStudentSelect: (student: Student | null) => void;
  selectedStudent: Student | null;
}

export function StudentFilter({ onStudentSelect, selectedStudent }: StudentFilterProps) {
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="relative">
      <select
        value={selectedStudent?._id || ""}
        onChange={(e) => {
          const student = allStudents.find(s => s._id === e.target.value);
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
        {allStudents.map(student => (
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
  );
}
