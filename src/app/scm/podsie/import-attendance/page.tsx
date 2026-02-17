"use client";

import { useState, useEffect } from "react";
import {
  syncSectionAttendance,
  type AttendanceSyncResult,
} from "@/app/actions/scm/student/attendance-sync";
import { fetchSectionConfigs } from "@/app/actions/scm/podsie/section-config";
import { useToast } from "@/components/core/feedback/Toast";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import { Spinner } from "@/components/core/feedback/Spinner";

interface SectionOption {
  id: string;
  classSection: string;
  groupId: string;
  teacher?: string;
  gradeLevel: string;
  school: string;
  displayName: string;
}

export default function ImportAttendancePage() {
  const [sections, setSections] = useState<SectionOption[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSectionsLoading, setIsSectionsLoading] = useState(true);
  const [results, setResults] = useState<AttendanceSyncResult[]>([]);
  const [currentSyncingSection, setCurrentSyncingSection] = useState<
    string | null
  >(null);

  const resultToast = useToast();

  useEffect(() => {
    loadSections();
    // Set default start date to yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const defaultDate = yesterday.toISOString().split("T")[0];
    setStartDate(defaultDate);
  }, []);

  const loadSections = async () => {
    setIsSectionsLoading(true);
    try {
      const response = await fetchSectionConfigs();

      if (response.success && response.items) {
        // Filter sections that have groupId
        const sectionsWithGroupId = response.items
          .filter((s) => s.groupId)
          .map((s) => ({
            id: String(s._id || s.id),
            classSection: String(s.classSection),
            groupId: String(s.groupId),
            teacher: s.teacher,
            gradeLevel: String(s.gradeLevel),
            school: String(s.school),
            displayName: s.teacher
              ? `${s.classSection} (${s.teacher})`
              : String(s.classSection),
          }));
        setSections(sectionsWithGroupId);
        // Select all sections by default
        setSelectedSections(sectionsWithGroupId.map((s) => s.id));
      } else {
        console.error("Failed to fetch sections:", response);
      }
    } catch (error) {
      console.error("Error loading sections:", error);
    } finally {
      setIsSectionsLoading(false);
    }
  };

  // Group sections by school
  const sectionsBySchool = sections.reduce(
    (acc, section) => {
      if (!acc[section.school]) {
        acc[section.school] = [];
      }
      acc[section.school].push(section);
      return acc;
    },
    {} as Record<string, SectionOption[]>,
  );

  // Handler for toggling individual section
  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId],
    );
  };

  // Handler for select all checkbox for a school
  const handleSelectAll = (school: string, schoolSections: SectionOption[]) => {
    const schoolSectionIds = schoolSections.map((s) => s.id);
    const allSelected = schoolSectionIds.every((id) =>
      selectedSections.includes(id),
    );

    if (allSelected) {
      // Deselect all sections in this school
      setSelectedSections((prev) =>
        prev.filter((id) => !schoolSectionIds.includes(id)),
      );
    } else {
      // Select all sections in this school
      setSelectedSections((prev) => [
        ...new Set([...prev, ...schoolSectionIds]),
      ]);
    }
  };

  // Check if all sections in a school are selected
  const isAllSelected = (schoolSections: SectionOption[]) => {
    return schoolSections.every((s) => selectedSections.includes(s.id));
  };

  // Check if some (but not all) sections are selected
  const isSomeSelected = (schoolSections: SectionOption[]) => {
    const selectedCount = schoolSections.filter((s) =>
      selectedSections.includes(s.id),
    ).length;
    return selectedCount > 0 && selectedCount < schoolSections.length;
  };

  const handleFetchAndImport = async () => {
    if (selectedSections.length === 0) {
      resultToast.showToast({
        title: "Please select at least one section",
        variant: "error",
        icon: ExclamationCircleIcon,
      });
      return;
    }
    if (!startDate) {
      resultToast.showToast({
        title: "Please select a start date",
        variant: "error",
        icon: ExclamationCircleIcon,
      });
      return;
    }

    setIsLoading(true);
    setResults([]);

    const sectionsToSync = sections.filter((s) =>
      selectedSections.includes(s.id),
    );
    const syncResults: AttendanceSyncResult[] = [];

    resultToast.showToast({
      title: `Syncing attendance for ${sectionsToSync.length} sections...`,
      variant: "info",
      icon: InformationCircleIcon,
    });

    try {
      // Sync each section sequentially
      for (const section of sectionsToSync) {
        setCurrentSyncingSection(section.classSection);

        try {
          const syncResponse = await syncSectionAttendance(
            section.groupId,
            section.classSection,
            { startDate },
          );
          syncResults.push(syncResponse);
        } catch (error) {
          syncResults.push({
            success: false,
            section: section.classSection,
            groupId: section.groupId,
            totalProcessed: 0,
            created: 0,
            updated: 0,
            notTracked: 0,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      setResults(syncResults);
      setCurrentSyncingSection(null);

      // Calculate totals
      const totalProcessed = syncResults.reduce(
        (sum, r) => sum + r.totalProcessed,
        0,
      );
      const totalCreated = syncResults.reduce((sum, r) => sum + r.created, 0);
      const totalUpdated = syncResults.reduce((sum, r) => sum + r.updated, 0);
      const totalNotTracked = syncResults.reduce(
        (sum, r) => sum + r.notTracked,
        0,
      );
      const failedSections = syncResults.filter((r) => !r.success).length;

      if (failedSections === 0) {
        resultToast.showToast({
          title: "Attendance sync completed!",
          description: `${totalProcessed} records: ${totalCreated} created, ${totalUpdated} updated, ${totalNotTracked} not tracked`,
          variant: "success",
          icon: CheckCircleIcon,
        });
      } else {
        resultToast.showToast({
          title: `Sync completed with ${failedSections} errors`,
          description: `${totalProcessed} records processed across ${sectionsToSync.length - failedSections} successful sections`,
          variant: "error",
          icon: ExclamationCircleIcon,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to sync attendance data";
      resultToast.showToast({
        title: "Sync failed",
        description: errorMessage,
        variant: "error",
        icon: ExclamationCircleIcon,
      });
    } finally {
      setIsLoading(false);
      setCurrentSyncingSection(null);
    }
  };

  if (isSectionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" variant="primary" />
          <p className="text-gray-500">Loading sections...</p>
        </div>
      </div>
    );
  }

  // Calculate totals from results
  const totalProcessed = results.reduce((sum, r) => sum + r.totalProcessed, 0);
  const totalCreated = results.reduce((sum, r) => sum + r.created, 0);
  const totalUpdated = results.reduce((sum, r) => sum + r.updated, 0);
  const totalNotTracked = results.reduce((sum, r) => sum + r.notTracked, 0);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Toast Component */}
      <resultToast.ToastComponent />

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Import Attendance Data</h1>
        <p className="text-gray-600">
          Automatically fetch and import attendance data from Podsie for
          selected sections.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Section Selector */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Select Sections</h2>
          <div className="flex gap-8 items-start flex-wrap">
            {Object.entries(sectionsBySchool).map(
              ([school, schoolSections]) => (
                <div
                  key={school}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <fieldset>
                    {/* School title and Select All checkbox */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                      <legend className="text-sm font-medium text-gray-900">
                        {school}
                      </legend>
                      <div className="flex gap-2 items-center">
                        <div className="flex h-5 shrink-0 items-center">
                          <div className="group grid size-4 grid-cols-1">
                            <input
                              id={`select-all-${school}`}
                              type="checkbox"
                              checked={isAllSelected(schoolSections)}
                              ref={(input) => {
                                if (input) {
                                  input.indeterminate =
                                    isSomeSelected(schoolSections);
                                }
                              }}
                              onChange={() =>
                                handleSelectAll(school, schoolSections)
                              }
                              disabled={isLoading}
                              className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto cursor-pointer"
                            />
                            <svg
                              fill="none"
                              viewBox="0 0 14 14"
                              className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                            >
                              <path
                                d="M3 8L6 11L11 3.5"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="opacity-0 group-has-checked:opacity-100"
                              />
                              <path
                                d="M3 7H11"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="opacity-0 group-has-indeterminate:opacity-100"
                              />
                            </svg>
                          </div>
                        </div>
                        <label
                          htmlFor={`select-all-${school}`}
                          className="text-xs text-gray-600 cursor-pointer"
                        >
                          Select All
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3">
                      {schoolSections.map((section, optionIdx) => (
                        <div key={section.id} className="flex gap-3">
                          <div className="flex h-5 shrink-0 items-center">
                            <div className="group grid size-4 grid-cols-1">
                              <input
                                id={`${school}-${optionIdx}`}
                                type="checkbox"
                                checked={selectedSections.includes(section.id)}
                                onChange={() => handleSectionToggle(section.id)}
                                disabled={isLoading}
                                className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto cursor-pointer"
                              />
                              <svg
                                fill="none"
                                viewBox="0 0 14 14"
                                className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                              >
                                <path
                                  d="M3 8L6 11L11 3.5"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="opacity-0 group-has-checked:opacity-100"
                                />
                              </svg>
                            </div>
                          </div>
                          <label
                            htmlFor={`${school}-${optionIdx}`}
                            className="text-sm text-gray-600 cursor-pointer"
                          >
                            {section.displayName}
                          </label>
                        </div>
                      ))}
                    </div>
                  </fieldset>
                </div>
              ),
            )}
          </div>
        </div>

        {/* Date Range Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Date Range</h2>

          <div className="flex items-end gap-6 flex-wrap">
            {/* Start Date */}
            <div>
              <label
                htmlFor="start-date"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Start Date
              </label>
              <input
                type="date"
                id="start-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                disabled={isLoading}
              />
              <p className="mt-1 text-sm text-gray-500">
                Data will be fetched from this date until today
              </p>
            </div>

            {/* Fetch Button */}
            <button
              onClick={handleFetchAndImport}
              disabled={
                isLoading || selectedSections.length === 0 || !startDate
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" variant="default" />
                  {currentSyncingSection
                    ? `Syncing ${currentSyncingSection}...`
                    : "Syncing..."}
                </span>
              ) : (
                `Fetch & Import (${selectedSections.length} sections)`
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Import Results</h2>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-indigo-50 border border-indigo-200 rounded-md p-4">
                <div className="text-2xl font-bold text-indigo-700">
                  {results.length}
                </div>
                <div className="text-sm text-indigo-600">Sections Synced</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="text-2xl font-bold text-green-700">
                  {totalProcessed}
                </div>
                <div className="text-sm text-green-600">Total Processed</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="text-2xl font-bold text-blue-700">
                  {totalCreated}
                </div>
                <div className="text-sm text-blue-600">Created</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="text-2xl font-bold text-yellow-700">
                  {totalUpdated}
                </div>
                <div className="text-sm text-yellow-600">Updated</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <div className="text-2xl font-bold text-gray-700">
                  {totalNotTracked}
                </div>
                <div className="text-sm text-gray-600">Not Tracked</div>
              </div>
            </div>

            {/* Per-Section Results */}
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Section
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Processed
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Updated
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Not Tracked
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((result, idx) => (
                    <tr key={idx} className={result.success ? "" : "bg-red-50"}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {result.section}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {result.success ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Success
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                        {result.totalProcessed}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                        {result.created}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                        {result.updated}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                        {result.notTracked}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Failed section errors */}
            {results.some((r) => !r.success) && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                <h3 className="text-red-800 font-medium mb-2">Errors</h3>
                <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                  {results
                    .filter((r) => !r.success)
                    .map((r, idx) => (
                      <li key={idx}>
                        {r.section}: {r.error}
                      </li>
                    ))}
                </ul>
              </div>
            )}

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-blue-800 font-medium mb-2">
                ℹ️ About &ldquo;Not Tracked&rdquo; Records
              </h3>
              <p className="text-blue-700 text-sm">
                Days marked as &ldquo;Not Tracked&rdquo; had no attendance data
                in the source system. These records are still saved to track
                mastery checks. For attendance rate calculations, these days are
                assumed as &ldquo;present&rdquo; (assuming school was in
                session).
              </p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-3">How it Works</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>
              Select one or more sections from the checkboxes above (all
              sections selected by default)
            </li>
            <li>Choose a start date (defaults to yesterday)</li>
            <li>
              Click &ldquo;Fetch & Import&rdquo; to automatically:
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-sm text-gray-600">
                <li>Fetch attendance data from Podsie API for each section</li>
                <li>Import the data into the database</li>
                <li>Update existing records or create new ones</li>
              </ul>
            </li>
            <li>
              Review the results to see how many records were processed per
              section
            </li>
          </ol>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="font-medium text-blue-800 mb-2">Note:</h3>
            <p className="text-sm text-blue-700">
              The Podsie API endpoint returns all attendance data from the start
              date until today. You can run this import multiple times to update
              records with the latest data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
