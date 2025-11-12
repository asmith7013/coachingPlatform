"use client";

import { useState, useEffect } from "react";
import { RoadmapsNav } from "../components/RoadmapsNav";
import { fetchStudentAssessments, getAssessmentDateRange } from "@/app/actions/313/student-assessments";
import { fetchStudents } from "@/app/actions/313/students";
import { Student } from "@zod-schema/313/student";
import { Sections313 } from "@/lib/schema/enum/313";
import { useAssessmentScraper } from "../assessment-scraper/hooks/useAssessmentScraper";

type AssessmentRow = {
  studentId: string;
  studentName: string;
  section: string;
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

const SECTION_OPTIONS: Array<{ value: string; label: string; grade?: string }> = [
  { value: "", label: "All Sections" },
  ...Sections313
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || '0');
      const numB = parseInt(b.match(/\d+/)?.[0] || '0');
      return numA - numB;
    })
    .map(section => {
      const firstChar = section.charAt(0);
      let grade = '';
      if (firstChar === '6') grade = 'Grade 6';
      else if (firstChar === '7') grade = 'Grade 7';
      else if (firstChar === '8') grade = 'Grade 8';
      return { value: section, label: section, grade };
    })
];

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "All Statuses" },
  { value: "Mastered", label: "✅ Mastered" },
  { value: "Attempted But Not Mastered", label: "⏳ Attempted But Not Mastered" }
];

