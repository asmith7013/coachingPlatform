"use client";

import { useState, useEffect } from "react";
import { syncSectionAttendance, type AttendanceSyncResult } from "@/app/actions/313/attendance-sync";
import { fetchSectionConfigs } from "@/app/actions/313/section-config";
import { useToast } from "@/components/core/feedback/Toast";
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from "@heroicons/react/24/solid";

interface SectionConfigOption {
  classSection: string;
  groupId: string;
  teacher?: string;
  gradeLevel: string;
  school: string;
}

export default function ImportAttendancePage() {
  const [sections, setSections] = useState<SectionConfigOption[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AttendanceSyncResult | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rawJson, setRawJson] = useState<any>(null);

  // Three separate toast instances for progress tracking
  // fetchToast: Shows when fetching data from Podsie API
  // processToast: Shows when processing/importing records to database
  // resultToast: Shows final success/error result with stats
  const fetchToast = useToast();
  const processToast = useToast();
  const resultToast = useToast();

  useEffect(() => {
    loadSections();
    // Set default start date to September 1st of current school year
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11 (Jan=0, Dec=11)
    const currentYear = now.getFullYear();

    // If we're in Sept-Dec (months 8-11), use current year
    // If we're in Jan-Aug (months 0-7), use previous year
    const schoolYearStartYear = currentMonth >= 8 ? currentYear : currentYear - 1;
    const defaultDate = `${schoolYearStartYear}-09-01`;
    setStartDate(defaultDate);
  }, []);

  const loadSections = async () => {
    try {
      const response = await fetchSectionConfigs();
      console.log("Fetch response:", response);

      if (response.success && response.items) {
        console.log("Section configs data:", response.items);
        // Filter sections that have groupId
        const sectionsWithGroupId = response.items
          .filter((s) => s.groupId)
          .map((s) => ({
            classSection: String(s.classSection),
            groupId: String(s.groupId),
            teacher: s.teacher,
            gradeLevel: String(s.gradeLevel),
            school: String(s.school),
          }));
        console.log("Filtered sections with groupId:", sectionsWithGroupId);
        setSections(sectionsWithGroupId);
      } else {
        console.error("Failed to fetch sections:", response);
      }
    } catch (error) {
      console.error("Error loading sections:", error);
    }
  };

  const handleFetchAndImport = async () => {
    if (!selectedGroupId) {
      resultToast.showToast({
        title: "Please select a section",
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
    setResult(null);
    setRawJson(null);

    // Step 1: Show fetching toast
    fetchToast.showToast({
      title: "Fetching attendance data from Podsie...",
      variant: "info",
      icon: InformationCircleIcon,
    });

    try {
      // Use the attendance sync module (follows podsie-sync pattern)
      const syncResponse = await syncSectionAttendance(
        selectedGroupId,
        selectedSection?.classSection || '',
        { startDate }
      );

      // Hide fetch toast
      fetchToast.hideToast();

      if (syncResponse.success) {
        // Step 2: Show processing toast
        processToast.showToast({
          title: "Processing and importing attendance records...",
          description: `Importing ${syncResponse.totalProcessed} records`,
          variant: "info",
          icon: InformationCircleIcon,
        });

        // Small delay to show the processing state
        await new Promise(resolve => setTimeout(resolve, 800));

        setResult(syncResponse);
        setRawJson(syncResponse.rawData);

        // Hide process toast
        processToast.hideToast();

        // Step 3: Show success with stats
        resultToast.showToast({
          title: "Attendance data synced successfully!",
          description: `${syncResponse.totalProcessed} records processed: ${syncResponse.created} created, ${syncResponse.updated} updated, ${syncResponse.notTracked} not tracked`,
          variant: "success",
          icon: CheckCircleIcon,
        });
      } else {
        resultToast.showToast({
          title: "Sync failed",
          description: syncResponse.error || "Unknown error",
          variant: "error",
          icon: ExclamationCircleIcon,
        });
        setResult(syncResponse);
        setRawJson(syncResponse.rawData);
      }
    } catch (error) {
      fetchToast.hideToast();
      processToast.hideToast();

      const errorMessage = error instanceof Error ? error.message : "Failed to sync attendance data";
      resultToast.showToast({
        title: "Sync failed",
        description: errorMessage,
        variant: "error",
        icon: ExclamationCircleIcon,
      });
      setResult({
        success: false,
        section: selectedSection?.classSection || '',
        groupId: selectedGroupId,
        totalProcessed: 0,
        created: 0,
        updated: 0,
        notTracked: 0,
        error: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedSection = sections.find(s => s.groupId === selectedGroupId);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Toast Components */}
      <fetchToast.ToastComponent />
      <processToast.ToastComponent />
      <resultToast.ToastComponent />
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

                {/* PS19 */}
                {sections.some(s => s.school === 'PS19') && (
                  <>
                    <option disabled className="font-bold">─── PS19 ───</option>
                    {sections
                      .filter(s => s.school === 'PS19')
                      .sort((a, b) => a.classSection.localeCompare(b.classSection))
                      .map((section) => (
                        <option key={section.groupId} value={section.groupId}>
                          {section.classSection}
                        </option>
                      ))}
                  </>
                )}

                {/* IS313 */}
                {sections.some(s => s.school === 'IS313') && (
                  <>
                    <option disabled className="font-bold">─── IS313 ───</option>
                    {sections
                      .filter(s => s.school === 'IS313')
                      .sort((a, b) => a.classSection.localeCompare(b.classSection))
                      .map((section) => (
                        <option key={section.groupId} value={section.groupId}>
                          {section.classSection}
                        </option>
                      ))}
                  </>
                )}
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
                {isLoading ? "Syncing..." : "Fetch & Import Attendance"}
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

        {/* Raw JSON Display */}
        {rawJson && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Raw API Response</h2>
            <div className="bg-gray-900 text-green-400 rounded-md p-4 overflow-auto max-h-96">
              <pre className="text-xs font-mono whitespace-pre-wrap">
                {JSON.stringify(rawJson, null, 2)}
              </pre>
            </div>
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
