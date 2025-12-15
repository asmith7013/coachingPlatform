"use client";

import { useState, useMemo, useRef } from "react";
import { importZearnCompletions } from "@/app/actions/scm/roadmaps/zearn-completions";
import { Sections313 } from "@/lib/schema/enum/313";
import { Spinner } from "@/components/core/feedback/Spinner";
import { Button } from "@/components/core/Button";
import { Dialog as Modal } from "@/components/composed/dialogs/Dialog";
import { CheckIcon } from "@heroicons/react/24/solid";
import {
  useAssessmentData,
  useZearnCompletions,
  usePodsieCompletions,
} from "@/hooks/scm";

const SECTION_OPTIONS: Array<{ value: string; label: string; grade?: string }> = [
  { value: "", label: "All Sections" },
  ...[...Sections313]
    .sort((a: string, b: string) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || '0');
      const numB = parseInt(b.match(/\d+/)?.[0] || '0');
      return numA - numB;
    })
    .map((section: string) => {
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
  // Data fetching with React Query hooks
  const { data, loading, error } = useAssessmentData();
  const { data: zearnData, loading: zearnLoading, error: zearnError, refetch: refetchZearn } = useZearnCompletions();
  const { data: podsieData, loading: podsieLoading, error: podsieError } = usePodsieCompletions();

  // Zearn import state
  const [showZearnImport, setShowZearnImport] = useState(false);
  const [zearnImportData, setZearnImportData] = useState("");
  const [importing, setImporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [zearnFileName, setZearnFileName] = useState("");
  const [zearnImportResult, setZearnImportResult] = useState<{
    success: boolean;
    imported: number;
    skipped: number;
    errors: string[];
  } | null>(null);
  const zearnFileInputRef = useRef<HTMLInputElement>(null);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Filters
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(getTodayDate);
  const [endDate, setEndDate] = useState<string>(getTodayDate);

  // Filter assessment data with useMemo
  const filteredData = useMemo(() => {
    // Helper function to convert dateCompleted to YYYY-MM-DD format for comparison
    const toComparableDate = (dateStr: string): string => {
      // Handle format: "11/06/2025, 2:12 PM" -> "2025-11-06"
      const datePart = dateStr.split(',')[0];
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

    // Filter by section
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
      return dateB - dateA;
    });

    return filtered;
  }, [data, selectedSection, selectedStatus, startDate, endDate]);

  // Filter Zearn data with useMemo
  const filteredZearnData = useMemo(() => {
    const toZearnComparableDate = (dateStr: string): string => {
      // Handle format: "10/30/25" -> "2025-10-30"
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const month = parts[0].padStart(2, '0');
        const day = parts[1].padStart(2, '0');
        let year = parts[2];
        if (year.length === 2) {
          year = parseInt(year, 10) < 50 ? `20${year}` : `19${year}`;
        }
        return `${year}-${month}-${day}`;
      }
      return dateStr;
    };

    let filtered = [...zearnData];

    if (selectedSection) {
      filtered = filtered.filter(row => row.section === selectedSection);
    }

    if (startDate && endDate) {
      filtered = filtered.filter(row => {
        const dateStr = toZearnComparableDate(row.completionDate);
        return dateStr >= startDate && dateStr <= endDate;
      });
    } else if (startDate) {
      filtered = filtered.filter(row => {
        const dateStr = toZearnComparableDate(row.completionDate);
        return dateStr >= startDate;
      });
    } else if (endDate) {
      filtered = filtered.filter(row => {
        const dateStr = toZearnComparableDate(row.completionDate);
        return dateStr <= endDate;
      });
    }

    return filtered;
  }, [zearnData, selectedSection, startDate, endDate]);

  // Filter Podsie data with useMemo
  const filteredPodsieData = useMemo(() => {
    const toPodsieComparableDate = (dateStr: string): string => {
      return dateStr.split('T')[0];
    };

    let filtered = [...podsieData];

    if (selectedSection) {
      filtered = filtered.filter(row => row.section === selectedSection);
    }

    if (startDate && endDate) {
      filtered = filtered.filter(row => {
        const dateStr = toPodsieComparableDate(row.completedDate);
        return dateStr >= startDate && dateStr <= endDate;
      });
    } else if (startDate) {
      filtered = filtered.filter(row => {
        const dateStr = toPodsieComparableDate(row.completedDate);
        return dateStr >= startDate;
      });
    } else if (endDate) {
      filtered = filtered.filter(row => {
        const dateStr = toPodsieComparableDate(row.completedDate);
        return dateStr <= endDate;
      });
    }

    return filtered;
  }, [podsieData, selectedSection, startDate, endDate]);

  // Calculate summary statistics
  const totalAttempts = filteredData.length;
  const masteredAttempts = filteredData.filter(row => row.passed).length;
  const masteryPercentage = totalAttempts > 0 ? (masteredAttempts / totalAttempts) * 100 : 0;

  // Calculate average score
  const scoresWithValues = filteredData
    .map(row => parseFloat(row.score))
    .filter(score => !isNaN(score));
  const averageScore = scoresWithValues.length > 0
    ? scoresWithValues.reduce((sum, score) => sum + score, 0) / scoresWithValues.length
    : 0;

  // Handle scrape all sections (commented out - scraper runs via GitHub Actions)
  // const handleScrapeAll = async () => {
  //   await scrapeAndUpdateBatch({
  //     email: 'alex.smith@teachinglab.org',
  //     password: 'rbx1KQD3fpv7qhd!erc'
  //   });
  //   // Reload data after scraping
  //   const result = await fetchStudentAssessments();
  //   if (result.success && result.data) {
  //     setData(result.data as AssessmentRow[]);
  //     setFilteredData(result.data as AssessmentRow[]);
  //   }
  // };

  // Handle Zearn file upload
  const handleZearnFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setZearnFileName(file.name);
    setZearnImportResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      // Convert CSV commas to tabs if needed (handle both formats)
      const lines = text.split('\n');
      const processedLines = lines.map(line => {
        // If line has more commas than tabs, it's likely CSV format
        const commaCount = (line.match(/,/g) || []).length;
        const tabCount = (line.match(/\t/g) || []).length;
        if (commaCount > tabCount && commaCount >= 8) {
          // Convert CSV to TSV, handling quoted fields
          return line.replace(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/g, '\t').replace(/"/g, '');
        }
        return line;
      });
      setZearnImportData(processedLines.join('\n'));
    };
    reader.readAsText(file);
  };

  // Handle Zearn import
  const handleZearnImport = async () => {
    if (!zearnImportData.trim()) return;

    setImporting(true);
    setZearnImportResult(null);

    try {
      const result = await importZearnCompletions(zearnImportData);
      if (result.success) {
        setZearnImportResult({
          success: true,
          imported: result.data.imported,
          skipped: result.data.skipped,
          errors: result.data.errors
        });

        // Clear on success
        if (result.data.imported > 0) {
          setZearnImportData("");
          setZearnFileName("");
          if (zearnFileInputRef.current) {
            zearnFileInputRef.current.value = "";
          }
        }

        // Reload Zearn data
        refetchZearn();
      } else {
        setZearnImportResult({
          success: false,
          imported: 0,
          skipped: 0,
          errors: [result.error || "Import failed"]
        });
      }
    } catch (err) {
      setZearnImportResult({
        success: false,
        imported: 0,
        skipped: 0,
        errors: [err instanceof Error ? err.message : "Unknown error"]
      });
    } finally {
      setImporting(false);
    }
  };

  // Handle closing the Zearn import modal
  const handleCloseZearnImport = () => {
    setShowZearnImport(false);
    setZearnImportData("");
    setZearnFileName("");
    setZearnImportResult(null);
    if (zearnFileInputRef.current) {
      zearnFileInputRef.current.value = "";
    }
  };

  // Copy shoutouts to clipboard
  const handleCopyShoutouts = async () => {
    // Group by student first name
    const studentCounts = new Map<string, { zearn: number; roadmaps: number; podsie: number }>();

    // Count Zearn completions (from filtered data)
    for (const row of filteredZearnData) {
      // Extract first name from "LastName, FirstName" format
      const firstName = row.studentName.split(', ')[1] || row.studentName;
      const current = studentCounts.get(firstName) || { zearn: 0, roadmaps: 0, podsie: 0 };
      current.zearn++;
      studentCounts.set(firstName, current);
    }

    // Count Roadmaps mastery (only passed/mastered from filtered data)
    for (const row of filteredData) {
      if (row.passed) {
        const firstName = row.studentName.split(', ')[1] || row.studentName;
        const current = studentCounts.get(firstName) || { zearn: 0, roadmaps: 0, podsie: 0 };
        current.roadmaps++;
        studentCounts.set(firstName, current);
      }
    }

    // Count Podsie completions (from filtered data)
    for (const row of filteredPodsieData) {
      // Extract first name from "LastName, FirstName" format
      const firstName = row.studentName.split(', ')[1] || row.studentName;
      const current = studentCounts.get(firstName) || { zearn: 0, roadmaps: 0, podsie: 0 };
      current.podsie++;
      studentCounts.set(firstName, current);
    }

    // Format as bullet points
    const lines: string[] = [];
    const sortedStudents = Array.from(studentCounts.entries()).sort((a, b) =>
      a[0].localeCompare(b[0])
    );

    for (const [firstName, counts] of sortedStudents) {
      const parts: string[] = [];

      if (counts.zearn > 0) {
        parts.push(counts.zearn > 1 ? `🆉 (${counts.zearn}x)` : '🆉');
      }

      if (counts.roadmaps > 0) {
        parts.push(counts.roadmaps > 1 ? `📍 (${counts.roadmaps}x)` : '📍');
      }

      if (counts.podsie > 0) {
        parts.push(counts.podsie > 1 ? `🅿️ (${counts.podsie}x)` : '🅿️');
      }

      if (parts.length > 0) {
        lines.push(`${firstName} ${parts.join(', ')}`);
      }
    }

    const text = lines.join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto p-6" style={{ maxWidth: "1600px" }}>

        {/* Title */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">📜</span>
            <h1 className="text-4xl font-bold text-gray-900">Assessment History</h1>
          </div>
          <p className="text-gray-600">View all student assessment attempts and progress.</p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              {startDate === endDate && (
                <Button
                  onClick={handleCopyShoutouts}
                  disabled={filteredData.length === 0 && filteredZearnData.length === 0 && filteredPodsieData.length === 0}
                  intent={copied ? "success" : "secondary"}
                  appearance="solid"
                  textSize="sm"
                  padding="md"
                >
                  {copied ? "✓ Copied!" : "📋 Copy Shoutouts"}
                </Button>
              )}
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
          </div>
        </div>

        {/* Zearn Import Modal */}
        <Modal
          open={showZearnImport}
          onClose={handleCloseZearnImport}
          title="Import Zearn Data"
          size="sm"
        >
          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
            <input
              ref={zearnFileInputRef}
              type="file"
              accept=".csv,.tsv,.txt"
              onChange={handleZearnFileUpload}
              className="hidden"
              id="zearn-file-upload"
            />
            <label
              htmlFor="zearn-file-upload"
              className="cursor-pointer"
            >
              <div className="text-3xl mb-2">📁</div>
              {zearnFileName ? (
                <div>
                  <p className="text-sm font-medium text-gray-900">{zearnFileName}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {zearnImportData.trim().split('\n').length - 1} data rows
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-gray-900">Click to upload CSV</p>
                  <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
                </div>
              )}
            </label>
          </div>

          {/* Results */}
          {zearnImportResult && (
            <div className={`mt-4 rounded-lg p-4 ${
              zearnImportResult.success && zearnImportResult.imported > 0
                ? 'bg-green-50 border border-green-200'
                : zearnImportResult.success && zearnImportResult.imported === 0
                ? 'bg-yellow-50 border border-yellow-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className={`text-sm font-medium ${
                zearnImportResult.success && zearnImportResult.imported > 0
                  ? 'text-green-900'
                  : zearnImportResult.success && zearnImportResult.imported === 0
                  ? 'text-yellow-900'
                  : 'text-red-900'
              }`}>
                {zearnImportResult.success && zearnImportResult.imported > 0
                  ? `Imported ${zearnImportResult.imported} lessons`
                  : zearnImportResult.success && zearnImportResult.imported === 0
                  ? 'No new data imported'
                  : 'Import failed'}
              </div>
              {zearnImportResult.skipped > 0 && (
                <div className="text-xs text-gray-600 mt-1">
                  {zearnImportResult.skipped} students skipped
                </div>
              )}
              {zearnImportResult.errors.length > 0 && (
                <div className="text-xs text-gray-600 mt-2 max-h-20 overflow-y-auto">
                  {zearnImportResult.errors.slice(0, 5).map((error, i) => (
                    <div key={i}>{error}</div>
                  ))}
                  {zearnImportResult.errors.length > 5 && (
                    <div className="italic">...and {zearnImportResult.errors.length - 5} more</div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <Button
              intent="secondary"
              onClick={handleCloseZearnImport}
            >
              {zearnImportResult?.success && zearnImportResult.imported > 0 ? 'Done' : 'Cancel'}
            </Button>
            {(!zearnImportResult || !zearnImportResult.success || zearnImportResult.imported === 0) && (
              <Button
                intent="primary"
                onClick={handleZearnImport}
                disabled={importing || !zearnImportData.trim()}
                loading={importing}
              >
                Import
              </Button>
            )}
          </div>
        </Modal>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Roadmaps */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Roadmaps Completions</h2>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    {filteredData.length.toLocaleString()} records
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                      <CheckIcon className="h-3 w-3" />
                      {filteredData.filter(row => row.passed).length.toLocaleString()} mastered
                    </span>
                  </p>
                </div>
                {/* Mini stat cards */}
                <div className="flex gap-2">
                  <div className="bg-white rounded-lg px-3 py-2 border border-blue-200 text-center">
                    <p className="text-xs text-blue-600 font-medium">Avg Score</p>
                    <p className="text-sm font-bold text-blue-900">{averageScore.toFixed(0)}%</p>
                  </div>
                  <div className="bg-white rounded-lg px-3 py-2 border border-blue-200 text-center">
                    <p className="text-xs text-blue-600 font-medium">Mastery Rate</p>
                    <p className="text-sm font-bold text-blue-900">{masteryPercentage.toFixed(0)}%</p>
                  </div>
                </div>
{/* Button commented out - scraper runs via GitHub Actions
                <button
                  onClick={handleScrapeAll}
                  disabled={isScraping}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    isScraping
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'text-blue-700 bg-blue-100 hover:bg-blue-200'
                  }`}
                >
                  {isScraping ? 'Updating...' : '+ Update Roadmaps Data'}
                </button>
                */}
              </div>
            </div>
            {loading ? (
              <div className="p-8 flex flex-col items-center justify-center">
                <Spinner size="lg" variant="default" />
                <div className="text-gray-500 mt-3">Loading assessment data...</div>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-600">
                Error: {error}
              </div>
            ) : (
              <div className="overflow-x-hidden max-h-[600px] overflow-y-auto">
                <table className="w-full table-fixed">
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[35%]">
                        Student
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                        Section
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                        Skill
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%]">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                          No assessment data found
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {row.studentName}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {row.section}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <div className="truncate max-w-32" title={row.skillName}>
                              {row.skillCode}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {row.dateCompleted ? (() => {
                              const date = new Date(row.dateCompleted);
                              const today = new Date();
                              const yesterday = new Date(today);
                              yesterday.setDate(yesterday.getDate() - 1);

                              const isToday = date.getDate() === today.getDate() &&
                                             date.getMonth() === today.getMonth() &&
                                             date.getFullYear() === today.getFullYear();
                              const isYesterday = date.getDate() === yesterday.getDate() &&
                                                 date.getMonth() === yesterday.getMonth() &&
                                                 date.getFullYear() === yesterday.getFullYear();

                              if (isToday) {
                                return `Today, ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
                              } else if (isYesterday) {
                                return `Yesterday, ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
                              } else {
                                const dayOfWeek = date.toLocaleDateString([], { weekday: 'short' });
                                const dateStr = date.toLocaleDateString([], { month: 'numeric', day: 'numeric' });
                                const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                                return `${dayOfWeek}, ${dateStr}, ${timeStr}`;
                              }
                            })() : '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              row.passed
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {row.score}
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

          {/* Right Column - Zearn */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-yellow-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Zearn Completions</h2>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                      <CheckIcon className="h-3 w-3" />
                      {filteredZearnData.length.toLocaleString()} completed
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setShowZearnImport(true)}
                  className="px-3 py-1.5 text-sm font-medium text-orange-700 bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors cursor-pointer"
                >
                  + Import Zearn Data
                </button>
              </div>
            </div>
            {zearnLoading ? (
              <div className="p-8 flex flex-col items-center justify-center">
                <Spinner size="lg" variant="default" />
                <div className="text-gray-500 mt-3">Loading Zearn data...</div>
              </div>
            ) : zearnError ? (
              <div className="p-8 text-center text-red-600">
                Error: {zearnError}
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Section
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lesson
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredZearnData.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                          No Zearn data found
                        </td>
                      </tr>
                    ) : (
                      filteredZearnData.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {row.studentName}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {row.section}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-mono">
                              {row.lessonCode}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {row.completionDate ? (() => {
                              // Parse MM/DD/YY format
                              const parts = row.completionDate.split('/');
                              if (parts.length === 3) {
                                const month = parseInt(parts[0], 10) - 1;
                                const day = parseInt(parts[1], 10);
                                let year = parseInt(parts[2], 10);
                                if (year < 100) {
                                  year += year < 50 ? 2000 : 1900;
                                }
                                const date = new Date(year, month, day);
                                const today = new Date();
                                const yesterday = new Date(today);
                                yesterday.setDate(yesterday.getDate() - 1);

                                const isToday = date.getDate() === today.getDate() &&
                                               date.getMonth() === today.getMonth() &&
                                               date.getFullYear() === today.getFullYear();
                                const isYesterday = date.getDate() === yesterday.getDate() &&
                                                   date.getMonth() === yesterday.getMonth() &&
                                                   date.getFullYear() === yesterday.getFullYear();

                                if (isToday) {
                                  return 'Today';
                                } else if (isYesterday) {
                                  return 'Yesterday';
                                } else {
                                  const dayOfWeek = date.toLocaleDateString([], { weekday: 'short' });
                                  const dateStr = date.toLocaleDateString([], { month: 'numeric', day: 'numeric' });
                                  return `${dayOfWeek}, ${dateStr}`;
                                }
                              }
                              return row.completionDate;
                            })() : '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Third Column - Podsie */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Podsie Completions</h2>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                      <CheckIcon className="h-3 w-3" />
                      {filteredPodsieData.length.toLocaleString()} completed
                    </span>
                  </p>
                </div>
              </div>
            </div>
            {podsieLoading ? (
              <div className="p-8 flex flex-col items-center justify-center">
                <Spinner size="lg" variant="default" />
                <div className="text-gray-500 mt-3">Loading Podsie data...</div>
              </div>
            ) : podsieError ? (
              <div className="p-8 text-center text-red-600">
                Error: {podsieError}
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Section
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assignment
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPodsieData.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                          No Podsie data found
                        </td>
                      </tr>
                    ) : (
                      filteredPodsieData.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {row.studentName}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {row.section}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <span className={`px-2 py-1 rounded text-xs font-mono ${
                              row.lessonType === 'rampUp'
                                ? 'bg-yellow-100 text-yellow-800'
                                : row.lessonType === 'assessment'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {row.unitLessonId || row.assignmentName}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {row.completedDate ? (() => {
                              const date = new Date(row.completedDate);
                              const today = new Date();
                              const yesterday = new Date(today);
                              yesterday.setDate(yesterday.getDate() - 1);

                              const isToday = date.getDate() === today.getDate() &&
                                             date.getMonth() === today.getMonth() &&
                                             date.getFullYear() === today.getFullYear();
                              const isYesterday = date.getDate() === yesterday.getDate() &&
                                                 date.getMonth() === yesterday.getMonth() &&
                                                 date.getFullYear() === yesterday.getFullYear();

                              if (isToday) {
                                return `Today, ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
                              } else if (isYesterday) {
                                return `Yesterday, ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
                              } else {
                                const dayOfWeek = date.toLocaleDateString([], { weekday: 'short' });
                                const dateStr = date.toLocaleDateString([], { month: 'numeric', day: 'numeric' });
                                const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                                return `${dayOfWeek}, ${dateStr}, ${timeStr}`;
                              }
                            })() : '-'}
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
    </div>
  );
}
