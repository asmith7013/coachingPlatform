"use client";

import { useState, useEffect } from "react";
import { importAttendanceData } from "@/app/actions/313/attendance-import";
import { fetchSectionConfigs } from "@/app/actions/313/section-config";
import { toast } from "sonner";

interface SectionConfigOption {
  classSection: string;
  groupId: string;
  teacher?: string;
  gradeLevel: string;
}

export default function ImportAttendancePage() {
  const [sections, setSections] = useState<SectionConfigOption[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    loadSections();
    // Set default start date to September 1st of current school year
    const now = new Date();
    const year = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
    setStartDate(`${year}-09-01`);
  }, []);

  const loadSections = async () => {
    try {
      const response = await fetchSectionConfigs();
      if (response.success && response.data) {
        // Filter sections that have groupId
        const sectionsWithGroupId = response.data
          .filter((s: SectionConfigOption) => s.groupId)
          .map((s: SectionConfigOption) => ({
            classSection: s.classSection,
            groupId: s.groupId,
            teacher: s.teacher,
            gradeLevel: s.gradeLevel,
          }));
        setSections(sectionsWithGroupId);
      }
    } catch (error) {
      console.error("Error loading sections:", error);
    }
  };

  const handleFetchAndImport = async () => {
    if (!selectedGroupId) {
      toast.error("Please select a section");
      return;
    }
    if (!startDate) {
      toast.error("Please select a start date");
      return;
    }

    setIsLoading(true);
    setIsFetching(true);
    setResult(null);

    try {
      // Build Podsie API URL
      const podsieUrl = `https://www.podsie.org/api/external/mastery-checks-passed/${selectedGroupId}?startDate=${startDate}`;

      toast.info("Fetching data from Podsie...");

      // Fetch data from Podsie API
      const fetchResponse = await fetch(podsieUrl);

      if (!fetchResponse.ok) {
        throw new Error(`Podsie API error: ${fetchResponse.status} ${fetchResponse.statusText}`);
      }

      const data = await fetchResponse.json();

      setIsFetching(false);
      toast.info("Importing attendance data...");

      // Call import action
      const importResponse = await importAttendanceData(data);

      if (importResponse.success) {
        setResult(importResponse.data);
        toast.success("Attendance data imported successfully!");
      } else {
        toast.error(importResponse.error || "Import failed");
        setResult({ error: importResponse.error });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch or import data";
      toast.error(errorMessage);
      setResult({ error: errorMessage });
      setIsFetching(false);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedSection = sections.find(s => s.groupId === selectedGroupId);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Import Attendance Data</h1>
        <p className="text-gray-600">
          Automatically fetch and import attendance data from Podsie for a specific section.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Fetch Form Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Select Section and Date Range</h2>

          <div className="space-y-4">
            {/* Section Selector */}
            <div>
              <label htmlFor="section-select" className="block text-sm font-medium text-gray-700 mb-2">
                Section
              </label>
              <select
                id="section-select"
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="">Select a section...</option>
                {sections.map((section) => (
                  <option key={section.groupId} value={section.groupId}>
                    {section.classSection} - {section.teacher || 'No teacher'} (Grade {section.gradeLevel})
                  </option>
                ))}
              </select>
              {selectedSection && (
                <p className="mt-2 text-sm text-gray-500">
                  Podsie Group ID: {selectedSection.groupId}
                </p>
              )}
            </div>

            {/* Start Date */}
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                id="start-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <p className="mt-1 text-sm text-gray-500">
                Data will be fetched from this date until today
              </p>
            </div>

            {/* API URL Preview */}
            {selectedGroupId && startDate && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                <p className="text-xs font-medium text-gray-700 mb-1">API URL:</p>
                <code className="text-xs text-gray-600 break-all">
                  https://www.podsie.org/api/external/mastery-checks-passed/{selectedGroupId}?startDate={startDate}
                </code>
              </div>
            )}

            {/* Fetch Button */}
            <div className="flex gap-3">
              <button
                onClick={handleFetchAndImport}
                disabled={isLoading || !selectedGroupId || !startDate}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isFetching ? "Fetching from Podsie..." : isLoading ? "Importing..." : "Fetch & Import Attendance"}
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Import Results</h2>

            {result.error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <h3 className="text-red-800 font-medium mb-2">Error</h3>
                <p className="text-red-700">{result.error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="text-2xl font-bold text-green-700">
                      {result.totalProcessed}
                    </div>
                    <div className="text-sm text-green-600">Total Processed</div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="text-2xl font-bold text-blue-700">{result.created}</div>
                    <div className="text-sm text-blue-600">Created</div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="text-2xl font-bold text-yellow-700">{result.updated}</div>
                    <div className="text-sm text-yellow-600">Updated</div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                    <div className="text-2xl font-bold text-gray-700">{result.notTracked}</div>
                    <div className="text-sm text-gray-600">Not Tracked</div>
                  </div>
                </div>

                {result.errors && result.errors.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <h3 className="text-yellow-800 font-medium mb-2">Warnings</h3>
                    <ul className="list-disc list-inside text-yellow-700 text-sm space-y-1">
                      {result.errors.map((error: string, index: number) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h3 className="text-blue-800 font-medium mb-2">ℹ️ About &ldquo;Not Tracked&rdquo; Records</h3>
                  <p className="text-blue-700 text-sm">
                    Days marked as &ldquo;Not Tracked&rdquo; had no attendance data in the source system. These
                    records are still saved to track mastery checks. For attendance rate calculations,
                    these days are assumed as &ldquo;present&rdquo; (assuming school was in session).
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-3">How it Works</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Select a section from the dropdown (only sections with Podsie group IDs are shown)</li>
            <li>Choose a start date (defaults to September 1st of current school year)</li>
            <li>Click &ldquo;Fetch & Import Attendance&rdquo; to automatically:
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-sm text-gray-600">
                <li>Fetch attendance data from Podsie API</li>
                <li>Import the data into the database</li>
                <li>Update existing records or create new ones</li>
              </ul>
            </li>
            <li>Review the results to see how many records were processed</li>
          </ol>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="font-medium text-blue-800 mb-2">Note:</h3>
            <p className="text-sm text-blue-700">
              The Podsie API endpoint returns all attendance data from the start date until today.
              You can run this import multiple times to update records with the latest data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