export default function AssessmentHistoryPage() {
  const [data, setData] = useState<AssessmentRow[]>([]);
  const [filteredData, setFilteredData] = useState<AssessmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Assessment scraper hook
  const {
    isLoading: isScraping,
    scrapeAndUpdateBatch
  } = useAssessmentScraper();

  // Filters
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>(""); // Show all statuses by default
  const [startDate, setStartDate] = useState<string>(''); // No start date filter by default
  const [endDate, setEndDate] = useState<string>(''); // Will be set to today
  const [_availableDates, setAvailableDates] = useState<string[]>([]);
  const [_studentsBySection, setStudentsBySection] = useState<Map<string, Set<string>>>(new Map());

  // Set end date to today (in local timezone)
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    setEndDate(`${year}-${month}-${day}`);
  }, []);

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

  // Load date range (for reference, not needed for filtering anymore)
  useEffect(() => {
    const loadDateRange = async () => {
      try {
        const result = await getAssessmentDateRange();
        if (result.success && result.data) {
          const dates = result.data.allDates || [];
          setAvailableDates(dates);
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
        const result = await fetchStudentAssessments();

        if (result.success && result.data) {
          // Log first 3 records to see actual date format
          console.log('[History] First 3 records with dates:', (result.data as AssessmentRow[]).slice(0, 3).map(r => ({
            student: r.studentName,
            dateCompleted: r.dateCompleted,
            dateType: typeof r.dateCompleted,
            split: r.dateCompleted.split('T')[0]
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
    // Helper function to convert dateCompleted to YYYY-MM-DD format for comparison
    const toComparableDate = (dateStr: string): string => {
      // Handle format: "11/06/2025, 2:12 PM" -> "2025-11-06"
      const datePart = dateStr.split(',')[0]; // Get "11/06/2025"
      const [month, day, year] = datePart.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    };

    let filtered = [...data];

    // Hide "Not Started" status (no attempts recorded)
    filtered = filtered.filter(row => row.status !== 'Not Started');

    // Filter by status based on individual attempt pass/fail
    if (selectedStatus) {
      if (selectedStatus === 'Mastered') {
        filtered = filtered.filter(row => row.passed === true);
      } else if (selectedStatus === 'Attempted But Not Mastered') {
        filtered = filtered.filter(row => row.passed === false);
      }
    }

    // Filter by section - use the section field directly from the row
    if (selectedSection) {
      filtered = filtered.filter(row => row.section === selectedSection);
    }

    // Filter by date range
    if (startDate && endDate) {
      filtered = filtered.filter(row => {
        const dateStr = toComparableDate(row.dateCompleted);
        return dateStr >= startDate && dateStr <= endDate;
      });
    } else if (startDate) {
      filtered = filtered.filter(row => {
        const dateStr = toComparableDate(row.dateCompleted);
        return dateStr >= startDate;
      });
    } else if (endDate) {
      filtered = filtered.filter(row => {
        const dateStr = toComparableDate(row.dateCompleted);
        return dateStr <= endDate;
      });
    }

    // Sort by most recent date first
    filtered.sort((a, b) => {
      const dateA = new Date(a.dateCompleted).getTime();
      const dateB = new Date(b.dateCompleted).getTime();
      return dateB - dateA; // Descending order (most recent first)
    });

    setFilteredData(filtered);
  }, [data, selectedSection, selectedStatus, startDate, endDate]);

  // Calculate summary statistics
  const totalAttempts = filteredData.length;
  const masteredAttempts = filteredData.filter(row => row.passed).length;
  const masteryPercentage = totalAttempts > 0 ? (masteredAttempts / totalAttempts) * 100 : 0;

  // Handle scrape all sections
  const handleScrapeAll = async () => {
    await scrapeAndUpdateBatch({
      email: 'alex.smith@teachinglab.org',
      password: 'rbx1KQD3fpv7qhd!erc'
    });
    // Reload data after scraping
    const result = await fetchStudentAssessments();
    if (result.success && result.data) {
      setData(result.data as AssessmentRow[]);
      setFilteredData(result.data as AssessmentRow[]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 max-w-7xl">
        <RoadmapsNav />

        {/* Title and Summary Statistics */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* Title */}
          <div className="bg-white rounded-lg shadow-sm p-8 flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">📜</span>
              <h1 className="text-4xl font-bold text-gray-900">Assessment History</h1>
            </div>
            <p className="text-gray-600">View all student assessment attempts and progress.</p>
          </div>

          {/* Total Skills Mastered */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm p-6 border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-700 uppercase tracking-wide mb-1">
                  Total Skills Mastered
                </p>
                <p className="text-3xl font-bold text-green-900">
                  {masteredAttempts.toLocaleString()}
                </p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>

          {/* Mastery Percentage */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-1">
                  Mastery Rate
                </p>
                <p className="text-3xl font-bold text-blue-900">
                  {masteryPercentage.toFixed(1)}%
                </p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
            {/* Progress Bar */}
            <div className="mt-3">
              <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${masteryPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <button
                onClick={handleScrapeAll}
                disabled={isScraping}
                className={`
                  px-4 py-2 rounded-lg font-medium text-white text-sm
                  transition-all duration-200
                  ${isScraping
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg'
                  }
                `}
              >
                {isScraping ? 'Updating...' : '🔄 Update Assessment Data'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  {SECTION_OPTIONS.map(option => {
                    if (option.value === '') {
                      return (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      );
                    }

                    // Check if this is the first section of a grade
                    const currentIndex = SECTION_OPTIONS.indexOf(option);
                    const prevOption = SECTION_OPTIONS[currentIndex - 1];
                    const isFirstOfGrade = !prevOption || prevOption.grade !== option.grade;

                    if (isFirstOfGrade && option.grade) {
                      // Render optgroup header
                      const gradeOptions = SECTION_OPTIONS.filter(opt => opt.grade === option.grade);
                      return (
                        <optgroup key={option.grade} label={option.grade}>
                          {gradeOptions.map(gradeOpt => (
                            <option key={gradeOpt.value} value={gradeOpt.value}>
                              {gradeOpt.label}
                            </option>
                          ))}
                        </optgroup>
                      );
                    }

                    // Skip if already rendered in optgroup
                    return null;
                  })}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* End Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredData.length.toLocaleString()} of {data.length.toLocaleString()} records
            </div>
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
                      Section
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
                      <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                        No assessment data found
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {row.studentName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {row.section}
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
                            row.passed
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {row.passed ? '✅ Mastered' : '⏳ Attempted But Not Mastered'}
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
