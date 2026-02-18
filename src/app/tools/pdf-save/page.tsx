"use client";

import { useState, useRef } from "react";
import { PDFExtractorState, GRADE_OPTIONS } from "./types";
import {
  processPDF,
  getPDFPageCount,
  sanitizeTitle,
  saveFilesToPublic,
  parseTitles,
  validateForm,
} from "./utils";

export default function PDFSavePage() {
  const [state, setState] = useState<PDFExtractorState>({
    selectedFile: null,
    grade: "",
    unit: 1,
    titles: "",
    pageCount: 0,
    isProcessing: false,
    extractedImages: [],
    error: "",
    success: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateState = (updates: Partial<PDFExtractorState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const clearMessages = () => {
    updateState({ error: "", success: "" });
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    clearMessages();
    updateState({ selectedFile: file, pageCount: 0, extractedImages: [] });

    try {
      const pageCount = await getPDFPageCount(file);
      updateState({ pageCount });
    } catch (error) {
      updateState({
        error: `Failed to load PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
        selectedFile: null,
      });
    }
  };

  const validateCurrentForm = (): string | null => {
    return validateForm(
      state.selectedFile,
      state.grade,
      state.unit,
      state.titles,
      state.pageCount,
    );
  };

  const handleProcess = async () => {
    const validationError = validateCurrentForm();
    if (validationError) {
      updateState({ error: validationError });
      return;
    }

    if (!state.selectedFile) return;

    updateState({ isProcessing: true, error: "", success: "" });

    try {
      // Process PDF and extract images
      const images = await processPDF(state.selectedFile);
      updateState({ extractedImages: images });

      // Parse titles
      const titleArray = parseTitles(state.titles);

      // Create and download zip file with curricula structure
      await saveFilesToPublic(state.grade, state.unit, titleArray, images);

      updateState({
        success: `Successfully processed ${images.length} pages. Downloaded zip file: curricula-${state.grade}-Unit-${state.unit}-ramp-ups.zip with proper folder structure. Extract the zip file to your desired location.`,
        isProcessing: false,
      });
    } catch (error) {
      updateState({
        error: `Processing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        isProcessing: false,
      });
    }
  };

  const titleArray = parseTitles(state.titles);
  const isFormValid = !validateCurrentForm();

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">
        PDF Page Extractor and Organizer
      </h1>

      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        {/* File Upload */}
        <div>
          <label
            htmlFor="file-upload"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select PDF File
          </label>
          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {state.selectedFile && (
            <p className="mt-2 text-sm text-gray-600">
              File: {state.selectedFile.name} ({state.pageCount} pages)
            </p>
          )}
        </div>

        {/* Grade Selection */}
        <div>
          <label
            htmlFor="grade"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Grade
          </label>
          <select
            id="grade"
            value={state.grade}
            onChange={(e) => updateState({ grade: e.target.value })}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Grade</option>
            {GRADE_OPTIONS.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </div>

        {/* Unit Number */}
        <div>
          <label
            htmlFor="unit"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Unit Number
          </label>
          <input
            id="unit"
            type="number"
            min="1"
            value={state.unit}
            onChange={(e) =>
              updateState({ unit: parseInt(e.target.value) || 1 })
            }
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Titles Input */}
        <div>
          <label
            htmlFor="titles"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Page Titles (one per line)
          </label>
          <textarea
            id="titles"
            rows={6}
            value={state.titles}
            onChange={(e) => updateState({ titles: e.target.value })}
            placeholder={
              "Enter page titles, one per line...\\nExample:\\nIntroduction to Fractions\\nAdding Fractions\\nSubtracting Fractions"
            }
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {state.pageCount > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              Titles entered: {titleArray.length} / {state.pageCount} pages
              {titleArray.length !== state.pageCount && (
                <span className="text-red-600 ml-2">⚠️ Count mismatch</span>
              )}
            </p>
          )}
        </div>

        {/* Preview */}
        {titleArray.length > 0 && state.grade && state.unit && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              File Structure Preview:
            </h3>
            <div className="text-xs text-gray-600 font-mono">
              <div>
                curricula/{state.grade}/Unit-{state.unit}/ramp-ups/
              </div>
              {titleArray.slice(0, 3).map((title, index) => (
                <div key={index} className="ml-4">
                  ├── ramp-up-{index + 1}-{sanitizeTitle(title)}/
                  <div className="ml-4">└── Cool-Down.png</div>
                </div>
              ))}
              {titleArray.length > 3 && (
                <div className="ml-4 text-gray-500">
                  ... and {titleArray.length - 3} more folders
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error/Success Messages */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="text-red-800">
                <strong>Error:</strong> {state.error}
              </div>
            </div>
          </div>
        )}

        {state.success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="text-green-800">
                <strong>Success:</strong> {state.success}
              </div>
            </div>
          </div>
        )}

        {/* Process Button */}
        <div>
          <button
            onClick={handleProcess}
            disabled={!isFormValid || state.isProcessing}
            className={`w-full py-3 px-4 rounded-md font-medium ${
              isFormValid && !state.isProcessing
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            } transition-colors`}
          >
            {state.isProcessing
              ? "Processing PDF..."
              : "Extract Pages and Download Zip"}
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            Instructions:
          </h3>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Select a PDF file to upload</li>
            <li>Choose the appropriate grade level</li>
            <li>Enter the unit number</li>
            <li>Enter page titles, one per line (one title per PDF page)</li>
            <li>
              Click &quot;Extract Pages and Download Zip&quot; to download a zip
              file with the complete folder structure
            </li>
            <li>
              Extract the downloaded zip file to your desired location (it
              contains curricula/[grade]/Unit-[unit]/ramp-ups/ structure)
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
