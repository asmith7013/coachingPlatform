"use client";

import { useState, useEffect } from "react";
import { RoadmapsNav } from "../components/RoadmapsNav";
import { fetchStudentAssessmentData, getAssessmentDateRange } from "@/app/actions/313/roadmaps-student-data";
import { fetchStudents } from "@/app/actions/313/students";
import { Student } from "@zod-schema/313/student";
import { Sections313 } from "@/lib/schema/enum/313";

type AssessmentRow = {
  studentId: string;
  studentName: string;
  schoolId: string;
  assessmentDate: string;
  skillCode: string;
  skillName: string;
  skillGrade: string;
  unit: string;
  status: string;
  attemptNumber: number;
  dateCompleted: string;
  score: string;
  passed: boolean;
};

const SECTION_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "All Sections" },
  ...Sections313.map(section => ({ value: section, label: section }))
];

export default function AssessmentHistoryPage() {
  const [data, setData] = useState<AssessmentRow[]>([]);
  const [filteredData, setFilteredData] = useState<AssessmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [studentsBySection, setStudentsBySection] = useState<Map<string, Set<string>>>(new Map());

  // Load students to map sections
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
          const sectionMap = new Map<string, Set<string>>();

          (result.items as Student[]).forEach(student => {
            console.log('[History] Student:', {
              studentID: student.studentID,
              section: student.section,
              name: `${student.firstName} ${student.lastName}`
            });
            if (!sectionMap.has(student.section)) {
              sectionMap.set(student.section, new Set());
            }
            sectionMap.get(student.section)!.add(student.studentID.toString());
          });

          console.log('[History] Section map:', Object.fromEntries(
            Array.from(sectionMap.entries()).map(([section, ids]) => [section, Array.from(ids)])
          ));
          setStudentsBySection(sectionMap);
        }
      } catch (err) {
        console.error('Error loading students:', err);
      }
    };

    loadStudents();
  }, []);

  // Load date range
  useEffect(() => {
    const loadDateRange = async () => {
      try {
        const result = await getAssessmentDateRange();
        if (result.success && result.data) {
          const dates = result.data.allDates || [];
          setAvailableDates(dates);
          // Select all dates by default
          setSelectedDates(new Set(dates));
        }
      } catch (err) {
        console.error('Error loading date range:', err);
      }
    };

    loadDateRange();
  }, []);

  // Load assessment data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchStudentAssessmentData({});

        if (result.success && result.data) {
          console.log('[History] Sample assessment rows:', (result.data as AssessmentRow[]).slice(0, 5).map(row => ({
            studentId: row.studentId,
            studentName: row.studentName,
            skillCode: row.skillCode
          })));
          setData(result.data as AssessmentRow[]);
          setFilteredData(result.data as AssessmentRow[]);
        } else {
          setError(result.error || "Failed to load assessment data");
        }
      } catch (err) {
        setError('Failed to load assessment data');
        console.error('Error loading assessment data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...data];

    // Hide "Not Started" status
    filtered = filtered.filter(row => row.status !== 'Not Started');

    // Filter by section - match students in the selected section
    if (selectedSection) {
      const studentIdsInSection = studentsBySection.get(selectedSection);
      console.log('[History] Filtering by section:', selectedSection);
      console.log('[History] Student IDs in section:', studentIdsInSection ? Array.from(studentIdsInSection) : 'none');
      console.log('[History] Sample studentIds from data:', filtered.slice(0, 5).map(r => r.studentId));
      if (studentIdsInSection) {
        filtered = filtered.filter(row => studentIdsInSection.has(row.studentId));
        console.log('[History] Filtered count:', filtered.length);
      }
    }

    // Filter by selected dates
    if (selectedDates.size > 0 && selectedDates.size < availableDates.length) {
      filtered = filtered.filter(row => {
        const dateStr = row.dateCompleted.split('T')[0];
        return selectedDates.has(dateStr);
      });
    }

    // Sort by most recent date first
    filtered.sort((a, b) => {
      const dateA = new Date(a.dateCompleted).getTime();
      const dateB = new Date(b.dateCompleted).getTime();
      return dateB - dateA; // Descending order (most recent first)
    });

    setFilteredData(filtered);
  }, [data, selectedSection, selectedDates, studentsBySection, availableDates.length]);

  const toggleDate = (date: string) => {
    setSelectedDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  const toggleAllDates = () => {
    if (selectedDates.size === availableDates.length) {
      setSelectedDates(new Set());
    } else {
      setSelectedDates(new Set(availableDates));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 max-w-7xl">
        <RoadmapsNav />

        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">📜</span>
            <h1 className="text-4xl font-bold text-gray-900">Assessment History</h1>
          </div>
          <p className="text-gray-600">View all student assessment attempts and progress.</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Section Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {SECTION_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dates
                <button
                  onClick={toggleAllDates}
                  className="ml-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  ({selectedDates.size === availableDates.length ? 'Deselect' : 'Select'} All)
                </button>
              </label>
              <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2">
                {availableDates.map(date => (
                  <label key={date} className="flex items-center gap-2 p-1 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedDates.has(date)}
                      onChange={() => toggleDate(date)}
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm">{new Date(date).toLocaleDateString()}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredData.length.toLocaleString()} of {data.length.toLocaleString()} records
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="text-gray-500">Loading assessment data...</div>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              Error: {error}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Skill
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Skill Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Unit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attempt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                        No assessment data found
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {row.studentName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {row.skillName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {row.skillCode}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-32">
                          <div className="break-words">{row.unit || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {row.attemptNumber || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {row.dateCompleted ? new Date(row.dateCompleted).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`font-medium ${
                            row.passed ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {row.score}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            row.status === 'Demonstrated'
                              ? 'bg-green-100 text-green-800'
                              : row.status === 'Attempted But Not Passed'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
