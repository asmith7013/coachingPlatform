"use client";

import { useState, useRef } from "react";
import { importZearnCompletions } from "@/app/actions/scm/roadmaps/zearn-completions";

export default function ZearnImportPage() {
  const [importData, setImportData] = useState("");
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    imported: number;
    skipped: number;
    errors: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setResult(null);

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
      setImportData(processedLines.join('\n'));
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!importData.trim()) return;

    setImporting(true);
    setResult(null);

    try {
      const response = await importZearnCompletions(importData);
      if (response.success) {
        setResult({
          success: true,
          imported: response.data.imported,
          skipped: response.data.skipped,
          errors: response.data.errors
        });
        // Clear on success
        if (response.data.imported > 0) {
          setImportData("");
          setFileName("");
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      } else {
        setResult({
          success: false,
          imported: 0,
          skipped: 0,
          errors: [response.error || "Import failed"]
        });
      }
    } catch (err) {
      setResult({
        success: false,
        imported: 0,
        skipped: 0,
        errors: [err instanceof Error ? err.message : "Unknown error"]
      });
    } finally {
      setImporting(false);
    }
  };

  const handleClear = () => {
    setImportData("");
    setFileName("");
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto p-6" style={{ maxWidth: "1600px" }}>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">Z</span>
            <h1 className="text-4xl font-bold text-gray-900">Zearn Data Import</h1>
          </div>
          <p className="text-gray-600">
            Import Zearn lesson completion data to track student progress.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">How to Import</h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Export data from Zearn as a CSV file with the following columns:</li>
          </ol>
          <div className="mt-3 p-3 bg-white rounded border border-blue-200 font-mono text-xs text-gray-600 overflow-x-auto">
            School, Class, Class Grade, SIS ID, Last Name, First Name, Student Grade, Lesson, Completion Date
          </div>
          <ol className="list-decimal list-inside space-y-2 text-blue-800 mt-3" start={2}>
            <li>Upload the CSV file below</li>
            <li>Click Import to process the data</li>
          </ol>
          <p className="mt-3 text-sm text-blue-700">
            <strong>Note:</strong> Only unique lessons will be added per student.
            If a student already has a lesson recorded, it will be skipped.
          </p>
        </div>

        {/* Import Area */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Zearn CSV File
          </label>

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.tsv,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer"
            >
              <div className="text-4xl mb-3">📁</div>
              {fileName ? (
                <div>
                  <p className="text-lg font-medium text-gray-900">{fileName}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {importData.trim().split('\n').length - 1} data rows loaded
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-medium text-gray-900">Click to upload CSV file</p>
                  <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
                </div>
              )}
            </label>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
              {importData.trim() ? (
                <>
                  {importData.trim().split('\n').length - 1} data rows
                  {importData.trim().split('\n').length > 1 && ' (excluding header)'}
                </>
              ) : (
                'No file uploaded yet'
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleClear}
                disabled={!importData.trim() && !result}
                className={`px-4 py-2 rounded-lg font-medium ${
                  !importData.trim() && !result
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                Clear
              </button>
              <button
                onClick={handleImport}
                disabled={importing || !importData.trim()}
                className={`px-6 py-2 rounded-lg font-medium text-white transition-all ${
                  importing || !importData.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 hover:shadow-lg'
                }`}
              >
                {importing ? 'Importing...' : 'Import Data'}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className={`rounded-lg p-6 mb-6 ${
            result.success && result.imported > 0
              ? 'bg-green-50 border border-green-200'
              : result.success && result.imported === 0
              ? 'bg-yellow-50 border border-yellow-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-3 ${
              result.success && result.imported > 0
                ? 'text-green-900'
                : result.success && result.imported === 0
                ? 'text-yellow-900'
                : 'text-red-900'
            }`}>
              {result.success && result.imported > 0
                ? 'Import Successful'
                : result.success && result.imported === 0
                ? 'No New Data Imported'
                : 'Import Failed'}
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-lg p-4">
                <div className="text-sm text-gray-500">Lessons Imported</div>
                <div className="text-2xl font-bold text-green-600">{result.imported}</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-sm text-gray-500">Students Skipped</div>
                <div className="text-2xl font-bold text-yellow-600">{result.skipped}</div>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  {result.errors.length} Issue{result.errors.length !== 1 ? 's' : ''} Found:
                </h4>
                <div className="max-h-40 overflow-y-auto bg-white rounded p-3 text-sm text-gray-600">
                  {result.errors.slice(0, 20).map((error, index) => (
                    <div key={index} className="py-1 border-b border-gray-100 last:border-0">
                      {error}
                    </div>
                  ))}
                  {result.errors.length > 20 && (
                    <div className="py-1 text-gray-400 italic">
                      ...and {result.errors.length - 20} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Help Section */}
        <div className="bg-gray-100 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Troubleshooting</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li><strong>Student not found:</strong> The SIS ID doesn&apos;t match any student in the database. Add the student first.</li>
            <li><strong>Invalid SIS ID:</strong> The SIS ID must be a number.</li>
            <li><strong>Not enough columns:</strong> Ensure your data has all 9 required columns separated by tabs.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
